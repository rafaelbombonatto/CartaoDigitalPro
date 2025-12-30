
import React, { useState, useRef, useEffect } from 'react';
import { ProfileData, QuickAction, SocialLink, UploadPending } from '../types';
import Auth from './Auth';
import PremiumModal from './PremiumModal';
import { supabase, uploadImage, checkAliasAvailability } from '../lib/supabase';
import { DEFAULT_PROFILE, DEFAULT_QUICK_ACTIONS, DEFAULT_SOCIAL_LINKS } from '../constants';
import { useRouter } from '../lib/routerContext';
import Logo from './Logo';
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
  
  // Estados de Analytics
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [labelData, setLabelData] = useState<any[]>([]);
  const [rawClicks, setRawClicks] = useState<any[]>([]); 
  const [totalClicks, setTotalClicks] = useState(0);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession) {
          fetchProfile(initialSession.user.id);
          fetchAnalytics(initialSession.user.id);
      } else {
          setLoadingProfile(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (currentSession?.user?.id !== session?.user?.id) {
          setSession(currentSession);
          if (currentSession) {
              fetchProfile(currentSession.user.id);
              fetchAnalytics(currentSession.user.id);
          }
      }
    });
    return () => subscription.unsubscribe();
  }, [session?.user?.id]);

  const fetchAnalytics = async (userId: string) => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setHours(0, 0, 0, 0);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

      const { data, error } = await supabase
        .from('profiles_clicks')
        .select('*')
        .eq('profile_id', userId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error || !data) return;

      setRawClicks(data);
      setTotalClicks(data.length);

      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      
      const dailyMap = new Map();
      for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setHours(d.getHours() - 3);
          d.setDate(d.getDate() - i);
          const dateKey = d.toISOString().split('T')[0];
          dailyMap.set(dateKey, { name: dayNames[d.getDay()], cliques: 0 });
      }

      data.forEach(click => {
          const clickDate = new Date(click.created_at);
          clickDate.setHours(clickDate.getHours() - 3);
          const dateKey = clickDate.toISOString().split('T')[0];
          
          if (dailyMap.has(dateKey)) {
              dailyMap.get(dateKey).cliques += 1;
          }
      });

      setDailyData(Array.from(dailyMap.values()).reverse());

      const labelMap: Record<string, number> = {};
      data.forEach(click => {
          const label = click.action_label || 'Outros';
          labelMap[label] = (labelMap[label] || 0) + 1;
      });

      const formattedLabels = Object.keys(labelMap)
        .map(key => ({ name: key, cliques: labelMap[key] }))
        .sort((a, b) => b.cliques - a.cliques);
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
          profile.createdAt = profile.createdAt || data.created_at;
          
          if (!profile.document) profile.document = { label: '', value: '' };
          setProfileData(profile);
          if (content.actions) setQuickActions(content.actions);
          if (content.links) setSocialLinks(content.links);
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
      if (rawClicks.length === 0) return alert("Sem dados para exportar ainda.");
      const headers = "data,hora,tipo,destino\n";
      const rows = rawClicks.map(click => {
          const date = new Date(click.created_at);
          date.setHours(date.getHours() - 3); 
          const dataStr = date.toLocaleDateString('pt-BR');
          const horaStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const tipo = click.action_type || 'desconhecido';
          const destino = click.action_label || 'sem_nome';
          return `${dataStr},${horaStr},${tipo.replace(/,/g, '')},${destino.replace(/,/g, '')}`;
      }).join("\n");
      const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `analisecardpro_${profileData.alias}_relatorio.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleActionChange = (index: number, val: string) => {
      const newActions = [...quickActions];
      const type = newActions[index].type;
      let finalUrl = val;
      if (type === 'whatsapp') finalUrl = `https://wa.me/55${val.replace(/\D/g, '')}`;
      else if (type === 'email') finalUrl = `mailto:${val}`;
      else if (type === 'map') finalUrl = `https://maps.google.com/?q=${encodeURIComponent(val)}`;
      newActions[index].url = finalUrl;
      setQuickActions(newActions);
  };

  const getActionDisplay = (action: QuickAction) => {
      if (!action.url || action.url === '#') return '';
      if (action.type === 'whatsapp') return action.url.replace('https://wa.me/55', '');
      if (action.type === 'email') return action.url.replace('mailto:', '');
      if (action.type === 'map') return decodeURIComponent(action.url.replace('https://maps.google.com/?q=', ''));
      return action.url;
  };

  const handleSocialChange = (index: number, url: string) => {
      const newLinks = [...socialLinks];
      newLinks[index].url = url;
      setSocialLinks(newLinks);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/${profileData.alias}`)}`;

  if (!session) return <div className="min-h-screen bg-black flex items-center justify-center p-4"><Auth /></div>;
  if (loadingProfile) return <div className="min-h-screen flex items-center justify-center bg-black"><div className="w-12 h-12 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin"></div></div>;

  // Lógica de Expiração (Exatamente igual ao PublicCard)
  const createdAt = profileData.createdAt ? new Date(profileData.createdAt) : new Date();
  const trialEnd = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  const isExpired = !profileData.isPremium && new Date() > trialEnd;

  const status = profileData.isPremium 
    ? { label: 'PRO VITALÍCIO', color: 'bg-brand-cyan text-black shadow-lg', icon: 'fa-crown' }
    : isExpired 
      ? { label: 'TESTE EXPIRADO', color: 'bg-red-500 text-white shadow-lg shadow-red-500/20', icon: 'fa-triangle-exclamation' }
      : { label: `TESTE ATIVO`, color: 'bg-zinc-800 text-brand-cyan border border-brand-cyan/30', icon: 'fa-clock' };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pb-40 transition-colors duration-500">
      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />

      <header className="fixed top-0 w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-zinc-800 z-50 h-20 flex items-center justify-between px-4 sm:px-6">
        <Logo size="sm" />
        <div className="flex items-center gap-3">
             <button onClick={() => setShowPremiumModal(true)} className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[8px] font-black tracking-widest ${status.color}`}>
                <i className={`fa-solid ${status.icon}`}></i> <span>{status.label}</span>
             </button>
             <button onClick={() => window.open(`/${profileData.alias}`, '_blank')} className="text-[10px] font-black px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-brand-cyan uppercase tracking-widest">Ver Card</button>
             <button onClick={() => supabase.auth.signOut().then(() => navigate('/'))} className="text-[10px] font-black text-red-500 px-2 uppercase tracking-widest">Sair</button>
        </div>
      </header>

      <div className="pt-28 px-4 max-w-xl mx-auto space-y-10">
         
         <section className="bg-gray-50/50 dark:bg-zinc-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800/50 shadow-sm">
            <h2 className="text-[10px] font-black text-brand-blue uppercase mb-4 tracking-[0.2em] ml-1">1. Endereço Digital</h2>
            <div className="flex items-center gap-1 bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-zinc-800 p-1 group focus-within:border-brand-cyan transition-all shadow-sm">
                <span className="pl-3 text-gray-400 text-[11px] font-bold whitespace-nowrap shrink-0">analisecardpro/</span>
                <input 
                    type="text" 
                    value={profileData.alias} 
                    onChange={(e) => setProfileData({...profileData, alias: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} 
                    className="flex-1 bg-transparent py-3 px-1 outline-none font-black text-brand-cyan text-sm min-w-[80px]" 
                />
                <button 
                  onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/${profileData.alias}`);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                  }} 
                  className="p-3 text-zinc-400 hover:text-brand-cyan shrink-0"
                >
                    {copiedLink ? <i className="fa-solid fa-check text-green-500"></i> : <i className="fa-regular fa-copy"></i>}
                </button>
            </div>
         </section>

         <section className="bg-gray-50/50 dark:bg-zinc-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800/50 shadow-sm space-y-6">
             <h2 className="text-[10px] font-black text-brand-blue uppercase tracking-[0.2em] ml-1">2. Aparência & Identidade</h2>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Foto Perfil</label>
                    <div onClick={() => avatarInputRef.current?.click()} className="aspect-square rounded-2xl bg-white dark:bg-black border-2 border-dashed border-gray-200 dark:border-zinc-800 flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-brand-cyan transition-colors">
                        {profileData.avatarUrl ? <img src={profileData.avatarUrl} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user-plus text-xl text-zinc-700"></i>}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><i className="fa-solid fa-camera text-white"></i></div>
                    </div>
                    <input type="file" ref={avatarInputRef} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const preview = URL.createObjectURL(file); setProfileData({...profileData, avatarUrl: preview}); setPendingUploads(prev => [...prev.filter(u => u.field !== 'avatarUrl'), {field: 'avatarUrl', file, previewUrl: preview}]); } }} />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Fundo Luxo</label>
                    <div onClick={() => bgInputRef.current?.click()} className="aspect-square rounded-2xl bg-white dark:bg-black border-2 border-dashed border-gray-200 dark:border-zinc-800 flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-brand-cyan transition-colors">
                        {profileData.backgroundUrl ? <img src={profileData.backgroundUrl} className="w-full h-full object-cover" /> : <i className="fa-solid fa-image text-xl text-zinc-700"></i>}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><i className="fa-solid fa-upload text-white"></i></div>
                    </div>
                    <input type="file" ref={bgInputRef} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const preview = URL.createObjectURL(file); setProfileData({...profileData, backgroundUrl: preview}); setPendingUploads(prev => [...prev.filter(u => u.field !== 'backgroundUrl'), {field: 'backgroundUrl', file, previewUrl: preview}]); } }} />
                </div>
             </div>
             <div className="space-y-4">
                 <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} placeholder="Seu Nome Completo" className="w-full bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 p-4 rounded-xl outline-none focus:border-brand-cyan text-xs font-bold shadow-sm" />
                 <input type="text" value={profileData.title} onChange={(e) => setProfileData({...profileData, title: e.target.value})} placeholder="Cargo ou Especialidade" className="w-full bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 p-4 rounded-xl outline-none focus:border-brand-cyan text-xs font-bold shadow-sm" />
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Tipo de Registro</label>
                        <input type="text" value={profileData.document?.label || ''} onChange={(e) => setProfileData({...profileData, document: { ...profileData.document, label: e.target.value }})} placeholder="Ex: CRECI, OAB" className="w-full bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 p-4 rounded-xl outline-none focus:border-brand-cyan text-xs font-bold shadow-sm" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Número</label>
                        <input type="text" value={profileData.document?.value || ''} onChange={(e) => setProfileData({...profileData, document: { ...profileData.document, value: e.target.value }})} placeholder="000.000-0" className="w-full bg-white dark:bg-black border border-gray-200 dark:border-zinc-700 p-4 rounded-xl outline-none focus:border-brand-cyan text-xs font-bold shadow-sm" />
                    </div>
                 </div>
                 <textarea rows={3} value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} placeholder="Sua bio profissional rápida..." className="w-full bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 p-4 rounded-xl outline-none focus:border-brand-cyan text-xs font-medium resize-none shadow-sm" />
             </div>
         </section>

         <section className="bg-gray-50/50 dark:bg-zinc-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800/50 shadow-sm space-y-4">
             <h2 className="text-[10px] font-black text-brand-blue uppercase tracking-[0.2em] ml-1">3. Canais de Atendimento</h2>
             {quickActions.map((action, idx) => (
                 <div key={idx} className="space-y-1.5">
                    <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><i className={action.icon}></i> {action.label}</label>
                    <input 
                        type="text" 
                        value={getActionDisplay(action)} 
                        onChange={(e) => handleActionChange(idx, e.target.value)} 
                        placeholder={action.type === 'whatsapp' ? '11999999999' : 'Link ou texto'}
                        className="w-full bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 p-3.5 rounded-xl outline-none focus:border-brand-cyan text-[11px] font-bold shadow-sm" 
                    />
                 </div>
             ))}
         </section>

         <section className="bg-gray-50/50 dark:bg-zinc-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800/50 shadow-sm space-y-4">
             <h2 className="text-[10px] font-black text-brand-blue uppercase tracking-[0.2em] ml-1">4. Redes Sociais</h2>
             {socialLinks.map((link, idx) => (
                 <div key={idx} className="flex gap-2">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
                        <i className={`${link.icon} text-lg text-zinc-500`}></i>
                    </div>
                    <input 
                        type="text" 
                        value={link.url} 
                        onChange={(e) => handleSocialChange(idx, e.target.value)} 
                        placeholder={`URL do ${link.label}`}
                        className="flex-1 bg-white dark:bg-black border border-gray-200 dark:border-zinc-700 p-3.5 rounded-xl outline-none focus:border-brand-cyan text-[10px] font-bold shadow-sm" 
                    />
                 </div>
             ))}
         </section>

         <section className="bg-gray-50/50 dark:bg-zinc-900/50 p-8 rounded-[2rem] border border-gray-100 dark:border-zinc-800/50 shadow-sm flex flex-col items-center">
             <h2 className="text-[10px] font-black text-brand-blue uppercase mb-6 tracking-[0.2em]">5. QR Code de Impressão</h2>
             <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl mb-6 border border-brand-cyan/20 ring-8 ring-brand-cyan/5">
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
             </div>
             <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest text-center mb-6">Aponte a câmera para testar seu card digital</p>
             <button onClick={() => window.open(qrCodeUrl, '_blank')} className="bg-white dark:bg-zinc-800 text-black dark:text-white text-[10px] font-black py-4 px-8 rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-md hover:scale-105 transition-all uppercase tracking-widest">Download Alta Resolução</button>
         </section>

         <section className="bg-zinc-950 p-6 rounded-[2rem] border border-white/5 shadow-2xl space-y-5">
             <h2 className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.2em] flex items-center gap-2">
                <i className="fa-solid fa-rocket"></i> 6. Marketing & Analytics PRO
             </h2>
             <div className="space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><i className="fa-brands fa-facebook"></i> ID do Pixel do Meta</label>
                    <input 
                        type="text" 
                        value={profileData.metaPixelId || ''} 
                        onChange={(e) => setProfileData({...profileData, metaPixelId: e.target.value})} 
                        placeholder="Ex: 123456789012345"
                        className="w-full bg-black border border-white/10 p-3.5 rounded-xl outline-none focus:border-brand-cyan text-[11px] font-mono text-brand-cyan shadow-inner" 
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><i className="fa-brands fa-google"></i> ID de Medição GA4</label>
                    <input 
                        type="text" 
                        value={profileData.ga4MeasurementId || ''} 
                        onChange={(e) => setProfileData({...profileData, ga4MeasurementId: e.target.value})} 
                        placeholder="Ex: G-XXXXXXXXXX"
                        className="w-full bg-black border border-white/10 p-3.5 rounded-xl outline-none focus:border-brand-cyan text-[11px] font-mono text-brand-cyan shadow-inner" 
                    />
                 </div>
             </div>
             <div className="bg-brand-cyan/5 border border-brand-cyan/20 p-4 rounded-xl">
                 <p className="text-[10px] text-brand-cyan font-medium leading-relaxed italic">As tags UTM são adicionadas automaticamente a todos os links do seu cartão para rastreio total de ROI.</p>
             </div>
         </section>

         <section className="bg-zinc-950 p-6 rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden">
            <h2 className="text-[10px] font-black text-brand-cyan uppercase mb-6 tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-list-check"></i> 7. Conversão por Botão
            </h2>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={labelData} layout="vertical" margin={{ left: 10, right: 30 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="#999" fontSize={9} width={100} tickLine={false} axisLine={false} />
                        <Tooltip 
                            cursor={{fill: 'rgba(255,255,255,0.02)'}} 
                            formatter={(value) => [`${value} cliques`, "Cliques"]}
                            contentStyle={{ background: '#000', border: '1px solid #00E5FF', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                            itemStyle={{ color: '#00E5FF' }}
                            labelStyle={{ color: '#00E5FF', marginBottom: '4px' }}
                        />
                        <Bar dataKey="cliques" radius={[0, 4, 4, 0]} barSize={24}>
                            {labelData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.cliques > 0 ? '#00E5FF' : '#333'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
         </section>

         <section className="bg-zinc-950 p-6 rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden">
            <h2 className="text-[10px] font-black text-brand-cyan uppercase mb-6 tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-chart-line"></i> 8. Volume nos Últimos 7 Dias
            </h2>
            <div className="h-48 w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyData}>
                        <defs>
                            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis hide />
                        <Tooltip 
                            labelFormatter={(label) => `Dia: ${label}`}
                            formatter={(value) => [`${value} cliques`, "Cliques"]}
                            contentStyle={{ background: '#000', border: '1px solid #00E5FF', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }} 
                            itemStyle={{ color: '#00E5FF' }}
                            labelStyle={{ color: '#00E5FF', marginBottom: '4px' }}
                        />
                        <Area type="monotone" dataKey="cliques" stroke="#00E5FF" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 inline-block">
                <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total da Semana</div>
                <div className="text-2xl font-black text-white">{totalClicks}</div>
            </div>
         </section>

         <section className="bg-white dark:bg-zinc-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800 space-y-4 shadow-sm text-center">
             <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">9. Extração de Dados Profissional</h2>
             <p className="text-[11px] text-zinc-500 max-w-xs mx-auto mb-4 font-medium leading-relaxed">Baixe o relatório detalhado linha a linha para análise de ROI em planilhas externas.</p>
             <button 
                onClick={exportCSV}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-brand-cyan text-[10px] font-black py-5 rounded-2xl uppercase tracking-[0.15em] flex items-center justify-center gap-3 border border-brand-cyan/20 transition-all shadow-xl"
             >
                <i className="fa-solid fa-file-csv text-xl"></i> Exportar Relatório (data, hora, tipo, destino)
             </button>
         </section>
      </div>

      <div className="fixed bottom-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl p-4 sm:p-6 border-t border-gray-100 dark:border-zinc-800/50 z-[60] flex justify-center pb-safe">
        <button onClick={handleSave} disabled={isSaving} className="w-full max-w-lg bg-brand-cyan hover:bg-white text-black font-black py-4 rounded-2xl shadow-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 disabled:opacity-50">
            {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
            <span className="tracking-widest uppercase text-xs">Publicar Alterações no Card</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
