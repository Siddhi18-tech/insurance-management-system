# AegisShield — Insurance Management System

A full-stack, enterprise-grade **Insurance Management System** featuring a **Node.js/Express/MongoDB** backend and a **React/Vite/Tailwind CSS** frontend.

---

## 🏗️ Architecture

```
Insurance/
├── package.json              # Root project scripts (run backend & frontend)
├── README.md                 # Full system documentation
├── insurance-backend/        # Node.js + Express + Mongoose Backend
│   ├── .env                  # Environment variables (PORT, MONGODB_URI)
│   ├── src/
│   │   ├── app.js            # Express application & CORS
│   │   ├── server.js         # Server entry point & DB connection
│   │   ├── config/db.js      # Mongoose MongoDB connection
│   │   ├── models/           # User, Policy, Claim schemas
│   │   ├── controllers/      # User, Policy, Claim business logic & Auth
│   │   ├── routes/           # REST endpoints (/api/users, /api/policies, /api/claims)
│   │   └── middlewares/      # Error handler & ObjectId validator
│   └── README.md             # Backend API reference
└── client/                   # React + Vite + Tailwind CSS Frontend
    ├── vite.config.js        # Vite config with API proxy to port 5000
    ├── tailwind.config.js    # Custom dark theme & brand palettes
    └── src/
        ├── App.jsx           # Auth gating (Auth Flow vs Dashboard)
        ├── api/client.js     # API service layer connecting to Express backend
        ├── context/          # AuthContext with persistent session
        └── components/
            ├── auth/         # Sign-in & Sign-up pages (with name & password)
            ├── dashboard/    # Live empty dashboard, PolicyCard, ClaimCard
            └── modals/       # Manual Create Policy & File Claim forms
```

---

## ✨ Key Frontend Features

1. **Initial Authentication Flow First**:
   - Initial application state gates the user behind a modern, dark-themed **Authentication Page**.
   - **Sign-Up**: Requires `Full Name` and `Password` (with optional `Email` and `Role: Policyholder/Agent`). Directly registers the user via `POST /api/users`.
   - **Login**: Accepts `Username` or `Email` and `Password`, authenticating against `POST /api/users/login`.
   - Dynamic error feedback with validation messages.

2. **Completely Empty Dashboard (Zero Mock Data)**:
   - **Zero Hardcoded Data**: Strictly contains no dummy arrays, placeholder statistics, or mock cards.
   - Upon login with a new account, the dashboard displays real zeros:
     - `0 Active Policies`
     - `$0 Total Coverage`
     - `0 Claims Filed`
     - `$0 Claimed Amount`
   - Clean, purposeful empty-state banners informing the user to create their first policy or submit their first claim.

4. **Nominee Details & PDF Receipts**:
   - **Nominee Details**: Policy creation form includes `Nominee Name` and `Nominee Relation` fields, stored in MongoDB and rendered on policy cards.
   - **Download Receipt**: Generates a professional, client-side PDF certificate and payment receipt using `jsPDF` with policyholder details, nominee information, terms, and currency amounts in ₹.

5. **Upcoming Dues & Reminders**:
   - Automatically computes the next premium due date for all active policies based on `startDate` and `paymentFrequency` (*Monthly, Quarterly, Semi-Annual, Annual*).
   - Displays policy title, next due date, days remaining badge, and exact premium amount in ₹.
   - **Set Reminder**: Posts to the Express Reminders API (`POST /api/reminders`), persisting active reminders in MongoDB.
   - **Tailwind Alert Components**: Renders active reminders as eye-catching banners at the top of the dashboard with urgency indicators and dismiss actions.

---

## 🚀 Running the Project

### 1. Prerequisites
- **Node.js** v18+
- **MongoDB** running locally (`mongodb://localhost:27017/insurance_management`) or a MongoDB Atlas URI configured in `insurance-backend/.env`.

### 2. Quick Start

Open two terminal tabs:

#### **Terminal 1: Start Express Backend**
```bash
cd insurance-backend
npm run dev
```
*Backend runs on `http://localhost:5000`*

#### **Terminal 2: Start Vite React Frontend**
```bash
cd client
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🧪 Testing the Complete Workflow

1. Open `http://localhost:5173` in your browser.
2. Select **Create Account**.
3. Enter your **Name** (e.g., `Alex Mercer`) and **Password** (e.g., `SecurePass123`).
4. Click **Register & Enter Dashboard**.
5. You are routed to the **Dashboard**, which begins **completely blank** (0 policies, $0 coverage).
6. Click **+ New Policy**, fill out the details (e.g. Health Coverage for $100,000), and click **Save Policy**.
7. The policy is saved to MongoDB and immediately appears as a card on your dashboard, updating your metrics to `1 Active Policy` and `$100,000 Coverage`.
8. Click **+ File Claim**, select your new policy, enter an incident description and claim amount, and click **Submit Claim**.
9. The claim is saved to MongoDB and immediately appears in your claims feed.
