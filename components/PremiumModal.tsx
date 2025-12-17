
import React, { useState } from 'react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Função auxiliar para acesso seguro a variáveis de ambiente
  const getEnv = (key: string) => {
    try {
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        return import.meta.env[key];
      }
    } catch (e) {
      // ignore
    }
    return undefined;
  };

  // --- CONFIGURAÇÃO DO MERCADO PAGO ---
  // Tenta pegar do ambiente, se não existir, retorna undefined
  const PAYMENT_LINK = getEnv('VITE_MERCADO_PAGO_LINK');
  
  const handleCheckout = () => {
      setIsLoading(true);
      
      if (!PAYMENT_LINK || PAYMENT_LINK === "COLE_AQUI_SEU_LINK_DO_MERCADO_PAGO") {
          alert("Link de Pagamento não configurado. Adicione a variável VITE_MERCADO_PAGO_LINK no Netlify.");
          setIsLoading(false);
          return;
      }

      // Simula um pequeno delay para feedback visual antes de redirecionar
      setTimeout(() => {
          window.location.href = PAYMENT_LINK;
      }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop com Blur */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-[#111] border border-gold/30 rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col">
        
        {/* Header Decorativo */}
        <div className="h-32 bg-gradient-to-br from-gold/20 via-black to-black flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute w-64 h-64 bg-gold/10 rounded-full blur-[80px]"></div>
            
            <div className="z-10 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold text-black text-xl mb-2 shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                    <i className="fa-solid fa-crown"></i>
                </div>
                <h2 className="text-xl font-bold text-white tracking-widest uppercase">Cartão Digital <span className="text-gold">Pro</span></h2>
            </div>

            <button 
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 text-white/60 hover:text-white hover:bg-black/60 flex items-center justify-center transition-all"
            >
                <i className="fa-solid fa-times"></i>
            </button>
        </div>

        {/* Body */}
        <div className="p-8">
            <div className="text-center mb-8">
                <p className="text-gray-400 text-sm font-medium mb-1">ACESSO VITALÍCIO</p>
                <div className="flex items-end justify-center gap-1 text-white">
                    <span className="text-2xl font-medium text-gray-500 mb-2">R$</span>
                    <span className="text-6xl font-extrabold tracking-tighter">49,90</span>
                </div>
                <p className="text-xs text-green-500 font-bold mt-2 bg-green-500/10 inline-block px-3 py-1 rounded-full border border-green-500/20">
                    Pagamento Único • Sem mensalidades
                </p>
            </div>

            <div className="space-y-4 mb-8">
                {[
                    'Edição ilimitada de informações',
                    'Link personalizado exclusivo',
                    'QR Code de alta resolução',
                    'Suporte técnico prioritário',
                    'Remoção da marca d\'água (futuro)'
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-300">
                        <i className="fa-solid fa-check text-gold"></i>
                        <span className="text-sm">{item}</span>
                    </div>
                ))}
            </div>

            {/* Payment Methods Visuals */}
            <div className="border-t border-white/10 pt-6">
                <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest mb-4">Pagamento Seguro via Mercado Pago</p>
                
                <div className="flex justify-center gap-4 text-2xl text-gray-400 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    <i className="fa-brands fa-cc-visa hover:text-white" title="Visa"></i>
                    <i className="fa-brands fa-cc-mastercard hover:text-white" title="Mastercard"></i>
                    <i className="fa-brands fa-cc-amex hover:text-white" title="Amex"></i>
                    <i className="fa-solid fa-barcode hover:text-white" title="Boleto"></i>
                    <div className="flex items-center gap-1 hover:text-white" title="PIX">
                        <i className="fa-brands fa-pix text-xl"></i>
                        <span className="text-xs font-bold font-sans">PIX</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-zinc-900 border-t border-white/5">
            <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-gold hover:bg-yellow-400 text-black font-bold text-center py-4 rounded-xl shadow-lg hover:shadow-gold/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                        Redirecionando...
                    </>
                ) : (
                    <>
                        Liberar Acesso Agora <i className="fa-solid fa-lock ml-2 text-xs"></i>
                    </>
                )}
            </button>
            <p className="text-center text-[10px] text-gray-600 mt-3">
                Ambiente criptografado. Liberação imediata após aprovação.
            </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
