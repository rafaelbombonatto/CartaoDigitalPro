import React from 'react';
import { SocialLink } from '../types';

interface FooterProps {
  links: SocialLink[];
  isDemo?: boolean;
}

const Footer: React.FC<FooterProps> = ({ links, isDemo = false }) => {
  // If Demo, show all links. If not, filter only valid ones.
  const activeLinks = isDemo 
    ? links 
    : links.filter(link => link.url && (link.url.startsWith('http://') || link.url.startsWith('https://')));

  const handleClick = (e: React.MouseEvent) => {
    if (isDemo) {
      e.preventDefault();
    }
  };

  return (
    <footer className="mt-auto pt-6 pb-4 border-t border-black/10 dark:border-white/10 w-full animate-slide-up transition-colors duration-300" style={{ animationDelay: '0.7s' }}>
      <div className="flex justify-center gap-6 mb-4">
        {activeLinks.map((link, idx) => (
          <a
            key={idx}
            href={isDemo ? '#' : link.url}
            target={isDemo ? undefined : "_blank"}
            rel="noopener noreferrer"
            onClick={handleClick}
            aria-label={link.label}
            className={`
                text-gray-500 dark:text-gray-400 
                ${!isDemo ? 'hover:text-gold-dark dark:hover:text-gold hover:scale-125 hover:-translate-y-1 cursor-pointer' : 'cursor-default opacity-70'}
                transition-all duration-300 transform
            `}
          >
            <i className={`${link.icon} text-xl`}></i>
          </a>
        ))}
      </div>
      <div className="text-center text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors duration-300">
        &copy; {new Date().getFullYear()} Meu Saas.
      </div>
    </footer>
  );
};

export default Footer;