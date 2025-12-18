
import React, { useRef, useState } from 'react';
import { ProfileData, QuickAction, SocialLink, UploadPending } from '../types';
import Auth from './Auth';
import { supabase } from '../lib/supabase';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: ProfileData;
  setProfileData: (data: ProfileData) => void;
  socialLinks: SocialLink[];
  setSocialLinks: (links: SocialLink[]) => void;
  quickActions: QuickAction[];
  setQuickActions: (actions: QuickAction[]) => void;
  onSave: (pendingUploads: UploadPending[]) => Promise<void>;
  isSaving: boolean;
  session: any;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen, onClose, profileData, setProfileData, socialLinks, setSocialLinks, quickActions, setQuickActions, onSave, isSaving, session
}) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const [pendingUploads, setPendingUploads] = useState<UploadPending[]>([]);

  if (!isOpen) return null;

  if (!session) {
    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 h-full overflow-y-auto shadow-2xl animate-fade-in border-l border-white/10 flex flex-col relative">
                <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors">
                    <i className="fa-solid fa-times"></i>
                </button>
                <Auth />
            </div>
        </div>
    );
  }

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleDocumentChange = (field: 'label' | 'value', value: string) => {
    setProfileData({
      ...profileData,
      document: { ...profileData.document, [field]: value }
    });
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
      setPendingUploads(prev => [
        ...prev.filter(p => p.field !== field),
        { field, file, previewUrl }
      ]);
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

    if (rawValue.trim() === '') {
      finalUrl = '';
    } else {
      if (type === 'whatsapp') {
        const cleanNumber = rawValue.replace(/\D/g, '');
        finalUrl = `https://wa.me/55${cleanNumber}`;
      } else if (type === 'email') {
        finalUrl = `mailto:${rawValue}`;
      } else if (type === 'map') {
        finalUrl = `https://maps.google.com/?q=${encodeURIComponent(rawValue)}`;
      }
    }
    newActions[index] = { ...newActions[index], url: finalUrl };
    setQuickActions(newActions);
  };

  const handleSocialChange = (index: number, value: string) => {
    const newLinks = [...socialLinks];
    newLinks[index] = { ...newLinks[index], url: value };
    setSocialLinks(newLinks);
  };

  const handleSaveClick = async () => {
    await onSave(pendingUploads);
    setPendingUploads([]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 h-full overflow-y-auto shadow-2xl animate-fade-in border-l border-white/10 flex flex-col">
        
        <div className="p-4 border-b border-gray-200 dark:border-zinc-700 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur z-20">
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Editor de Perfil</h2>
                <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-500 underline ml-2">Sair</button>
            </div>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="p-6 space-y-8 flex-1">
          <section className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/30">
            <h3 className="text-sm uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              <i className="fa-solid fa-link mr-2"></i>Endereço Digital
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Defina o link exclusivo do seu cartão.
            </p>
            <div className="flex items-center">
              <span className="bg-gray-100 dark:bg-zinc-800 border border-r-0 border-gray-200 dark:border-zinc-700 p-2 text-sm text-gray-500 rounded-l">
                cartao.pro/
              </span>
              <input 
                type="text" 
                value={profileData.alias} 
                onChange={handleAliasChange}
                placeholder="seunome"
                className="flex-1 bg-white dark:bg-black border border-gray-200 dark:border-zinc-700 rounded-r p-2 text-sm focus:border-indigo-500 outline-none text-indigo-600 dark:text-indigo-400 font-bold font-mono"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Imagens</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs mb-2 text-gray-500">Foto de Perfil</label>
                <div 
                  onClick={() => avatarInputRef.current?.click()}
                  className="h-24 rounded-lg bg-gray-100 dark:bg-zinc-800 border-2 border-dashed border-gray-300 dark:border-zinc-600 flex flex-col items-center justify-center cursor-pointer hover:border-gold transition-colors overflow-hidden relative"
                >
                  {profileData.avatarUrl && <img src={profileData.avatarUrl} className="w-full h-full object-cover absolute inset-0 opacity-50" />}
                  <i className="fa-solid fa-camera text-gray-400 relative z-10"></i>
                  <span className="text-[10px] text-gray-400 mt-1 relative z-10">Alterar</span>
                </div>
                <input type="file" ref={avatarInputRef} accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e, 'avatarUrl')} />
              </div>

              <div className="flex-1">
                <label className="block text-xs mb-2 text-gray-500">Fundo</label>
                <div 
                  onClick={() => bgInputRef.current?.click()}
                  className="h-24 rounded-lg bg-gray-100 dark:bg-zinc-800 border-2 border-dashed border-gray-300 dark:border-zinc-600 flex flex-col items-center justify-center cursor-pointer hover:border-gold transition-colors overflow-hidden relative"
                >
                  {profileData.backgroundUrl && <img src={profileData.backgroundUrl} className="w-full h-full object-cover absolute inset-0 opacity-50" />}
                  <i className="fa-solid fa-image text-gray-400 relative z-10"></i>
                  <span className="text-[10px] text-gray-400 mt-1 relative z-10">Alterar</span>
                </div>
                <input type="file" ref={bgInputRef} accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e, 'backgroundUrl')} />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Dados Pessoais</h3>
            <input type="text" value={profileData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Seu Nome Completo" className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded p-3 text-sm outline-none text-black dark:text-white" />
            <input type="text" value={profileData.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Cargo ou Especialidade" className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded p-3 text-sm outline-none text-black dark:text-white" />
            <textarea value={profileData.bio} onChange={(e) => handleChange('bio', e.target.value)} rows={3} placeholder="Sua Biografia (Breve resumo profissional)" className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded p-3 text-sm outline-none text-black dark:text-white resize-none" />
          </section>

          <section className="space-y-4">
             <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Atendimento Direto</h3>
             {quickActions.map((action, idx) => (
                 <div key={idx} className="mb-3">
                    <label className="block text-[10px] mb-1 text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2"><i className={`${action.icon}`}></i> {action.label}</label>
                    <input type="text" value={getDisplayValue(action)} onChange={(e) => handleSmartActionChange(idx, e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded p-3 text-sm outline-none text-black dark:text-white" />
                 </div>
             ))}
          </section>

          <section className="space-y-4 pb-10">
             <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Redes Sociais</h3>
             {socialLinks.map((link, idx) => (
               <div key={idx} className="flex gap-2 items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 rounded text-gray-500"><i className={link.icon}></i></div>
                  <input type="text" value={link.url} onChange={(e) => handleSocialChange(idx, e.target.value)} className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded p-2 text-xs outline-none text-black dark:text-white" placeholder="https://instagram.com/seu-perfil" />
               </div>
             ))}
          </section>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 sticky bottom-0 z-20">
          <button 
            onClick={handleSaveClick}
            disabled={isSaving}
            className="w-full bg-gold hover:bg-gold-light text-black font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <><i className="fa-solid fa-spinner fa-spin"></i> SALVANDO...</>
            ) : (
              <><i className="fa-solid fa-floppy-disk"></i> PUBLICAR ALTERAÇÕES</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
