
import React from 'react';
import { RouterProvider, useRouter } from './lib/routerContext';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import PublicCard from './components/PublicCard';
import CheckoutStatus from './components/CheckoutStatus';

const AppRoutes: React.FC = () => {
  const { path } = useRouter();

  // Remove trailing slashes e query strings para comparação de rotas
  const pathWithoutQuery = path.split('?')[0];
  const normalizedPath = pathWithoutQuery.endsWith('/') && pathWithoutQuery.length > 1 
    ? pathWithoutQuery.slice(0, -1) 
    : pathWithoutQuery;

  // Rota: Landing Page (Home)
  if (normalizedPath === '/' || normalizedPath === '' || normalizedPath === '/index.html') {
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
  // Ignora se o slug for vazio ou for um arquivo de sistema
  if (normalizedPath.length > 1 && !normalizedPath.includes('.')) {
    const slug = normalizedPath.startsWith('/') ? normalizedPath.substring(1) : normalizedPath; 
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
