import re
import unicodedata
from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class InputModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Credentials(InputModel):
    email: str = Field(max_length=254)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        email = value.strip().lower()
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
            raise ValueError("A valid email address is required")
        return email


class CustomerRegistration(Credentials):
    full_name: str = Field(min_length=1, max_length=100)
    password: str = Field(max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if len(value) < 9:
            raise ValueError("Password must be at least 9 characters long")
        if not any(character.isupper() for character in value):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(character.islower() for character in value):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(
            unicodedata.category(character)[0] in {"P", "S"}
            for character in value
        ):
            raise ValueError("Password must contain at least one special character")
        return value

    @field_validator("full_name")
    @classmethod
    def trim_full_name(cls, value: str) -> str:
        name = value.strip()
        if not name:
            raise ValueError("Name cannot be blank")
        return name


class StaffCreate(CustomerRegistration):
    pass


class LoginRequest(Credentials):
    pass


class UserUpdate(InputModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=100)

    @field_validator("full_name")
    @classmethod
    def reject_null_name(cls, value: str | None) -> str:
        if value is None:
            raise ValueError("Name cannot be null")
        name = value.strip()
        if not name:
            raise ValueError("Name cannot be blank")
        return name


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"


class ProductCreate(InputModel):
    name: str = Field(min_length=1, max_length=120)
    product_type: str = Field(default="general", min_length=1, max_length=50)
    sales_price: Decimal | None = Field(
        default=None, ge=0, max_digits=10, decimal_places=2
    )
    cost_price: Decimal = Field(
        default=Decimal("0.00"), ge=0, max_digits=10, decimal_places=2
    )
    notes: str | None = None
    # Keep accepting the original request fields for existing API clients.
    description: str | None = None
    base_price: Decimal | None = Field(
        default=None, ge=0, max_digits=10, decimal_places=2
    )
    active: bool = True

    @model_validator(mode="after")
    def preserve_legacy_price(self) -> "ProductCreate":
        if self.sales_price is None and self.base_price is None:
            raise ValueError("sales_price is required")
        if self.sales_price is None:
            self.sales_price = self.base_price
        elif self.base_price is None:
            self.base_price = self.sales_price
        elif self.sales_price != self.base_price:
            raise ValueError("sales_price and legacy base_price must match")
        return self


class ProductUpdate(InputModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    product_type: str | None = Field(default=None, min_length=1, max_length=50)
    sales_price: Decimal | None = Field(
        default=None, ge=0, max_digits=10, decimal_places=2
    )
    cost_price: Decimal | None = Field(
        default=None, ge=0, max_digits=10, decimal_places=2
    )
    notes: str | None = None
    description: str | None = None
    base_price: Decimal | None = Field(
        default=None, ge=0, max_digits=10, decimal_places=2
    )
    active: bool | None = None

    @field_validator("name", "base_price", "active")
    @classmethod
    def reject_null_required_fields(cls, value: object) -> object:
        if value is None:
            raise ValueError("This field cannot be null")
        return value

    @field_validator("product_type", "sales_price", "cost_price")
    @classmethod
    def reject_null_product_fields(cls, value: object) -> object:
        if value is None:
            raise ValueError("This field cannot be null")
        return value

    @model_validator(mode="after")
    def validate_legacy_price(self) -> "ProductUpdate":
        if (
            self.sales_price is not None
            and self.base_price is not None
            and self.sales_price != self.base_price
        ):
            raise ValueError("sales_price and legacy base_price must match")
        return self


class ProductVariantCreate(InputModel):
    name: str = Field(min_length=1, max_length=120)
    sku: str = Field(min_length=1, max_length=80)
    additional_price: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=10,
                                      decimal_places=2)
    active: bool = True


class ProductVariantUpdate(InputModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    sku: str | None = Field(default=None, min_length=1, max_length=80)
    additional_price: Decimal | None = Field(default=None, ge=0, max_digits=10,
                                             decimal_places=2)
    active: bool | None = None

    @field_validator("name", "sku", "additional_price", "active")
    @classmethod
    def reject_null_fields(cls, value: object) -> object:
        if value is None:
            raise ValueError("This field cannot be null")
        return value


class ProductVariantRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    name: str
    sku: str
    additional_price: Decimal
    active: bool


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    product_type: str
    sales_price: Decimal
    cost_price: Decimal
    notes: str | None
    # Retained in responses so clients using the original field remain compatible.
    base_price: Decimal
    description: str | None
    active: bool
    variants: list[ProductVariantRead]


BillingFrequency = Literal["daily", "weekly", "monthly", "yearly"]
AutoClosePolicy = Literal["never"]
EarlyClosePolicy = Literal["admin_only"]
PausePolicy = Literal["allowed"]
RenewalPolicy = Literal["auto_renew"]


class PlanCreate(InputModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None
    price: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    billing_frequency: BillingFrequency
    billing_interval: int = Field(default=1, ge=1)
    minimum_quantity: int = Field(default=1, ge=1)
    availability_start_date: date | None = None
    availability_end_date: date | None = None
    auto_close_policy: AutoClosePolicy = "never"
    early_close_policy: EarlyClosePolicy = "admin_only"
    pause_policy: PausePolicy = "allowed"
    renewal_policy: RenewalPolicy = "auto_renew"
    active: bool = True

    @model_validator(mode="after")
    def validate_availability_dates(self) -> "PlanCreate":
        if (
            self.availability_start_date is not None
            and self.availability_end_date is not None
            and self.availability_end_date < self.availability_start_date
        ):
            raise ValueError("availability_end_date must be on or after availability_start_date")
        return self


class PlanUpdate(InputModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None
    price: Decimal | None = Field(default=None, gt=0, max_digits=10, decimal_places=2)
    billing_frequency: BillingFrequency | None = None
    billing_interval: int | None = Field(default=None, ge=1)
    minimum_quantity: int | None = Field(default=None, ge=1)
    availability_start_date: date | None = None
    availability_end_date: date | None = None
    auto_close_policy: AutoClosePolicy | None = None
    early_close_policy: EarlyClosePolicy | None = None
    pause_policy: PausePolicy | None = None
    renewal_policy: RenewalPolicy | None = None
    active: bool | None = None

    @field_validator("name", "price", "billing_frequency", "billing_interval", "active")
    @classmethod
    def reject_null_required_fields(cls, value: object) -> object:
        if value is None:
            raise ValueError("This field cannot be null")
        return value

    @field_validator(
        "minimum_quantity",
        "auto_close_policy",
        "early_close_policy",
        "pause_policy",
        "renewal_policy",
    )
    @classmethod
    def reject_null_plan_fields(cls, value: object) -> object:
        if value is None:
            raise ValueError("This field cannot be null")
        return value

    @model_validator(mode="after")
    def validate_availability_dates(self) -> "PlanUpdate":
        if (
            self.availability_start_date is not None
            and self.availability_end_date is not None
            and self.availability_end_date < self.availability_start_date
        ):
            raise ValueError("availability_end_date must be on or after availability_start_date")
        return self


class PlanRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    price: Decimal
    billing_frequency: BillingFrequency
    billing_interval: int
    minimum_quantity: int
    availability_start_date: date | None
    availability_end_date: date | None
    auto_close_policy: AutoClosePolicy
    early_close_policy: EarlyClosePolicy
    pause_policy: PausePolicy
    renewal_policy: RenewalPolicy
    active: bool
