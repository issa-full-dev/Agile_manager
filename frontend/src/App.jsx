import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard'; // On importe le nouveau Dashboard
import { authService } from './services/authService';

// Composant pour protéger les pages privées
const PrivateRoute = ({ children }) => {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Route publique : La page de connexion */}
        <Route path="/login" element={<Login />} />

        {/* Route protégée : Le Dashboard gère maintenant Projets ET Tâches */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Redirection automatique vers / si l'URL n'existe pas */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;