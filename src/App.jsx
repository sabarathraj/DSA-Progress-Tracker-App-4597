import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DatabaseProvider } from './context/DatabaseContext';
import AuthGuard from './components/AuthGuard';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Problems from './pages/Problems';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

function App() {
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (appLoading) {
    return <LoadingSpinner message="Initializing DSA Tracker Pro..." />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGuard>
          <DatabaseProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                <Navbar />
                <main className="pt-16">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/problems" element={<Problems />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </main>
              </div>
            </Router>
          </DatabaseProvider>
        </AuthGuard>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;