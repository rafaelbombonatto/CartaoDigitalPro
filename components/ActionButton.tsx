import React from 'react';
import { QuickAction } from '../types';

interface ActionButtonProps {
  action: QuickAction;
  index: number;
}

const ActionButton: React.FC<ActionButtonProps> = ({ action, index }) => {
  const isWhatsApp = action.type === 'whatsapp';
  
  // Hide button if URL is empty or is just the protocol prefix (user cleared the input)
  const isValid = action.url && 
                  action.url !== '' && 
                  action.url !== '#' && 
                  action.url !== 'https://wa.me/55' && 
                  action.url !== 'mailto:' && 
                  action.url !== 'https://maps.google.com/?q=';

  if (!isValid) return null;

  return (
    <a 
      href={action.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group relative flex flex-col items-center justify-center p-4 
        rounded-xl backdrop-blur-md transition-all duration-300
        border border-black/10 dark:border-white/10 hover:border-gold/50
        bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10
        transform hover:-translate-y-1 hover:shadow-lg hover:shadow-gold/10
        animate-slide-up
      `}
      style={{ animationDelay: `${0.2 + (index * 0.1)}s` }}
    >
      <div className={`
        w-10 h-10 mb-2 rounded-full flex items-center justify-center text-xl
        transition-colors duration-300
        ${isWhatsApp ? 'bg-green-500/20 text-green-600 dark:text-green-400 group-hover:bg-green-500 group-hover:text-white' : 'bg-gold/20 text-gold-dark dark:text-gold group-hover:bg-gold group-hover:text-black'}
      `}>
        <i className={`${action.icon}`}></i>
      </div>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white tracking-wide transition-colors duration-300">
        {action.label}
      </span>
    </a>
  );
};

export default ActionButton;