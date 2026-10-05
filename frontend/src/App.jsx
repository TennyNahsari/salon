import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function getViewFromLocation() {
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view');

  if (viewParam === 'login' || path === '/login' || path === '/admin/login') {
    return 'login';
  }
  if (viewParam === 'dashboard' || path === '/dashboard' || path === '/admin/dashboard') {
    return 'dashboard';
  }
  if (path === '/admin') {
    return 'admin_route';
  }
  return 'home';
}

function MainApp() {
  const { admin, loading } = useAuth();
  const [view, setViewState] = useState(getViewFromLocation);

  const navigateTo = (newView, updateUrl = true) => {
    setViewState(newView);
    if (updateUrl) {
      let targetPath = '/';
      if (newView === 'login') targetPath = '/login';
      else if (newView === 'dashboard') targetPath = '/admin';
      
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view: newView }, '', targetPath);
      }
    }
  };

  // Sync state on browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setViewState(getViewFromLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // When admin state changes or route is '/admin'
  useEffect(() => {
    if (!loading) {
      if (view === 'admin_route') {
        if (admin) {
          setViewState('dashboard');
        } else {
          setViewState('login');
        }
      } else if (admin && view === 'login') {
        setViewState('dashboard');
      }
    }
  }, [admin, loading, view]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-emeraldsoft font-bold font-serif text-xl">
        Memuat Salon Application...
      </div>
    );
  }

  // Determine actual view if initial view was 'admin_route'
  const activeView = view === 'admin_route' ? (admin ? 'dashboard' : 'login') : view;

  // Render based on current view state
  if (activeView === 'dashboard' && admin) {
    return <AdminDashboardPage onGoHome={() => navigateTo('home')} />;
  }

  if (activeView === 'login' && !admin) {
    return (
      <AdminLoginPage
        onGoHome={() => navigateTo('home')}
        onSuccessLogin={() => navigateTo('dashboard')}
      />
    );
  }

  // Default: Public Homepage
  return (
    <HomePage
      onGoAdminLogin={() => {
        if (admin) {
          navigateTo('dashboard');
        } else {
          navigateTo('login');
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
