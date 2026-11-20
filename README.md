# 🛡️ AgiesShield — Insurance Management System

A full-stack, enterprise-grade **Insurance Management System** built with **Node.js + Express + MongoDB** on the backend and **React + Vite + Tailwind CSS** on the frontend. Features a dedicated **Policyholder Portal** and a separate **Licensed Agent & Broker Portal** with real-time claim adjudication workflows.

---

## 📸 Features at a Glance

| Feature | Description |
|---|---|
| 🔐 Dual Auth Portals | Separate Sign In / Sign Up for Policyholders & Agents |
| 🧑‍💼 Agent Dashboard | Claim adjudication queue, sold policies, policyholder directory |
| 📋 Policy Management | Create, view, and download policy PDF receipts |
| 🏥 Claims Management | File, track, approve, and reject insurance claims |
| 🔔 Premium Reminders | Auto-calculated due dates with active alert banners |
| 📄 PDF Receipts | Client-side policy certificate generation using jsPDF |
| 🏦 Bank Mandate | Full bank account details stored per policy for ECS / NEFT |
| 👤 Nominee Details | Nominee name and relationship stored against each policy |
| 📊 Live Portfolio Metrics | Zero mock data — all metrics computed from real MongoDB records |

---

## 🏗️ Project Architecture

```
AgiesShield/
├── README.md
├── package.json                        # Root workspace scripts
│
├── insurance-backend/                  # Node.js + Express + Mongoose Backend
│   ├── .env                            # PORT, MONGODB_URI
│   ├── src/
│   │   ├── server.js                   # Entry point, DB connection
│   │   ├── app.js                      # Express app, CORS, routes mount
│   │   ├── config/
│   │   │   └── db.js                   # Mongoose connection
│   │   ├── models/
│   │   │   ├── User.js                 # User schema (customer / agent roles)
│   │   │   ├── Policy.js               # Policy schema with bankDetails & nominee
│   │   │   ├── Claim.js                # Claim schema with adjudication fields
│   │   │   └── Reminder.js             # Premium reminder schema
│   │   ├── controllers/
│   │   │   ├── userController.js       # Auth login, signup, user CRUD
│   │   │   ├── policyController.js     # Policy CRUD with agent/client filter
│   │   │   ├── claimController.js      # Claim CRUD + status adjudication
│   │   │   └── reminderController.js   # Reminder CRUD
│   │   ├── routes/
│   │   │   ├── userRoutes.js
│   │   │   ├── policyRoutes.js
│   │   │   ├── claimRoutes.js
│   │   │   └── reminderRoutes.js
│   │   └── middlewares/
│   │       ├── asyncHandler.js
│   │       └── validateObjectId.js
│
└── client/                             # React + Vite + Tailwind CSS Frontend
    ├── vite.config.js                  # Proxy /api -> localhost:5000
    ├── tailwind.config.js
    └── src/
        ├── App.jsx                     # Role-based routing (Auth / Policyholder / Agent)
        ├── main.jsx
        ├── api/
        │   └── client.js               # Centralized API fetch service
        ├── context/
        │   └── AuthContext.jsx         # Auth state, login/signup/logout
        ├── utils/
        │   ├── generateReceiptPdf.js   # jsPDF policy certificate generator
        │   └── dueCalculator.js        # Next premium due date calculator
        └── components/
            ├── auth/
            │   └── AuthPage.jsx        # Dual portal: Policyholder + Agent sign-in/register
            ├── agent/
            │   └── AgentDashboard.jsx  # Full agent broker portal
            ├── dashboard/
            │   ├── Dashboard.jsx       # Policyholder dashboard
            │   ├── PolicyCard.jsx      # Policy display with bank & nominee
            │   └── ClaimCard.jsx       # Claim card with agent decision banners
            └── modals/
                ├── CreatePolicyModal.jsx  # Policy creation (policyholder + agent)
                └── CreateClaimModal.jsx   # Claim filing form
```

