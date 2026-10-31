# Brightloop Backend Integration Handoff — Member 3

This document describes the backend as currently implemented for integration
with Member 3's subscription and billing work. It distinguishes existing
Member 1 functionality from work that Member 3 still owns. No subscription,
invoice, discount, or payment model or endpoint is currently implemented.

## 1. Technology stack

- Python
- FastAPI
- Pydantic v2 request and response schemas
- SQLAlchemy ORM
- SQLite by default; `DATABASE_URL` can select another SQLAlchemy-supported
  database
- PyJWT (HS256) bearer tokens
- Python `hashlib.scrypt` password hashing
- Uvicorn
- pytest and FastAPI's `TestClient` for tests

Dependencies are listed in the repository-root `requirements.txt` and
`requirements-dev.txt`.

## 2. Database configuration and initialization

Database setup lives in [`database.py`](./database.py):

- `Base` is the declarative SQLAlchemy base used by all mapped models.
- `create_database_engine(url)` creates the engine. For SQLite it enables
  cross-thread connections and turns on SQLite foreign-key enforcement.
- `get_db` yields a request-scoped SQLAlchemy `Session` from the application
  session factory and closes it when the request completes.

Application initialization is in [`main.py`](./main.py), in `create_app`'s
lifespan:

1. Requires `JWT_SECRET_KEY` with at least 32 characters.
2. Calls `Base.metadata.create_all(bind=engine)`.
3. Applies additive SQLite-compatible column migrations for the Product and
   SubscriptionPlan additions.
4. Creates the initial admin if credentials are configured and no admin
   exists.

The default URL is `sqlite:///./subscription_manager.db`. Set `DATABASE_URL`
to override it. The current schema adjustments are small startup migrations,
not a general migration framework.

## 3. Existing SQLAlchemy models

All current mapped models are in [`models.py`](./models.py).

### `User` (`users`)

- `id`: integer primary key
- `email`: unique, indexed string
- `full_name`: string
- `password_hash`: string; stores a scrypt hash, not the plaintext password
- `role`: string, constrained to `admin`, `staff`, or `customer`; defaults to
  `customer`
- `created_at`: timezone-aware datetime

### `Product` (`products`)

- `id`: integer primary key
- `name`: indexed string
- `product_type`: string; defaults to `general`
- `description`: nullable text (retained for API compatibility)
- `base_price`: `Numeric(10, 2)`; existing database price column
- `sales_price`: SQLAlchemy synonym for `base_price`, not a separate column
- `cost_price`: `Numeric(10, 2)`
- `notes`: nullable text
- `active`: boolean
- `created_at`: timezone-aware datetime
- `variants`: one-to-many relationship to `ProductVariant`, ordered by ID

### `ProductVariant` (`product_variants`)

- `id`: integer primary key
- `product_id`: foreign key to `products.id`, indexed, with database
  `ON DELETE CASCADE`
- `name`: string
- `sku`: unique, indexed string
- `additional_price`: `Numeric(10, 2)`
- `active`: boolean
- `product`: many-to-one relationship back to `Product`

The Product relationship also specifies ORM `all, delete-orphan` cascade.
Catalog DELETE API operations currently archive by setting `active=False`;
they do not call SQLAlchemy hard deletion.

### `SubscriptionPlan` (`subscription_plans`)

- `id`: integer primary key
- `name`: unique, indexed string
- `description`: nullable text
- `price`: `Numeric(10, 2)`
- `billing_frequency`: string constrained to `daily`, `weekly`, `monthly`,
  or `yearly`
- `billing_interval`: integer, minimum 1
- `minimum_quantity`: integer, minimum 1
- `availability_start_date`, `availability_end_date`: nullable SQL `DATE`
- `auto_close_policy`: currently accepts `never`
- `early_close_policy`: currently accepts `admin_only`
- `pause_policy`: currently accepts `allowed`
- `renewal_policy`: currently accepts `auto_renew`
- `active`: boolean
- `created_at`: timezone-aware datetime

Plan availability dates are validated so the end date cannot be earlier than
the start date. They are configuration data; subscription availability
evaluation or lifecycle processing is not implemented here.

