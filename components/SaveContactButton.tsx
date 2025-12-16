import React from 'react';
import { ProfileData } from '../types';

interface SaveContactButtonProps {
  data: ProfileData;
  isDemo?: boolean;
}

const SaveContactButton: React.FC<SaveContactButtonProps> = ({ data, isDemo = false }) => {
  
  const handleDownloadVCard = () => {
    if (isDemo) return;

    // Basic vCard 3.0 string generation
    const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${data.name}
N:${data.name.split(' ').reverse().join(';')}
TITLE:${data.title}
NOTE:${data.bio}
END:VCARD`;

    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${data.name.replace(' ', '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full mt-8 mb-6 px-2 animate-slide-up" style={{ animationDelay: '0.6s' }}>
      <button
        onClick={handleDownloadVCard}
        className={`
          w-full relative overflow-hidden group
          bg-gradient-to-r from-gold to-[#b8952b]
          text-black font-bold py-4 rounded-xl
          shadow-lg shadow-gold/20
          transform transition-all duration-300
          ${!isDemo ? 'hover:scale-[1.02] hover:shadow-gold/40 active:scale-[0.98]' : 'cursor-default'}
        `}
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
        <div className="flex items-center justify-center gap-3 relative z-10">
          <i className="fa-solid fa-address-book text-lg"></i>
          <span className="tracking-widest text-sm">SALVAR NA AGENDA</span>
        </div>
      </button>
      
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default SaveContactButton;