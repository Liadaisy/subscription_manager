
# Brightloop Subscription Management System

A subscription-management application developed for a hackathon. The project consists of a React frontend and a FastAPI backend, providing authentication, role-based access and subscription management functionality.

---

## 1. Project Overview

Brightloop aims to simplify subscription management by providing features for managing:

- User accounts and authentication
- Admin, staff and customer roles
- Products and product variants
- Subscription plans
- Customer information
- Subscription-related operations

## 2. Technologies Used

### Frontend
- React.js
- JavaScript
- Vite
- Tailwind CSS
- React Router
- Lucide React

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- JWT Authentication

### Development Tools
- Visual Studio Code
- Git and GitHub
- Node.js and npm
- Uvicorn

---

## 3. Project Structure

```text
subscription_manager/
│
├── backend/
│   ├── main.py
│   ├── models.py
│   └── schemas.py
│
├── src/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── package.json
├── package-lock.json
├── requirements.txt
├── requirements-dev.txt
├── README.md
└── .gitignore
```

---

## 4. Requirements

Install the following before running the project:

- Python 3.12 or compatible version
- Node.js
- npm
- Git

Verify the installations:

```powershell
python --version
node --version
npm --version
git --version
```

---

## 5. Clone the Repository

Open PowerShell or a terminal and execute:

```powershell
git clone https://github.com/Liadaisy/subscription_manager.git

cd subscription_manager
```

If you already have the repository cloned, update it using:

```powershell
git pull origin main
```

---

## 6. Backend Setup

### Step 1: Create a Virtual Environment

```powershell
python -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

### Step 2: Install Dependencies

```powershell
python -m pip install -r requirements.txt
```

### Step 3: Configure Environment Variables

Create a `.env` file in the project root directory.

Add the following configuration:

```env
JWT_SECRET_KEY=your-long-random-secret-key
INITIAL_ADMIN_EMAIL=admin@example.com
INITIAL_ADMIN_PASSWORD=YourStrongPassword123!
```

**Important:**
- Use a strong JWT secret containing at least 32 characters.
- Replace the example administrator credentials with your own.
- Never upload the `.env` file to GitHub.

### Step 4: Start the Backend Server

```powershell
uvicorn backend.main:app --reload --env-file .env
```

Backend URL:

http://127.0.0.1:8000

Interactive API documentation:

http://127.0.0.1:8000/docs

---

## 7. Frontend Setup

Open a second terminal in the project root directory.

### Step 1: Install Dependencies

```powershell
npm install
```

### Step 2: Configure the API URL

Create a `.env.local` file in the project root.

Add:

```env
VITE_API_URL=http://127.0.0.1:8000
```

### Step 3: Start the Frontend

```powershell
npm run dev
```

Frontend URL:

http://localhost:5173

**Note:** Both frontend and backend servers must be running simultaneously.

---

## 8. Authentication and User Roles

The application supports three user roles.

### Administrator
- Created during backend initialization.
- Can manage users and staff.
- Can manage products, variants and subscription plans.

### Staff
- Created by an administrator.
- Can access customer information.
- Can view product and subscription plan catalogs.

### Customer
- Can register through the customer registration API.
- Can log in using registered credentials.
- Can access the product and subscription plan catalogs.

### Authentication Workflow

1. User enters email and password.
2. Frontend sends credentials to the backend.
3. Backend validates the credentials.
4. Backend generates a JWT access token.
5. Frontend stores the token.
6. Authenticated requests include the token in the Authorization header.

---

## 9. Backend API Endpoints

The backend currently supports the following API operations.

| Module | Method | Endpoint |
|---|---|---|
| Authentication | POST | `/auth/register` |
| Authentication | POST | `/auth/login` |
| User Profile | GET | `/users/me` |
| User Profile | PATCH | `/users/me` |
| User Management | GET | `/users` |
| Staff Management | POST | `/staff` |
| Customers | GET | `/customers` |
| Products | GET | `/products` |
| Products | POST | `/products` |
| Products | PATCH | `/products/{product_id}` |
| Products | DELETE | `/products/{product_id}` |
| Subscription Plans | GET | `/plans` |
| Subscription Plans | POST | `/plans` |
| Subscription Plans | PATCH | `/plans/{plan_id}` |
| Subscription Plans | DELETE | `/plans/{plan_id}` |

Additional endpoints are available for managing product variants.

Refer to the Swagger documentation for complete endpoint details:

http://127.0.0.1:8000/docs

---

## 10. Frontend–Backend Integration

The React frontend communicates with the FastAPI backend through REST API requests.

The integration work includes:

- Configuring the frontend API service.
- Connecting the login page to backend authentication.
- Implementing JWT token storage and authorization headers.
- Managing login and logout through React Context.
- Restoring authenticated sessions.
- Configuring CORS for frontend-backend communication.
- Connecting frontend API calls for retrieving plans and products.

**Current integration status:** Authentication has been connected and administrator login has been tested successfully. Further integration of the remaining application modules is ongoing.

---

## 11. Testing

### Backend Testing

Install development dependencies:

```powershell
python -m pip install -r requirements-dev.txt
```

Run tests:

```powershell
python -m pytest
```

### API Testing

Use the Swagger interface:

http://127.0.0.1:8000/docs

Test authentication and available API endpoints through the interactive documentation.

---

## 12. Git Workflow

To upload your local changes to GitHub:

```powershell
git status

git add .

git commit -m "Update frontend and backend integration"

git push origin main
```

To download the latest changes:

```powershell
git pull origin main
```

---

## 13. Security Notes

- Do not upload `.env` or `.env.local`.
- Do not expose passwords or JWT secret keys.
- Do not commit local database files.
- Keep virtual environments and dependency folders out of Git.
- Use secure environment variables for production deployment.
- Configure HTTPS and a production database before deployment.

---

## 14. Current Development Status

| Feature | Status |
|---|---|
| Backend setup | Completed |
| Frontend setup | Completed |
| Backend API connection | Completed for initial integration |
| JWT authentication | Integrated |
| Administrator login | Tested successfully |
| Staff and customer login | Requires testing |
| Customer registration UI | Pending |
| Products and plans integration | In progress |
| Subscription and invoice workflows | Further implementation required |

---

## Contributors

Developed as part of the Brightloop Subscription Management hackathon project.
** Ann Lia Sunil **
** Aleena Johnson **
** Ann Mariya T M **
---

**Repository:** https://github.com/Liadaisy/subscription_manager
