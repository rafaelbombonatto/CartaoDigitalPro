
import React from 'react';
import { QuickAction } from '../types';

interface ActionButtonProps {
  action: QuickAction;
  index: number;
  isDemo?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ action, index, isDemo = false }) => {
  const isWhatsApp = action.type === 'whatsapp';
  
  const handleClick = (e: React.MouseEvent) => {
    if (isDemo) {
      e.preventDefault();
    }
  };

  return (
    <a 
      href={isDemo ? '#' : action.url}
      target={isDemo ? undefined : "_blank"}
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`
        group relative flex flex-col items-center justify-center p-4 h-full
        rounded-2xl backdrop-blur-md transition-all duration-300
        border border-black/10 dark:border-white/10 hover:border-gold/50
        bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10
        transform hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/10
        animate-slide-up
        ${isDemo ? 'cursor-default hover:translate-y-0' : ''}
      `}
      style={{ animationDelay: `${0.2 + (index * 0.1)}s` }}
    >
      <div className={`
        w-12 h-12 mb-3 rounded-2xl flex items-center justify-center text-2xl
        transition-all duration-500
        ${isWhatsApp 
          ? 'bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-white group-hover:rotate-[360deg]' 
          : 'bg-gold/10 text-gold group-hover:bg-gold group-hover:text-black group-hover:scale-110'}
      `}>
        <i className={`${action.icon}`}></i>
      </div>
      <span className="text-[11px] font-black text-gray-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white tracking-widest uppercase transition-colors duration-300">
        {action.label}
      </span>
    </a>
  );
};

export default ActionButton;
