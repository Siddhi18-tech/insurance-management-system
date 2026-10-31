import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/auth/AuthPage';
import Dashboard from './components/dashboard/Dashboard';

function AppContent() {
  const { user } = useAuth();

  // If user is not authenticated, load the initial authentication flow (Login & Sign-up)
  if (!user) {
    return <AuthPage />;
  }

  // Once authenticated, route to the live empty dashboard
  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
