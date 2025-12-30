
import React, { useEffect, useState } from 'react';
import { RouterProvider, useRouter } from './lib/routerContext';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import PublicCard from './components/PublicCard';
import CheckoutStatus from './components/CheckoutStatus';
import { supabase } from './lib/supabase';

const AppRoutes: React.FC = () => {
  const { path, navigate } = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Listener global de autenticação
  useEffect(() => {
    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setIsAuthChecking(false);
      
      // Se já existe sessão e estamos na home/com hash de retorno, vai para dashboard
      if (initialSession && (window.location.pathname === '/' || window.location.hash)) {
        navigate('/dashboard');
      }
    });

    // Escutar mudanças no estado (Login/Logout/OAuth Redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      
      // Captura SIGNED_IN (incluindo retornos de Google OAuth que trazem hash na URL)
      if (event === 'SIGNED_IN' || (event === 'INITIAL_SESSION' && currentSession)) {
        const p = window.location.pathname;
        if (p === '/' || p === '' || p === '/index.html' || window.location.hash.includes('access_token')) {
          navigate('/dashboard');
        }
      }
      
      if (event === 'SIGNED_OUT') {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Remove trailing slashes e query strings para comparação de rotas
  const pathWithoutQuery = path.split('?')[0];
  const normalizedPath = pathWithoutQuery.endsWith('/') && pathWithoutQuery.length > 1 
    ? pathWithoutQuery.slice(0, -1) 
    : pathWithoutQuery;

  // Enquanto verifica o estado inicial, mostramos um loader simples
  if (isAuthChecking && normalizedPath === '/dashboard') {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin"></div></div>;
  }

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
