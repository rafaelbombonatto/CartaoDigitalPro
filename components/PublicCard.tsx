
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from '../lib/routerContext';
import Background from './Background';
import ProfileHeader from './ProfileHeader';
import ActionButton from './ActionButton';
import SaveContactButton from './SaveContactButton';
import Footer from './Footer';
import { ProfileData, QuickAction, SocialLink } from '../types';
import { getProfileByAlias, supabase } from '../lib/supabase';
import { DEFAULT_PROFILE, DEFAULT_QUICK_ACTIONS, DEFAULT_SOCIAL_LINKS } from '../constants';

interface PublicCardProps {
    slug: string;
}

declare global {
  interface Window {
    fbq: any;
    gtag: any;
    dataLayer: any;
  }
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
  const [userId, setUserId] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<ProfileData>(DEFAULT_PROFILE);
  const [quickActions, setQuickActions] = useState<QuickAction[]>(DEFAULT_QUICK_ACTIONS);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(DEFAULT_SOCIAL_LINKS);

  // 1. Injeção de Rastreamento (Meta Pixel & GA4)
  useEffect(() => {
    if (loading || error) return;

    // Meta Pixel
    if (profileData.metaPixelId) {
      // Fix: Added optional indicators (?) to parameters n, t, s to resolve TS error "Expected 7 arguments, but got 4"
      (function(f:any,b:any,e:any,v:any,n?:any,t?:any,s?:any)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window,document,'script',
      'https://connect.facebook.net/en_US/fbevents.js'));
      window.fbq('init', profileData.metaPixelId);
      window.fbq('track', 'PageView');
    }

    // Google Analytics 4
    if (profileData.ga4MeasurementId) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${profileData.ga4MeasurementId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function(){window.dataLayer.push(arguments);}
      window.gtag('js', new Date());
      window.gtag('config', profileData.ga4MeasurementId);
    }
  }, [profileData.metaPixelId, profileData.ga4MeasurementId, loading, error]);

  // 2. Handler de Clique Inteligente
  const handleActionClick = useCallback(async (action: QuickAction | SocialLink, type: string) => {
    if (isDemo || !action.url || action.url === '#') return;

    // Construir URL com UTMs
    const utmUrl = new URL(action.url.startsWith('mailto:') || action.url.startsWith('https://wa.me/') ? action.url : 
                   (action.url.startsWith('http') ? action.url : `https://${action.url}`));
    
    // Adicionar UTMs se for uma URL HTTP
    if (utmUrl.protocol.startsWith('http')) {
        utmUrl.searchParams.set('utm_source', 'cartaodigitalpro');
        utmUrl.searchParams.set('utm_medium', 'card');
        utmUrl.searchParams.set('utm_campaign', `${profileData.alias}_${type}`);
    }

    const finalUrl = utmUrl.toString();

    // Rastreamento Meta Pixel
    if (profileData.metaPixelId && window.fbq) {
      window.fbq('trackCustom', 'CardClick', { 
        action_type: type, 
        profile_alias: profileData.alias,
        label: action.label 
      });
    }

    // Rastreamento GA4
    if (profileData.ga4MeasurementId && window.gtag) {
      window.gtag('event', 'card_click', {
        event_category: 'card',
        event_label: `${profileData.alias}_${type}`,
        action_label: action.label
      });
    }

    // Salvar no Banco (Supabase)
    if (userId) {
      supabase.from('profiles_clicks').insert({
        profile_id: userId,
        action_type: type,
        action_label: action.label,
        source: 'card'
      }).then(({error}) => error && console.error("Error logging click:", error));
    }

    // Redirecionar
    window.open(finalUrl, '_blank');
  }, [profileData, isDemo, userId]);

  useEffect(() => {
    if (slug) {
        if (slug === 'exemplo' || slug === 'demo') {
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

  useEffect(() => {
    const root = document.documentElement;
    const color = profileData.themeColor || "#D4AF37";
    root.style.setProperty('--theme-color', color);
    root.style.setProperty('--theme-color-dark', adjustColor(color, -40)); 
    root.style.setProperty('--theme-color-light', adjustColor(color, 40));
    document.documentElement.classList.add('dark');
  }, [profileData.themeColor]);

  const loadProfile = async (alias: string) => {
      try {
        const { data, error } = await getProfileByAlias(alias);
        if (error || !data) {
            setError(true);
        } else if (data.content) {
            setUserId(data.id);
            const content = data.content;
            if (content.profile) {
                const profile = content.profile as ProfileData;
                const finalProfile = {
                    ...profile,
                    isPremium: profile.isPremium ?? false,
                    createdAt: profile.createdAt || data.created_at || new Date().toISOString()
                };
                setProfileData(finalProfile);
                if (!finalProfile.isPremium) {
                    const trialEnd = new Date(new Date(finalProfile.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000); 
                    if (new Date() > trialEnd) setIsExpired(true);
                }
            }
            if (content.actions) setQuickActions(content.actions);
            if (content.links) setSocialLinks(content.links);
        }
      } catch (e) {
          setError(true);
      } finally {
          setLoading(false);
      }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center"><i className="fa-solid fa-ghost text-6xl text-gray-700 mb-4"></i><h1 className="text-2xl font-bold mb-2">Cartão não encontrado</h1><button onClick={() => navigate('/')} className="bg-gold text-black font-bold px-6 py-3 rounded-full">Criar meu cartão</button></div>;
  if (isExpired) return <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center"><h1 className="text-2xl font-bold mb-2">Cartão Expirado</h1><button onClick={() => navigate('/')} className="bg-white text-black font-bold px-6 py-3 rounded-lg">Acessar Painel</button></div>;

  return (
    <>
      <Background imageUrl={profileData.backgroundUrl} />
      {isDemo && <div className="fixed top-0 left-0 w-full bg-indigo-600/90 text-white text-center text-[10px] font-bold py-1 z-50 tracking-widest uppercase">Modo de Demonstração</div>}
      
      <main className={`min-h-screen w-full flex flex-col items-center justify-center p-4 relative z-10 pb-12 animate-fade-in ${isDemo ? 'pt-12' : ''}`}>
        <div className="w-full max-w-[400px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center relative overflow-hidden">
          <ProfileHeader data={profileData} />

          {/* Grid de Ações Rápidas com Interceptor de Clique */}
          <div className="w-full grid grid-cols-2 gap-3 mb-2">
            {quickActions.map((action, index) => (
              <div key={index} onClick={(e) => { e.preventDefault(); handleActionClick(action, action.type); }}>
                <ActionButton action={action} index={index} isDemo={isDemo} />
              </div>
            ))}
          </div>

          <SaveContactButton data={profileData} isDemo={isDemo} />

          {/* Footer Social com Interceptor de Clique */}
          <footer className="mt-auto pt-6 pb-4 border-t border-black/10 dark:border-white/10 w-full animate-slide-up transition-colors duration-300" style={{ animationDelay: '0.7s' }}>
            <div className="flex justify-center gap-6 mb-4">
                {socialLinks.filter(l => l.url && l.url !== '#').map((link, idx) => (
                <button
                    key={idx}
                    onClick={() => handleActionClick(link, 'social')}
                    className="text-gray-400 hover:text-gold transition-all transform hover:scale-125"
                >
                    <i className={`${link.icon} text-xl`}></i>
                </button>
                ))}
            </div>
          </footer>
        </div>
        <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="mt-8 text-[10px] text-white/30 uppercase tracking-widest hover:text-gold transition-colors">Criado com Cartão Digital Pro</a>
      </main>
    </>
  );
};

export default PublicCard;
