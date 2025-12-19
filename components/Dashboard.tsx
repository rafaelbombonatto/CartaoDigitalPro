
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ProfileData, QuickAction, SocialLink, UploadPending } from '../types';
import Auth from './Auth';
import PremiumModal from './PremiumModal';
import { supabase, uploadImage, checkAliasAvailability } from '../lib/supabase';
import { DEFAULT_PROFILE, DEFAULT_QUICK_ACTIONS, DEFAULT_SOCIAL_LINKS } from '../constants';
import { useRouter } from '../lib/routerContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

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
  const hasLoadedInitialData = useRef(false);

  // Dados Fictícios de Analytics para o Modo Free/Demo inicial
  const analyticsData = useMemo(() => [
    { name: 'Seg', clicks: 12 },
    { name: 'Ter', clicks: 25 },
    { name: 'Qua', clicks: 18 },
    { name: 'Qui', clicks: 42 },
    { name: 'Sex', clicks: 38 },
    { name: 'Sáb', clicks: 54 },
    { name: 'Dom', clicks: 61 },
  ], []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession && !hasLoadedInitialData.current) {
          fetchProfile(initialSession.user.id);
      } else if (!initialSession) {
          setLoadingProfile(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (currentSession?.user?.id !== session?.user?.id) {
          setSession(currentSession);
          if (currentSession && !hasLoadedInitialData.current) {
              fetchProfile(currentSession.user.id);
          } else if (!currentSession) {
              setLoadingProfile(false);
              hasLoadedInitialData.current = false;
          }
      }
    });
    return () => subscription.unsubscribe();
  }, [session?.user?.id]);

  const fetchProfile = async (userId: string) => {
    if (hasLoadedInitialData.current) return;
    try {
      setLoadingProfile(true);
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
          const content = data.content || {};
          let profile = content.profile || { ...DEFAULT_PROFILE };
          profile.isPremium = !!profile.isPremium;
          profile.alias = data.alias || profile.alias;
          setProfileData(profile);
          if (content.actions) setQuickActions(content.actions);
          if (content.links) setSocialLinks(content.links);
          hasLoadedInitialData.current = true;
      } else {
          setProfileData({ ...DEFAULT_PROFILE, isPremium: false, createdAt: new Date().toISOString() });
          hasLoadedInitialData.current = true;
      }
      if (new URLSearchParams(window.location.search).get('upgrade') === 'success') {
          setShowSuccessToast(true);
          window.history.replaceState({}, document.title, window.location.pathname);
          setTimeout(() => setShowSuccessToast(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSave = async () => {
    if (!session) return;
    setIsSaving(true);
    try {
      const isAvailable = await checkAliasAvailability(profileData.alias, session.user.id);
      if (!isAvailable) throw new Error("Este endereço já está em uso.");

      let updatedProfile = { ...profileData };
      for (const upload of pendingUploads) {
        const publicUrl = await uploadImage(upload.file, session.user.id);
        if (publicUrl) updatedProfile = { ...updatedProfile, [upload.field]: publicUrl };
      }

      const { error } = await supabase.from('profiles').upsert({
          id: session.user.id,
          alias: updatedProfile.alias,
          updated_at: new Date(),
          content: { profile: updatedProfile, actions: quickActions, links: socialLinks }
      });

      if (error) throw error;
      setProfileData(updatedProfile);
      setPendingUploads([]);
      alert('Perfil publicado com sucesso!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const status = profileData.isPremium 
    ? { label: 'PRO VITALÍCIO', color: 'bg-gold text-black shadow-lg', icon: 'fa-crown' }
    : { label: `TESTE ATIVO`, color: 'bg-zinc-800 text-gold border border-gold/30', icon: 'fa-clock' };

  if (!session) return <div className="min-h-screen bg-black flex items-center justify-center p-4"><Auth /></div>;
  if (loadingProfile) return <div className="min-h-screen flex items-center justify-center bg-black"><div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pb-40 transition-colors duration-500">
      
      {showSuccessToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs px-4">
             <div className="bg-green-600 text-white p-4 rounded-2xl shadow-2xl animate-slide-up flex items-center gap-4 border border-green-400">
                <i className="fa-solid fa-check text-xl"></i>
                <div className="text-xs font-bold uppercase tracking-widest">Upgrade Ativado!</div>
             </div>
          </div>
      )}

      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />

      <header className="fixed top-0 w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-zinc-800 z-50 h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center font-black text-black text-[10px] shadow-md">ACP</div>
             <button onClick={() => !profileData.isPremium && setShowPremiumModal(true)} className={`flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black tracking-widest ${status.color}`}>
                <i className={`fa-solid ${status.icon}`}></i> <span>{status.label}</span>
             </button>
        </div>
        <div className="flex items-center gap-2">
             <button onClick={() => window.open(`/${profileData.alias}`, '_blank')} className="text-[10px] font-black px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-gold">VER CARD</button>
             <button onClick={() => supabase.auth.signOut().then(() => navigate('/'))} className="text-[10px] font-black text-red-500 px-2">SAIR</button>
        </div>
      </header>

      <div className="pt-24 px-4 max-w-xl mx-auto space-y-6">
         
         {/* Analytics Insight Card - NEW */}
         <section className="bg-zinc-900 border border-white/5 p-6 rounded-[2rem] shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10"><i className="fa-solid fa-chart-line text-6xl text-gold"></i></div>
            <h2 className="text-[10px] font-black text-gold uppercase mb-6 tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-eye"></i> Desempenho do Card
            </h2>
            <div className="h-40 w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData}>
                        <defs>
                            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis hide />
                        <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', fontSize: '10px' }} />
                        <Area type="monotone" dataKey="clicks" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                <div>
                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Cliques Totais (7d)</div>
                    <div className="text-xl font-black text-white">250</div>
                </div>
                {!profileData.isPremium && (
                    <button onClick={() => setShowPremiumModal(true)} className="text-[9px] font-black text-gold underline tracking-widest">VER MÉTRICAS AVANÇADAS</button>
                )}
            </div>
         </section>

         {/* Endereço Digital */}
         <section className="bg-gray-50/50 dark:bg-zinc-900/50 p-5 rounded-[2rem] border border-gray-100 dark:border-zinc-800/50">
            <h2 className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest ml-1">Endereço Digital</h2>
            <div className="flex items-center gap-1 bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-zinc-800 p-1 group focus-within:border-gold transition-all shadow-sm">
                <span className="pl-3 text-gray-400 text-xs font-bold whitespace-nowrap shrink-0">analisecard.pro/</span>
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
                  className="p-3 text-zinc-400 hover:text-gold shrink-0"
                >
                    {copiedLink ? <i className="fa-solid fa-check text-green-500"></i> : <i className="fa-regular fa-copy"></i>}
                </button>
            </div>
         </section>

         {/* Marketing & Tracking Section */}
         <section className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30 space-y-5">
             <div className="flex items-center gap-2 mb-2">
                <i className="fa-solid fa-chart-line text-indigo-500"></i>
                <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Marketing & Analytics PRO</h2>
             </div>
             <div className="space-y-4">
                 <div className="space-y-1">
                     <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Meta Pixel ID (Facebook)</label>
                     <input 
                        type="text" 
                        value={profileData.metaPixelId || ''} 
                        onChange={(e) => setProfileData({...profileData, metaPixelId: e.target.value})} 
                        placeholder="Ex: 123456789012345"
                        className="w-full bg-white dark:bg-black border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-xl outline-none focus:border-indigo-500 text-xs font-mono" 
                     />
                 </div>
                 <div className="space-y-1">
                     <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">GA4 Measurement ID (Google)</label>
                     <input 
                        type="text" 
                        value={profileData.ga4MeasurementId || ''} 
                        onChange={(e) => setProfileData({...profileData, ga4MeasurementId: e.target.value})} 
                        placeholder="Ex: G-XXXXXXXXXX"
                        className="w-full bg-white dark:bg-black border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-xl outline-none focus:border-indigo-500 text-xs font-mono" 
                     />
                 </div>
             </div>
             <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-tight italic">Tags UTM automáticas são ativadas em todos os links externos no Plano Pro.</p>
             </div>
         </section>

         {/* Aparência do Card */}
         <section className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800 space-y-6 shadow-sm">
             <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aparência & Identidade</h2>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Foto Perfil</label>
                    <div onClick={() => avatarInputRef.current?.click()} className="aspect-square rounded-2xl bg-gray-50 dark:bg-black border-2 border-dashed border-gray-200 dark:border-zinc-800 flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-gold transition-colors">
                        {profileData.avatarUrl ? <img src={profileData.avatarUrl} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user-plus text-xl text-zinc-700"></i>}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><i className="fa-solid fa-camera text-white"></i></div>
                    </div>
                    <input type="file" ref={avatarInputRef} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const preview = URL.createObjectURL(file); setProfileData({...profileData, avatarUrl: preview}); setPendingUploads(prev => [...prev.filter(u => u.field !== 'avatarUrl'), {field: 'avatarUrl', file, previewUrl: preview}]); } }} />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Fundo Luxo</label>
                    <div onClick={() => bgInputRef.current?.click()} className="aspect-square rounded-2xl bg-gray-50 dark:bg-black border-2 border-dashed border-gray-200 dark:border-zinc-800 flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-gold transition-colors">
                        {profileData.backgroundUrl ? <img src={profileData.backgroundUrl} className="w-full h-full object-cover" /> : <i className="fa-solid fa-image text-xl text-zinc-700"></i>}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><i className="fa-solid fa-upload text-white"></i></div>
                    </div>
                    <input type="file" ref={bgInputRef} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const preview = URL.createObjectURL(file); setProfileData({...profileData, backgroundUrl: preview}); setPendingUploads(prev => [...prev.filter(u => u.field !== 'backgroundUrl'), {field: 'backgroundUrl', file, previewUrl: preview}]); } }} />
                </div>
             </div>
             <div className="space-y-4 pt-2">
                 <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} placeholder="Nome Completo" className="w-full bg-gray-50 dark:bg-black border border-gray-100 dark:border-zinc-800 p-4 rounded-xl outline-none focus:border-gold text-sm font-bold" />
                 <input type="text" value={profileData.title} onChange={(e) => setProfileData({...profileData, title: e.target.value})} placeholder="Cargo ou Especialidade" className="w-full bg-gray-50 dark:bg-black border border-gray-100 dark:border-zinc-800 p-4 rounded-xl outline-none focus:border-gold text-sm font-bold" />
                 <textarea rows={3} value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} placeholder="Sua bio profissional" className="w-full bg-gray-50 dark:bg-black border border-gray-100 dark:border-zinc-800 p-4 rounded-xl outline-none focus:border-gold text-sm font-medium resize-none" />
             </div>
         </section>

         {/* Contatos & Redes */}
         <section className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm">
             <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Canais de Atendimento</h2>
             <div className="space-y-3">
                 {quickActions.map((action, idx) => (
                     <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-black/40 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 focus-within:border-gold transition-all">
                         <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-gold text-lg"><i className={action.icon}></i></div>
                         <div className="flex-1">
                             <input 
                                type="text" 
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
      </div>

      <div className="fixed bottom-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl p-4 sm:p-6 border-t border-gray-100 dark:border-zinc-800/50 z-[60] flex justify-center pb-safe">
        <button onClick={handleSave} disabled={isSaving} className="w-full max-w-lg bg-gold hover:bg-yellow-400 text-black font-black py-4 rounded-2xl shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50">
            {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
            <span className="tracking-widest uppercase text-xs">Publicar Alterações</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
