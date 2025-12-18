
import React, { useState, useRef, useEffect } from 'react';
import { ProfileData, QuickAction, SocialLink, UploadPending } from '../types';
import Auth from './Auth';
import PremiumModal from './PremiumModal';
import { supabase, uploadImage, checkAliasAvailability } from '../lib/supabase';
import { DEFAULT_PROFILE, DEFAULT_QUICK_ACTIONS, DEFAULT_SOCIAL_LINKS } from '../constants';
import { useRouter } from '../lib/routerContext';

const Dashboard: React.FC = () => {
  const { navigate } = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  const [profileData, setProfileData] = useState<ProfileData>(DEFAULT_PROFILE);
  const [quickActions, setQuickActions] = useState<QuickAction[]>(DEFAULT_QUICK_ACTIONS);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(DEFAULT_SOCIAL_LINKS);
  
  const [isSaving, setIsSaving] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<UploadPending[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
          fetchProfile(session.user.id);
      } else {
          setLoadingProfile(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoadingProfile(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      setLoadingProfile(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
          let currentProfile = data.content?.profile || DEFAULT_PROFILE;
          
          // Garantia de integridade: se vier do banco sem isPremium, assume false
          if (currentProfile.isPremium === undefined) {
              currentProfile.isPremium = false;
          }

          if (!currentProfile.createdAt) {
              currentProfile.createdAt = data.created_at || new Date().toISOString();
          }
          
          setProfileData(currentProfile);
          if (data.content?.actions) setQuickActions(data.content.actions);
          if (data.content?.links) setSocialLinks(data.content.links);
      } else {
          // Novo usuário: Garante que o estado inicial tenha isPremium: false
          setProfileData({ ...DEFAULT_PROFILE, isPremium: false });
      }

      const params = new URLSearchParams(window.location.search);
      if (params.get('upgrade') === 'success') {
          setShowSuccessToast(true);
          window.history.replaceState({}, document.title, window.location.pathname);
          setTimeout(() => setShowSuccessToast(false), 5000);
      }
      
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSave = async () => {
    if (!session) return;
    setIsSaving(true);
    try {
      const alias = profileData.alias;
      if (!alias || alias.length < 3) throw new Error("O link personalizado deve ter pelo menos 3 caracteres.");
      
      const isAvailable = await checkAliasAvailability(alias, session.user.id);
      if (!isAvailable) throw new Error("Este endereço já está em uso por outro usuário.");

      let updatedProfile = { 
        ...profileData,
        // Garante que o campo isPremium sempre seja enviado (true ou false)
        isPremium: profileData.isPremium ?? false,
        createdAt: profileData.createdAt || new Date().toISOString() 
      };

      for (const upload of pendingUploads) {
        const publicUrl = await uploadImage(upload.file, session.user.id);
        if (publicUrl) updatedProfile = { ...updatedProfile, [upload.field]: publicUrl };
      }

      const { error } = await supabase.from('profiles').upsert({
          id: session.user.id,
          alias: updatedProfile.alias,
          updated_at: new Date(),
          content: { 
            profile: updatedProfile, 
            actions: quickActions, 
            links: socialLinks 
          }
      });

      if (error) throw error;
      setProfileData(updatedProfile);
      setPendingUploads([]);
      alert('Alterações publicadas com sucesso!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getTrialDaysLeft = () => {
    if (profileData.isPremium) return null;
    const created = new Date(profileData.createdAt || new Date().toISOString());
    const expires = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000);
    const diff = expires.getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const trialDays = getTrialDaysLeft();

  const status = profileData.isPremium 
    ? { label: 'PRO VITALÍCIO', color: 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]', icon: 'fa-crown' }
    : { label: `TESTE: ${trialDays} DIAS`, color: 'bg-zinc-800 text-gold border border-gold/30', icon: 'fa-clock' };

  if (!session) return <div className="min-h-screen bg-black flex items-center justify-center p-4"><Auth /></div>;
  if (loadingProfile) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gold font-bold text-xs tracking-widest animate-pulse">CARREGANDO PAINEL...</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pb-32">
      
      {showSuccessToast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs px-4">
             <div className="bg-green-600 text-white p-4 rounded-2xl shadow-2xl animate-slide-up flex items-center gap-4 border border-green-400">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-check text-xl"></i>
                </div>
                <div>
                    <h3 className="font-bold text-sm">Upgrade Ativo!</h3>
                    <p className="text-[10px] opacity-90">Sua conta agora é Premium Vitalícia.</p>
                </div>
                <button onClick={() => setShowSuccessToast(false)} className="ml-auto text-white/50 hover:text-white">
                    <i className="fa-solid fa-times"></i>
                </button>
             </div>
          </div>
      )}

      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />

      <header className="fixed top-0 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 z-50 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
             <div className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center font-black text-black shadow-lg shadow-gold/20">CP</div>
             <button 
                onClick={() => !profileData.isPremium && setShowPremiumModal(true)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all ${status.color} ${!profileData.isPremium ? 'hover:scale-105 active:scale-95' : ''}`}
             >
                <i className={`fa-solid ${status.icon}`}></i> {status.label}
             </button>
        </div>
        <div className="flex items-center gap-3">
             <button onClick={() => window.open(`/${profileData.alias}`, '_blank')} className="hidden sm:flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border border-zinc-700 text-gold hover:bg-gold/5 transition-colors">
                <i className="fa-solid fa-external-link-alt"></i> Visualizar
             </button>
             <button onClick={() => supabase.auth.signOut().then(() => navigate('/'))} className="text-xs font-bold text-red-500 hover:text-red-400 p-2">Sair</button>
        </div>
      </header>

      <div className="pt-24 px-4 max-w-2xl mx-auto space-y-8">
         {!profileData.isPremium && (
             <div className="bg-gradient-to-r from-gold/20 to-gold/5 border border-gold/30 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="flex items-center gap-4 text-left">
                     <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center text-gold">
                        <i className="fa-solid fa-bolt"></i>
                     </div>
                     <div>
                        <p className="text-[11px] font-bold text-gold uppercase tracking-wider">Modo Demonstração</p>
                        <p className="text-xs text-gray-400">Seu perfil será bloqueado em {trialDays} dias.</p>
                     </div>
                 </div>
                 <button 
                    onClick={() => setShowPremiumModal(true)}
                    className="w-full sm:w-auto bg-gold hover:bg-yellow-400 text-black text-[10px] font-black px-6 py-3 rounded-xl transition-all shadow-lg shadow-gold/20"
                >
                    REMOVER LIMITES
                </button>
             </div>
         )}

         {/* Edição de Link Principal */}
         <section className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-xs font-black text-gray-500 uppercase mb-4 tracking-[0.2em]">Endereço Digital</h2>
            <div className="flex items-center bg-gray-50 dark:bg-black rounded-2xl border border-gray-200 dark:border-zinc-800 p-2 group focus-within:border-gold transition-colors">
                <span className="pl-4 pr-1 text-gray-400 text-sm font-medium">meucartao.pro/</span>
                <input 
                    type="text" 
                    value={profileData.alias} 
                    onChange={(e) => setProfileData({...profileData, alias: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} 
                    className="flex-1 bg-transparent p-3 outline-none font-black text-gold text-lg" 
                    placeholder="seu-nome"
                />
                <button onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/${profileData.alias}`);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                }} className="p-3 text-zinc-500 hover:text-gold transition-colors">
                    {copiedLink ? <i className="fa-solid fa-check text-green-500"></i> : <i className="fa-regular fa-copy"></i>}
                </button>
            </div>
         </section>

         {/* Conteúdo do Perfil */}
         <section className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-200 dark:border-zinc-800 space-y-6">
             <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Informações Gerais</h2>
             
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Foto de Perfil</label>
                    <div onClick={() => avatarInputRef.current?.click()} className="aspect-square rounded-3xl bg-gray-50 dark:bg-black border-2 border-dashed border-gray-200 dark:border-zinc-800 flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-gold transition-colors">
                        {profileData.avatarUrl ? (
                            <img src={profileData.avatarUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                            <i className="fa-solid fa-user-plus text-2xl text-zinc-700"></i>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <i className="fa-solid fa-camera text-white"></i>
                        </div>
                    </div>
                    <input type="file" ref={avatarInputRef} className="hidden" onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (file) {
                             const preview = URL.createObjectURL(file);
                             setProfileData({...profileData, avatarUrl: preview});
                             setPendingUploads(prev => [...prev.filter(u => u.field !== 'avatarUrl'), {field: 'avatarUrl', file, previewUrl: preview}]);
                         }
                    }} />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Imagem de Fundo</label>
                    <div onClick={() => bgInputRef.current?.click()} className="aspect-square rounded-3xl bg-gray-50 dark:bg-black border-2 border-dashed border-gray-200 dark:border-zinc-800 flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-gold transition-colors">
                        {profileData.backgroundUrl ? (
                            <img src={profileData.backgroundUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                            <i className="fa-solid fa-image text-2xl text-zinc-700"></i>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <i className="fa-solid fa-upload text-white"></i>
                        </div>
                    </div>
                    <input type="file" ref={bgInputRef} className="hidden" onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (file) {
                             const preview = URL.createObjectURL(file);
                             setProfileData({...profileData, backgroundUrl: preview});
                             setPendingUploads(prev => [...prev.filter(u => u.field !== 'backgroundUrl'), {field: 'backgroundUrl', file, previewUrl: preview}]);
                         }
                    }} />
                </div>
             </div>

             <div className="space-y-4">
                 <div className="space-y-1">
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nome de Exibição</label>
                     <input type="text" placeholder="Ex: Mariana Xavier" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 p-4 rounded-2xl outline-none focus:border-gold transition-colors text-sm font-bold" />
                 </div>
                 <div className="space-y-1">
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Cargo ou Especialidade</label>
                     <input type="text" placeholder="Ex: Arquiteta de Interiores" value={profileData.title} onChange={(e) => setProfileData({...profileData, title: e.target.value})} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 p-4 rounded-2xl outline-none focus:border-gold transition-colors text-sm font-bold" />
                 </div>
                 <div className="space-y-1">
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Sobre Você</label>
                     <textarea placeholder="Conte um pouco sobre seu trabalho..." rows={3} value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 p-4 rounded-2xl outline-none focus:border-gold transition-colors text-sm font-medium resize-none" />
                 </div>
             </div>
         </section>

         {/* Links e Botões */}
         <section className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-200 dark:border-zinc-800">
             <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Canais de Atendimento</h2>
             <div className="space-y-4">
                 {quickActions.map((action, idx) => (
                     <div key={idx} className="group flex items-center gap-4 bg-gray-50 dark:bg-black/50 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 focus-within:border-gold transition-all">
                         <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-gold text-xl group-hover:scale-110 transition-transform">
                            <i className={action.icon}></i>
                         </div>
                         <div className="flex-1">
                             <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">{action.label}</div>
                             <input 
                                type="text" 
                                placeholder={`Insira seu ${action.label}`}
                                value={action.url.replace('https://wa.me/55', '').replace('mailto:', '').replace('https://maps.google.com/?q=', '')} 
                                onChange={(e) => {
                                    const newActions = [...quickActions];
                                    let val = e.target.value;
                                    if (action.type === 'whatsapp') val = `https://wa.me/55${val.replace(/\D/g, '')}`;
                                    else if (action.type === 'email') val = `mailto:${val}`;
                                    else if (action.type === 'map') val = `https://maps.google.com/?q=${encodeURIComponent(val)}`;
                                    newActions[idx].url = val;
                                    setQuickActions(newActions);
                                }}
                                className="w-full bg-transparent outline-none text-sm font-bold text-gray-800 dark:text-white" 
                             />
                         </div>
                     </div>
                 ))}
             </div>
         </section>
      </div>

      {/* Botão Salvar Flutuante */}
      <div className="fixed bottom-0 w-full bg-gradient-to-t from-white dark:from-black to-transparent p-6 border-t border-gray-100 dark:border-zinc-800/50 z-40 flex justify-center">
        <button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="w-full max-w-md bg-gold hover:bg-yellow-400 text-black font-black py-5 rounded-2xl shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
        >
            {isSaving ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> SALVANDO...</>
            ) : (
                <><i className="fa-solid fa-rocket"></i> PUBLICAR NO MEU PERFIL</>
            )}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
