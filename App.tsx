import React from 'react';
import { RouterProvider, useRouter } from './lib/routerContext';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import PublicCard from './components/PublicCard';

// Componente que decide qual tela mostrar baseado na URL atual
const AppRoutes: React.FC = () => {
  const { path } = useRouter();

  // Rota: Landing Page (Home)
  if (path === '/' || path === '/index.html') {
    return <LandingPage />;
  }
  
  // Rota: Dashboard (Editor)
  if (path === '/dashboard') {
    return <Dashboard />;
  }

  // Rota: Cartão Público (Slug dinâmico)
  // Se não for nenhuma das rotas acima e tiver conteúdo, assumimos que é um slug (ex: /joao)
  // Filtramos 'index.html' caso apareça no pathname por configuração do servidor
  if (path.length > 1 && !path.includes('index.html')) {
    // Remove a barra inicial '/' para pegar apenas o nome
    const slug = path.substring(1); 
    return <PublicCard slug={slug} />;
  }

  // Fallback padrão
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