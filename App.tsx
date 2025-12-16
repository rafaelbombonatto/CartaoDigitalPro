import React, { useEffect, useState } from 'react';
import Background from './components/Background';
import ProfileHeader from './components/ProfileHeader';
import ActionButton from './components/ActionButton';
import SaveContactButton from './components/SaveContactButton';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import AdminPanel from './components/AdminPanel';
import TrialBanner from './components/TrialBanner';
import { DEFAULT_PROFILE, DEFAULT_QUICK_ACTIONS, DEFAULT_SOCIAL_LINKS } from './constants';
import { ProfileData, QuickAction, SocialLink, UploadPending } from './types';
import { supabase, uploadImage } from './lib/supabase';

function adjustColor(color: string, amount: number) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

const App: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [session, setSession] = useState<any>(null);

  // States
  const [profileData, setProfileData] = useState<ProfileData>(DEFAULT_PROFILE);
  const [quickActions, setQuickActions] = useState<QuickAction[]>(DEFAULT_QUICK_ACTIONS);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(DEFAULT_SOCIAL_LINKS);

  // --- Gerenciamento de Sessão ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Busca de Dados ---
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignora erro se não encontrar (usa default)
        console.error('Erro ao buscar perfil:', error);
      }

      if (data && data.content) {
        const content = data.content;
        if (content.profile) setProfileData(content.profile);
        if (content.actions) setQuickActions(content.actions);
        if (content.links) setSocialLinks(content.links);
      }
    } catch (err) {
      console.error('Erro inesperado ao buscar:', err);
    }
  };

  useEffect(() => {
    // Efeito de carregamento inicial visual
    setLoaded(true);
    document.documentElement.classList.add('dark');
  }, []);

  // --- Injeção de CSS Dinâmico ---
  useEffect(() => {
    const root = document.documentElement;
    const color = profileData.themeColor;
    root.style.setProperty('--theme-color', color);
    root.style.setProperty('--theme-color-dark', adjustColor(color, -40)); 
    root.style.setProperty('--theme-color-light', adjustColor(color, 40));
  }, [profileData.themeColor]);

  // --- Função de Salvar (Supabase) ---
  const handleSave = async (pendingUploads: UploadPending[]) => {
    if (!session) {
        alert("Você precisa estar logado para salvar.");
        return;
    }

    setIsSaving(true);
    try {
      let updatedProfile = { ...profileData };

      // 1. Processar Uploads para Storage
      for (const upload of pendingUploads) {
        // Tenta fazer upload para o bucket 'images'
        // Assumimos que o bucket e as policies foram criados conforme instruções em lib/supabase.ts
        const publicUrl = await uploadImage(upload.file, session.user.id);
        
        if (publicUrl) {
           updatedProfile = { ...updatedProfile, [upload.field]: publicUrl };
        } else {
           // Fallback: Se falhar (ex: bucket não existe), tenta salvar como base64 (não recomendado para produção)
           alert(`Falha no upload da imagem ${upload.field}. Tente configurar o Storage do Supabase.`);
        }
      }

      setProfileData(updatedProfile);

      // 2. Salvar no Banco de Dados (Upsert)
      const contentToSave = {
        profile: updatedProfile,
        actions: quickActions,
        links: socialLinks
      };

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          alias: updatedProfile.alias,
          updated_at: new Date(),
          content: contentToSave
        });

      if (error) {
        throw error;
      }

      alert('Perfil salvo com sucesso no Supabase!');
      
      // Atualiza URL se alias mudou
      if (updatedProfile.alias !== 'default' && !window.location.pathname.includes(updatedProfile.alias)) {
           window.history.pushState({}, '', `/${updatedProfile.alias}`);
      }
      
      setIsAdminOpen(false);

    } catch (err: any) {
      console.error(err);
      alert('Erro ao salvar no banco de dados: ' + (err.message || err.error_description || 'Erro desconhecido'));
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  return (
    <>
      <Background imageUrl={profileData.backgroundUrl} />

      {/* Admin Trigger */}
      <button 
        onClick={() => setIsAdminOpen(true)}
        className="fixed top-24 right-4 z-40 w-10 h-10 bg-white dark:bg-zinc-800 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gold transition-colors"
        title="Editar Perfil"
      >
        <i className={`fa-solid ${session ? 'fa-pen-to-square' : 'fa-lock'}`}></i>
      </button>

      <AdminPanel 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)}
        profileData={profileData}
        setProfileData={setProfileData}
        socialLinks={socialLinks}
        setSocialLinks={setSocialLinks}
        quickActions={quickActions}
        setQuickActions={setQuickActions}
        onSave={handleSave}
        isSaving={isSaving}
        session={session}
      />

      <main className={`min-h-screen w-full flex flex-col items-center justify-center p-4 transition-opacity duration-1000 relative z-10 ${loaded ? 'opacity-100' : 'opacity-0'} pb-24`}>
        
        <div className="
          w-full max-w-[400px] 
          bg-white/60 dark:bg-white/10
          backdrop-blur-xl 
          border border-white/40 dark:border-white/20 
          rounded-3xl shadow-2xl 
          p-6 sm:p-8
          flex flex-col items-center
          relative overflow-hidden
          transition-all duration-500
        ">
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />

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
      </main>

      <TrialBanner />
    </>
  );
};

export default App;
