import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
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
        // O App.tsx vai detectar a mudança de sessão automaticamente
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
          redirectTo: window.location.origin, // Redireciona de volta para a página atual após o login
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setMessage({ text: error.message || 'Erro ao conectar com Google.', type: 'error' });
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
          {/* Botão Google */}
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