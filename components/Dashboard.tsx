
import React, { useState, useRef, useEffect } from 'react';
import { ProfileData, QuickAction, SocialLink, UploadPending } from '../types';
import Auth from './Auth';
import PremiumModal from './PremiumModal'; // Importando o Modal
import { supabase, uploadImage, checkAliasAvailability } from '../lib/supabase';
import { DEFAULT_PROFILE, DEFAULT_QUICK_ACTIONS, DEFAULT_SOCIAL_LINKS } from '../constants';
import { useRouter } from '../lib/routerContext';

const Dashboard: React.FC = () => {
  const { navigate } = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Data States
  const [profileData, setProfileData] = useState<ProfileData>(DEFAULT_PROFILE);
  const [quickActions, setQuickActions] = useState<QuickAction[]>(DEFAULT_QUICK_ACTIONS);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(DEFAULT_SOCIAL_LINKS);
  
  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<UploadPending[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false); // Novo estado para sucesso de pagamento
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // --- Auth & Data Fetching ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
          fetchProfile(session.user.id);
          checkPaymentReturn(); // Verifica se voltou do Mercado Pago
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

  // Verifica URL parameters para retorno do Mercado Pago
  const checkPaymentReturn = () => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const paymentId = params.get('payment_id');
    
    if (status === 'approved' && paymentId) {
        setPaymentSuccess(true);
        // Limpa a URL para não processar novamente ao recarregar
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Opcional: Aqui você pode disparar uma atualização manual para o Supabase se não usar Webhooks
        // Mas a forma correta é esperar o Webhook atualizar o banco.
        // Vamos atualizar o estado local para dar feedback imediato:
        setProfileData(prev => ({ ...prev, isPremium: true }));
    }
  };

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
        
        let loadedProfile = content.profile || DEFAULT_PROFILE;
        
        // Garante que existe uma data de criação
        if (!loadedProfile.createdAt) {
            loadedProfile = { ...loadedProfile, createdAt: new Date().toISOString() };
        }
        
        // Se detectamos pagamento aprovado localmente, mantém como true
        if (paymentSuccess) {
            loadedProfile.isPremium = true;
        }
        
        setProfileData(loadedProfile);

        if (content.actions) setQuickActions(content.actions);
        if (content.links) setSocialLinks(content.links);
      } else {
        // Novo perfil
        setProfileData({ ...DEFAULT_PROFILE, createdAt: new Date().toISOString() });
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
      const alias = profileData.alias;
      if (!alias || alias.length < 3) {
          throw new Error("O link do cartão deve ter pelo menos 3 caracteres.");
      }
      
      const isAvailable = await checkAliasAvailability(alias, session.user.id);
      if (!isAvailable) {
          throw new Error(`O link "${alias}" já está sendo usado por outra pessoa. Por favor, escolha outro.`);
      }

      let updatedProfile = { ...profileData };

      for (const upload of pendingUploads) {
        const publicUrl = await uploadImage(upload.file, session.user.id);
        if (publicUrl) updatedProfile = { ...updatedProfile, [upload.field]: publicUrl };
      }

      setProfileData(updatedProfile);
      setPendingUploads([]);

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

  const handleCopyLink = () => {
      const alias = profileData.alias || '';
      const fullUrl = `${window.location.origin}/${alias}`;
      
      navigator.clipboard.writeText(fullUrl).then(() => {
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 2000);
      });
  };

  const handleDownloadQR = async () => {
      const alias = profileData.alias || '';
      const fullUrl = `${window.location.origin}/${alias}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(fullUrl)}`;

      try {
          const response = await fetch(qrUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `qrcode-${alias}.png`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
      } catch (error) {
          console.error("Erro ao baixar QR Code", error);
          window.open(qrUrl, '_blank');
      }
  };

  const handleQRClick = () => {
      if (profileData.isPremium) {
          setShowQRCodeModal(true);
      } else {
          setShowPremiumModal(true);
      }
  };

  const getAccountStatus = () => {
      if (profileData.isPremium) {
          return { type: 'premium', label: 'PREMIUM', color: 'bg-gold text-black', icon: 'fa-crown', clickable: false };
      }
      
      const createdAt = new Date(profileData.createdAt || new Date());
      const now = new Date();
      const trialEnd = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); 
      const diffTime = trialEnd.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysLeft > 0) {
          return { type: 'trial', label: `${daysLeft} dias de teste`, color: 'bg-blue-600 text-white animate-pulse', icon: 'fa-clock', clickable: true };
      } else {
          return { type: 'expired', label: 'Teste Expirado', color: 'bg-red-600 text-white animate-pulse', icon: 'fa-exclamation-triangle', clickable: true };
      }
  };

  const status = getAccountStatus();

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
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white relative">
      
      {/* Confetti / Success Modal se pagamento aprovado */}
      {paymentSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
             <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl animate-slide-up flex items-center gap-4 border border-green-400">
                <i className="fa-solid fa-circle-check text-2xl"></i>
                <div>
                    <h3 className="font-bold">Pagamento Confirmado!</h3>
                    <p className="text-sm">Seu plano Premium vitalício está ativo.</p>
                </div>
                <button onClick={() => setPaymentSuccess(false)} className="pointer-events-auto ml-2 hover:text-green-200"><i className="fa-solid fa-times"></i></button>
             </div>
          </div>
      )}

      {/* Modal de Pagamento */}
      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />

      {/* Modal de QR Code */}
      {showQRCodeModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowQRCodeModal(false)}></div>
             <div className="relative bg-white dark:bg-zinc-900 border border-gold/20 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-slide-up">
                 <button onClick={() => setShowQRCodeModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><i className="fa-solid fa-times"></i></button>
                 
                 <h2 className="text-xl font-bold text-gold mb-2">Seu QR Code</h2>
                 <p className="text-sm text-gray-400 mb-6">Escaneie para acessar seu cartão ou faça o download para imprimir.</p>
                 
                 <div className="bg-white p-4 rounded-xl mx-auto mb-6 w-64 h-64 flex items-center justify-center">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(`${window.location.origin}/${profileData.alias}`)}`} 
                        alt="QR Code" 
                        className="w-full h-full object-contain"
                    />
                 </div>

                 <button 
                    onClick={handleDownloadQR}
                    className="w-full bg-gold hover:bg-yellow-400 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                 >
                    <i className="fa-solid fa-download"></i> Baixar Alta Resolução (PNG)
                 </button>
             </div>
        </div>
      )}

      {/* Header Dashboard */}
      <header className="fixed top-0 w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 z-50 h-16 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-gold flex items-center justify-center font-bold text-black">CP</div>
             <h1 className="font-bold hidden sm:block">Editor de Cartão</h1>
             
             {/* Account Status Badge */}
             <button 
                onClick={() => status.clickable && setShowPremiumModal(true)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ml-2 ${status.color} ${status.clickable ? 'hover:scale-105 cursor-pointer shadow-lg' : ''} transition-all`}
             >
                <i className={`fa-solid ${status.icon}`}></i>
                {status.label}
             </button>
        </div>
        <div className="flex items-center gap-3">
             {!profileData.isPremium && (
                 <button onClick={() => setShowPremiumModal(true)} className="hidden sm:block text-xs font-bold bg-zinc-800 hover:bg-gold hover:text-black text-gold px-3 py-1.5 rounded-lg border border-gold/30 transition-all mr-2">
                     <i className="fa-solid fa-rocket mr-1"></i> Fazer Upgrade
                 </button>
             )}

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
                    <span className="pl-3 pr-1 text-gray-500 text-sm border-r border-transparent">{window.location.host}/</span>
                    <input 
                        type="text" 
                        value={profileData.alias} 
                        onChange={handleAliasChange} 
                        className="flex-1 bg-transparent p-3 outline-none font-bold text-indigo-500"
                        placeholder="seu-nome"
                    />
                    
                    {/* Copy Button */}
                    <button 
                        onClick={handleCopyLink}
                        title="Copiar link"
                        className="px-3 py-3 text-gray-400 hover:text-gold transition-colors border-l border-zinc-800 hover:bg-zinc-900"
                    >
                        {copiedLink ? (
                            <i className="fa-solid fa-check text-green-500"></i>
                        ) : (
                            <i className="fa-regular fa-copy"></i>
                        )}
                    </button>

                    {/* QR Code Button */}
                    <button 
                        onClick={handleQRClick}
                        title="Gerar QR Code"
                        className={`px-3 py-3 transition-colors border-l border-zinc-800 hover:bg-zinc-900 ${profileData.isPremium ? 'text-gray-400 hover:text-gold' : 'text-gray-600 hover:text-red-400'}`}
                    >
                         {profileData.isPremium ? (
                             <i className="fa-solid fa-qrcode"></i>
                         ) : (
                             <i className="fa-solid fa-lock text-xs"></i>
                         )}
                    </button>
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
