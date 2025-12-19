
import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
    _fbq_initialized?: boolean;
    _ga4_initialized?: boolean;
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

  // Helper para validar se uma ação deve ser exibida
  const isActionValid = (action: QuickAction) => {
      if (isDemo) return true;
      return action.url && 
             action.url !== '' && 
             action.url !== '#' && 
             action.url !== 'https://wa.me/55' && 
             action.url !== 'mailto:' && 
             action.url !== 'https://maps.google.com/?q=';
  };

  // Filtra as ações válidas para evitar lacunas no grid
  const visibleActions = useMemo(() => {
      return quickActions.filter(isActionValid);
  }, [quickActions, isDemo]);

  // 1. Sistema de Injeção de Rastreamento
  useEffect(() => {
    if (loading || error || isDemo) return;

    if (profileData.metaPixelId && !window._fbq_initialized) {
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
      window._fbq_initialized = true;
    }

    if (profileData.ga4MeasurementId && !window._ga4_initialized) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${profileData.ga4MeasurementId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function(){window.dataLayer.push(arguments);}
      window.gtag('js', new Date());
      window.gtag('config', profileData.ga4MeasurementId, { page_path: window.location.pathname });
      window._ga4_initialized = true;
    }
  }, [profileData.metaPixelId, profileData.ga4MeasurementId, loading, error, isDemo]);

  // 2. Handler de Clique
  const handleActionClick = useCallback(async (action: QuickAction | SocialLink, type: string) => {
    if (isDemo || !action.url || action.url === '#') return;

    let finalUrl = action.url;
    if (!finalUrl.startsWith('http') && !finalUrl.startsWith('mailto:') && !finalUrl.startsWith('tel:')) {
        finalUrl = `https://${finalUrl}`;
    }

    try {
        const urlObj = new URL(finalUrl);
        if (urlObj.protocol.startsWith('http')) {
            urlObj.searchParams.set('utm_source', 'cartaodigitalpro');
            urlObj.searchParams.set('utm_medium', 'card');
            urlObj.searchParams.set('utm_campaign', `${profileData.alias}_${type}`);
            finalUrl = urlObj.toString();
        }
    } catch (e) {}

    if (window.fbq && profileData.metaPixelId) {
      window.fbq('trackCustom', 'CardClick', { action_type: type, label: action.label, alias: profileData.alias });
    }

    if (userId) {
      supabase.from('profiles_clicks').insert({
        profile_id: userId,
        action_type: type,
        action_label: action.label,
        source: 'card'
      }).then(({error}) => error && console.error(error));
    }

    setTimeout(() => { window.open(finalUrl, '_blank'); }, 100);
  }, [profileData, isDemo, userId]);

  useEffect(() => {
    if (slug) {
        if (slug === 'exemplo' || slug === 'demo') {
            setIsDemo(true);
            setLoading(false);
        } else {
            loadProfile(slug);
        }
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
                setProfileData({
                    ...profile,
                    isPremium: profile.isPremium ?? false,
                    createdAt: profile.createdAt || data.created_at || new Date().toISOString()
                });
                
                if (!profile.isPremium) {
                    const trialEnd = new Date(new Date(profile.createdAt || data.created_at).getTime() + 7 * 24 * 60 * 60 * 1000); 
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

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gold font-bold text-[10px] tracking-widest uppercase animate-pulse">Carregando Cartão...</p>
        </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black mb-2 uppercase tracking-tighter">Perfil não encontrado</h1>
        <button onClick={() => navigate('/')} className="bg-gold text-black font-black px-8 py-4 rounded-2xl uppercase text-xs tracking-widest shadow-lg shadow-gold/20">Criar meu cartão</button>
    </div>
  );

  return (
    <>
      <Background imageUrl={profileData.backgroundUrl} />
      {isDemo && <div className="fixed top-0 left-0 w-full bg-indigo-600/90 text-white text-center text-[10px] font-black py-2 z-[100] tracking-widest uppercase">Modo de Demonstração</div>}
      
      <main className={`min-h-screen w-full flex flex-col items-center justify-center p-4 relative z-10 pb-20 animate-fade-in ${isDemo ? 'pt-14' : ''}`}>
        <div className="w-full max-w-[420px] bg-white/5 dark:bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl p-6 sm:p-10 flex flex-col items-center relative overflow-hidden transition-all duration-500">
          
          <ProfileHeader data={profileData} />

          {/* Smart Grid de Ações Rápidas */}
          <div className="w-full grid grid-cols-2 gap-4 mb-4">
            {visibleActions.map((action, index) => {
              // Se for o último item e o total for ímpar, ocupa 2 colunas
              const isLastAndOdd = visibleActions.length % 2 !== 0 && index === visibleActions.length - 1;
              return (
                <div 
                  key={index} 
                  className={isLastAndOdd ? 'col-span-2' : ''}
                  onClick={(e) => { e.preventDefault(); handleActionClick(action, action.type); }}
                >
                  <ActionButton action={action} index={index} isDemo={isDemo} />
                </div>
              );
            })}
          </div>

          <SaveContactButton data={profileData} isDemo={isDemo} />

          {/* Footer Social */}
          <footer className="mt-8 pt-8 border-t border-white/5 w-full">
            <div className="flex justify-center gap-6 mb-8">
                {socialLinks.filter(l => l.url && l.url !== '#').map((link, idx) => (
                <button
                    key={idx}
                    onClick={() => handleActionClick(link, 'social')}
                    className="text-zinc-400 hover:text-gold transition-all transform hover:scale-125"
                >
                    <i className={`${link.icon} text-2xl`}></i>
                </button>
                ))}
            </div>
            <div className="flex flex-col items-center opacity-20">
                <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="text-[9px] text-white uppercase tracking-[0.3em] font-black">
                    Cartão Digital <span className="text-gold">Pro</span>
                </a>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
};

export default PublicCard;
