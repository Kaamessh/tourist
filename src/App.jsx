import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabaseAuth } from './lib/supabaseClient';
import TouristPortal from './pages/TouristPortal';
import Login from './pages/Login';
import './index.css';

// Reusable wrapper to bounce unauthenticated travelers back to /login
const PrivateRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabaseAuth.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabaseAuth.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f9ff'}}>
      <h2 style={{color: 'var(--teal-primary)'}}>Verifying Tourist Identity...</h2>
    </div>;
  }

  return session ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/portal" replace />} />
        
        {/* Isolated login route */}
        <Route path="/login" element={<Login />} />
        
        {/* Fully protected Tourist Dashboard route */}
        <Route path="/portal" element={
          <PrivateRoute>
            <TouristPortal />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
