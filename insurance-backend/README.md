# Insurance Management System - Backend API

A production-grade RESTful API backend for an **Insurance Management System** built with **Node.js**, **Express**, **MongoDB**, and **Mongoose**. Environment variables (such as the MongoDB connection URI and server port) are configured using **dotenv**.

---

## 🚀 Features

- **Mongoose Data Models**:
  - `User`: Manages policyholders, agents, and administrators with role-based attributes, validation, and address subdocuments.
  - `Policy`: Manages insurance policies (Health, Auto, Life, Home, Travel, Property) with premium calculation, term limits, nominee details (`nomineeName`, `nomineeRelation`), and policyholder linkage.
  - `Claim`: Tracks insurance claims, settlement status, loss descriptions, review history, and supporting documentation.
  - `Reminder`: Stores premium payment due reminders (`user`, `policy`, `dueDate`, `amount`, `status: Active/Dismissed/Paid`).
- **Full CRUD REST API**:
  - Comprehensive endpoints for Users, Policies, Claims, and Reminders.
  - Sub-resource endpoints (e.g., `/api/users/:id/policies`, `/api/policies/:id/claims`).
  - Specialized claim adjudication status transitions (`PATCH /api/claims/:id/status`).
  - Reminder creation and dismissal endpoints (`/api/reminders`).
- **Pagination, Filtering, & Search**:
  - Built-in pagination (`page`, `limit`), case-insensitive multi-field search (`search`), and status/role filtering.
- **Robust Error Handling**:
  - Centralized error handler catching Mongoose validation errors, duplicate keys (`E11000`), bad ObjectIds (`CastError`), and 404s.
- **Environment Configuration**:
  - Managed via `dotenv` with a sample `.env.example` file.
- **Database Seeder**:
  - Quick mock data generator (`npm run seed`) for rapid testing.

---

## 🛠 Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v4)
- **Database & ODM**: MongoDB with Mongoose (v8)
- **Environment**: Dotenv
- **Cross-Origin**: CORS

---

## 📁 Project Architecture

```
insurance-backend/
├── .env                  # Local environment configuration (dotenv)
├── .env.example          # Template environment file
├── .gitignore            # Git exclusion rules
├── package.json          # Project scripts and dependencies
├── README.md             # API documentation
└── src/
    ├── app.js            # Express app configuration & middleware
    ├── server.js         # Server entry point & DB bootstrap
    ├── seed.js           # Database seeding script
    ├── config/
    │   └── db.js         # Mongoose MongoDB connection
    ├── controllers/
    │   ├── userController.js    # User CRUD & sub-resources
    │   ├── policyController.js  # Policy CRUD & sub-resources
    │   └── claimController.js   # Claim CRUD & adjudication
    ├── middlewares/
    │   ├── asyncHandler.js      # Wrapper for async route handlers
    │   ├── errorHandler.js      # Centralized error handler & 404
    │   └── validateObjectId.js  # MongoDB ObjectId validation
    ├── models/
    │   ├── User.js              # User schema & model
    │   ├── Policy.js            # Policy schema & model
    │   └── Claim.js             # Claim schema & model
    └── routes/
        ├── index.js             # API router aggregator & health check
        ├── userRoutes.js        # /api/users endpoints
        ├── policyRoutes.js      # /api/policies endpoints
        └── claimRoutes.js       # /api/claims endpoints
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.x or later)
- [MongoDB](https://www.mongodb.com/) (running locally or a MongoDB Atlas URI)

### 2. Install Dependencies
```bash
cd insurance-backend
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` or edit the existing `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/insurance_management
```
> **Note on MongoDB URI**:
> - For local MongoDB: `mongodb://localhost:27017/insurance_management`
> - For MongoDB Atlas: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/insurance_management?retryWrites=true&w=majority`

### 4. Seed Sample Data (Optional)
Populate the database with sample users, policies, and claims:
```bash
npm run seed
```

### 5. Run the Server
- **Production mode**:
  ```bash
  npm start
  ```
- **Development mode (auto-reload)**:
  ```bash
  npm run dev
  ```

The server will start at: `http://localhost:5000`

---

## 📚 API Reference

Base URL: `http://localhost:5000/api`

### 🩺 Health & Root
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check API status, server uptime, and timestamp |
| `GET` | `/api` | API directory and service metadata |

---

### 👤 Users API (`/api/users`)

| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `POST` | `/api/users` | Register a new user | — |
| `GET` | `/api/users` | Retrieve all users | `role`, `isActive`, `search`, `page`, `limit` |
| `GET` | `/api/users/:id` | Retrieve user by ID | — |
| `PUT` | `/api/users/:id` | Update user details | — |
| `DELETE`| `/api/users/:id` | Delete user (prevents deletion if active policies exist) | — |
| `GET` | `/api/users/:id/policies` | Get all policies owned by this user | — |
| `GET` | `/api/users/:id/claims` | Get all claims filed by this user | — |

