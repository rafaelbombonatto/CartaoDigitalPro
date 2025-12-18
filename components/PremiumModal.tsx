
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'offer' | 'verifying'>('offer');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    // Captura o ID do pagamento caso o usuário tenha sido redirecionado de volta
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

  const handleBuy = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert("Você precisa estar logado para realizar o upgrade.");
        setIsLoading(false);
        return;
      }

      // Chamada para a Edge Function que você criou no Supabase
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            user_id: session.user.id,
            plan: 'vitalicio',
            amount_cents: 4990 // R$ 49,90
          })
        }
      );

      const data = await res.json();

      if (res.ok && data.init_point) {
        // Redireciona para o checkout oficial do Mercado Pago
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

  const handleFinalActivation = async (idToVerify?: string) => {
    const targetId = idToVerify || paymentId;
    
    if (!targetId) {
        alert("Por favor, conclua o pagamento primeiro. Não encontramos o código da transação.");
        return;
    }

    setIsVerifying(true);
    
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Sua sessão expirou. Por favor, entre novamente.");

        // Busca o perfil para atualizar
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (!profile) throw new Error("Perfil não encontrado.");

        const updatedContent = { 
            ...profile.content, 
            profile: { 
                ...profile.content.profile, 
                isPremium: true,
                mp_payment_id: targetId,
                premium_since: new Date().toISOString()
            } 
        };

        const { error: updateError } = await supabase.from('profiles').upsert({
            id: session.user.id,
            alias: profile.alias,
            updated_at: new Date(),
            content: updatedContent
        });

        if (updateError) throw updateError;

        // Redireciona com parâmetro de sucesso para o Dashboard
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

      <div className="relative w-full max-w-md bg-[#0d0d0d] border border-gold/20 rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
        
        {step === 'offer' ? (
            <div className="p-8 text-center">
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
                        { icon: 'fa-infinity', t: 'Acesso Vitalício (Sem Mensalidades)' },
                        { icon: 'fa-headset', t: 'Prioridade no Atendimento' }
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
                    <p className="text-[10px] text-gold font-bold uppercase tracking-widest mt-1">Pagamento Único</p>
                </div>

                <button
                    onClick={handleBuy}
                    disabled={isLoading}
                    className="w-full bg-white text-black font-black py-5 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-bolt"></i>}
                    {isLoading ? 'GERANDO PEDIDO...' : 'LIBERAR ACESSO AGORA'}
                </button>
                
                <p className="mt-4 text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                    Segurança garantida pelo Mercado Pago
                </p>
            </div>
        ) : (
            <div className="p-8 text-center animate-fade-in">
                <div className="mb-8">
                    <div className="w-24 h-24 rounded-full border-4 border-gold/20 border-t-gold animate-spin mx-auto flex items-center justify-center relative">
                        <i className="fa-solid fa-hourglass-half text-gold text-2xl absolute animate-pulse"></i>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-white mb-4">Aguardando Pagamento</h2>
                
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 text-left space-y-4 mb-8">
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        Se você realizou o pagamento via <span className="text-white font-bold">PIX</span>, siga estes passos:
                    </p>
                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-gold text-black flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                            <p className="text-[11px] text-gray-300">Conclua a transação no seu banco.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-gold text-black flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                            <p className="text-[11px] text-gray-300">Aguarde o e-mail de confirmação.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-gold text-black flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                            <p className="text-[11px] text-gray-300">Clique no botão abaixo para ativar.</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => handleFinalActivation()}
                    disabled={isVerifying}
                    className="w-full bg-gold text-black font-black py-5 rounded-2xl shadow-2xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {isVerifying ? (
                        <><i className="fa-solid fa-spinner fa-spin"></i> ATIVANDO...</>
                    ) : (
                        <><i className="fa-solid fa-check-circle"></i> JÁ PAGUEI, ATIVAR AGORA</>
                    )}
                </button>
                
                <button 
                    onClick={() => setStep('offer')} 
                    className="mt-6 text-xs text-gray-500 hover:text-white underline font-medium"
                >
                    Voltar para oferta
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default PremiumModal;
