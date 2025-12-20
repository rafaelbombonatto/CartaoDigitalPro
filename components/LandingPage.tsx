
import React from 'react';
import { useRouter } from '../lib/routerContext';
import Logo from './Logo';

const LandingPage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-cyan selection:text-black overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Logo size="md" />
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Entrar
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-brand-cyan text-black px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-cyan/20"
              >
                CRIAR MEU CARD
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-blue/10 rounded-full blur-[150px] -z-10 opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[120px] -z-10 opacity-20 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-cyan text-[10px] font-black uppercase tracking-widest mb-8 animate-fade-in shadow-xl">
            <i className="fa-solid fa-chart-line text-xs"></i>
            Networking com ROI Real
          </div>
          
          <h1 className="text-5xl sm:text-8xl font-black tracking-tighter mb-8 leading-[0.9] animate-slide-up">
            Cartões que <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-white to-brand-blue">Vendem.</span><br />
            Dados que <span className="text-brand-blue">Convertem.</span>
          </h1>
          
          <p className="mt-4 max-w-3xl mx-auto text-lg sm:text-xl text-gray-400 mb-12 animate-slide-up font-medium leading-relaxed" style={{ animationDelay: '0.1s' }}>
            Pare de usar cartões gratuitos que são apenas links. Use a ferramenta profissional que integra <span className="text-white font-bold underline decoration-brand-cyan">Meta Pixel</span>, <span className="text-white font-bold underline decoration-brand-blue">GA4</span> e <span className="text-white font-bold underline decoration-white">UTMs Automáticas</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button 
                onClick={() => navigate('/dashboard')}
                className="px-10 py-5 bg-brand-cyan hover:bg-white text-black font-black rounded-2xl text-lg transition-all transform hover:-translate-y-1 shadow-[0_0_30px_rgba(0,229,255,0.4)] uppercase tracking-widest text-xs"
            >
              Começar Teste Grátis <i className="fa-solid fa-arrow-right ml-2"></i>
            </button>
            <button 
                onClick={() => navigate('/demo')}
                className="px-10 py-5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black rounded-2xl text-lg transition-all backdrop-blur-md uppercase tracking-widest text-xs"
            >
              Ver Card de Exemplo
            </button>
          </div>

          <div className="mt-20 flex justify-center items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all">
             <i className="fa-brands fa-facebook text-3xl"></i>
             <i className="fa-brands fa-google text-3xl"></i>
             <i className="fa-brands fa-instagram text-3xl"></i>
             <i className="fa-brands fa-whatsapp text-3xl"></i>
          </div>
        </div>
      </div>

      {/* Why Section */}
      <section className="py-24 bg-zinc-950 relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-4xl sm:text-5xl font-black mb-8 leading-tight tracking-tighter">
                        Por que pagar por métricas se o "grátis" existe?
                    </h2>
                    <div className="space-y-8">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-blue/20 text-brand-blue flex items-center justify-center shrink-0 border border-brand-blue/30">
                                <i className="fa-solid fa-bullseye"></i>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Públicos de Remarketing</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">Com o Pixel instalado, todo mundo que visita seu cartão vira um público quente para seus anúncios no Instagram. Não perca nenhum lead.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-cyan/20 text-brand-cyan flex items-center justify-center shrink-0 border border-brand-cyan/30">
                                <i className="fa-solid fa-code"></i>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">UTM Automática</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">Saiba exatamente de onde veio o clique. O AnaliseCardPro adiciona tags automaticamente para você ler no Google Analytics sem esforço.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-brand-cyan/20 blur-[100px] -z-10 rounded-full"></div>
                    <div className="bg-black/50 backdrop-blur-2xl border border-white/10 p-8 rounded-[3rem] shadow-2xl overflow-hidden group">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-brand-cyan">Analytics em Tempo Real</h4>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[9px] font-bold text-green-500">LIVE</span>
                            </div>
                        </div>
                        <div className="space-y-6">
                            {[
                                { l: 'Cliques no WhatsApp', v: '142', p: '78%' },
                                { l: 'Salvamentos na Agenda', v: '89', p: '56%' },
                                { l: 'Taxa de Conversão', v: '12.4%', p: '100%' },
                            ].map((stat, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase text-gray-500">
                                        <span>{stat.l}</span>
                                        <span className="text-white">{stat.v}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-cyan rounded-full" style={{ width: stat.p }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-black mb-16 tracking-tighter">Investimento Único. Retorno Constante.</h2>
            <div className="max-w-sm mx-auto bg-gradient-to-b from-zinc-900 to-black border border-brand-cyan/20 p-10 rounded-[2.5rem] relative group hover:border-brand-cyan transition-all duration-500">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-cyan text-black text-[9px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-xl">VITALÍCIO</div>
                
                <div className="mb-8">
                    <div className="text-gray-500 text-sm font-bold line-through mb-1">R$ 147,00</div>
                    <div className="flex items-end justify-center gap-1">
                        <span className="text-2xl font-bold text-brand-cyan mb-2">R$</span>
                        <span className="text-7xl font-black tracking-tighter">49,90</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Pagamento único. Sem mensalidades.</p>
                </div>

                <ul className="text-left space-y-4 mb-10">
                    {['Pixel Meta & GA4 Nativo', 'UTM Automática em links', 'Dashboard de Cliques', 'QR Code de Impressão', '7 Dias de Teste Grátis'].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-xs font-bold text-gray-300">
                            <i className="fa-solid fa-check text-brand-cyan"></i> {item}
                        </li>
                    ))}
                </ul>

                <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-brand-cyan transition-all uppercase tracking-widest text-xs shadow-lg"
                >
                    COMEÇAR MEU TESTE AGORA
                </button>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black text-center">
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center grayscale opacity-50 mb-6 scale-75">
                <Logo size="sm" />
            </div>
            <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">© 2024 AnaliseCardPro - Uma ferramenta de marketing profissional.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
