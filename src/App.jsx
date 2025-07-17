import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Landing from './pages/Landing';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Problems from './pages/Problems';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { AuthProvider } from './context/AuthContext';
import { DSAProvider } from './context/DSAContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Initializing DSA Tracker..." />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <DSAProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <Navbar />
              <main className="pt-16">
                <Routes>
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/problems" element={
                    <ProtectedRoute>
                      <Problems />
                    </ProtectedRoute>
                  } />
                  <Route path="/analytics" element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              
              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-color)',
                    border: '1px solid var(--toast-border)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#ffffff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#ffffff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </DSAProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;