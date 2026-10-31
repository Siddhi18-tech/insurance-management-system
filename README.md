AegisShield - MERN Stack Insurance Management System

A full-stack, responsive Insurance Management System built entirely on the MERN stack (MongoDB, Express, React, Node.js). This application allows users to manage their insurance portfolios, create custom policies, file claims, and track upcoming premium dues in a modern, user-friendly dashboard.

🚀 Features

Secure Authentication: User sign-up and login flow ensuring private, localized data per user.

Dynamic Dashboard: Real-time metrics tracking active policies, total coverage, and claim settlements.

Policy Management: Create custom policies (Health, Auto, Property, etc.) complete with Nominee details (Name & Relation).

Claims Processing: File claims against active policies with a visual Claim Progress Timeline (Submitted → Under Review → Approved → Disbursed).

Smart Reminders: Automated "Upcoming Dues" section calculating the next premium due date based on payment frequency.

No-Claim Bonus (NCB): Dynamic UI badges rewarding users who maintain an active portfolio with zero filed claims.

One-Click Export: Instantly generate and download clean PDF receipts of policy details.

🛠️ Tech Stack

Frontend: React.js (Vite), Tailwind CSS

Backend: Node.js, Express.js

Database: MongoDB Atlas (Mongoose ODM)

Tools: Antigravity IDE, Git, Visual Studio Code

📁 Project Structure

The repository is divided into two main directories:

/client: Contains the React/Vite frontend code and Tailwind configurations.

/insurance-backend: Contains the Node/Express server, API routes, and Mongoose models.

⚙️ Getting Started

Prerequisites

Node.js installed on your local machine.

A MongoDB Atlas account and cluster.

Installation

Clone the repository:

git clone https://github.com/YourUsername/insurance-management-system.git
cd insurance-management-system


Backend Setup:

cd insurance-backend
npm install


Create a .env file in the insurance-backend directory.

Add your MongoDB connection string and port:

PORT=5000
MONGO_URI=your_mongodb_connection_string_here


Start the backend server:

npm run dev


Frontend Setup:
Open a new terminal tab and run:

cd client
npm install


Start the React frontend:

npm run dev


Launch:
Open your browser and navigate to the localhost URL provided by Vite (usually http://localhost:5173) to view the application.

📝 License

This project was created as a software engineering assignment.
