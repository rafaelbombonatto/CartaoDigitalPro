
import React, { useEffect, useState } from 'react';
import { useRouter } from '../lib/routerContext';
import Background from './Background';
import ProfileHeader from './ProfileHeader';
import ActionButton from './ActionButton';
import SaveContactButton from './SaveContactButton';
import Footer from './Footer';
import { ProfileData, QuickAction, SocialLink } from '../types';
import { getProfileByAlias } from '../lib/supabase';
import { DEFAULT_PROFILE, DEFAULT_QUICK_ACTIONS, DEFAULT_SOCIAL_LINKS } from '../constants';

interface PublicCardProps {
    slug: string;
}

function adjustColor(color: string, amount: number) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

const PublicCard: React.FC<PublicCardProps> = ({ slug }) => {
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // States
  const [profileData, setProfileData] = useState<ProfileData>(DEFAULT_PROFILE);
  const [quickActions, setQuickActions] = useState<QuickAction[]>(DEFAULT_QUICK_ACTIONS);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(DEFAULT_SOCIAL_LINKS);

  useEffect(() => {
    if (slug) {
        if (slug === 'exemplo' || slug === 'demo') {
            // Carrega dados de exemplo instantaneamente
            setIsDemo(true);
            setLoading(false);
        } else {
            loadProfile(slug);
        }
    } else {
        setError(true);
        setLoading(false);
    }
  }, [slug]);

  // --- Injeção de CSS Dinâmico ---
  useEffect(() => {
    const root = document.documentElement;
    const color = profileData.themeColor;
    root.style.setProperty('--theme-color', color);
    root.style.setProperty('--theme-color-dark', adjustColor(color, -40)); 
    root.style.setProperty('--theme-color-light', adjustColor(color, 40));
    document.documentElement.classList.add('dark'); // Force dark mode for card view usually looks better
  }, [profileData.themeColor]);

  const loadProfile = async (alias: string) => {
      try {
        const { data, error } = await getProfileByAlias(alias);
        
        if (error || !data) {
            console.warn("Profile fetch failed:", error?.message);
            setError(true);
        } else if (data.content) {
            const content = data.content;
            if (content.profile) {
                const profile = content.profile as ProfileData;
                setProfileData(profile);
                
                // Verificar Validade do Teste Grátis
                if (!profile.isPremium) {
                    const createdAt = new Date(profile.createdAt || new Date().toISOString()); // Se não tiver data, assume hoje (fallback)
                    const now = new Date();
                    const trialEnd = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias
                    
                    if (now > trialEnd) {
                        setIsExpired(true);
                    }
                }
            }
            if (content.actions) setQuickActions(content.actions);
            if (content.links) setSocialLinks(content.links);
        }
      } catch (e) {
          console.error("Unexpected error loading profile:", e);
          setError(true);
      } finally {
          setLoading(false);
      }
  };

  if (loading) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
  }

  if (error) {
      return (
          <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
              <i className="fa-solid fa-ghost text-6xl text-gray-700 mb-4"></i>
              <h1 className="text-2xl font-bold mb-2">Cartão não encontrado</h1>
              <p className="text-gray-400 mb-6">O endereço <strong>/{slug}</strong> não existe ou foi desativado.</p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => navigate('/')} 
                    className="bg-gold text-black font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform"
                  >
                    Criar meu cartão
                  </button>
                  <button 
                    onClick={() => navigate('/exemplo')} 
                    className="bg-zinc-800 text-white font-bold px-6 py-3 rounded-full hover:bg-zinc-700 transition-colors"
                  >
                    Ver Exemplo
                  </button>
              </div>
          </div>
      );
  }

  // --- Bloqueio por Expiração ---
  if (isExpired) {
      return (
          <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
             {/* Background blur effect */}
             <div className="absolute inset-0 bg-red-900/20 blur-3xl"></div>
             
             <div className="relative z-10 max-w-md w-full bg-zinc-900/80 border border-red-500/30 p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 text-3xl">
                    <i className="fa-solid fa-lock"></i>
                </div>
                <h1 className="text-2xl font-bold mb-2">Cartão Expirado</h1>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    O período de teste gratuito deste cartão encerrou. Se você é o dono deste cartão, acesse o painel para regularizar.
                </p>
                
                <button 
                    onClick={() => navigate('/')} 
                    className="w-full bg-white text-black font-bold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors mb-4"
                >
                    Acessar Painel
                </button>
                <p className="text-xs text-gray-600">Este perfil foi criado há mais de 7 dias.</p>
             </div>
          </div>
      );
  }

  return (
    <>
      <Background imageUrl={profileData.backgroundUrl} />

      {isDemo && (
          <>
            <div className="fixed top-0 left-0 w-full bg-indigo-600/90 backdrop-blur-sm text-white text-center text-[10px] font-bold py-1 z-50 tracking-widest uppercase">
                Modo de Demonstração
            </div>
            {/* Botão Voltar ao Início */}
            <button 
                onClick={() => navigate('/')}
                className="fixed top-8 left-4 z-50 group flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 transition-all text-white text-sm font-medium"
            >
                <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                <span className="hidden sm:inline">Voltar ao Início</span>
            </button>
          </>
      )}

      <main className={`min-h-screen w-full flex flex-col items-center justify-center p-4 relative z-10 pb-12 animate-fade-in ${isDemo ? 'pt-12' : ''}`}>
        
        <div className="
          w-full max-w-[400px] 
          bg-white/10
          backdrop-blur-xl 
          border border-white/20 
          rounded-3xl shadow-2xl 
          p-6 sm:p-8
          flex flex-col items-center
          relative overflow-hidden
        ">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

          <ProfileHeader data={profileData} />

          <div className="w-full grid grid-cols-2 gap-3 mb-2">
            {quickActions.map((action, index) => (
              <ActionButton key={index} action={action} index={index} isDemo={isDemo} />
            ))}
          </div>

          <SaveContactButton data={profileData} isDemo={isDemo} />

          <Footer links={socialLinks} isDemo={isDemo} />
        </div>
        
        {/* Branding discreto */}
        <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="mt-8 text-[10px] text-white/30 uppercase tracking-widest hover:text-gold transition-colors cursor-pointer">
            Criado com Cartão Digital Pro
        </a>

      </main>
    </>
  );
};

export default PublicCard;