---

## ✨ Core Features

### 🔐 Dual Authentication System

Two fully separate login and registration flows:

**Policyholder Portal**
- Register with Full Legal Name, Email (optional), Phone (optional), Password
- Login using Username or Email + Password
- Role automatically set to `customer`

**Agent & Broker Portal**
- Register with Full Name, Corporate Email, Agent License ID, Phone, Password
- Login using Agent Username or Official Email + Password
- Role automatically set to `agent`

After login, users are automatically routed based on their role:
- `customer` → Policyholder Dashboard
- `agent` → Agent & Broker Dashboard

---

### 🧑‍💼 Agent & Broker Dashboard

The **dedicated agent portal** (`/agent`) provides:

**Executive KPI Metrics**
- Total Policies Sold
- Total Premium Book Value (₹)
- Total Sum Insured / Underwritten Portfolio (₹)
- Incoming Claims Requiring Agent Decision (live count with pulse badge)

**Incoming Claim Requests Queue**
- Real-time list of all claims filed by policyholders
- Filter by: All | Pending Review | Approved | Rejected
- Each claim card shows:
  - Claimant name, email, phone, residential address
  - Direct disbursal Bank Mandate (Bank, A/C, IFSC)
  - Linked policy title, number, coverage limit, and type
  - Incident description, date, and location

**Claim Adjudication Actions**
- ✅ **Accept & Approve Claim** — Agent enters Approved Disbursal Amount (₹) and Assessment Notes. Updates claim status to `Approved` with `approvedAmount`, `reviewNotes`, and `reviewedBy` agent reference.
- ❌ **Reject Claim** — Agent records formal rejection reason. Updates status to `Rejected` with notes visible on the policyholder's dashboard.

**Sold Policies & Policyholder Details Tab**
- Full list of all policies in the portfolio
- Shows: Policyholder name, email, phone, address, Nominee name & relation, Bank mandate details
- Download PDF policy certificate per client
- Search by policy number, title, or client name
- Filter by policy category (Health, Auto, Life, Home, Travel, Property)

**Client Directory Tab**
- Full roster of all registered policyholder clients
- Contact info, policy count, and total insured sum per client

---

### 📋 Policyholder Dashboard

**Live Portfolio Overview (Zero Mock Data)**
- All metrics computed in real-time from MongoDB records
- Empty-state banners shown when no data exists

**Policy Management**
- Create new policies with: Title, Type, Coverage (₹), Premium (₹), Deductible, Payment Frequency, Term, Start Date
- Nominee: Nominee Full Name + Relationship
- Bank Mandate: Bank Name, Account Holder, Account Number, IFSC Code
- Download policy PDF certificate & receipt

**Claims Management**
- File claims against active policies
- Track real-time status: `Submitted` → `Under Review` → `Approved` / `Rejected` / `Settled`
- When agent approves: Shows "Claim Approved by Agent [Name] — Disbursal Amount: ₹X" with assessment note
- When agent rejects: Shows "Claim Rejected by Agent [Name] — Reason: ..."

**Upcoming Dues & Reminders**
- Auto-calculates next premium due date from startDate + paymentFrequency
- Urgency badges (Overdue, Due in N days)
- Set Reminder → saves to MongoDB → appears as Tailwind alert banner at top of dashboard
- Dismiss reminders once acknowledged

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB Atlas** account (or local MongoDB instance)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/Siddhi18-tech/insurance-management-system.git
cd insurance-management-system
```

### 2. Configure Environment Variables

Create `insurance-backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_connection_string_here
```

> **MongoDB Atlas Setup:** Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Network Access → Add IP Address → Allow Access from Anywhere (`0.0.0.0/0`) for local development.

### 3. Install Dependencies

```bash
# Install backend dependencies
cd insurance-backend
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 4. Run the Application

Open **two terminal windows**:

