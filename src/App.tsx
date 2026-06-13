import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { DarkModeProvider } from './context/DarkModeContext';
import Login from './components/Login';
import AppLayout from './components/AppLayout';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardUser from './components/DashboardUser';
import Parcelles from './components/Parcelles';
import Cultures from './components/Cultures';
import Stock from './components/Stock';
import Cheptel from './components/Cheptel';
import Rapports from './components/Rapports';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} /> : <Login />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/dashboard" element={<DashboardUser />} />
        <Route path="/parcelles" element={<Parcelles />} />
        <Route path="/cultures" element={<Cultures />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/cheptel" element={<Cheptel />} />
        <Route path="/rapports" element={<Rapports />} />
      </Route>
    </Routes>
  );
};

const App = () => (
  <Router>
    <AuthProvider>
      <LanguageProvider>
        <DarkModeProvider>
          <AppRoutes />
        </DarkModeProvider>
      </LanguageProvider>
    </AuthProvider>
  </Router>
);

export default App;