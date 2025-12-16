import React, { useState, useRef, useEffect } from 'react';
import { ProfileData, QuickAction, SocialLink, UploadPending } from '../types';
import Auth from './Auth';
import { supabase, uploadImage } from '../lib/supabase';
import { DEFAULT_PROFILE, DEFAULT_QUICK_ACTIONS, DEFAULT_SOCIAL_LINKS } from '../constants';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Data States
  const [profileData, setProfileData] = useState<ProfileData>(DEFAULT_PROFILE);
  const [quickActions, setQuickActions] = useState<QuickAction[]>(DEFAULT_QUICK_ACTIONS);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(DEFAULT_SOCIAL_LINKS);
  
  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<UploadPending[]>([]);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // --- Auth & Data Fetching ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoadingProfile(false);
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

      if (data && data.content) {
        const content = data.content;
        if (content.profile) setProfileData(content.profile);
        if (content.actions) setQuickActions(content.actions);
        if (content.links) setSocialLinks(content.links);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // --- Handlers ---
  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleDocumentChange = (field: 'label' | 'value', value: string) => {
    setProfileData({ ...profileData, document: { ...profileData.document, [field]: value } });
  };

  const handleAliasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setProfileData({ ...profileData, alias: value });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'backgroundUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setProfileData({ ...profileData, [field]: previewUrl });
      setPendingUploads(prev => [...prev.filter(p => p.field !== field), { field, file, previewUrl }]);
    }
  };

  const getDisplayValue = (action: QuickAction) => {
    if (!action.url || action.url === '#') return '';
    switch (action.type) {
      case 'whatsapp': return action.url.replace('https://wa.me/55', '');
      case 'email': return action.url.replace('mailto:', '');
      case 'map': return decodeURIComponent(action.url.replace('https://maps.google.com/?q=', ''));
      default: return action.url;
    }
  };

  const handleSmartActionChange = (index: number, rawValue: string) => {
    const newActions = [...quickActions];
    const type = newActions[index].type;
    let finalUrl = rawValue;

    if (rawValue.trim() !== '') {
      if (type === 'whatsapp') {
        const cleanNumber = rawValue.replace(/\D/g, '');
        finalUrl = `https://wa.me/55${cleanNumber}`;
      } else if (type === 'email') {
        finalUrl = `mailto:${rawValue}`;
      } else if (type === 'map') {
        finalUrl = `https://maps.google.com/?q=${encodeURIComponent(rawValue)}`;
      }
    } else {
        finalUrl = '';
    }
    newActions[index] = { ...newActions[index], url: finalUrl };
    setQuickActions(newActions);
  };

  const handleSocialChange = (index: number, value: string) => {
    const newLinks = [...socialLinks];
    newLinks[index] = { ...newLinks[index], url: value };
    setSocialLinks(newLinks);
  };

  const handleSave = async () => {
    if (!session) return;
    setIsSaving(true);
    try {
      let updatedProfile = { ...profileData };

      // Upload Images
      for (const upload of pendingUploads) {
        const publicUrl = await uploadImage(upload.file, session.user.id);
        if (publicUrl) updatedProfile = { ...updatedProfile, [upload.field]: publicUrl };
      }

      setProfileData(updatedProfile);
      setPendingUploads([]);

      // Save to DB
      const contentToSave = { profile: updatedProfile, actions: quickActions, links: socialLinks };
      const { error } = await supabase.from('profiles').upsert({
          id: session.user.id,
          alias: updatedProfile.alias,
          updated_at: new Date(),
          content: contentToSave
      });

      if (error) throw error;
      alert('Cartão atualizado com sucesso!');
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const viewLiveCard = () => {
      const alias = profileData.alias === 'default' ? '' : profileData.alias;
      if (alias) {
          window.open(`/${alias}`, '_blank');
      } else {
          alert('Defina um Link Personalizado primeiro.');
      }
  };

  // --- Render ---

  if (!session) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden border border-zinc-800">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/50">
                     <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white text-sm"><i className="fa-solid fa-arrow-left"></i> Voltar</button>
                     <span className="font-bold text-white">Login</span>
                     <div className="w-10"></div>
                </div>
                <Auth />
            </div>
        </div>
    );
  }

  if (loadingProfile) {
      return <div className="min-h-screen flex items-center justify-center bg-black text-white"><i className="fa-solid fa-spinner fa-spin text-3xl text-gold"></i></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
      {/* Header Dashboard */}
      <header className="fixed top-0 w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 z-50 h-16 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-gold flex items-center justify-center font-bold text-black">CP</div>
             <h1 className="font-bold hidden sm:block">Editor de Cartão</h1>
        </div>
        <div className="flex items-center gap-3">
             <button onClick={viewLiveCard} className="text-sm px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors text-gold">
                <i className="fa-solid fa-external-link-alt mr-2"></i> Ver Cartão
             </button>
             <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 ml-2">Sair</button>
        </div>
      </header>

      <div className="pt-24 pb-20 px-4 max-w-4xl mx-auto space-y-8">
        
         {/* ALIAS SECTION */}
         <section className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><i className="fa-solid fa-link text-gold"></i> Link do Cartão</h2>
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center bg-gray-100 dark:bg-black rounded-lg border border-gray-300 dark:border-zinc-700 overflow-hidden">
                    <span className="px-3 text-gray-500 text-sm border-r border-gray-300 dark:border-zinc-700">{window.location.host}/</span>
                    <input 
                        type="text" 
                        value={profileData.alias} 
                        onChange={handleAliasChange} 
                        className="flex-1 bg-transparent p-3 outline-none font-bold text-indigo-500"
                        placeholder="seu-nome"
                    />
                </div>
                <button onClick={viewLiveCard} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-bold transition-colors">
                    Acessar
                </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Este é o link que você enviará para seus clientes.</p>
         </section>

         {/* VISUALS SECTION */}
         <section className="grid md:grid-cols-2 gap-6">
             <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                <h2 className="text-lg font-bold mb-4">Aparência</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">Cor do Tema</label>
                        <div className="flex items-center gap-3">
                            <input type="color" value={profileData.themeColor} onChange={(e) => handleChange('themeColor', e.target.value)} className="w-12 h-12 rounded cursor-pointer p-0 border-0" />
                            <span className="text-sm font-mono">{profileData.themeColor}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-500 mb-2">Foto de Perfil</label>
                            <div onClick={() => avatarInputRef.current?.click()} className="aspect-square rounded-full bg-black border-2 border-dashed border-zinc-700 hover:border-gold cursor-pointer relative overflow-hidden group">
                                <img src={profileData.avatarUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                <div className="absolute inset-0 flex items-center justify-center text-white"><i className="fa-solid fa-camera"></i></div>
                            </div>
                            <input type="file" className="hidden" ref={avatarInputRef} onChange={(e) => handleImageSelect(e, 'avatarUrl')} accept="image/*" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-2">Imagem de Fundo</label>
                            <div onClick={() => bgInputRef.current?.click()} className="aspect-square rounded-lg bg-black border-2 border-dashed border-zinc-700 hover:border-gold cursor-pointer relative overflow-hidden group">
                                <img src={profileData.backgroundUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                <div className="absolute inset-0 flex items-center justify-center text-white"><i className="fa-solid fa-image"></i></div>
                            </div>
                             <input type="file" className="hidden" ref={bgInputRef} onChange={(e) => handleImageSelect(e, 'backgroundUrl')} accept="image/*" />
                        </div>
                    </div>
                </div>
             </div>

             <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                 <h2 className="text-lg font-bold mb-4">Informações</h2>
                 <div className="space-y-3">
                     <input type="text" placeholder="Nome Completo" value={profileData.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-700 p-3 rounded-lg outline-none focus:border-gold dark:text-white" />
                     <input type="text" placeholder="Cargo / Título" value={profileData.title} onChange={(e) => handleChange('title', e.target.value)} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-700 p-3 rounded-lg outline-none focus:border-gold dark:text-white" />
                     <textarea placeholder="Biografia curta" rows={3} value={profileData.bio} onChange={(e) => handleChange('bio', e.target.value)} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-700 p-3 rounded-lg outline-none focus:border-gold dark:text-white resize-none"></textarea>
                     <div className="flex gap-2">
                        <input type="text" placeholder="Tipo Doc (ex: CRECI)" value={profileData.document.label} onChange={(e) => handleDocumentChange('label', e.target.value)} className="w-1/3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-700 p-3 rounded-lg outline-none focus:border-gold dark:text-white" />
                        <input type="text" placeholder="Número" value={profileData.document.value} onChange={(e) => handleDocumentChange('value', e.target.value)} className="w-2/3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-700 p-3 rounded-lg outline-none focus:border-gold dark:text-white" />
                     </div>
                 </div>
             </div>
         </section>

         {/* ACTIONS */}
         <section className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Botões de Ação Rápida</h2>
            <div className="grid md:grid-cols-2 gap-4">
                {quickActions.map((action, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-black p-3 rounded-lg border border-gray-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2 mb-2 text-gold">
                            <i className={action.icon}></i>
                            <span className="text-sm font-bold">{action.label}</span>
                        </div>
                        <input 
                            type="text" 
                            placeholder={action.type === 'whatsapp' ? 'DDD + Número' : action.type === 'email' ? 'email@exemplo.com' : 'URL ou Endereço'}
                            value={getDisplayValue(action)} 
                            onChange={(e) => handleSmartActionChange(idx, e.target.value)} 
                            className="w-full bg-transparent border-b border-zinc-700 focus:border-gold outline-none py-1 text-sm dark:text-white" 
                        />
                    </div>
                ))}
            </div>
         </section>

         {/* SOCIALS */}
         <section className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Redes Sociais</h2>
            <div className="space-y-3">
                {socialLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-black rounded border border-gray-200 dark:border-zinc-800 text-gray-500">
                            <i className={link.icon}></i>
                        </div>
                        <input 
                            type="text" 
                            placeholder={`Link do ${link.label}`}
                            value={link.url}
                            onChange={(e) => handleSocialChange(idx, e.target.value)}
                            className="flex-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-700 p-2 rounded outline-none focus:border-gold text-sm dark:text-white"
                        />
                    </div>
                ))}
            </div>
         </section>
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-0 w-full bg-white dark:bg-zinc-900 p-4 border-t border-gray-200 dark:border-zinc-800 z-40 flex justify-center">
        <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full max-w-md bg-gold hover:bg-yellow-400 text-black font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
            {isSaving ? <><i className="fa-solid fa-spinner fa-spin"></i> Salvando...</> : <><i className="fa-solid fa-floppy-disk"></i> Salvar Alterações</>}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;