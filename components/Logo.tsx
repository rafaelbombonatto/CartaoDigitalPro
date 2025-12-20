
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = "" }) => {
  const sizeMap = {
    sm: { icon: 24, text: 'text-xs', gap: 'gap-1.5' },
    md: { icon: 32, text: 'text-base', gap: 'gap-2' },
    lg: { icon: 48, text: 'text-2xl', gap: 'gap-3' },
    xl: { icon: 64, text: 'text-3xl', gap: 'gap-4' },
  };

  const config = sizeMap[size];

  return (
    <div className={`flex items-center ${config.gap} ${className}`}>
      {/* Ícone Estilizado do Cartão */}
      <svg 
        width={config.icon * 1.3} 
        height={config.icon} 
        viewBox="0 0 100 80" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="100" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00E5FF" />
            <stop offset="1" stopColor="#0081FF" />
          </linearGradient>
        </defs>
        
        {/* Corpo do Cartão */}
        <rect x="2" y="22" width="96" height="56" rx="8" stroke="url(#logoGradient)" strokeWidth="4"/>
        
        {/* Linhas de "Dados" do Cartão */}
        <rect x="12" y="38" width="40" height="4" rx="2" fill="url(#logoGradient)" />
        <rect x="12" y="52" width="25" height="4" rx="2" fill="url(#logoGradient)" />
        
        {/* Ícone de Sinal (NFC/Contactless) */}
        <path d="M50 45C50 34 60 24 75 24" stroke="url(#logoGradient)" strokeWidth="4" strokeLinecap="round" />
        <path d="M50 45C50 25 70 12 90 12" stroke="url(#logoGradient)" strokeWidth="4" strokeLinecap="round" />
        
        {/* Círculo Central do Sinal */}
        <circle cx="50" cy="45" r="6" fill="url(#logoGradient)" />
        
        {/* QR Code Placeholder */}
        <rect x="70" y="50" width="18" height="18" rx="2" stroke="url(#logoGradient)" strokeWidth="2" />
        <rect x="74" y="54" width="4" height="4" fill="url(#logoGradient)" />
        <rect x="80" y="60" width="4" height="4" fill="url(#logoGradient)" />
      </svg>

      {/* Texto Tipográfico Stacked */}
      {showText && (
        <div className="flex flex-col leading-[0.9] select-none">
          <span className={`font-bold tracking-tight text-white ${config.text}`}>
            ANÁLISE
          </span>
          <span className={`font-bold tracking-tight text-white ${config.text}`}>
            CARD
          </span>
          <span className={`font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan to-brand-blue ${config.text}`}>
            PRO
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
