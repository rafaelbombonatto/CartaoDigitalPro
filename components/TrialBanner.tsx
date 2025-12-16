import React from 'react';

const TrialBanner: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-indigo-600 text-white z-50 py-3 px-4 shadow-lg animate-slide-up flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
          <i className="fa-solid fa-clock"></i>
        </div>
        <div>
          <p className="font-bold text-sm">Modo de Teste Gratuito</p>
          <p className="text-xs text-indigo-200">Seu teste de 7 dias expira em breve.</p>
        </div>
      </div>
      <button className="bg-white text-indigo-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-md w-full sm:w-auto">
        Obter Licença Vitalícia
      </button>
    </div>
  );
};

export default TrialBanner;