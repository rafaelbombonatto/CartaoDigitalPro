
import React from 'react';
import { useRouter } from '../lib/routerContext';
import Logo from './Logo';

const LandingPage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-cyan selection:text-black overflow-x-hidden font-sans">
      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Logo size="sm" />
            <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
               <a href="#features" className="hover:text-brand-cyan transition-colors">Recursos</a>
               <a href="#pricing" className="hover:text-brand-cyan transition-colors">Preços</a>
               <a href="#demo" className="hover:text-brand-cyan transition-colors">Exemplo</a>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-white transition-colors"
              >
                Entrar
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-brand-cyan text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)]"
              >
                CRIAR MEU CARD
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section Remodelada */}
      <div className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 overflow-hidden">
        {/* Luzes de fundo dinâmicas */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-blue/20 rounded-full blur-[120px] -z-10 opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-[100px] -z-10 opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            
            {/* Badge de Lançamento */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-brand-cyan text-[9px] font-black uppercase tracking-[0.2em] mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
              </span>
              Nova Era do Networking Digital
            </div>
            
            {/* Headline Principal */}
            <h1 className="text-5xl sm:text-8xl font-black tracking-tighter mb-6 leading-[0.85] animate-slide-up">
              Seu Networking não é <br />
              apenas um link. É um <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-white to-brand-blue">Funil de Vendas.</span>
            </h1>
            
            {/* Sub-headline */}
            <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-zinc-400 mb-12 animate-slide-up font-medium leading-relaxed" style={{ animationDelay: '0.1s' }}>
              O único cartão digital projetado para profissionais de elite que exigem <span className="text-white font-bold">Analytics em tempo real</span>, <span className="text-white font-bold">Remarketing</span> e <span className="text-white font-bold">ROI mensurável</span>.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up mb-12" style={{ animationDelay: '0.2s' }}>
              <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-10 py-5 bg-white text-black font-black rounded-2xl text-[11px] transition-all transform hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(255,255,255,0.2)] uppercase tracking-[0.15em]"
              >
                Começar Teste Grátis <i className="fa-solid fa-bolt ml-2 text-brand-blue"></i>
              </button>
              <button 
                  onClick={() => navigate('/demo')}
                  className="w-full sm:w-auto px-10 py-5 bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 text-zinc-300 font-black rounded-2xl text-[11px] transition-all backdrop-blur-md uppercase tracking-[0.15em]"
              >
                Ver Card de Exemplo
              </button>
            </div>

            {/* Prova Social */}
            <div className="flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
               <div className="flex -space-x-3">
                  {[1,2,3,4,5].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-10 h-10 rounded-full border-2 border-black object-cover" alt="User" />
                  ))}
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-black flex items-center justify-center text-[10px] font-black text-brand-cyan">+5k</div>
               </div>
               <div className="flex flex-col items-center">
                  <div className="flex gap-1 text-gold mb-1">
                    {[1,2,3,4,5].map(i => <i key={i} className="fa-solid fa-star text-[10px]"></i>)}
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Aprovado por profissionais de alta performance</span>
               </div>
            </div>

            {/* Mockup do Produto em CSS (Apple-style) */}
            <div className="mt-24 relative w-full max-w-4xl mx-auto group">
               {/* Sombra de fundo do Mockup */}
               <div className="absolute inset-0 bg-brand-cyan/20 blur-[120px] -z-10 rounded-full transform group-hover:scale-110 transition-transform duration-1000"></div>
               
               <div className="relative bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-4 sm:p-8 shadow-2xl overflow-hidden aspect-[16/9] flex items-center justify-center">
                  <div className="grid grid-cols-12 gap-6 w-full h-full">
                     {/* Preview do Mobile (Mockup à esquerda) */}
                     <div className="col-span-12 lg:col-span-4 flex justify-center">
                        <div className="w-48 h-[400px] bg-zinc-950 rounded-[2.5rem] border-[6px] border-zinc-800 shadow-2xl overflow-hidden relative">
                           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-800 rounded-b-2xl z-20"></div>
                           <div className="p-4 flex flex-col items-center">
                              <div className="w-16 h-16 rounded-full bg-zinc-800 mb-4 mt-6"></div>
                              <div className="w-24 h-2 bg-zinc-800 rounded-full mb-2"></div>
                              <div className="w-16 h-1.5 bg-zinc-900 rounded-full mb-8"></div>
                              <div className="w-full space-y-2">
                                 <div className="w-full h-10 bg-brand-cyan/20 border border-brand-cyan/20 rounded-xl"></div>
                                 <div className="w-full h-10 bg-white/5 rounded-xl"></div>
                                 <div className="w-full h-10 bg-white/5 rounded-xl"></div>
                              </div>
                           </div>
                        </div>
                     </div>
                     {/* Painel de Dados (Analytics à direita) */}
                     <div className="hidden lg:col-span-8 lg:flex flex-col justify-center space-y-6">
                        <div className="bg-black/40 p-6 rounded-3xl border border-white/5 space-y-4">
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase tracking-widest text-brand-cyan">Performance em Tempo Real</span>
                              <div className="px-2 py-1 rounded bg-green-500/20 text-green-500 text-[8px] font-bold">ATIVO</div>
                           </div>
                           <div className="flex gap-4">
                              <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/5">
                                 <div className="text-zinc-500 text-[8px] font-black uppercase mb-1">Taxa de Conversão</div>
                                 <div className="text-2xl font-black text-white">12.4%</div>
                              </div>
                              <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/5">
                                 <div className="text-zinc-500 text-[8px] font-black uppercase mb-1">Remarketing</div>
                                 <div className="text-2xl font-black text-brand-blue">ON</div>
                              </div>
                           </div>
                           <div className="w-full h-32 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden">
                              {/* Gráfico Simulado */}
                              <svg className="absolute bottom-0 w-full" viewBox="0 0 100 40">
                                 <path d="M0,40 Q25,10 50,30 T100,0 L100,40 L0,40 Z" fill="url(#grad)" fillOpacity="0.2" />
                                 <path d="M0,40 Q25,10 50,30 T100,0" fill="none" stroke="#00E5FF" strokeWidth="2" />
                                 <defs>
                                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                       <stop offset="0%" stopColor="#00E5FF" />
                                       <stop offset="100%" stopColor="transparent" />
                                    </linearGradient>
                                 </defs>
                              </svg>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Floating Elements (Badges Técnicas) */}
               <div className="absolute -top-10 -left-10 bg-zinc-900 border border-white/10 p-4 rounded-2xl shadow-2xl animate-bounce [animation-duration:3s] hidden sm:block">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-brand-cyan/20 text-brand-cyan flex items-center justify-center"><i className="fa-brands fa-facebook-f text-xs"></i></div>
                     <div>
                        <div className="text-[8px] font-black text-zinc-500 uppercase">Meta Pixel</div>
                        <div className="text-[10px] font-black text-white">Instalado</div>
                     </div>
                  </div>
               </div>
               <div className="absolute -bottom-10 -right-10 bg-zinc-900 border border-white/10 p-4 rounded-2xl shadow-2xl animate-bounce [animation-duration:4s] hidden sm:block">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-brand-blue/20 text-brand-blue flex items-center justify-center"><i className="fa-solid fa-chart-pie text-xs"></i></div>
                     <div>
                        <div className="text-[8px] font-black text-zinc-500 uppercase">Google GA4</div>
                        <div className="text-[10px] font-black text-white">Rastreando ROI</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Integradores (Logos) */}
      <section className="py-20 border-y border-white/5 bg-zinc-950/50">
         <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-12">Integração Nativa com Gigantes</span>
            <div className="flex flex-wrap justify-center gap-12 sm:gap-20 opacity-30 hover:opacity-100 transition-opacity duration-500 grayscale hover:grayscale-0">
               <i className="fa-brands fa-facebook text-4xl"></i>
               <i className="fa-brands fa-google text-4xl"></i>
               <i className="fa-brands fa-instagram text-4xl"></i>
               <i className="fa-brands fa-whatsapp text-4xl"></i>
               <i className="fa-brands fa-linkedin text-4xl"></i>
               <i className="fa-brands fa-tiktok text-4xl"></i>
            </div>
         </div>
      </section>

      {/* Why Section */}
      <section id="features" className="py-24 bg-zinc-950 relative border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-4xl sm:text-5xl font-black mb-8 leading-tight tracking-tighter">
                        O "Grátis" está custando caro para o seu negócio.
                    </h2>
                    <div className="space-y-8">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-blue/20 text-brand-blue flex items-center justify-center shrink-0 border border-brand-blue/30">
                                <i className="fa-solid fa-bullseye"></i>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Públicos de Remarketing</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">Com o Pixel instalado, todo mundo que visita seu cartão vira um público quente para seus anúncios no Instagram. Não perca nenhum lead.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-cyan/20 text-brand-cyan flex items-center justify-center shrink-0 border border-brand-cyan/30">
                                <i className="fa-solid fa-code"></i>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">UTM Automática</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">Saiba exatamente de onde veio o clique. O AnaliseCardPro adiciona tags automaticamente para você ler no Google Analytics sem esforço.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-brand-cyan/20 blur-[100px] -z-10 rounded-full"></div>
                    <div className="bg-black/50 backdrop-blur-2xl border border-white/10 p-8 rounded-[3rem] shadow-2xl overflow-hidden group">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-brand-cyan">Dashboard de Conversão</h4>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[9px] font-bold text-green-500 uppercase">Ao Vivo</span>
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
      <section id="pricing" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-black mb-16 tracking-tighter">Investimento Único. <br /> Retorno Constante.</h2>
            <div className="max-w-sm mx-auto bg-gradient-to-b from-zinc-900 to-black border border-brand-cyan/20 p-10 rounded-[2.5rem] relative group hover:border-brand-cyan transition-all duration-500">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-cyan text-black text-[9px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-xl">VITALÍCIO</div>
                
                <div className="mb-8">
                    <div className="text-zinc-500 text-sm font-bold line-through mb-1">R$ 147,00</div>
                    <div className="flex items-end justify-center gap-1">
                        <span className="text-2xl font-bold text-brand-cyan mb-2">R$</span>
                        <span className="text-7xl font-black tracking-tighter">49,90</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-2">Pagamento único. Sem mensalidades.</p>
                </div>

                <ul className="text-left space-y-4 mb-10">
                    {['Pixel Meta & GA4 Nativo', 'UTM Automática em links', 'Dashboard de Cliques', 'QR Code de Impressão', '7 Dias de Teste Grátis'].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-tight text-zinc-300">
                            <i className="fa-solid fa-check text-brand-cyan"></i> {item}
                        </li>
                    ))}
                </ul>

                <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-brand-cyan transition-all uppercase tracking-widest text-[11px] shadow-lg active:scale-95"
                >
                    COMEÇAR MEU TESTE AGORA
                </button>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black text-center">
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center grayscale opacity-30 mb-6 scale-75">
                <Logo size="sm" />
            </div>
            <p className="text-zinc-700 text-[10px] uppercase font-bold tracking-widest">© 2024 AnaliseCardPro - Uma ferramenta de marketing para profissionais de elite.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
