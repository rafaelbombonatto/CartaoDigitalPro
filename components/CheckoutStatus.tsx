
import React from 'react';
import { useRouter } from '../lib/routerContext';

interface CheckoutStatusProps {
  type: 'success' | 'failure' | 'pending';
}

const CheckoutStatus: React.FC<CheckoutStatusProps> = ({ type }) => {
  const { navigate } = useRouter();

  const configs = {
    success: {
      icon: 'fa-circle-check',
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      title: 'Pagamento Aprovado!',
      desc: 'Sua conta Premium Vitalícia foi ativada com sucesso. Aproveite todos os recursos agora.',
      buttonText: 'IR PARA MEU PAINEL',
      buttonClass: 'bg-gold text-black hover:bg-yellow-400',
      action: () => navigate('/dashboard')
    },
    failure: {
      icon: 'fa-circle-xmark',
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      title: 'Ops! Algo deu errado',
      desc: 'Não conseguimos processar seu pagamento. Verifique os dados ou tente outro método.',
      buttonText: 'TENTAR NOVAMENTE',
      buttonClass: 'bg-white text-black hover:bg-gray-200',
      action: () => navigate('/dashboard')
    },
    pending: {
      icon: 'fa-hourglass-half',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      title: 'Pagamento em Análise',
      desc: 'Estamos aguardando a confirmação do seu pagamento (PIX ou Boleto podem levar alguns minutos).',
      buttonText: 'VOLTAR AO INÍCIO',
      buttonClass: 'bg-zinc-800 text-white hover:bg-zinc-700',
      action: () => navigate('/')
    }
  };

  const config = configs[type];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 ${type === 'success' ? 'bg-green-500' : type === 'failure' ? 'bg-red-500' : 'bg-gold'}`}></div>
      </div>

      <div className={`relative z-10 w-full max-w-sm bg-zinc-900/50 backdrop-blur-xl border ${config.border} p-8 rounded-[2.5rem] shadow-2xl animate-slide-up`}>
        <div className={`w-20 h-20 ${config.bg} ${config.color} rounded-full flex items-center justify-center mx-auto mb-6 text-4xl animate-bounce`}>
          <i className={`fa-solid ${config.icon}`}></i>
        </div>

        <h1 className="text-2xl font-black text-white mb-3 tracking-tight uppercase">
          {config.title}
        </h1>
        
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          {config.desc}
        </p>

        <button
          onClick={config.action}
          className={`w-full py-4 rounded-2xl font-black text-xs tracking-widest transition-all shadow-xl active:scale-95 ${config.buttonClass}`}
        >
          {config.buttonText}
        </button>
        
        <p className="mt-6 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
          Checkout Seguro Mercado Pago
        </p>
      </div>
    </div>
  );
};

export default CheckoutStatus;
