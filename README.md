# Brightloop Subscription Management

Backend API for the Brightloop subscription-management hackathon project, built with FastAPI, SQLAlchemy, SQLite, Pydantic, and JWT bearer authentication.

## Run locally

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
$env:JWT_SECRET_KEY = "<at-least-32-random-characters>"
$env:INITIAL_ADMIN_EMAIL = "admin@example.com"
$env:INITIAL_ADMIN_PASSWORD = "<strong-password>"
uvicorn backend.main:app --reload
```

The initial administrator is created on first startup when both `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` are set. No public admin-registration endpoint exists. Set `DATABASE_URL` to override the default SQLite database (`./subscription_manager.db`).

Interactive API documentation is available at `/docs`.

## API scope and access

- `POST /auth/register` creates customer accounts; `POST /auth/login` issues a 30-minute JWT.
- `GET/PATCH /users/me` allows a signed-in user to access and update only their own profile.
- Admins can create staff with `POST /staff`, list users, and create, update, and delete products, variants, and plans.
- Staff can list customers and read the product and plan catalogs, but cannot create staff or modify the catalog.
- Customers can read the product and plan catalogs but cannot access other users or modify the catalog.
- Product variants have unique SKUs and a non-negative additional price. Plan frequencies are daily, weekly, monthly, or yearly; `billing_interval` supports intervals such as every two weeks.

Catalog and staff/admin customer-list endpoints require a bearer token; inactive products and plans are hidden from customers. SQLite tables are created automatically when the app starts. For production, use a managed secret for `JWT_SECRET_KEY`, configure an appropriate database URL, and use migrations before changing deployed schemas.

## Tests

```powershell
python -m pip install -r requirements-dev.txt
python -m pytest
```
