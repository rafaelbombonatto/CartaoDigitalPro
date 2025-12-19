
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ProfileData, QuickAction, SocialLink, UploadPending } from '../types';
import Auth from './Auth';
import PremiumModal from './PremiumModal';
import { supabase, uploadImage, checkAliasAvailability } from '../lib/supabase';
import { DEFAULT_PROFILE, DEFAULT_QUICK_ACTIONS, DEFAULT_SOCIAL_LINKS } from '../constants';
import { useRouter } from '../lib/routerContext';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell 
} from 'recharts';

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
  
  // Estados de Analytics
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [labelData, setLabelData] = useState<any[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const hasLoadedInitialData = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession && !hasLoadedInitialData.current) {
          fetchProfile(initialSession.user.id);
          fetchAnalytics(initialSession.user.id);
      } else if (!initialSession) {
          setLoadingProfile(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (currentSession?.user?.id !== session?.user?.id) {
          setSession(currentSession);
          if (currentSession) {
              fetchProfile(currentSession.user.id);
              fetchAnalytics(currentSession.user.id);
          } else {
              setLoadingProfile(false);
          }
      }
    });
    return () => subscription.unsubscribe();
  }, [session?.user?.id]);

  const fetchAnalytics = async (userId: string) => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('profiles_clicks')
        .select('*')
        .eq('profile_id', userId)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (error || !data) return;

      setTotalClicks(data.length);

      // Processar dados diários
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const dailyMap: any = {};
      
      // Inicializar últimos 7 dias com zero
      for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          dailyMap[days[d.getDay()]] = 0;
      }

      data.forEach(click => {
          const dayName = days[new Date(click.created_at).getDay()];
          if (dailyMap[dayName] !== undefined) dailyMap[dayName]++;
      });

      const formattedDaily = Object.keys(dailyMap).map(key => ({ name: key, clicks: dailyMap[key] })).reverse();
      setDailyData(formattedDaily);

      // Processar cliques por label
      const labelMap: any = {};
      data.forEach(click => {
          const label = click.action_label || 'Outros';
          labelMap[label] = (labelMap[label] || 0) + 1;
      });

      const formattedLabels = Object.keys(labelMap)
        .map(key => ({ name: key, value: labelMap[key] }))
        .sort((a, b) => b.value - a.value);
      setLabelData(formattedLabels);
  };

  const fetchProfile = async (userId: string) => {
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
      }
      if (new URLSearchParams(window.location.search).get('upgrade') === 'success') {
          setShowSuccessToast(true);
          window.history.replaceState({}, document.title, window.location.pathname);
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

  const exportCSV = () => {
      if (dailyData.length === 0) return alert("Sem dados para exportar ainda.");
      const csvContent = "data:text/csv;charset=utf-8," 
          + "Label,Cliques\n" 
          + labelData.map(e => `${e.name},${e.value}`).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `relatorio_analisecard_${profileData.alias}.csv`);
      document.body.appendChild(link);
      link.click();
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/${profileData.alias}`)}`;

  if (!session) return <div className="min-h-screen bg-black flex items-center justify-center p-4"><Auth /></div>;
  if (loadingProfile) return <div className="min-h-screen flex items-center justify-center bg-black"><div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div></div>;

  const status = profileData.isPremium 
    ? { label: 'PRO VITALÍCIO', color: 'bg-gold text-black shadow-lg', icon: 'fa-crown' }
    : { label: `TESTE ATIVO`, color: 'bg-zinc-800 text-gold border border-gold/30', icon: 'fa-clock' };

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

      <div className="pt-24 px-4 max-w-xl mx-auto space-y-8">
         
         {/* 1. Endereço Digital */}
         <section className="bg-gray-50/50 dark:bg-zinc-900/50 p-5 rounded-[2rem] border border-gray-100 dark:border-zinc-800/50 shadow-sm">
            <h2 className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest ml-1">Endereço Digital</h2>
            <div className="flex items-center gap-1 bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-zinc-800 p-1 group focus-within:border-gold transition-all">
                <span className="pl-3 text-gray-400 text-xs font-bold whitespace-nowrap shrink-0">analisecard.pro/</span>
                <input 
                    type="text" 
                    value={profileData.alias} 
                    onChange={(e) => setProfileData({...profileData, alias: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} 
                    className="flex-1 bg-transparent py-3 px-1 outline-none font-black text-gold text-sm min-w-[80px]" 
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

         {/* 2. Aparência & Identidade */}
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

         {/* 3. Canais de Atendimento */}
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
                                placeholder={action.label}
                                className="w-full bg-transparent outline-none text-xs font-bold text-gray-800 dark:text-white" 
                             />
                         </div>
                     </div>
                 ))}
             </div>
         </section>

         {/* 4. Redes Sociais */}
         <section className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm">
             <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Links de Redes Sociais</h2>
             <div className="grid grid-cols-1 gap-4">
                 {socialLinks.map((link, idx) => (
                     <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-black/40 p-3 rounded-xl border border-gray-100 dark:border-zinc-800">
                         <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-gold"><i className={link.icon}></i></div>
                         <input 
                            type="text" 
                            value={link.url === '#' ? '' : link.url} 
                            onChange={(e) => {
                                const newLinks = [...socialLinks];
                                newLinks[idx].url = e.target.value;
                                setSocialLinks(newLinks);
                            }}
                            placeholder={`Link do ${link.label}`}
                            className="flex-1 bg-transparent outline-none text-[10px] font-bold text-gray-400"
                         />
                     </div>
                 ))}
             </div>
         </section>

         {/* 5. QR Code */}
         <section className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-gray-100 dark:border-zinc-800 text-center shadow-lg">
             <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">QR Code para Impressão</h2>
             <div className="bg-white p-4 rounded-3xl inline-block shadow-xl mb-6 border-4 border-gold/10">
                 <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
             </div>
             <div className="flex flex-col gap-3">
                 <button 
                    onClick={() => window.open(qrCodeUrl, '_blank')}
                    className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 py-3 rounded-xl uppercase tracking-widest hover:text-gold transition-colors"
                 >
                     <i className="fa-solid fa-download mr-2"></i> Baixar Imagem QR
                 </button>
             </div>
         </section>

         {/* 6. Marketing & Tracking PRO */}
         <section className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30 space-y-5">
             <div className="flex items-center gap-2 mb-2">
                <i className="fa-solid fa-chart-line text-indigo-500"></i>
                <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Marketing & Analytics PRO</h2>
             </div>
             <div className="space-y-4">
                 <div className="space-y-1">
                     <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Meta Pixel ID</label>
                     <input type="text" value={profileData.metaPixelId || ''} onChange={(e) => setProfileData({...profileData, metaPixelId: e.target.value})} placeholder="Ex: 1234567890" className="w-full bg-white dark:bg-black border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-xl outline-none focus:border-indigo-500 text-xs font-mono" />
                 </div>
                 <div className="space-y-1">
                     <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">GA4 ID</label>
                     <input type="text" value={profileData.ga4MeasurementId || ''} onChange={(e) => setProfileData({...profileData, ga4MeasurementId: e.target.value})} placeholder="Ex: G-XXXXX" className="w-full bg-white dark:bg-black border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-xl outline-none focus:border-indigo-500 text-xs font-mono" />
                 </div>
             </div>
         </section>

         {/* 7. Analytics Real */}
         <section className="bg-zinc-900 border border-white/5 p-6 rounded-[2rem] shadow-2xl overflow-hidden">
            <h2 className="text-[10px] font-black text-gold uppercase mb-6 tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-eye"></i> Desempenho Real (7 dias)
            </h2>
            
            <div className="h-48 w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyData}>
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

            <h3 className="text-[9px] font-black text-gray-500 uppercase mb-4 tracking-widest">Top Cliques por Botão</h3>
            <div className="h-48 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={labelData} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="#999" fontSize={8} width={80} />
                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ background: '#111', border: 'none', fontSize: '9px' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {labelData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#D4AF37' : '#333'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Total Geral</div>
                    <div className="text-xl font-black text-white">{totalClicks}</div>
                </div>
                <button 
                  onClick={exportCSV}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white text-[9px] font-black p-4 rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-file-csv text-gold"></i> EXPORTAR CSV
                </button>
            </div>
         </section>
      </div>

      <div className="fixed bottom-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl p-4 sm:p-6 border-t border-gray-100 dark:border-zinc-800/50 z-[60] flex justify-center pb-safe">
        <button onClick={handleSave} disabled={isSaving} className="w-full max-w-lg bg-gold hover:bg-yellow-400 text-black font-black py-4 rounded-2xl shadow-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50">
            {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
            <span className="tracking-widest uppercase text-xs">Publicar Alterações</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
