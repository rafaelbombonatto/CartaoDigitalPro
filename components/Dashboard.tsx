
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
          const content = data.content || {};
          let profile = content.profile || { ...DEFAULT_PROFILE };
          
          if (typeof profile.isPremium !== 'boolean') profile.isPremium = false;
          if (!profile.createdAt) profile.createdAt = data.created_at || new Date().toISOString();
          profile.alias = data.alias || profile.alias;
          
          setProfileData(profile);
          if (content.actions) setQuickActions(content.actions);
          if (content.links) setSocialLinks(content.links);
      } else {
          setProfileData({ ...DEFAULT_PROFILE, isPremium: false, createdAt: new Date().toISOString() });
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
      alert('Seu perfil foi atualizado com sucesso!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const downloadQRCode = async () => {
    if (!profileData.isPremium) return;
    try {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(`${window.location.origin}/${profileData.alias}`)}`;
        
        // Buscamos a imagem como blob para forçar o download direto
        const response = await fetch(qrUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `qrcode-${profileData.alias}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Limpeza de memória
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("Erro ao baixar QR Code:", error);
        // Fallback simples caso o fetch falhe por CORS (embora api.qrserver geralmente permita)
        window.open(`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(`${window.location.origin}/${profileData.alias}`)}`, '_blank');
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
    ? { label: 'PRO VITALÍCIO', color: 'bg-gold text-black shadow-lg', icon: 'fa-crown' }
    : { label: `TESTE: ${trialDays} DIAS`, color: 'bg-zinc-800 text-gold border border-gold/30', icon: 'fa-clock' };

  if (!session) return <div className="min-h-screen bg-black flex items-center justify-center p-4"><Auth /></div>;
  if (loadingProfile) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gold font-bold text-[10px] tracking-widest animate-pulse uppercase">Sincronizando Dados...</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pb-40 transition-colors duration-500">
      
      {showSuccessToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs px-4">
             <div className="bg-green-600 text-white p-4 rounded-2xl shadow-2xl animate-slide-up flex items-center gap-4 border border-green-400">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0"><i className="fa-solid fa-check text-xl"></i></div>
                <div>
                    <h3 className="font-bold text-sm">Upgrade Ativo!</h3>
                    <p className="text-[10px] opacity-90">Sua conta agora é Premium Vitalícia.</p>
                </div>
                <button onClick={() => setShowSuccessToast(false)} className="ml-auto text-white/50"><i className="fa-solid fa-times"></i></button>
             </div>
          </div>
      )}

      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />

      <header className="fixed top-0 w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-zinc-800 z-50 h-16 flex items-center justify-between px-4 sm:px-6 transition-all">
        <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center font-black text-black shadow-md">CP</div>
             <button 
                onClick={() => !profileData.isPremium && setShowPremiumModal(true)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black tracking-widest transition-all ${status.color} ${!profileData.isPremium ? 'hover:scale-105' : ''}`}
             >
                <i className={`fa-solid ${status.icon}`}></i> <span className="hidden xs:inline">{status.label}</span>
             </button>
        </div>
        <div className="flex items-center gap-2">
             <button onClick={() => window.open(`/${profileData.alias}`, '_blank')} className="flex items-center gap-2 text-[10px] font-black px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gold hover:bg-gold/5">
                <i className="fa-solid fa-eye"></i> <span className="hidden sm:inline">VER</span>
             </button>
             <button onClick={() => supabase.auth.signOut().then(() => navigate('/'))} className="text-[10px] font-black text-red-500 px-2">SAIR</button>
        </div>
      </header>

      <div className="pt-24 px-4 max-w-xl mx-auto space-y-6">
         {!profileData.isPremium && (
             <div className="bg-gradient-to-br from-gold/15 to-gold/5 border border-gold/20 p-4 rounded-2xl flex items-center justify-between gap-4">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center text-gold"><i className="fa-solid fa-clock-rotate-left"></i></div>
                     <div>
                        <p className="text-[10px] font-black text-gold uppercase tracking-widest">Teste Grátis</p>
                        <p className="text-[11px] text-gray-500">Expira em {trialDays} dias</p>
                     </div>
                 </div>
                 <button onClick={() => setShowPremiumModal(true)} className="bg-gold text-black text-[9px] font-black px-4 py-2.5 rounded-lg shadow-lg">UPGRADE</button>
             </div>
         )}

         {/* Endereço Digital */}
         <section className="bg-gray-50/50 dark:bg-zinc-900/50 p-5 rounded-[2rem] border border-gray-100 dark:border-zinc-800/50">
            <h2 className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest ml-1">Endereço Digital</h2>
            <div className="flex items-center gap-1 bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-zinc-800 p-1 group focus-within:border-gold transition-all shadow-sm">
                <span className="pl-3 text-gray-400 text-xs font-bold whitespace-nowrap shrink-0">meucartao.pro/</span>
                <input 
                    type="text" 
                    value={profileData.alias} 
                    onChange={(e) => setProfileData({...profileData, alias: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} 
                    className="flex-1 bg-transparent py-3 px-1 outline-none font-black text-gold text-sm min-w-[80px]" 
                    placeholder="seu-nome"
                />
                <button 
                  onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/${profileData.alias}`);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                  }} 
                  className="p-3 text-zinc-400 hover:text-gold transition-colors shrink-0"
                >
                    {copiedLink ? <i className="fa-solid fa-check text-green-500"></i> : <i className="fa-regular fa-copy"></i>}
                </button>
            </div>
         </section>

         {/* Seção de QR Code */}
         <section className="bg-gray-50/50 dark:bg-zinc-900/50 p-5 rounded-[2rem] border border-gray-100 dark:border-zinc-800/50 flex flex-col items-center relative overflow-hidden">
            <h2 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest self-start ml-1">Seu QR Code</h2>
            
            <div className="relative mb-4 group">
                <div className={`p-3 bg-white rounded-2xl shadow-xl transition-all duration-500 ${!profileData.isPremium ? 'blur-sm grayscale opacity-50' : ''}`}>
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/${profileData.alias}`)}`} 
                        alt="QR Code" 
                        className="w-32 h-32"
                    />
                </div>
                {!profileData.isPremium && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-gold text-black flex items-center justify-center shadow-lg animate-bounce">
                            <i className="fa-solid fa-lock"></i>
                        </div>
                    </div>
                )}
            </div>

            {profileData.isPremium ? (
                <button 
                    onClick={downloadQRCode}
                    className="flex items-center gap-2 text-[10px] font-black text-gold hover:text-gold-light transition-colors uppercase tracking-widest"
                >
                    <i className="fa-solid fa-download"></i> Baixar Arquivo PNG
                </button>
            ) : (
                <button 
                    onClick={() => setShowPremiumModal(true)}
                    className="bg-gold/10 text-gold border border-gold/20 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold/20 transition-all"
                >
                    Liberar QR Code <i className="fa-solid fa-crown ml-1"></i>
                </button>
            )}
         </section>

         {/* Informações Gerais */}
         <section className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800 space-y-6 shadow-sm">
             <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aparência do Cartão</h2>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Foto Perfil</label>
                    <div onClick={() => avatarInputRef.current?.click()} className="aspect-square rounded-2xl bg-gray-50 dark:bg-black border-2 border-dashed border-gray-200 dark:border-zinc-800 flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-gold transition-colors">
                        {profileData.avatarUrl ? (
                            <img src={profileData.avatarUrl} className="w-full h-full object-cover" />
                        ) : (
                            <i className="fa-solid fa-user-plus text-xl text-zinc-700"></i>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><i className="fa-solid fa-camera text-white"></i></div>
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
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Foto Fundo</label>
                    <div onClick={() => bgInputRef.current?.click()} className="aspect-square rounded-2xl bg-gray-50 dark:bg-black border-2 border-dashed border-gray-200 dark:border-zinc-800 flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-gold transition-colors">
                        {profileData.backgroundUrl ? (
                            <img src={profileData.backgroundUrl} className="w-full h-full object-cover" />
                        ) : (
                            <i className="fa-solid fa-image text-xl text-zinc-700"></i>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><i className="fa-solid fa-upload text-white"></i></div>
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

             <div className="space-y-4 pt-2">
                 <div className="space-y-1">
                     <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nome Completo</label>
                     <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full bg-gray-50 dark:bg-black border border-gray-100 dark:border-zinc-800 p-4 rounded-xl outline-none focus:border-gold text-sm font-bold" />
                 </div>
                 <div className="space-y-1">
                     <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Especialidade</label>
                     <input type="text" value={profileData.title} onChange={(e) => setProfileData({...profileData, title: e.target.value})} className="w-full bg-gray-50 dark:bg-black border border-gray-100 dark:border-zinc-800 p-4 rounded-xl outline-none focus:border-gold text-sm font-bold" />
                 </div>
                 <div className="space-y-1">
                     <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Biografia</label>
                     <textarea rows={3} value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} className="w-full bg-gray-50 dark:bg-black border border-gray-100 dark:border-zinc-800 p-4 rounded-xl outline-none focus:border-gold text-sm font-medium resize-none" />
                 </div>
             </div>
         </section>

         {/* Canais de Atendimento */}
         <section className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm">
             <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Contatos Diretos</h2>
             <div className="space-y-3">
                 {quickActions.map((action, idx) => (
                     <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-black/40 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 focus-within:border-gold transition-all">
                         <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-gold text-lg"><i className={action.icon}></i></div>
                         <div className="flex-1">
                             <input 
                                type="text" 
                                placeholder={action.label}
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
                                className="w-full bg-transparent outline-none text-xs font-bold text-gray-800 dark:text-white" 
                             />
                         </div>
                     </div>
                 ))}
             </div>
         </section>

         {/* NOVO: Redes Sociais Restauradas */}
         <section className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm">
             <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Redes Sociais</h2>
             <div className="space-y-4">
                 {socialLinks.map((link, idx) => (
                     <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-black/40 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 focus-within:border-gold transition-all">
                         <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-gold text-lg"><i className={link.icon}></i></div>
                         <div className="flex-1">
                             <input 
                                type="text" 
                                placeholder={link.label}
                                value={link.url === '#' ? '' : link.url} 
                                onChange={(e) => {
                                    const newLinks = [...socialLinks];
                                    newLinks[idx].url = e.target.value;
                                    setSocialLinks(newLinks);
                                }}
                                className="w-full bg-transparent outline-none text-xs font-bold text-gray-800 dark:text-white" 
                             />
                         </div>
                     </div>
                 ))}
             </div>
         </section>
      </div>

      {/* Botão Salvar */}
      <div className="fixed bottom-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl p-4 sm:p-6 border-t border-gray-100 dark:border-zinc-800/50 z-[60] flex justify-center pb-safe">
        <button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="w-full max-w-lg bg-gold hover:bg-yellow-400 text-black font-black py-4 rounded-2xl shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
        >
            {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
            <span className="tracking-widest uppercase text-xs">Atualizar Perfil</span>
        </button>
      </div>

      <style>{`
        .pb-safe {
            padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
        }
        @media (max-width: 350px) {
            .xs\\:inline { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
