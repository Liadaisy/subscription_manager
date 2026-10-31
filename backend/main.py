import logging
import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Annotated
from fastapi.middleware.cors import CORSMiddleware
import jwt
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload, sessionmaker

from backend.database import (
    Base,
    create_database_engine,
    get_db,
    migrate_product_columns,
    migrate_subscription_plan_columns,
)
from backend.models import Product, ProductVariant, SubscriptionPlan, User
from backend.schemas import (
    CustomerRegistration,
    Credentials,
    LoginRequest,
    PlanCreate,
    PlanRead,
    PlanUpdate,
    ProductCreate,
    ProductRead,
    ProductUpdate,
    ProductVariantCreate,
    ProductVariantRead,
    ProductVariantUpdate,
    StaffCreate,
    TokenResponse,
    UserRead,
    UserUpdate,
)
from backend.security import create_access_token, hash_password, verify_password

logger = logging.getLogger(__name__)
bearer_scheme = HTTPBearer(auto_error=False)


def _admin_bootstrap(factory: sessionmaker[Session], email: str | None,
                     password: str | None) -> None:
    if bool(email) != bool(password):
        raise RuntimeError("Set both INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD.")

    with factory() as db:
        if db.scalar(select(User.id).where(User.role == "admin").limit(1)) is not None:
            return
        if not email or not password:
            logger.warning(
                "No administrator exists. Set INITIAL_ADMIN_EMAIL and "
                "INITIAL_ADMIN_PASSWORD to bootstrap one."
            )
            return
        try:
            admin_data = Credentials(
                email=email,
                password=password,
            )
        except ValidationError as error:
            raise RuntimeError("Initial administrator credentials are invalid.") from error

        admin = User(
            email=admin_data.email,
            full_name="Administrator",
            password_hash=hash_password(admin_data.password),
            role="admin",
        )
        db.add(admin)
        try:
            db.commit()
        except IntegrityError as error:
            db.rollback()
            raise RuntimeError("Could not bootstrap the initial administrator.") from error


