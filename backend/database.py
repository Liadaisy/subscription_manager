from collections.abc import Generator
import sqlite3

from fastapi import Request
from sqlalchemy import Engine, create_engine, event, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session


class Base(DeclarativeBase):
    pass


def create_database_engine(database_url: str) -> Engine:
    connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
    engine = create_engine(database_url, connect_args=connect_args)

    if database_url.startswith("sqlite"):

        @event.listens_for(engine, "connect")
        def enable_sqlite_foreign_keys(
            connection: sqlite3.Connection, _record: object
        ) -> None:
            cursor = connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

    return engine


def migrate_product_columns(engine: Engine) -> None:
    columns = {column["name"] for column in inspect(engine).get_columns("products")}
    new_columns = {
        "product_type": "VARCHAR(50) NOT NULL DEFAULT 'general'",
        "cost_price": "NUMERIC(10, 2) NOT NULL DEFAULT 0.00",
        "notes": "TEXT",
    }
    with engine.begin() as connection:
        for name, definition in new_columns.items():
            if name not in columns:
                connection.execute(
                    text(f"ALTER TABLE products ADD COLUMN {name} {definition}")
                )


def migrate_subscription_plan_columns(engine: Engine) -> None:
    columns = {
        column["name"]
        for column in inspect(engine).get_columns("subscription_plans")
    }
    new_columns = {
        "minimum_quantity": "INTEGER NOT NULL DEFAULT 1",
        "availability_start_date": "DATE",
        "availability_end_date": "DATE",
        "auto_close_policy": "VARCHAR(30) NOT NULL DEFAULT 'never'",
        "early_close_policy": "VARCHAR(30) NOT NULL DEFAULT 'admin_only'",
        "pause_policy": "VARCHAR(30) NOT NULL DEFAULT 'allowed'",
        "renewal_policy": "VARCHAR(30) NOT NULL DEFAULT 'auto_renew'",
    }
    with engine.begin() as connection:
        for name, definition in new_columns.items():
            if name not in columns:
                connection.execute(
                    text(
                        f"ALTER TABLE subscription_plans ADD COLUMN {name} {definition}"
                    )
                )


def get_db(request: Request) -> Generator[Session, None, None]:
    session_factory = request.app.state.session_factory
    with session_factory() as session:
        yield session
