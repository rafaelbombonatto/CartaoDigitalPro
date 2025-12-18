
import React from 'react';
import { RouterProvider, useRouter } from './lib/routerContext';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import PublicCard from './components/PublicCard';
import CheckoutStatus from './components/CheckoutStatus';

const AppRoutes: React.FC = () => {
  const { path } = useRouter();

  const normalizedPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;

  // Rota: Landing Page (Home)
  if (normalizedPath === '/' || normalizedPath === '/index.html') {
    return <LandingPage />;
  }
  
  // Rota: Dashboard (Editor)
  if (normalizedPath === '/dashboard') {
    return <Dashboard />;
  }

  // Rotas de Checkout (Retorno do Mercado Pago)
  if (normalizedPath === '/checkout/success') {
    return <CheckoutStatus type="success" />;
  }
  if (normalizedPath === '/checkout/failure') {
    return <CheckoutStatus type="failure" />;
  }
  if (normalizedPath === '/checkout/pending') {
    return <CheckoutStatus type="pending" />;
  }

  // Rota: Cartão Público (Slug dinâmico)
  if (normalizedPath.length > 1 && !normalizedPath.includes('index.html')) {
    const slug = normalizedPath.substring(1); 
    return <PublicCard slug={slug} />;
  }

  return <LandingPage />;
};

const App: React.FC = () => {
  return (
    <RouterProvider>
      <AppRoutes />
    </RouterProvider>
  );
};

export default App;
