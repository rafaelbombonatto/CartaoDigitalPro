
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getAiAssistantResponse } from '../lib/aiService';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'offer' | 'verifying' | 'ai_chat'>('offer');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  
  // Estados do Chat IA
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('payment_id') || params.get('collection_id') || params.get('preference_id');
    const status = params.get('status');

    if (id && status === 'approved') {
        setPaymentId(id);
        setStep('verifying');
        handleFinalActivation(id);
    }
  }, [isOpen]);

  const getEnv = (key: string) => {
    try {
      // @ts-ignore
      return import.meta.env[key];
    } catch (e) { return undefined; }
  };

  const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || "https://hoaqohaawgvgzoxsfzyt.supabase.co";

  const handleBuy = async (customParams?: any) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert("Você precisa estar logado para realizar o upgrade.");
        setIsLoading(false);
        return;
      }

      // Se customParams vier da IA, usamos eles, senão usamos o padrão
      const payload = customParams || {
        user_id: session.user.id,
        plan: 'vitalicio',
        amount_cents: 4990,
        base_url: window.location.origin
      };

      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (res.ok && data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error(data.error || "Erro ao gerar link de pagamento.");
      }
    } catch (err: any) {
      alert("Não foi possível iniciar o pagamento: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiChat = async () => {
    if (!chatMessage.trim()) return;
    
    const userText = chatMessage;
    setChatHistory(prev => [...prev, { role: 'user', text: userText }]);
    setChatMessage('');
    setIsAiThinking(true);

    try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await getAiAssistantResponse(userText, session?.user.id || 'anonymous');
        
        // Verificar se houve chamada de função
        if (response.functionCalls && response.functionCalls.length > 0) {
            const fc = response.functionCalls[0];
            if (fc.name === 'criar_preferencia_mercadopago') {
                setChatHistory(prev => [...prev, { role: 'ai', text: "Perfeito! Estou gerando seu link de pagamento personalizado agora..." }]);
                // Executa o checkout com os dados validados pela IA
                await handleBuy(fc.args);
                return;
            }
        }

        const aiText = response.text || "Desculpe, não consegui processar seu pedido. Tente novamente.";
        setChatHistory(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
        setChatHistory(prev => [...prev, { role: 'ai', text: "Ocorreu um erro na conexão. Tente novamente em instantes." }]);
    } finally {
        setIsAiThinking(false);
    }
  };

  const handleFinalActivation = async (idToVerify?: string) => {
    const targetId = idToVerify || paymentId;
    if (!targetId) return;

    setIsVerifying(true);
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session?.user.id).single();

        if (!profile) throw new Error("Perfil não encontrado.");

        const updatedContent = { 
            ...profile.content, 
            profile: { 
                ...profile.content.profile, 
                isPremium: true,
                mp_payment_id: targetId,
                premium_since: new Date().toISOString(),
                createdAt: profile.content.profile?.createdAt || profile.created_at || new Date().toISOString()
            } 
        };

        await supabase.from('profiles').upsert({
            id: session?.user.id,
            alias: profile.alias,
            updated_at: new Date(),
            content: updatedContent
        });

        window.location.href = '/dashboard?upgrade=success';
    } catch (err: any) {
        alert("Erro ao ativar sua conta: " + err.message);
    } finally {
        setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-[#0d0d0d] border border-gold/20 rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        
        {step === 'offer' && (
            <div className="p-8 text-center overflow-y-auto">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-gold to-yellow-200 flex items-center justify-center shadow-lg shadow-gold/20 rotate-3">
                        <i className="fa-solid fa-crown text-black text-3xl"></i>
                    </div>
                </div>

                <h2 className="text-2xl font-black text-white mb-2 tracking-tight uppercase">Upgrade Premium</h2>
                <p className="text-gray-400 text-sm mb-8">Libere todas as funções e impulsione sua marca agora.</p>

                <div className="space-y-3 mb-8 text-left">
                    {[
                        { icon: 'fa-link', t: 'Link Personalizado Único' },
                        { icon: 'fa-qrcode', t: 'QR Code de Alta Resolução' },
                        { icon: 'fa-infinity', t: 'Acesso Vitalício' },
                        { icon: 'fa-robot', t: 'Suporte com Inteligência Artificial' }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                                <i className={`fa-solid ${item.icon} text-xs`}></i>
                            </div>
                            <span className="text-[11px] font-bold text-gray-200 uppercase tracking-tight">{item.t}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-gold/10 border border-gold/20 rounded-2xl p-4 mb-8">
                    <div className="flex items-end justify-center gap-1">
                        <span className="text-gold font-bold mb-1">R$</span>
                        <span className="text-4xl font-black text-white">49,90</span>
                    </div>
                </div>

                <button
                    onClick={() => handleBuy()}
                    disabled={isLoading}
                    className="w-full bg-white text-black font-black py-5 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mb-4 disabled:opacity-50"
                >
                    {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-bolt"></i>}
                    {isLoading ? 'GERANDO PEDIDO...' : 'LIBERAR ACESSO AGORA'}
                </button>

                <button 
                    onClick={() => setStep('ai_chat')}
                    className="w-full bg-zinc-900 text-zinc-400 font-bold py-4 rounded-2xl border border-zinc-800 hover:text-gold transition-colors text-xs flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-comment-dots text-gold"></i> DÚVIDAS? FALE COM O ASSISTENTE
                </button>
            </div>
        )}

        {step === 'ai_chat' && (
            <div className="flex flex-col h-[500px]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                            <i className="fa-solid fa-robot"></i>
                        </div>
                        <span className="text-sm font-black text-white uppercase tracking-widest">Consultor AI</span>
                    </div>
                    <button onClick={() => setStep('offer')} className="text-xs text-zinc-500 hover:text-white">VOLTAR</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {chatHistory.length === 0 && (
                        <div className="bg-gold/5 border border-gold/10 p-4 rounded-2xl text-xs text-gray-400 leading-relaxed italic">
                            Olá! Sou o assistente do Cartão Digital Pro. Em que posso te ajudar hoje? Você pode me perguntar sobre as vantagens do plano premium ou pedir para iniciar seu upgrade.
                        </div>
                    )}
                    {chatHistory.map((chat, i) => (
                        <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                                chat.role === 'user' 
                                ? 'bg-gold text-black rounded-tr-none' 
                                : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none'
                            }`}>
                                {chat.text}
                            </div>
                        </div>
                    ))}
                    {isAiThinking && (
                        <div className="flex justify-start">
                            <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-black border-t border-white/10">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAiChat()}
                            placeholder="Pergunte algo..."
                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-gold"
                        />
                        <button 
                            onClick={handleAiChat}
                            disabled={isAiThinking}
                            className="w-12 h-12 bg-gold text-black rounded-xl flex items-center justify-center hover:bg-yellow-400 transition-colors disabled:opacity-50"
                        >
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        )}

        {step === 'verifying' && (
            <div className="p-8 text-center animate-fade-in">
                <div className="mb-8">
                    <div className="w-24 h-24 rounded-full border-4 border-gold/20 border-t-gold animate-spin mx-auto flex items-center justify-center">
                        <i className="fa-solid fa-hourglass-half text-gold text-2xl animate-pulse"></i>
                    </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-4">Aguardando Pagamento</h2>
                <button
                    onClick={() => handleFinalActivation()}
                    disabled={isVerifying}
                    className="w-full bg-gold text-black font-black py-5 rounded-2xl shadow-2xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {isVerifying ? 'ATIVANDO...' : 'ATIVAR AGORA'}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default PremiumModal;
