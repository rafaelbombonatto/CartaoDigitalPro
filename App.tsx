import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import PublicCard from './components/PublicCard';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Página inicial (Vendas/Marketing) */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Painel Administrativo (Login/Edição) */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Rota para visualizar cartões públicos (slug) */}
        <Route path="/:slug" element={<PublicCard />} />
        
        {/* Fallback para home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;