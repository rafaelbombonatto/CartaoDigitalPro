
import React from 'react';
import { useRouter } from '../lib/routerContext';
import Logo from './Logo';

const LandingPage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-cyan selection:text-black overflow-x-hidden font-sans">
      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Logo size="sm" />
            <div className="hidden md:flex items-center gap-8 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">
               <a href="#features" className="hover:text-brand-cyan transition-colors">Recursos</a>
               <a href="#pricing" className="hover:text-brand-cyan transition-colors">Preços</a>
               <button onClick={() => navigate('/demo')} className="hover:text-brand-cyan transition-colors uppercase">Exemplo</button>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
              >
                Entrar
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-brand-cyan text-black px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,229,255,0.2)]"
              >
                CRIAR MEU CARD
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-[150px] -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            
            {/* Launch Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-white/10 text-brand-cyan text-[8px] font-black uppercase tracking-[0.3em] mb-10 backdrop-blur-md animate-fade-in">
              <span className="flex h-1.5 w-1.5 rounded-full bg-brand-cyan shadow-[0_0_10px_#00E5FF] animate-pulse"></span>
              The Future of Networking
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl sm:text-8xl font-black tracking-tighter mb-8 leading-[0.9] animate-slide-up">
              Seu Card Digital <br className="hidden sm:block" />
              agora é um <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-white to-brand-blue">Motor de Vendas.</span>
            </h1>
            
            {/* Sub-headline */}
            <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-zinc-400 mb-14 animate-slide-up font-medium leading-relaxed" style={{ animationDelay: '0.1s' }}>
              Projetado para profissionais que não aceitam o básico. 
              Rastreie cada clique, aplique <span className="text-white">remarketing automático</span> e domine o seu mercado.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-slide-up mb-16 w-full max-w-md" style={{ animationDelay: '0.2s' }}>
              <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-12 py-5 bg-white text-black font-black rounded-2xl text-[11px] transition-all transform hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(255,255,255,0.15)] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
              >
                Criar Grátis <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </button>
              <button 
                  onClick={() => navigate('/demo')}
                  className="w-full sm:w-auto px-12 py-5 bg-zinc-900/40 border border-white/10 hover:bg-zinc-800 text-zinc-300 font-black rounded-2xl text-[11px] transition-all backdrop-blur-md uppercase tracking-[0.2em]"
              >
                Ver Exemplo
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col items-center gap-5 animate-fade-in" style={{ animationDelay: '0.3s' }}>
               <div className="flex -space-x-4">
                  {[12,24,36,48,60].map(img => (
                    <img key={img} src={`https://i.pravatar.cc/100?img=${img}`} className="w-11 h-11 rounded-full border-4 border-black object-cover shadow-2xl" alt="Pro" />
                  ))}
                  <div className="w-11 h-11 rounded-full bg-brand-cyan text-black border-4 border-black flex items-center justify-center text-[10px] font-black">+1k</div>
               </div>
               <div className="space-y-1">
                  <div className="flex justify-center gap-1 text-yellow-400">
                    {[1,2,3,4,5].map(s => <i key={s} className="fa-solid fa-star text-[10px]"></i>)}
                  </div>
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">A escolha nº 1 de Especialistas em Marketing</p>
               </div>
            </div>

            {/* Product Showcase (Mockup) */}
            <div className="mt-28 relative w-full max-w-5xl mx-auto group">
               {/* Background Glow */}
               <div className="absolute inset-0 bg-brand-cyan/5 blur-[100px] -z-10 rounded-full scale-110 group-hover:bg-brand-cyan/10 transition-all duration-1000"></div>
               
               <div className="relative bg-zinc-900/30 backdrop-blur-3xl border border-white/5 rounded-[3.5rem] p-4 sm:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                     
                     {/* Left: Phone Mockup */}
                     <div className="lg:col-span-5 flex justify-center perspective-1000">
                        <div className="w-64 h-[520px] bg-zinc-950 rounded-[3rem] border-[8px] border-zinc-900 shadow-2xl relative overflow-hidden transform rotate-y-6 group-hover:rotate-y-0 transition-transform duration-700">
                           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-zinc-900 rounded-b-2xl z-20"></div>
                           <div className="p-5 flex flex-col items-center pt-10">
                              <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-brand-cyan/20 mb-4 shadow-xl"></div>
                              <div className="w-32 h-2.5 bg-zinc-800 rounded-full mb-2"></div>
                              <div className="w-20 h-2 bg-zinc-900 rounded-full mb-10"></div>
                              <div className="w-full space-y-3">
                                 <div className="w-full h-12 bg-brand-cyan/10 border border-brand-cyan/30 rounded-2xl"></div>
                                 <div className="w-full h-12 bg-white/5 rounded-2xl"></div>
                                 <div className="w-full h-12 bg-white/5 rounded-2xl"></div>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Right: Analytics UI */}
                     <div className="hidden lg:col-span-7 lg:flex flex-col gap-6 text-left">
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                           <div className="flex justify-between items-center">
                              <h4 className="text-[10px] font-black text-brand-cyan uppercase tracking-widest">Dashboard de Analytics PRO</h4>
                              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[8px] font-black uppercase">
                                 <span className="w-1 h-1 bg-green-500 rounded-full animate-ping"></span> Live
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                                 <span className="text-[8px] font-black text-zinc-500 uppercase block mb-1">Total Cliques</span>
                                 <span className="text-3xl font-black">2.847</span>
                              </div>
                              <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                                 <span className="text-[8px] font-black text-zinc-500 uppercase block mb-1">CTR Médio</span>
                                 <span className="text-3xl font-black text-brand-blue">18.4%</span>
                              </div>
                           </div>
                           <div className="h-32 w-full bg-black/40 rounded-2xl border border-white/5 overflow-hidden flex items-end px-1 gap-1">
                              {[35, 65, 45, 85, 55, 95, 75].map((h, i) => (
                                <div key={i} className="flex-1 bg-brand-cyan/20 border-t-2 border-brand-cyan rounded-t-lg transition-all duration-1000" style={{ height: `${h}%` }}></div>
                              ))}
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <div className="flex-1 bg-zinc-900/80 p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-brand-blue/20 text-brand-blue flex items-center justify-center"><i className="fa-brands fa-facebook-f"></i></div>
                              <div className="text-[10px] font-black uppercase">Pixel Ativo</div>
                           </div>
                           <div className="flex-1 bg-zinc-900/80 p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center"><i className="fa-brands fa-google"></i></div>
                              <div className="text-[10px] font-black uppercase">GA4 Tracked</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Floating Medals */}
               <div className="absolute -top-12 -right-10 bg-white text-black p-5 rounded-3xl shadow-2xl animate-bounce [animation-duration:5s] hidden sm:block">
                  <div className="text-[10px] font-black uppercase tracking-widest mb-1 text-zinc-400">Conversão</div>
                  <div className="text-2xl font-black">+42%</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <section className="py-24 bg-zinc-950/50 border-y border-white/5">
         <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
            <h3 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-16">Integração Nativa com Gigantes</h3>
            <div className="flex flex-wrap justify-center gap-14 sm:gap-24 opacity-30 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
               <i className="fa-brands fa-facebook text-4xl"></i>
               <i className="fa-brands fa-google text-4xl"></i>
               <i className="fa-brands fa-instagram text-4xl"></i>
               <i className="fa-brands fa-whatsapp text-4xl"></i>
               <i className="fa-brands fa-linkedin text-4xl"></i>
               <i className="fa-brands fa-tiktok text-4xl"></i>
            </div>
         </div>
      </section>

      {/* Features Detail */}
      <section id="features" className="py-32 bg-black relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="order-2 lg:order-1">
                    <div className="bg-zinc-900/50 p-10 rounded-[3rem] border border-white/5 relative group">
                        <div className="absolute inset-0 bg-brand-blue/5 blur-[80px] -z-10"></div>
                        <h4 className="text-[10px] font-black text-brand-blue uppercase mb-8 tracking-widest">Tecnologia de Rastreio</h4>
                        <div className="space-y-10">
                            {[
                                { t: 'Pixel do Meta', d: 'Crie públicos de remarketing automáticos para quem visita seu card.', i: 'fa-bullseye' },
                                { t: 'Google Analytics 4', d: 'Mensure o tempo de permanência e cliques com precisão cirúrgica.', i: 'fa-chart-simple' },
                                { t: 'UTMs Inteligentes', d: 'Saiba exatamente se o lead veio do seu Instagram, Bio ou WhatsApp.', i: 'fa-tag' }
                            ].map((f, i) => (
                                <div key={i} className="flex gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-blue text-xl group-hover:scale-110 transition-transform">
                                        <i className={`fa-solid ${f.i}`}></i>
                                    </div>
                                    <div>
                                        <h5 className="text-xl font-black mb-2">{f.t}</h5>
                                        <p className="text-sm text-zinc-500 leading-relaxed">{f.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="order-1 lg:order-2">
                    <h2 className="text-4xl sm:text-6xl font-black mb-8 leading-tight tracking-tighter">
                        Não é apenas estética. <br /> É Inteligência.
                    </h2>
                    <p className="text-lg text-zinc-400 leading-relaxed mb-10">
                        Enquanto cartões comuns apenas mostram seus links, o AnaliseCardPro entende o comportamento do seu cliente. 
                        Transformamos o seu networking casual em um ativo de marketing digital poderoso.
                    </p>
                    <button onClick={() => navigate('/dashboard')} className="text-brand-cyan text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:translate-x-2 transition-transform">
                        QUERO ESSA TECNOLOGIA <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-black mb-16 tracking-tighter">Planos para Profissionais</h2>
            <div className="max-w-sm mx-auto bg-black border border-brand-cyan/20 p-12 rounded-[3rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-6xl text-brand-cyan group-hover:opacity-10 transition-opacity">
                    <i className="fa-solid fa-crown"></i>
                </div>
                
                <span className="inline-block px-4 py-1.5 rounded-full bg-brand-cyan text-black text-[9px] font-black uppercase tracking-widest mb-8">Oferta Vitalícia</span>
                
                <div className="mb-12">
                    <div className="text-zinc-500 text-sm font-bold line-through mb-1">R$ 147,00</div>
                    <div className="flex items-end justify-center gap-1">
                        <span className="text-2xl font-bold text-brand-cyan mb-2">R$</span>
                        <span className="text-7xl font-black tracking-tighter">49,90</span>
                    </div>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-4 italic">Sem mensalidades. Para sempre seu.</p>
                </div>

                <ul className="text-left space-y-5 mb-12">
                    {['Links Ilimitados', 'Pixels de Rastreamento', 'UTM Dinâmica', 'Dashboard Completo', 'Suporte Prioritário'].map((item, i) => (
                        <li key={i} className="flex items-center gap-4 text-[11px] font-bold text-zinc-300">
                            <div className="w-5 h-5 rounded-full bg-brand-cyan/10 flex items-center justify-center"><i className="fa-solid fa-check text-[10px] text-brand-cyan"></i></div>
                            {item}
                        </li>
                    ))}
                </ul>

                <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-brand-cyan transition-all uppercase tracking-[0.2em] text-[11px] shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                >
                    GARANTIR MEU ACESSO
                </button>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-16 bg-black text-center">
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center grayscale opacity-20 mb-10 scale-90">
                <Logo size="sm" />
            </div>
            <div className="flex justify-center gap-10 text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-10">
                <a href="#" className="hover:text-white">Termos</a>
                <a href="#" className="hover:text-white">Privacidade</a>
                <a href="#" className="hover:text-white">Contato</a>
            </div>
            <p className="text-zinc-800 text-[10px] uppercase font-bold tracking-[0.3em]">© 2024 AnaliseCardPro. Powered by Marketing Intelligence.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
