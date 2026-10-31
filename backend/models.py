from datetime import date, datetime, timezone
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship, synonym

from backend.database import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("role IN ('admin', 'staff', 'customer')", name="valid_user_role"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(100))
    password_hash: Mapped[str] = mapped_column(String(256))
    role: Mapped[str] = mapped_column(String(20), default="customer")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("base_price >= 0", name="nonnegative_product_sales_price"),
        CheckConstraint("cost_price >= 0", name="nonnegative_product_cost_price"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    product_type: Mapped[str] = mapped_column(
        String(50), default="general", server_default=text("'general'")
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    base_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    sales_price = synonym("base_price")
    cost_price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        default=Decimal("0.00"),
        server_default=text("0.00"),
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    variants: Mapped[list["ProductVariant"]] = relationship(
        back_populates="product",
        order_by="ProductVariant.id",
    )


class ProductVariant(Base):
    __tablename__ = "product_variants"
    __table_args__ = (
        CheckConstraint("additional_price >= 0", name="nonnegative_variant_price"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="RESTRICT"), index=True
    )
    name: Mapped[str] = mapped_column(String(120))
    sku: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    additional_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"))
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    product: Mapped[Product] = relationship(back_populates="variants")


class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"
    __table_args__ = (
        CheckConstraint("billing_frequency IN ('daily', 'weekly', 'monthly', 'yearly')",
                        name="valid_billing_frequency"),
        CheckConstraint("billing_interval >= 1", name="positive_billing_interval"),
        CheckConstraint("price > 0", name="positive_plan_price"),
        CheckConstraint("minimum_quantity >= 1", name="positive_minimum_quantity"),
        CheckConstraint(
            "availability_start_date IS NULL OR availability_end_date IS NULL "
            "OR availability_end_date >= availability_start_date",
            name="valid_plan_availability_dates",
        ),
        CheckConstraint(
            "auto_close_policy IN ('never')",
            name="valid_plan_auto_close_policy",
        ),
        CheckConstraint(
            "early_close_policy IN ('admin_only')",
            name="valid_plan_early_close_policy",
        ),
        CheckConstraint(
            "pause_policy IN ('allowed')",
            name="valid_plan_pause_policy",
        ),
        CheckConstraint(
            "renewal_policy IN ('auto_renew')",
            name="valid_plan_renewal_policy",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    billing_frequency: Mapped[str] = mapped_column(String(20))
    billing_interval: Mapped[int] = mapped_column(Integer, default=1)
    minimum_quantity: Mapped[int] = mapped_column(Integer, default=1)
    availability_start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    availability_end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    auto_close_policy: Mapped[str] = mapped_column(String(30), default="never")
    early_close_policy: Mapped[str] = mapped_column(String(30), default="admin_only")
    pause_policy: Mapped[str] = mapped_column(String(30), default="allowed")
    renewal_policy: Mapped[str] = mapped_column(String(30), default="auto_renew")
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
