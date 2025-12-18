
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
              <span className="font-bold text-xl tracking-tight">Cartão Digital <span className="text-gold">Pro</span></span>
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
                Testar Grátis
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

          {/* Mockup Preview - Composição Visual de Marketing */}
          <div className="mt-20 relative mx-auto max-w-5xl animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="relative rounded-2xl bg-gradient-to-b from-gray-900 to-black p-2 border border-white/10 shadow-2xl overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-gold/5 blur-3xl -z-10"></div>
                
                {/* Imagem de Fundo: Abstrato Luxo (Preto e Dourado) */}
                <img 
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
                    alt="Fundo Luxo" 
                    className="rounded-xl opacity-80 group-hover:opacity-100 transition-all duration-1000 w-full object-cover h-[500px] object-center scale-100 group-hover:scale-105"
                />
                
                {/* Camada de Composição (Simulando Mockup do Cartão) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="relative transform transition-transform duration-700 group-hover:-translate-y-2">
                        {/* Corpo do Cartão Digital (Simulado) */}
                        <div className="w-64 h-[400px] bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl flex flex-col items-center p-6 relative overflow-hidden">
                           {/* Efeito de brilho no vidro */}
                           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/10 to-transparent opacity-50"></div>
                           
                           {/* Avatar Simulado */}
                           <div className="w-20 h-20 rounded-full border-2 border-gold shadow-lg mb-4 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200')"}}></div>
                           
                           {/* Linhas de Texto Simuladas */}
                           <div className="w-3/4 h-4 bg-white/90 rounded mb-2"></div>
                           <div className="w-1/2 h-3 bg-gold/80 rounded mb-6"></div>
                           
                           {/* Botões Simulados */}
                           <div className="w-full space-y-3">
                               <div className="w-full h-10 bg-white/10 rounded-lg border border-white/5"></div>
                               <div className="w-full h-10 bg-white/10 rounded-lg border border-white/5"></div>
                               <div className="w-full h-10 bg-gold rounded-lg text-black font-bold flex items-center justify-center text-xs shadow-lg shadow-gold/20">SALVAR CONTATO</div>
                           </div>
                        </div>
                        
                        {/* Elemento Flutuante 1: WhatsApp Stats */}
                        <div className="absolute -right-12 top-20 bg-black/60 backdrop-blur-md border border-gold/30 p-4 rounded-xl shadow-xl animate-slide-up" style={{animationDelay: '0.6s'}}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center"><i className="fa-brands fa-whatsapp"></i></div>
                                <div>
                                    <div className="text-[10px] text-gray-400">Conversão</div>
                                    <div className="text-sm font-bold text-white">+127%</div>
                                </div>
                            </div>
                        </div>

                        {/* Elemento Flutuante 2: QR Code */}
                        <div className="absolute -left-12 bottom-20 bg-black/60 backdrop-blur-md border border-gold/30 p-4 rounded-xl shadow-xl animate-slide-up" style={{animationDelay: '0.8s'}}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center"><i className="fa-solid fa-qrcode"></i></div>
                                <div>
                                    <div className="text-[10px] text-gray-400">Acessos</div>
                                    <div className="text-sm font-bold text-white">QR Code</div>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-zinc-950/50 relative border-t border-white/5">
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

      {/* Pricing Section */}
      <div className="py-24 bg-black relative overflow-hidden">
         {/* Glow effect */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[100px] pointer-events-none"></div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl font-bold text-white mb-12">Preço Simples e Justo</h2>

            <div className="max-w-sm mx-auto bg-[#1a1a1a] border border-gold/20 rounded-3xl p-8 backdrop-blur-md shadow-2xl hover:border-gold/40 transition-all duration-300 group">
                
                <div className="inline-block bg-gold text-black text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
                    Oferta Especial
                </div>

                <div className="flex items-end justify-center gap-1 mb-2">
                    <span className="text-gray-400 text-lg font-medium translate-y-[-6px]">R$</span>
                    <span className="text-6xl font-extrabold text-white tracking-tight">49,90</span>
                    <span className="text-gray-500 text-sm mb-2 font-medium">único</span>
                </div>
                <p className="text-gold font-bold text-sm mb-8 tracking-wider uppercase">Licença Vitalícia</p>

                <div className="w-full border-t border-white/10 mb-8"></div>

                <ul className="text-left space-y-4 mb-8">
                    {[
                        '7 dias de teste grátis',
                        'Cartão personalizado ilimitado',
                        'Link exclusivo permanente',
                        'Atualizações gratuitas',
                        'Suporte via email'
                    ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-gray-300 text-sm">
                            <div className="w-5 h-5 rounded-full bg-transparent flex items-center justify-center">
                                <i className="fa-solid fa-check text-gold text-sm"></i>
                            </div>
                            {item}
                        </li>
                    ))}
                </ul>

                <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-gold hover:bg-yellow-400 text-black font-bold py-4 rounded-xl transition-transform hover:-translate-y-1 shadow-lg shadow-gold/10 flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-arrow-right"></i> Começar Teste Grátis
                </button>
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