## 4. Current relationships and Member 3 integration

Existing ORM relationships:

- `Product` → `ProductVariant`: one-to-many; each variant belongs to one
  product.
- There are currently **no ORM relationships** from `User` to `Product`,
  `ProductVariant`, or `SubscriptionPlan`.
- There are currently **no Subscription or Payment models** and no foreign
  keys from those records, because those models do not exist yet.

For the future `Subscription` model, Member 3 should consider foreign-key
relationships to:

- the subscribing customer (`User.id`; validate that the associated user's
  role is `customer`);
- the selected product (`Product.id`);
- the selected product variant (`ProductVariant.id`) when the subscription
  uses a variant, ensuring the variant belongs to the selected product;
- the selected subscription plan (`SubscriptionPlan.id`).

These are integration considerations, **not existing fields or
relationships**. Decide which references are required or nullable based on
Member 3's domain requirements. Preserve historical references when catalog
records are archived; do not make a subscription dependent on an active
catalog listing remaining visible.

## 5. Existing API endpoints

`UserRead` responses expose `id`, `email`, `full_name`, and `role`; password
hashes are not returned. Catalog endpoints use the Pydantic response schemas
described below. Protected endpoints require
`Authorization: Bearer <JWT>`.

| Method | Path | Request schema/body | Response | Access |
|---|---|---|---|---|
| GET | `/` | None | Welcome message object | Public |
| GET | `/health` | None | `{"status": "healthy"}` | Public |
| POST | `/auth/register` | `CustomerRegistration` | `UserRead` (201) | Public; always creates customer |
| POST | `/auth/login` | `LoginRequest` | `TokenResponse` | Public |
| GET | `/users/me` | None | `UserRead` | Any authenticated user; own profile |
| PATCH | `/users/me` | `UserUpdate` | `UserRead` | Any authenticated user; own profile |
| GET | `/users` | None | `list[UserRead]` | Admin |
| POST | `/staff` | `StaffCreate` | `UserRead` (201) | Admin |
| GET | `/customers` | None | `list[UserRead]` | Admin or staff |
| GET | `/products` | None | `list[ProductRead]` | Any authenticated user |
| POST | `/products` | `ProductCreate` | `ProductRead` (201) | Admin |
| GET | `/products/{product_id}` | None | `ProductRead` | Authenticated; customer only sees active product |
| PATCH | `/products/{product_id}` | `ProductUpdate` | `ProductRead` | Admin |
| DELETE | `/products/{product_id}` | None | Archived `ProductRead` (200) | Admin; sets `active=False` |
| POST | `/products/{product_id}/variants` | `ProductVariantCreate` | `ProductVariantRead` (201) | Admin |
| PATCH | `/products/{product_id}/variants/{variant_id}` | `ProductVariantUpdate` | `ProductVariantRead` | Admin |
| DELETE | `/products/{product_id}/variants/{variant_id}` | None | Archived `ProductVariantRead` (200) | Admin; sets `active=False` |
| GET | `/plans` | None | `list[PlanRead]` | Any authenticated user |
| POST | `/plans` | `PlanCreate` | `PlanRead` (201) | Admin |
| GET | `/plans/{plan_id}` | None | `PlanRead` | Authenticated; customer only sees active plan |
| PATCH | `/plans/{plan_id}` | `PlanUpdate` | `PlanRead` | Admin |
| DELETE | `/plans/{plan_id}` | None | Archived `PlanRead` (200) | Admin; sets `active=False` |

There is no standalone GET endpoint for a product variant. Variants are
returned nested under products; customers receive active variants only,
while staff/admin catalog reads include inactive variants.

## 6. Request and response schemas

Schemas are defined in [`schemas.py`](./schemas.py).

- `CustomerRegistration` / `StaffCreate`: email, password, full name.
  Newly created customer/staff passwords require at least 9 characters, one
  uppercase letter, one lowercase letter, and one special character.
- `LoginRequest`: email and password; it does not apply the new-account
  strength rule, so existing accounts can continue to authenticate.
- `TokenResponse`: `access_token`, `token_type` (`bearer`).
- `UserUpdate`: optional full name. Users cannot change their role, email, or
  password through this endpoint.
