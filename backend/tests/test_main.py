from collections.abc import Iterator

import pytest
import jwt
from sqlalchemy import create_engine, text
from sqlalchemy.exc import IntegrityError
from fastapi.testclient import TestClient

from backend.main import create_app
from backend.models import Product, ProductVariant, User
from backend.security import hash_password


@pytest.fixture
def client(tmp_path) -> Iterator[TestClient]:
    database_path = (tmp_path / "test.db").as_posix()
    app = create_app(
        f"sqlite:///{database_path}",
        jwt_secret="test-secret-key-with-at-least-32-characters",
        initial_admin_email="admin@example.com",
        initial_admin_password="administrator-password",
    )
    with TestClient(app) as test_client:
        yield test_client


def login(client: TestClient, email: str, password: str) -> dict[str, str]:
    response = client.post("/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def register_customer(client: TestClient, email: str = "customer@example.com") -> dict[str, str]:
    response = client.post(
        "/auth/register",
        json={"email": email, "password": "Brightloop9!", "full_name": "Test Customer"},
    )
    assert response.status_code == 201
    return login(client, email, "Brightloop9!")


def test_registration_login_and_customer_scope(client: TestClient) -> None:
    customer_token = register_customer(client)
    profile = client.get("/users/me", headers=customer_token)
    assert profile.status_code == 200
    assert profile.json()["role"] == "customer"
    assert "password_hash" not in profile.json()
    assert client.get("/users", headers=customer_token).status_code == 403
    assert client.get("/customers", headers=customer_token).status_code == 403
    assert client.post("/staff", headers=customer_token, json={}).status_code == 403
    assert client.patch(
        "/users/me", headers=customer_token, json={"full_name": "Updated Customer"}
    ).json()["full_name"] == "Updated Customer"


def test_registration_cannot_assign_a_role(client: TestClient) -> None:
    response = client.post(
        "/auth/register",
        json={
            "email": "attacker@example.com",
            "password": "Brightloop9!",
            "full_name": "Customer",
            "role": "admin",
        },
    )
    assert response.status_code == 422


def test_duplicate_customer_registration_is_rejected(client: TestClient) -> None:
    register_customer(client)
    response = client.post(
        "/auth/register",
        json={
            "email": "CUSTOMER@example.com",
            "password": "AnotherValid9!",
            "full_name": "Duplicate Customer",
        },
    )
    assert response.status_code == 409


def test_successful_login_returns_bearer_token(client: TestClient) -> None:
    register_customer(client)
    response = client.post(
        "/auth/login",
        json={"email": "customer@example.com", "password": "Brightloop9!"},
    )
    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"
    assert response.json()["access_token"]


@pytest.mark.parametrize(
    "headers",
    [
        None,
        {"Authorization": "Bearer not-a-valid-jwt"},
        {
            "Authorization": "Bearer "
            + jwt.encode(
                {"sub": "1", "exp": 1},
                "test-secret-key-with-at-least-32-characters",
                algorithm="HS256",
            )
        },
    ],
    ids=["missing-token", "invalid-token", "expired-token"],
)
def test_protected_endpoints_reject_missing_invalid_and_expired_jwt(
    client: TestClient, headers: dict[str, str] | None
) -> None:
    for path in ("/users/me", "/products", "/plans"):
        response = client.get(path, headers=headers)
        assert response.status_code == 401


def test_customers_cannot_access_another_customers_profile(client: TestClient) -> None:
    customer_token = register_customer(client, "first@example.com")
    other_token = register_customer(client, "second@example.com")
    own_profile = client.get("/users/me", headers=customer_token)
    other_profile = client.get("/users/me", headers=other_token)

    assert own_profile.status_code == 200
    assert other_profile.status_code == 200
    assert own_profile.json()["id"] != other_profile.json()["id"]
    assert own_profile.json()["email"] == "first@example.com"
    assert client.get(
        f"/users/{other_profile.json()['id']}", headers=customer_token
    ).status_code == 404


def test_admin_staff_and_catalog_permissions(client: TestClient) -> None:
    admin_token = login(client, "admin@example.com", "administrator-password")
    staff_response = client.post(
        "/staff",
        headers=admin_token,
        json={
            "email": "staff@example.com",
            "password": "BrightloopStaff9!",
            "full_name": "Test Staff",
        },
    )
    assert staff_response.status_code == 201
    assert staff_response.json()["role"] == "staff"
    staff_token = login(client, "staff@example.com", "BrightloopStaff9!")
    customer_token = register_customer(client)
    customers = client.get("/customers", headers=staff_token)
    assert customers.status_code == 200
    assert customers.json()[0]["role"] == "customer"
    assert "password_hash" not in customers.json()[0]

    product_response = client.post(
        "/products",
        headers=admin_token,
        json={
            "name": "Brightloop",
            "product_type": "software",
            "sales_price": "10.00",
            "cost_price": "4.25",
            "notes": "Primary product",
        },
    )
    assert product_response.status_code == 201
    assert product_response.json()["product_type"] == "software"
    assert product_response.json()["sales_price"] == "10.00"
    assert product_response.json()["base_price"] == "10.00"
    assert product_response.json()["cost_price"] == "4.25"
    assert product_response.json()["notes"] == "Primary product"
    product_id = product_response.json()["id"]
    variant_response = client.post(
        f"/products/{product_id}/variants",
        headers=admin_token,
        json={"name": "Premium", "sku": "BRIGHT-PREMIUM", "additional_price": "2.50"},
    )
    assert variant_response.status_code == 201
    assert variant_response.json()["additional_price"] == "2.50"
    catalog_product = client.get(f"/products/{product_id}", headers=admin_token)
    assert catalog_product.json()["variants"][0]["sku"] == "BRIGHT-PREMIUM"

    assert client.get("/products", headers=staff_token).status_code == 200
    assert client.get("/users/me", headers=customer_token).json()["role"] == "customer"
    inactive_product = client.post(
        "/products",
        headers=admin_token,
        json={
            "name": "Hidden Product",
            "base_price": "1.00",
            "active": False,
        },
    ).json()
    customer_products = client.get("/products", headers=customer_token).json()
    assert all(product["id"] != inactive_product["id"] for product in customer_products)
    assert (
        client.get(f"/products/{inactive_product['id']}", headers=customer_token).status_code
        == 404
    )
    assert client.get("/products", headers=staff_token).json()[0]["active"] is True
    staff_products = client.get("/products", headers=staff_token).json()
    assert any(product["id"] == inactive_product["id"] for product in staff_products)
    assert client.post(
        "/products",
        headers=staff_token,
        json={"name": "Not Allowed", "base_price": "1.00"},
    ).status_code == 403
    assert client.post(
        "/staff",
        headers=staff_token,
        json={
            "email": "other-staff@example.com",
            "password": "BrightloopStaff9!",
            "full_name": "Other Staff",
        },
    ).status_code == 403
    updated_variant = client.patch(
        f"/products/{product_id}/variants/{variant_response.json()['id']}",
        headers=admin_token,
        json={"additional_price": "4.00"},
    )
    assert updated_variant.status_code == 200
    assert updated_variant.json()["additional_price"] == "4.00"
    updated_product = client.patch(
        f"/products/{product_id}",
        headers=admin_token,
        json={
            "name": "Brightloop Updated",
            "product_type": "digital",
            "sales_price": "12.00",
            "cost_price": "5.50",
            "notes": "Updated product notes",
        },
    )
    assert updated_product.status_code == 200
    assert updated_product.json()["name"] == "Brightloop Updated"
    assert updated_product.json()["product_type"] == "digital"
    assert updated_product.json()["sales_price"] == "12.00"
    assert updated_product.json()["base_price"] == "12.00"
    assert updated_product.json()["cost_price"] == "5.50"
    assert updated_product.json()["notes"] == "Updated product notes"
    archived_variant = client.delete(
        f"/products/{product_id}/variants/{variant_response.json()['id']}",
        headers=admin_token,
    )
    assert archived_variant.status_code == 200
    assert archived_variant.json()["active"] is False
    admin_product = client.get(f"/products/{product_id}", headers=admin_token).json()
    assert len(admin_product["variants"]) == 1
    assert admin_product["variants"][0]["id"] == archived_variant.json()["id"]
    assert admin_product["variants"][0]["active"] is False
    customer_product = client.get(f"/products/{product_id}", headers=customer_token).json()
    assert customer_product["variants"] == []

    archived_product = client.delete(f"/products/{product_id}", headers=admin_token)
    assert archived_product.status_code == 200
    assert archived_product.json()["active"] is False
    assert client.get(f"/products/{product_id}", headers=admin_token).status_code == 200
    assert client.get(f"/products/{product_id}", headers=customer_token).status_code == 404
    assert all(
        product["id"] != product_id
        for product in client.get("/products", headers=customer_token).json()
    )
    assert client.delete(
        f"/products/{product_id}", headers=customer_token
    ).status_code == 403


def test_only_admin_can_write_products_variants_and_plans(client: TestClient) -> None:
    admin_token = login(client, "admin@example.com", "administrator-password")
    staff_create = client.post(
        "/staff",
        headers=admin_token,
        json={
            "email": "catalog-staff@example.com",
            "password": "BrightloopStaff9!",
            "full_name": "Catalog Staff",
        },
    )
    assert staff_create.status_code == 201
    staff_token = login(client, "catalog-staff@example.com", "BrightloopStaff9!")
    customer_token = register_customer(client)

    product = client.post(
        "/products",
        headers=admin_token,
        json={
            "name": "Authorization Product",
            "sales_price": "10.00",
            "cost_price": "5.00",
        },
    ).json()
    variant = client.post(
        f"/products/{product['id']}/variants",
        headers=admin_token,
        json={"name": "Standard", "sku": "AUTH-STANDARD", "additional_price": "1.00"},
    ).json()
    plan = client.post(
        "/plans",
        headers=admin_token,
        json={
            "name": "Authorization Plan",
            "price": "10.00",
            "billing_frequency": "monthly",
        },
    ).json()

    assert client.get("/customers", headers=staff_token).status_code == 200
    assert client.get("/products", headers=staff_token).status_code == 200
    assert client.get("/plans", headers=staff_token).status_code == 200

    for role, headers in (("staff", staff_token), ("customer", customer_token)):
        requests = (
            ("post", "/products", {
                "name": "Forbidden Product",
                "sales_price": "1.00",
                "cost_price": "0.50",
            }),
            ("patch", f"/products/{product['id']}", {"name": "Modified"}),
            ("delete", f"/products/{product['id']}", None),
            ("post", f"/products/{product['id']}/variants", {
                "name": "Forbidden Variant",
                "sku": f"FORBIDDEN-{role.upper()}",
            }),
            (
                "patch",
                f"/products/{product['id']}/variants/{variant['id']}",
                {"name": "Modified"},
            ),
            ("delete", f"/products/{product['id']}/variants/{variant['id']}", None),
            ("post", "/plans", {
                "name": f"Forbidden Plan {role.title()}",
                "price": "1.00",
                "billing_frequency": "monthly",
            }),
            ("patch", f"/plans/{plan['id']}", {"name": "Modified"}),
            ("delete", f"/plans/{plan['id']}", None),
        )
        for method, path, payload in requests:
            response = client.request(
                method.upper(), path, headers=headers, json=payload
            )
            assert response.status_code == 403, f"{method.upper()} {path}"

    assert client.get(f"/products/{product['id']}", headers=admin_token).json()["active"]
    persisted_product = client.get(
        f"/products/{product['id']}", headers=admin_token
    ).json()
    assert persisted_product["variants"][0]["id"] == variant["id"]
    assert persisted_product["variants"][0]["active"] is True
    assert client.get(f"/plans/{plan['id']}", headers=admin_token).json()["active"]


@pytest.mark.parametrize("price_field", ["sales_price", "cost_price", "base_price"])
def test_product_create_rejects_negative_prices(
    client: TestClient, price_field: str
) -> None:
    admin_token = login(client, "admin@example.com", "administrator-password")
    response = client.post(
        "/products",
        headers=admin_token,
        json={"name": "Invalid Product", price_field: "-1.00"},
    )
    assert response.status_code == 422


@pytest.mark.parametrize("price_field", ["sales_price", "cost_price", "base_price"])
def test_product_update_rejects_negative_prices(
    client: TestClient, price_field: str
) -> None:
    admin_token = login(client, "admin@example.com", "administrator-password")
    product = client.post(
        "/products",
        headers=admin_token,
        json={"name": "Valid Product", "base_price": "10.00"},
    ).json()
    response = client.patch(
        f"/products/{product['id']}",
        headers=admin_token,
        json={price_field: "-1.00"},
    )
    assert response.status_code == 422


def test_product_create_preserves_legacy_fields(client: TestClient) -> None:
    admin_token = login(client, "admin@example.com", "administrator-password")
    response = client.post(
        "/products",
        headers=admin_token,
        json={
            "name": "Legacy Product",
            "base_price": "7.50",
            "description": "Existing description field",
        },
    )
    assert response.status_code == 201
    product = response.json()
    assert product["base_price"] == "7.50"
    assert product["sales_price"] == "7.50"
    assert product["description"] == "Existing description field"
    assert product["cost_price"] == "0.00"


def test_variant_sku_must_be_unique_and_additional_price_nonnegative(
    client: TestClient,
) -> None:
    admin_token = login(client, "admin@example.com", "administrator-password")
    product = client.post(
        "/products",
        headers=admin_token,
        json={
            "name": "Variant Validation Product",
            "sales_price": "10.00",
            "cost_price": "5.00",
        },
    ).json()
    variant_payload = {
        "name": "First Variant",
        "sku": "UNIQUE-VALIDATION-SKU",
        "additional_price": "1.25",
    }
    created = client.post(
        f"/products/{product['id']}/variants",
        headers=admin_token,
        json=variant_payload,
    )
    assert created.status_code == 201

    duplicate_sku = client.post(
        f"/products/{product['id']}/variants",
        headers=admin_token,
        json={**variant_payload, "name": "Duplicate SKU"},
    )
    assert duplicate_sku.status_code == 409

    negative_additional_price = client.post(
        f"/products/{product['id']}/variants",
        headers=admin_token,
        json={
            "name": "Negative Price Variant",
            "sku": "NEGATIVE-ADDITIONAL-PRICE",
            "additional_price": "-0.01",
        },
    )
    assert negative_additional_price.status_code == 422


def test_existing_product_table_gets_new_columns_without_losing_data(tmp_path) -> None:
    database_path = (tmp_path / "legacy.db").as_posix()
    engine = create_engine(f"sqlite:///{database_path}")
    with engine.begin() as connection:
        connection.execute(
            text(
                "CREATE TABLE products ("
                "id INTEGER PRIMARY KEY, "
                "name VARCHAR(120) NOT NULL, "
                "description TEXT, "
                "base_price NUMERIC(10, 2) NOT NULL, "
                "active BOOLEAN NOT NULL, "
                "created_at DATETIME NOT NULL)"
            )
        )
        connection.execute(
            text(
                "INSERT INTO products "
                "(id, name, description, base_price, active, created_at) "
                "VALUES (1, 'Existing Product', 'Original description', 8.50, 1, "
                "'2026-01-01 00:00:00')"
            )
        )
    engine.dispose()

    app = create_app(
        f"sqlite:///{database_path}",
        jwt_secret="test-secret-key-with-at-least-32-characters",
        initial_admin_email="admin@example.com",
        initial_admin_password="administrator-password",
    )
    with TestClient(app) as test_client:
        admin_token = login(test_client, "admin@example.com", "administrator-password")
        response = test_client.get("/products", headers=admin_token)

    assert response.status_code == 200
    product = response.json()[0]
    assert product["name"] == "Existing Product"
    assert product["description"] == "Original description"
    assert product["base_price"] == "8.50"
    assert product["sales_price"] == "8.50"
    assert product["product_type"] == "general"
    assert product["cost_price"] == "0.00"
    assert product["notes"] is None


def test_existing_plan_table_gets_new_columns_without_losing_data(tmp_path) -> None:
    database_path = (tmp_path / "legacy_plans.db").as_posix()
    engine = create_engine(f"sqlite:///{database_path}")
    with engine.begin() as connection:
        connection.execute(
            text(
                "CREATE TABLE subscription_plans ("
                "id INTEGER PRIMARY KEY, "
                "name VARCHAR(120) NOT NULL, "
                "description TEXT, "
                "price NUMERIC(10, 2) NOT NULL, "
                "billing_frequency VARCHAR(20) NOT NULL, "
                "billing_interval INTEGER NOT NULL, "
                "active BOOLEAN NOT NULL, "
                "created_at DATETIME NOT NULL)"
            )
        )
        connection.execute(
            text(
                "INSERT INTO subscription_plans "
                "(id, name, description, price, billing_frequency, billing_interval, "
                "active, created_at) "
                "VALUES (1, 'Existing Plan', 'Original plan', 9.99, 'monthly', 1, 1, "
                "'2026-01-01 00:00:00')"
            )
        )
    engine.dispose()

    app = create_app(
        f"sqlite:///{database_path}",
        jwt_secret="test-secret-key-with-at-least-32-characters",
        initial_admin_email="admin@example.com",
        initial_admin_password="administrator-password",
    )
    with TestClient(app) as test_client:
        admin_token = login(test_client, "admin@example.com", "administrator-password")
        response = test_client.get("/plans", headers=admin_token)

    assert response.status_code == 200
    plan = response.json()[0]
    assert plan["name"] == "Existing Plan"
    assert plan["price"] == "9.99"
    assert plan["minimum_quantity"] == 1
    assert plan["availability_start_date"] is None
    assert plan["availability_end_date"] is None
    assert plan["auto_close_policy"] == "never"
    assert plan["early_close_policy"] == "admin_only"
    assert plan["pause_policy"] == "allowed"
    assert plan["renewal_policy"] == "auto_renew"


@pytest.mark.parametrize("frequency", ["daily", "weekly", "monthly", "yearly"])
def test_plan_crud_supports_all_billing_frequencies(
    client: TestClient, frequency: str
) -> None:
    admin_token = login(client, "admin@example.com", "administrator-password")
    customer_token = register_customer(client)
    created = client.post(
        "/plans",
        headers=admin_token,
        json={
            "name": f"{frequency.title()} Plan",
            "price": "12.99",
            "billing_frequency": frequency,
            "billing_interval": 2,
            "minimum_quantity": 3,
            "availability_start_date": "2026-11-01",
            "availability_end_date": "2026-12-01",
            "auto_close_policy": "never",
            "early_close_policy": "admin_only",
            "pause_policy": "allowed",
            "renewal_policy": "auto_renew",
        },
    )
    assert created.status_code == 201
    plan_id = created.json()["id"]
    assert created.json()["billing_frequency"] == frequency
    assert created.json()["billing_interval"] == 2
    assert created.json()["minimum_quantity"] == 3
    assert created.json()["availability_start_date"] == "2026-11-01"
    assert created.json()["availability_end_date"] == "2026-12-01"
    assert created.json()["auto_close_policy"] == "never"
    assert created.json()["early_close_policy"] == "admin_only"
    assert created.json()["pause_policy"] == "allowed"
    assert created.json()["renewal_policy"] == "auto_renew"
    assert client.get(f"/plans/{plan_id}", headers=admin_token).status_code == 200
    assert len(client.get("/plans", headers=admin_token).json()) == 1
    assert client.patch(
        f"/plans/{plan_id}",
        headers=admin_token,
        json={
            "price": "15.00",
            "minimum_quantity": 5,
            "availability_start_date": "2026-11-02",
            "pause_policy": "allowed",
        },
    ).json()["price"] == "15.00"
    updated = client.get(f"/plans/{plan_id}", headers=admin_token).json()
    assert updated["minimum_quantity"] == 5
    assert updated["availability_start_date"] == "2026-11-02"
    assert updated["availability_end_date"] == "2026-12-01"
    archived_plan = client.delete(f"/plans/{plan_id}", headers=admin_token)
    assert archived_plan.status_code == 200
    assert archived_plan.json()["active"] is False
    assert client.get(f"/plans/{plan_id}", headers=admin_token).status_code == 200
    assert client.get(f"/plans/{plan_id}", headers=customer_token).status_code == 404
    assert all(
        listed_plan["id"] != plan_id
        for listed_plan in client.get("/plans", headers=customer_token).json()
    )
    assert client.delete(
        f"/plans/{plan_id}", headers=customer_token
    ).status_code == 403


def test_plan_create_validates_minimum_quantity_and_date_range(client: TestClient) -> None:
    admin_token = login(client, "admin@example.com", "administrator-password")
    plan_data = {
        "name": "Invalid Quantity Plan",
        "price": "10.00",
        "billing_frequency": "monthly",
    }
    assert client.post(
        "/plans", headers=admin_token, json={**plan_data, "minimum_quantity": 0}
    ).status_code == 422
    assert client.post(
        "/plans", headers=admin_token, json={**plan_data, "billing_interval": 0}
    ).status_code == 422

    invalid_dates = {
        **plan_data,
        "name": "Invalid Dates Plan",
        "availability_start_date": "2026-12-02",
        "availability_end_date": "2026-12-01",
    }
    assert client.post("/plans", headers=admin_token, json=invalid_dates).status_code == 422


def test_plan_update_validates_minimum_quantity_and_effective_date_range(
    client: TestClient,
) -> None:
    admin_token = login(client, "admin@example.com", "administrator-password")
    plan = client.post(
        "/plans",
        headers=admin_token,
        json={
            "name": "Update Validation Plan",
            "price": "10.00",
            "billing_frequency": "monthly",
            "availability_start_date": "2026-12-01",
            "availability_end_date": "2026-12-10",
        },
    ).json()
    plan_id = plan["id"]
    assert client.patch(
        f"/plans/{plan_id}",
        headers=admin_token,
        json={"minimum_quantity": 0},
    ).status_code == 422
    assert client.patch(
        f"/plans/{plan_id}",
        headers=admin_token,
        json={"availability_end_date": "2026-11-30"},
    ).status_code == 422
    assert client.patch(
        f"/plans/{plan_id}",
        headers=admin_token,
        json={"availability_start_date": "2026-12-11"},
    ).status_code == 422


def test_customers_only_see_active_plans_with_configuration(client: TestClient) -> None:
    admin_token = login(client, "admin@example.com", "administrator-password")
    customer_token = register_customer(client)
    active_plan = client.post(
        "/plans",
        headers=admin_token,
        json={
            "name": "Visible Plan",
            "price": "5.00",
            "billing_frequency": "monthly",
        },
    )
    inactive_plan = client.post(
        "/plans",
        headers=admin_token,
        json={
            "name": "Hidden Plan",
            "price": "5.00",
            "billing_frequency": "monthly",
            "active": False,
        },
    )
    assert active_plan.status_code == 201
    assert inactive_plan.status_code == 201
    customer_plans = client.get("/plans", headers=customer_token)
    assert customer_plans.status_code == 200
    assert [plan["id"] for plan in customer_plans.json()] == [active_plan.json()["id"]]


def test_login_rejects_bad_password_and_customers_cannot_edit_catalog(
    client: TestClient,
) -> None:
    customer_token = register_customer(client)
    assert (
        client.post(
            "/auth/login",
            json={"email": "customer@example.com", "password": "incorrect-password"},
        ).status_code
        == 401
    )
    assert (
        client.post(
            "/plans",
            headers=customer_token,
            json={
                "name": "Unauthorized",
                "price": "9.99",
                "billing_frequency": "monthly",
            },
        ).status_code
        == 403
    )


@pytest.mark.parametrize(
    ("password", "error"),
    [
        ("Short!A1", "at least 9 characters"),
        ("alllowercase9!", "uppercase letter"),
        ("ALLUPPERCASE9!", "lowercase letter"),
        ("NoSpecialChar9", "special character"),
    ],
)
@pytest.mark.parametrize("endpoint", ["/auth/register", "/staff"])
def test_account_creation_rejects_weak_passwords(
    client: TestClient, endpoint: str, password: str, error: str
) -> None:
    headers = None
    if endpoint == "/staff":
        headers = login(client, "admin@example.com", "administrator-password")
    response = client.post(
        endpoint,
        headers=headers,
        json={
            "email": f"{endpoint[1:]}-{error.split()[0]}@example.com",
            "password": password,
            "full_name": "Password Test",
        },
    )
    assert response.status_code == 422
    assert error in response.json()["detail"][0]["msg"]


@pytest.mark.parametrize(
    "password",
    ["Brightloop9!", "Ábcdefgh!"],
    ids=["ascii-letters-with-special", "unicode-letters-with-special"],
)
def test_registration_accepts_password_with_real_special_character(
    client: TestClient, password: str
) -> None:
    response = client.post(
        "/auth/register",
        json={
            "email": f"valid-{ord(password[0])}@example.com",
            "password": password,
            "full_name": "Valid Password",
        },
    )
    assert response.status_code == 201


def test_unicode_letters_do_not_satisfy_special_character_requirement(
    client: TestClient,
) -> None:
    response = client.post(
        "/auth/register",
        json={
            "email": "unicode-no-special@example.com",
            "password": "Ábcdefghi",
            "full_name": "Unicode Password",
        },
    )
    assert response.status_code == 422
    assert "special character" in response.json()["detail"][0]["msg"]


def test_new_customer_and_staff_accept_strong_passwords(client: TestClient) -> None:
    customer = client.post(
        "/auth/register",
        json={
            "email": "strong-customer@example.com",
            "password": "Brightloop9!",
            "full_name": "Strong Customer",
        },
    )
    assert customer.status_code == 201

    admin_token = login(client, "admin@example.com", "administrator-password")
    staff = client.post(
        "/staff",
        headers=admin_token,
        json={
            "email": "strong-staff@example.com",
            "password": "BrightloopStaff9!",
            "full_name": "Strong Staff",
        },
    )
    assert staff.status_code == 201


def test_existing_weak_password_can_still_be_used_to_log_in(client: TestClient) -> None:
    legacy_password = "legacy-password"
    with client.app.state.session_factory() as db:
        db.add(
            User(
                email="legacy@example.com",
                full_name="Legacy User",
                password_hash=hash_password(legacy_password),
                role="customer",
            )
        )
        db.commit()

    response = client.post(
        "/auth/login",
        json={"email": "legacy@example.com", "password": legacy_password},
    )
    assert response.status_code == 200
    assert response.json()["access_token"]


def test_product_hard_delete_is_restricted_and_preserves_variants(
    client: TestClient,
) -> None:
    admin_token = login(client, "admin@example.com", "administrator-password")
    product_response = client.post(
        "/products",
        headers=admin_token,
        json={
            "name": "Deletion Safety Product",
            "sales_price": "10.00",
            "cost_price": "5.00",
        },
    )
    assert product_response.status_code == 201
    product_id = product_response.json()["id"]
    variant_response = client.post(
        f"/products/{product_id}/variants",
        headers=admin_token,
        json={
            "name": "Deletion Safety Variant",
            "sku": "DELETION-SAFETY-SKU",
            "additional_price": "1.00",
        },
    )
    assert variant_response.status_code == 201
    variant_id = variant_response.json()["id"]

    with client.app.state.session_factory() as db:
        product = db.get(Product, product_id)
        assert product is not None
        assert len(product.variants) == 1
        db.delete(product)
        with pytest.raises(IntegrityError):
            db.commit()
        db.rollback()

    with client.app.state.session_factory() as db:
        assert db.get(Product, product_id) is not None
        assert db.get(ProductVariant, variant_id) is not None