#### User Payload Example (`POST /api/users`):
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "strongPassword123!",
  "phone": "+1-555-234-5678",
  "role": "customer",
  "dateOfBirth": "1992-08-15",
  "address": {
    "street": "123 Maple Street",
    "city": "Austin",
    "state": "TX",
    "zipCode": "78701",
    "country": "USA"
  }
}
```

---

### 📜 Policies API (`/api/policies`)

| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `POST` | `/api/policies` | Create a new policy | — |
| `GET` | `/api/policies` | List policies with filters | `policyType`, `status`, `user`, `search`, `minCoverage`, `maxPremium`, `page`, `limit` |
| `GET` | `/api/policies/:id` | Get policy by ID (populated with user & agent) | — |
| `PUT` | `/api/policies/:id` | Update policy details | — |
| `DELETE`| `/api/policies/:id` | Delete policy (blocked if claims exist) | — |
| `GET` | `/api/policies/:id/claims` | Retrieve all claims filed under this policy | — |

#### Policy Payload Example (`POST /api/policies`):
```json
{
  "title": "Comprehensive Family Health Plan",
  "policyType": "Health",
  "description": "Full medical, dental, and vision coverage for individuals and families",
  "premiumAmount": 380.00,
  "coverageAmount": 350000.00,
  "deductibleAmount": 1000.00,
  "paymentFrequency": "Monthly",
  "termMonths": 12,
  "startDate": "2026-05-01",
  "endDate": "2027-05-01",
  "status": "Active",
  "user": "651a1b2c3d4e5f6a7b8c9d01"
}
```
*(Note: If `policyNumber` is not provided, one is automatically generated.)*

---

### 📑 Claims API (`/api/claims`)

| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `POST` | `/api/claims` | File a new insurance claim | — |
| `GET` | `/api/claims` | List claims with filters | `status`, `policy`, `user`, `search`, `minAmount`, `maxAmount`, `page`, `limit` |
| `GET` | `/api/claims/:id` | Get claim by ID with populated details | — |
| `PUT` | `/api/claims/:id` | Update claim details | — |
| `PATCH`| `/api/claims/:id/status`| Transition claim adjudication status | — |
| `DELETE`| `/api/claims/:id` | Delete claim (blocked if already settled) | — |

#### Claim Payload Example (`POST /api/claims`):
```json
{
  "policy": "651a1b2c3d4e5f6a7b8c9d02",
  "user": "651a1b2c3d4e5f6a7b8c9d01",
  "claimAmount": 1850.00,
  "incidentDate": "2026-06-12",
  "incidentDescription": "Windstorm broke windshield and damaged hood",
  "incidentLocation": "Austin, TX",
  "documents": [
    {
      "name": "repair_quote.pdf",
      "url": "https://example.com/uploads/repair_quote.pdf"
    }
  ]
}
```

#### Status Transition Example (`PATCH /api/claims/:id/status`):
```json
{
  "status": "Approved",
  "approvedAmount": 1600.00,
  "reviewNotes": "Approved after inspection and deductible deduction",
  "reviewedBy": "651a1b2c3d4e5f6a7b8c9d03"
}
```
*(Valid statuses: `Submitted`, `Under Review`, `Approved`, `Rejected`, `Settled`)*

---

### ⏰ Reminders API (`/api/reminders`)

| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `POST` | `/api/reminders` | Create or update a premium payment reminder | — |
| `GET` | `/api/reminders` | List active reminders for a user | `user`, `status` |
| `PATCH`| `/api/reminders/:id/status` | Update reminder status (`Active`, `Dismissed`, `Paid`) | — |
| `DELETE`| `/api/reminders/:id` | Delete reminder | — |

#### Reminder Payload Example (`POST /api/reminders`):
```json
{
  "user": "651a1b2c3d4e5f6a7b8c9d01",
  "policy": "651a1b2c3d4e5f6a7b8c9d02",
  "title": "Premium Due: Comprehensive Health Plan",
  "dueDate": "2026-11-15T00:00:00.000Z",
  "amount": 2500,
  "note": "Payment frequency: Monthly"
}
```

---

## 🧪 Testing with cURL

### 1. Check Server Health
```bash
curl http://localhost:5000/api/health
```

### 2. Create a User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "Password123!",
    "phone": "+1-555-123-4567",
    "role": "customer"
  }'
```

### 3. List Users with Search
```bash
curl "http://localhost:5000/api/users?search=John&page=1&limit=5"
```

