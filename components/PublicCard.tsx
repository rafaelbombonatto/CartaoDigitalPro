import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Background from './Background';
import ProfileHeader from './ProfileHeader';
import ActionButton from './ActionButton';
import SaveContactButton from './SaveContactButton';
import Footer from './Footer';
import { ProfileData, QuickAction, SocialLink } from '../types';
import { getProfileByAlias } from '../lib/supabase';
import { DEFAULT_PROFILE, DEFAULT_QUICK_ACTIONS, DEFAULT_SOCIAL_LINKS } from '../constants';

function adjustColor(color: string, amount: number) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

const PublicCard: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // States
  const [profileData, setProfileData] = useState<ProfileData>(DEFAULT_PROFILE);
  const [quickActions, setQuickActions] = useState<QuickAction[]>(DEFAULT_QUICK_ACTIONS);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(DEFAULT_SOCIAL_LINKS);

  useEffect(() => {
    if (slug) {
        loadProfile(slug);
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
            console.error("Profile not found or public access disabled.");
            setError(true);
        } else if (data.content) {
            const content = data.content;
            if (content.profile) setProfileData(content.profile);
            if (content.actions) setQuickActions(content.actions);
            if (content.links) setSocialLinks(content.links);
        }
      } catch (e) {
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
              <p className="text-gray-400 mb-6">O endereço que você digitou não existe ou foi desativado.</p>
              <button 
                onClick={() => navigate('/')} 
                className="bg-gold text-black font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform"
              >
                Criar meu próprio cartão
              </button>
          </div>
      );
  }

  return (
    <>
      <Background imageUrl={profileData.backgroundUrl} />

      <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative z-10 pb-12 animate-fade-in">
        
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
              <ActionButton key={index} action={action} index={index} />
            ))}
          </div>

          <SaveContactButton data={profileData} />

          <Footer links={socialLinks} />
        </div>
        
        {/* Branding discreto */}
        <a href="/" className="mt-8 text-[10px] text-white/30 uppercase tracking-widest hover:text-gold transition-colors">
            Criado com CartãoPro
        </a>

      </main>
    </>
  );
};

export default PublicCard;