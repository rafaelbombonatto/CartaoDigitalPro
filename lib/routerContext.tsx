import React, { createContext, useContext, useState, useEffect } from 'react';

// Definição do Contexto de Navegação
interface RouterContextType {
  path: string;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  path: '/',
  navigate: () => {},
});

// Hook personalizado para usar a navegação nos componentes
export const useRouter = () => useContext(RouterContext);

// Provider que envolve a aplicação
export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicialização segura do estado da rota
  const [path, setPath] = useState(() => {
    try {
      // Em ambientes Blob (preview) ou iframe restrito, window.location pode ser problemático
      // ou retornar caminhos internos do blob. Forçamos a Home '/' nesses casos para evitar erros.
      if (typeof window !== 'undefined' && window.location.protocol === 'blob:') {
        return '/';
      }
      return window.location.pathname || '/';
    } catch {
      return '/';
    }
  });

  useEffect(() => {
    const onPopState = () => {
      try {
        setPath(window.location.pathname);
      } catch {
        // Ignora erros de leitura do location em ambientes restritos
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (newPath: string) => {
    // Tenta atualizar a URL visualmente via History API
    // Envolvemos em try-catch pois ambientes sandbox/blob bloqueiam pushState (SecurityError)
    try {
      const isBlob = window.location.protocol === 'blob:';
      if (!isBlob) {
        window.history.pushState({}, '', newPath);
      }
    } catch (e) {
      console.warn("Navegação visual (URL bar) bloqueada pelo ambiente. Usando navegação interna.", e);
    }
    
    // Atualiza o estado da aplicação independentemente da URL bar
    setPath(newPath);
    window.scrollTo(0, 0);
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};