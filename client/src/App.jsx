import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/auth/AuthPage';
import Dashboard from './components/dashboard/Dashboard';
import AgentDashboard from './components/agent/AgentDashboard';

function AppContent() {
  const { user } = useAuth();

  // If user is not authenticated, load the initial authentication flow (Policyholder & Agent Portals)
  if (!user) {
    return <AuthPage />;
  }

  // If the user is a licensed insurance agent, route to the dedicated Agent & Underwriting Dashboard
  if (user.role === 'agent') {
    return <AgentDashboard />;
  }

  // Once policyholder logs in, route to the live policyholder dashboard
  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
