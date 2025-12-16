import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [currentOrigin, setCurrentOrigin] = useState('');
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    const origin = window.location.origin;
    setCurrentOrigin(origin);
    setIsLocalhost(origin.includes('localhost') || origin.includes('127.0.0.1'));
  }, []);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
        setMessage({ text: 'Por favor, insira um endereço de e-mail válido.', type: 'error' });
        return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({ text: 'Cadastro realizado! Verifique seu e-mail ou faça login.', type: 'success' });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      setMessage({ text: error.message || 'Ocorreu um erro.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      let errorMsg = error.message || 'Erro ao conectar com Google.';
      
      if (errorMsg.includes('provider is not enabled')) {
        errorMsg = 'O login com Google não está ativo no Supabase.';
      }

      setMessage({ text: errorMsg, type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-full max-w-xs space-y-6">
        <div className="mb-4">
            <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 text-gold-dark dark:text-gold text-2xl">
                <i className="fa-solid fa-user-lock"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {isSignUp ? 'Criar Conta' : 'Área Restrita'}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
            Faça login para editar seu cartão digital.
            </p>
        </div>

        {message && (
          <div className={`p-3 rounded text-sm ${message.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <>
                <i className="fa-brands fa-google text-red-500"></i>
                <span>Entrar com Google</span>
              </>
            )}
          </button>

           <button 
            onClick={() => setShowHelp(!showHelp)}
            className="text-xs text-red-400 font-bold underline hover:text-red-500 transition-colors"
           >
             {showHelp ? 'Fechar Ajuda' : 'Deu erro 403? Clique aqui.'}
           </button>
           
           {showHelp && (
             <div className="text-left bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg border border-red-200 dark:border-red-900/50 text-xs text-gray-600 dark:text-gray-300 space-y-4 shadow-inner max-h-96 overflow-y-auto">
               <h3 className="font-bold text-red-500 dark:text-red-400 border-b border-gray-300 pb-2">DIAGNÓSTICO DE ERRO 403</h3>
               
               <div className="space-y-4">
                 
                 <div className="p-3 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded">
                    <p className="font-bold text-orange-800 dark:text-orange-400 mb-1">
                        <i className="fa-solid fa-users"></i> VOCÊ ADICIONOU SEU E-MAIL?
                    </p>
                    <p>O erro 403 geralmente significa que seu app está em modo "Testing" no Google.</p>
                    <ol className="list-decimal pl-4 mt-2 space-y-1 text-[10px]">
                        <li>Vá no <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" className="underline">Google Cloud Console &gt; OAuth consent screen</a>.</li>
                        <li>Verifique se o "Publishing status" é <strong>Testing</strong>.</li>
                        <li>Se for, desça até <strong>Test users</strong>.</li>
                        <li>Clique em <strong>+ ADD USERS</strong> e adicione o seu email.</li>
                        <li>Sem isso, o Google bloqueia o login.</li>
                    </ol>
                 </div>

                 {!isLocalhost && (
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded">
                        <p className="font-bold text-purple-800 dark:text-purple-400 mb-1">
                            <i className="fa-solid fa-cloud"></i> VOCÊ ESTÁ EM UM PREVIEW
                        </p>
                        <p>Você não está no Localhost. O Supabase não conhece este endereço temporário.</p>
                        <p className="mt-2 font-semibold">Adicione isto no Supabase (Redirect URLs):</p>
                        <code className="block mt-1 bg-black/10 dark:bg-black/30 p-1 rounded font-mono break-all select-all text-blue-600 dark:text-blue-400 font-bold mb-2">
                           {currentOrigin}/**
                        </code>
                        <p>Se a URL mudar sempre, tente usar um coringa:</p>
                        <code className="block mt-1 bg-black/10 dark:bg-black/30 p-1 rounded font-mono break-all select-all text-gray-500 dark:text-gray-400">
                           https://*.scf.usercontent.goog/**
                        </code>
                    </div>
                 )}

                 {isLocalhost && (
                     <div className="p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded">
                        <p className="font-bold text-blue-800 dark:text-blue-400 mb-1">LOCALHOST DETECTADO</p>
                        <p>Certifique-se de que <code>http://localhost:5173/**</code> está na lista de Redirect URLs no Supabase.</p>
                     </div>
                 )}

               </div>
             </div>
           )}

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-zinc-700"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">Ou com e-mail</span>
            <div className="flex-grow border-t border-gray-300 dark:border-zinc-700"></div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded p-3 text-sm outline-none text-black dark:text-white focus:border-gold"
            />
            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded p-3 text-sm outline-none text-black dark:text-white focus:border-gold"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-light text-black font-bold py-3 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : (isSignUp ? 'Cadastrar' : 'Entrar')}
            </button>
          </form>
        </div>

        <div className="text-sm text-gray-500">
          {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }}
            className="ml-1 text-gold-dark dark:text-gold font-bold hover:underline"
          >
            {isSignUp ? 'Entrar' : 'Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;