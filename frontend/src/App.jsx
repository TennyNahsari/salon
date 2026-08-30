import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function MainApp() {
  const { admin, loading } = useAuth();
  
  // Check URL query parameters or localStorage for default view
  const [view, setView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'dashboard' || viewParam === 'login') {
      return viewParam;
    }
    return 'home';
  });

  // When admin logs in or changes, if view was login, automatically switch to dashboard
  useEffect(() => {
    if (admin && view === 'login') {
      setView('dashboard');
    }
  }, [admin, view]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-emeraldsoft font-bold font-serif text-xl">
        Memuat Salon Application...
      </div>
    );
  }

  // Render based on current view state (allows visiting homepage even when admin token is active)
  if (view === 'dashboard' && admin) {
    return <AdminDashboardPage onGoHome={() => setView('home')} />;
  }

  if (view === 'login' && !admin) {
    return (
      <AdminLoginPage
        onGoHome={() => setView('home')}
        onSuccessLogin={() => setView('dashboard')}
      />
    );
  }

  // Default: Public Homepage (accessible anytime!)
  return (
    <HomePage
      onGoAdminLogin={() => {
        if (admin) {
          setView('dashboard');
        } else {
          setView('login');
        }
      }}
    />
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
