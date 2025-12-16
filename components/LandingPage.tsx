import React from 'react';
import { useRouter } from '../lib/routerContext';

const LandingPage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-gold selection:text-black overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gold to-yellow-200 flex items-center justify-center">
                <i className="fa-solid fa-address-card text-black text-sm"></i>
              </div>
              <span className="font-bold text-xl tracking-tight">Cartão<span className="text-gold">Pro</span></span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Entrar
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-gold hover:scale-105 transition-all"
              >
                Criar Grátis
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gold/20 rounded-full blur-[120px] -z-10 opacity-30 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gold text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Nova Versão 2.0 Disponível
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 leading-tight animate-slide-up">
            Seu Networking, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-200 to-gold">Reinventado.</span>
          </h1>
          
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Crie cartões de visita digitais interativos, elegantes e que convertem conexões em negócios. 100% editável e compatível com todos os dispositivos.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button 
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 bg-gold hover:bg-yellow-400 text-black font-bold rounded-xl text-lg transition-all transform hover:-translate-y-1 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
              Começar Agora <i className="fa-solid fa-arrow-right ml-2"></i>
            </button>
            <button 
                onClick={() => navigate('/exemplo')}
                className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-xl text-lg transition-all backdrop-blur-sm"
            >
              Ver Exemplo
            </button>
          </div>

          {/* Mockup Preview */}
          <div className="mt-20 relative mx-auto max-w-5xl animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="relative rounded-2xl bg-gradient-to-b from-gray-900 to-black p-2 border border-white/10 shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-full bg-gold/5 blur-3xl -z-10"></div>
                <img 
                    src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop" 
                    alt="App Preview" 
                    className="rounded-xl opacity-80 hover:opacity-100 transition-opacity duration-700 w-full object-cover h-[400px] object-top"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <p className="text-white/50 font-mono">interface_preview.png</p>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-zinc-950/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-white mb-4">Tudo que você precisa</h2>
                <p className="text-gray-400">Funcionalidades poderosas para destacar sua marca pessoal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: 'fa-wand-magic-sparkles', title: 'Design Premium', desc: 'Layouts sofisticados com glassmorphism e temas personalizáveis.' },
                    { icon: 'fa-share-nodes', title: 'Compartilhamento Fácil', desc: 'Link único para Bio do Instagram, WhatsApp e LinkedIn.' },
                    { icon: 'fa-chart-simple', title: 'Painel de Controle', desc: 'Edite suas informações em tempo real sem precisar de código.' }
                ].map((feature, idx) => (
                    <div key={idx} className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-white/10 transition-all group">
                        <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                            <i className={`fa-solid ${feature.icon} text-gold text-xl`}></i>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                        <p className="text-gray-400 leading-relaxed">
                            {feature.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">© 2024 Cartão Digital Pro. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;