def create_app(
    database_url: str | None = None,
    *,
    jwt_secret: str | None = None,
    initial_admin_email: str | None = None,
    initial_admin_password: str | None = None,
) -> FastAPI:
    url = database_url or os.getenv("DATABASE_URL", "sqlite:///./subscription_manager.db")
    secret = jwt_secret if jwt_secret is not None else os.getenv("JWT_SECRET_KEY")
    admin_email = (
        initial_admin_email
        if initial_admin_email is not None
        else os.getenv("INITIAL_ADMIN_EMAIL")
    )
    admin_password = (
        initial_admin_password
        if initial_admin_password is not None
        else os.getenv("INITIAL_ADMIN_PASSWORD")
    )
    engine = create_database_engine(url)
    factory = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncGenerator[None, None]:
        if not secret or len(secret) < 32:
            raise RuntimeError("Set JWT_SECRET_KEY to a value of at least 32 characters.")
        Base.metadata.create_all(bind=engine)
        migrate_product_columns(engine)
        migrate_subscription_plan_columns(engine)
        _admin_bootstrap(factory, admin_email, admin_password)
        yield
        engine.dispose()

    app = FastAPI(
        title="Brightloop Subscription Management",
        description="Backend API for Brightloop subscription management.",
        version="1.0.0",
        lifespan=lifespan,
    )
    app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    )   
    app.state.session_factory = factory
    app.state.jwt_secret = secret

    def unauthorized() -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    def get_current_user(
        request: Request,
        credentials: Annotated[
            HTTPAuthorizationCredentials | None, Depends(bearer_scheme)
        ],
        db: Annotated[Session, Depends(get_db)],
    ) -> User:
        if credentials is None:
            raise unauthorized()
        try:
            payload = jwt.decode(
                credentials.credentials,
                request.app.state.jwt_secret,
                algorithms=["HS256"],
                options={"require": ["exp", "sub"]},
            )
            user_id = int(payload["sub"])
        except (jwt.InvalidTokenError, KeyError, TypeError, ValueError):
            raise unauthorized() from None
        user = db.get(User, user_id)
        if user is None:
            raise unauthorized()
        return user

    def require_admin(user: Annotated[User, Depends(get_current_user)]) -> User:
        if user.role != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
        return user

    def require_staff_or_admin(
        user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        if user.role not in {"admin", "staff"}:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staff access required")
        return user

    def commit_or_conflict(db: Session, detail: str) -> None:
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail) from None

    @app.get("/")
    def home() -> dict[str, str]:
        return {"message": "Welcome to the Brightloop Subscription Management API!"}

    @app.get("/health")
    def health_check() -> dict[str, str]:
        return {"status": "healthy"}

    @app.post("/auth/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
    def register_customer(
        data: CustomerRegistration, db: Annotated[Session, Depends(get_db)]
    ) -> User:
        user = User(
            email=data.email,
            full_name=data.full_name,
            password_hash=hash_password(data.password),
            role="customer",
        )
        db.add(user)
        commit_or_conflict(db, "An account with this email already exists")
        db.refresh(user)
        return user

    @app.post("/auth/login", response_model=TokenResponse)
    def login(
        data: LoginRequest,
        request: Request,
        db: Annotated[Session, Depends(get_db)],
    ) -> TokenResponse:
        user = db.scalar(select(User).where(User.email == data.email))
        if user is None or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        token = create_access_token(user.id, request.app.state.jwt_secret)
        return TokenResponse(access_token=token)

    @app.get("/users/me", response_model=UserRead)
    def get_my_profile(
        user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        return user

    @app.patch("/users/me", response_model=UserRead)
    def update_my_profile(
        data: UserUpdate,
        user: Annotated[User, Depends(get_current_user)],
        db: Annotated[Session, Depends(get_db)],
    ) -> User:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(user, field, value)
        db.commit()
        db.refresh(user)
        return user

    @app.get("/users", response_model=list[UserRead])
    def list_users(
        _: Annotated[User, Depends(require_admin)],
        db: Annotated[Session, Depends(get_db)],
    ) -> list[User]:
        return list(db.scalars(select(User).order_by(User.id)).all())

    @app.post("/staff", response_model=UserRead, status_code=status.HTTP_201_CREATED)
    def create_staff(
        data: StaffCreate,
        _: Annotated[User, Depends(require_admin)],
        db: Annotated[Session, Depends(get_db)],
    ) -> User:
        user = User(
            email=data.email,
            full_name=data.full_name,
            password_hash=hash_password(data.password),
            role="staff",
        )
        db.add(user)
        commit_or_conflict(db, "An account with this email already exists")
        db.refresh(user)
        return user

    @app.get("/customers", response_model=list[UserRead])
    def list_customers(
        _: Annotated[User, Depends(require_staff_or_admin)],
        db: Annotated[Session, Depends(get_db)],
    ) -> list[User]:
        return list(
            db.scalars(
                select(User).where(User.role == "customer").order_by(User.id)
            ).all()
        )

    @app.get("/products", response_model=list[ProductRead])
    def list_products(
        user: Annotated[User, Depends(get_current_user)],
        db: Annotated[Session, Depends(get_db)],
    ) -> list[Product]:
        statement = select(Product)
        if user.role == "customer":
            statement = (
                statement.where(Product.active.is_(True))
                .options(
                    selectinload(
                        Product.variants.and_(ProductVariant.active.is_(True))
                    )
                )
            )
        else:
            statement = statement.options(selectinload(Product.variants))
        return list(db.scalars(statement.order_by(Product.id)).all())

    @app.post("/products", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
    def create_product(
        data: ProductCreate,
        _: Annotated[User, Depends(require_admin)],
        db: Annotated[Session, Depends(get_db)],
    ) -> Product:
        product = Product(**data.model_dump())
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @app.get("/products/{product_id}", response_model=ProductRead)
    def get_product(
        product_id: int,
        user: Annotated[User, Depends(get_current_user)],
        db: Annotated[Session, Depends(get_db)],
    ) -> Product:
        statement = select(Product).where(Product.id == product_id)
        if user.role == "customer":
            statement = statement.options(
                selectinload(
                    Product.variants.and_(ProductVariant.active.is_(True))
                )
            )
        product = db.scalar(statement)
        if product is None or (user.role == "customer" and not product.active):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        return product

    @app.patch("/products/{product_id}", response_model=ProductRead)
    def update_product(
        product_id: int,
        data: ProductUpdate,
        _: Annotated[User, Depends(require_admin)],
        db: Annotated[Session, Depends(get_db)],
    ) -> Product:
        product = db.get(Product, product_id)
        if product is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(product, field, value)
        db.commit()
        db.refresh(product)
        return product

    @app.delete("/products/{product_id}", response_model=ProductRead)
    def delete_product(
        product_id: int,
        _: Annotated[User, Depends(require_admin)],
        db: Annotated[Session, Depends(get_db)],
    ) -> Product:
        product = db.get(Product, product_id)
        if product is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        product.active = False
        db.commit()
        db.refresh(product)
        return product

    @app.post(
        "/products/{product_id}/variants",
        response_model=ProductVariantRead,
        status_code=status.HTTP_201_CREATED,
    )
    def create_product_variant(
        product_id: int,
        data: ProductVariantCreate,
        _: Annotated[User, Depends(require_admin)],
        db: Annotated[Session, Depends(get_db)],
    ) -> ProductVariant:
        if db.get(Product, product_id) is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        variant = ProductVariant(product_id=product_id, **data.model_dump())
        db.add(variant)
        commit_or_conflict(db, "A product variant with this SKU already exists")
        db.refresh(variant)
        return variant

    @app.patch(
        "/products/{product_id}/variants/{variant_id}",
        response_model=ProductVariantRead,
    )
    def update_product_variant(
        product_id: int,
        variant_id: int,
        data: ProductVariantUpdate,
        _: Annotated[User, Depends(require_admin)],
        db: Annotated[Session, Depends(get_db)],
    ) -> ProductVariant:
        variant = db.scalar(
            select(ProductVariant).where(
                ProductVariant.id == variant_id,
                ProductVariant.product_id == product_id,
            )
        )
        if variant is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product variant not found")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(variant, field, value)
        commit_or_conflict(db, "A product variant with this SKU already exists")
        db.refresh(variant)
        return variant

    @app.delete(
        "/products/{product_id}/variants/{variant_id}",
        response_model=ProductVariantRead,
    )
    def delete_product_variant(
        product_id: int,
        variant_id: int,
        _: Annotated[User, Depends(require_admin)],
        db: Annotated[Session, Depends(get_db)],
    ) -> ProductVariant:
        variant = db.scalar(
            select(ProductVariant).where(
                ProductVariant.id == variant_id,
                ProductVariant.product_id == product_id,
            )
        )
        if variant is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product variant not found")
        variant.active = False
        db.commit()
        db.refresh(variant)
        return variant

    @app.get("/plans", response_model=list[PlanRead])
    def list_plans(
        user: Annotated[User, Depends(get_current_user)],
        db: Annotated[Session, Depends(get_db)],
    ) -> list[SubscriptionPlan]:
        statement = select(SubscriptionPlan)
        if user.role == "customer":
            statement = statement.where(SubscriptionPlan.active.is_(True))
        return list(db.scalars(statement.order_by(SubscriptionPlan.id)).all())

    @app.post("/plans", response_model=PlanRead, status_code=status.HTTP_201_CREATED)
    def create_plan(
        data: PlanCreate,
        _: Annotated[User, Depends(require_admin)],
        db: Annotated[Session, Depends(get_db)],
    ) -> SubscriptionPlan:
        plan = SubscriptionPlan(**data.model_dump())
        db.add(plan)
        commit_or_conflict(db, "A subscription plan with this name already exists")
        db.refresh(plan)
        return plan

    @app.get("/plans/{plan_id}", response_model=PlanRead)
    def get_plan(
        plan_id: int,
        user: Annotated[User, Depends(get_current_user)],
        db: Annotated[Session, Depends(get_db)],
    ) -> SubscriptionPlan:
        plan = db.get(SubscriptionPlan, plan_id)
        if plan is None or (user.role == "customer" and not plan.active):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
        return plan

    @app.patch("/plans/{plan_id}", response_model=PlanRead)
    def update_plan(
        plan_id: int,
        data: PlanUpdate,
        _: Annotated[User, Depends(require_admin)],
        db: Annotated[Session, Depends(get_db)],
    ) -> SubscriptionPlan:
        plan = db.get(SubscriptionPlan, plan_id)
        if plan is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
        updates = data.model_dump(exclude_unset=True)
        start_date = updates.get("availability_start_date", plan.availability_start_date)
        end_date = updates.get("availability_end_date", plan.availability_end_date)
        if start_date is not None and end_date is not None and end_date < start_date:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="availability_end_date must be on or after availability_start_date",
            )
        for field, value in updates.items():
            setattr(plan, field, value)
        commit_or_conflict(db, "A subscription plan with this name already exists")
        db.refresh(plan)
        return plan

    @app.delete("/plans/{plan_id}", response_model=PlanRead)
    def delete_plan(
        plan_id: int,
        _: Annotated[User, Depends(require_admin)],
        db: Annotated[Session, Depends(get_db)],
    ) -> SubscriptionPlan:
        plan = db.get(SubscriptionPlan, plan_id)
        if plan is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
        plan.active = False
        db.commit()
        db.refresh(plan)
        return plan

    return app


app = create_app()