**Terminal 1 — Backend (Express API on port 5000)**
```bash
cd insurance-backend
npm run dev
```

**Terminal 2 — Frontend (React Vite on port 5173)**
```bash
cd client
npm run dev
```

Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 🧪 End-to-End Test Walkthrough

### As an Agent
1. Open `http://localhost:5173`
2. Click **"Agent & Broker Portal"** tab on the login page
3. Click **"Sign Up as Agent"** → Register with your name, email, and password
4. You are routed to the **Agent Dashboard**
5. Click **"Issue Policy"** → Select a registered policyholder client → Fill in coverage details → Save
6. Navigate to **"Incoming Claim Requests"** tab to review submitted claims
7. Click **"Accept & Approve Claim"** → Enter approved amount → Submit
8. The policyholder's dashboard now reflects the approval instantly

### As a Policyholder
1. Click **"Policyholder Portal"** tab on the login page
2. Click **"Register Account"** → Sign up with your name and password
3. You are routed to the **Policyholder Dashboard** (starts completely blank)
4. Click **"New Policy"** → Fill in coverage, nominee, and bank details → Save
5. Click **"File Claim"** → Select your policy → Describe the incident → Submit
6. Watch the claim status update in real-time after the agent reviews it
7. Click **"Download Receipt"** on any policy card to get a PDF certificate

---

## 🔌 REST API Reference

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Register new user |
| POST | `/api/users/login` | Login (returns user object) |
| GET | `/api/users` | Get all users (with role filter) |
| GET | `/api/users/:id` | Get user by ID |
| GET | `/api/users/:id/policies` | Get all policies for a user |
| GET | `/api/users/:id/claims` | Get all claims for a user |

### Policies
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/policies` | Create new policy |
| GET | `/api/policies` | Get all policies (filter by user, agent, type) |
| GET | `/api/policies/:id` | Get policy by ID |
| PUT | `/api/policies/:id` | Update policy |
| DELETE | `/api/policies/:id` | Delete policy |

### Claims
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/claims` | File a new claim |
| GET | `/api/claims` | Get all claims (filter by status, user) |
| GET | `/api/claims/:id` | Get claim by ID |
| PATCH | `/api/claims/:id/status` | Agent: Approve / Reject claim |
| DELETE | `/api/claims/:id` | Delete claim |

### Reminders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reminders` | Create premium reminder |
| GET | `/api/reminders` | Get active reminders |
| PATCH | `/api/reminders/:id/status` | Dismiss / update reminder |
| DELETE | `/api/reminders/:id` | Delete reminder |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Icons | Lucide React |
| PDF Generation | jsPDF, html2canvas, DOMPurify |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | Custom session-based (localStorage) |
| Dev Server | Nodemon (`--watch`), Vite HMR |

---

## 📁 Key Design Decisions

- **Zero Mock Data**: The dashboard only renders data fetched from the Express API. No hardcoded arrays or placeholder values exist anywhere in the frontend.
- **Role-Based Routing**: `App.jsx` checks `user.role` on login and routes to either `AgentDashboard` or `Dashboard` accordingly.
- **Mongoose 8.x Compatibility**: All `pre('validate')` hooks are written as synchronous functions without calling `next()`, which is required in Mongoose 8.x.
- **Policy Number Auto-Generation**: Backend generates unique `POL-XXXXXX` policy numbers automatically if not provided.
- **Account Number Privacy**: Bank account numbers are masked (`••••••••1234`) on all policyholder-facing UI.
- **Professional Color System**: Uses institutional corporate palette — Slate Navy (`#0f172a`), Royal Blue (`#2563eb`), Emerald (`#059669`), Amber (`#d97706`), Indigo (`#4f46e5`).

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">
  <strong>Built with ❤️ — AgiesShield Insurance Management System</strong><br/>
  <sub>Enterprise Policy Administration & Claims Disbursal Platform</sub>
</div>