- `ProductCreate` / `ProductUpdate`: name, product type, sales price, cost
  price, notes, active status, plus legacy `base_price` and `description`
  fields. `sales_price` and legacy `base_price` map to the same price and
  conflicting values are rejected. Monetary fields use `Decimal`; negative
  prices are rejected.
- `ProductRead`: product fields plus a list of `ProductVariantRead`.
- `ProductVariantCreate` / `ProductVariantUpdate`: name, SKU, additional
  price, active status. SKU is unique; additional price is non-negative.
- `SubscriptionPlan` schemas: name, description, Decimal price, billing
  frequency and interval, minimum quantity, nullable availability dates,
  policy values, and active status.
- Input schemas reject unknown fields (`extra="forbid"`).

## 7. Authentication and role permissions

JWTs are issued by `/auth/login` and expire after 30 minutes. The token subject
is the user's ID. `get_current_user` validates the token and fetches the
current User. Password hashes are generated and checked using scrypt in
[`security.py`](./security.py).

| Capability | Admin | Staff | Customer |
|---|---:|---:|---:|
| List users | Yes | No | No |
| Create staff | Yes | No | No |
| List customers | Yes | Yes | No |
| Read products/plans | Yes | Yes | Yes; active entries only |
| Read inactive product/plan | Yes | Yes | No |
| Create/update/archive products, variants, plans | Yes | No | No |
| Read/update own profile | Yes | Yes | Yes |
| Read another user's profile | No endpoint | No endpoint | No endpoint |

Initial admin credentials are configured with `INITIAL_ADMIN_EMAIL` and
`INITIAL_ADMIN_PASSWORD`. There is no public admin-registration endpoint.

## 8. SQLAlchemy access and registering new models

Member 3 can reuse the existing database dependency and base:

```python
from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session

from backend.database import Base, get_db

def example(db: Annotated[Session, Depends(get_db)]):
    ...
```

For a new model, import `Base` from `backend.database` and declare the mapped
class using `Base`. Ensure the model module is imported before
`Base.metadata.create_all(bind=engine)` executes. Currently,
[`main.py`](./main.py) imports the existing models at module load before app
lifespan initialization. If Member 3 places models in a new module, import
that module in `main.py` (or an already imported model-registration module)
before the `create_all` call; otherwise SQLAlchemy will not know about the
mapping and will omit its table. Use `Depends(get_db)` for request-scoped
sessions rather than creating a separate engine/session per endpoint.

For test app instances, `app.state.session_factory` is also available, but
application endpoints should use the `get_db` dependency.

## 9. Local setup and tests

From the repository root, in PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
$env:JWT_SECRET_KEY = "<at-least-32-random-characters>"
$env:INITIAL_ADMIN_EMAIL = "admin@example.com"
$env:INITIAL_ADMIN_PASSWORD = "<strong-password>"
uvicorn backend.main:app --reload
```

The API documentation is available at `http://127.0.0.1:8000/docs`.
Set `DATABASE_URL` to use a different database URL.

Install development dependencies and run all tests:

```powershell
python -m pip install -r requirements-dev.txt
python -m pytest
```

The test suite uses pytest fixtures with a separate temporary SQLite database
per test client.

## Integration Requirements for Member 3

### Existing foundation Member 3 can use

- SQLAlchemy `Base`, engine configuration, request-scoped `Session` dependency,
  and startup table initialization.
- `User`, `Product`, `ProductVariant`, and `SubscriptionPlan` models.
- Existing JWT authentication and role dependencies in `main.py`.
- Catalog archival via `active=False`; historical catalog rows remain in the
  database. Customer catalog reads filter inactive products/plans and
  inactive variants.

### Member 3 owns and still needs to implement

- Subscription model and subscription creation.
- Subscription lifecycle.
- Renewals and cancellations.
- Invoices.
- Discounts.
- Payment processing.

No endpoints, models, fields, or relationships for those features are
implemented in this Member 1 backend yet. Coordinate the final Subscription
foreign keys, nullability, and behavior with the project requirements before
adding them. Do not rely on product/variant/plan catalog visibility as a
substitute for preserving references to archived records.
