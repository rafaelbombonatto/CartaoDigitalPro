
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from '../lib/routerContext';

const Auth: React.FC = () => {
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

  const translateError = (error: any) => {
    const msg = error.message || '';
    if (msg.includes('Password should be at least 6 characters')) return 'A senha deve ter pelo menos 6 caracteres.';
    if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
    if (msg.includes('User already registered')) return 'Este e-mail já está cadastrado em nossa plataforma.';
    if (msg.includes('Email not confirmed')) return 'Por favor, confirme seu e-mail antes de entrar.';
    
    return 'Ocorreu um erro inesperado. Tente novamente.';
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ text: 'Verifique seu e-mail para confirmar a conta.', type: 'success' });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (error: any) {
      setMessage({ text: translateError(error), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);
    
    // Força o redirecionamento para o domínio atual exato (analisecardpro.com.br)
    const currentOrigin = window.location.origin;

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${currentOrigin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setMessage({ text: translateError(error), type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-white dark:bg-zinc-900 transition-colors">
      <div className="w-full max-w-xs space-y-6">
        <div className="mb-4">
            <div className="w-16 h-16 bg-brand-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-cyan text-2xl">
                <i className="fa-solid fa-user-lock"></i>
            </div>
            <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">
            {isSignUp ? 'Criar Conta' : 'Área do Editor'}
            </h2>
            <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold tracking-widest">
            Acesse para gerenciar seu cartão digital
            </p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 font-black py-4 rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-[10px] uppercase tracking-widest"
          >
            {loading ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <>
                <i className="fa-brands fa-google text-red-500 text-base"></i>
                <span>Entrar com Google</span>
              </>
            )}
          </button>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-gray-100 dark:border-zinc-800"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-[8px] uppercase font-black tracking-[0.2em]">Ou e-mail</span>
            <div className="flex-grow border-t border-gray-100 dark:border-zinc-800"></div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="email"
              placeholder="E-MAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl p-4 text-[11px] font-bold outline-none text-black dark:text-white focus:border-brand-cyan transition-colors"
            />
            <input
              type="password"
              placeholder="SENHA"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl p-4 text-[11px] font-bold outline-none text-black dark:text-white focus:border-brand-cyan transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-cyan hover:bg-brand-blue text-black font-black py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-[10px] uppercase tracking-widest"
            >
              {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : (isSignUp ? 'CRIAR MINHA CONTA' : 'ENTRAR NO PAINEL')}
            </button>
          </form>
        </div>

        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          {isSignUp ? 'Já possui cadastro?' : 'Novo por aqui?'}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }}
            className="ml-2 text-brand-cyan font-black hover:underline"
          >
            {isSignUp ? 'FAZER LOGIN' : 'CRIAR CONTA'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
