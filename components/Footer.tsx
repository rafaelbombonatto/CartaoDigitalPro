import React from 'react';
import { SocialLink } from '../types';

interface FooterProps {
  links: SocialLink[];
}

const Footer: React.FC<FooterProps> = ({ links }) => {
  // Only show links that have a valid URL starting with http:// or https://
  const activeLinks = links.filter(link => 
    link.url && (link.url.startsWith('http://') || link.url.startsWith('https://'))
  );

  return (
    <footer className="mt-auto pt-6 pb-4 border-t border-black/10 dark:border-white/10 w-full animate-slide-up transition-colors duration-300" style={{ animationDelay: '0.7s' }}>
      <div className="flex justify-center gap-6 mb-4">
        {activeLinks.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="text-gray-500 dark:text-gray-400 hover:text-gold-dark dark:hover:text-gold transition-colors duration-300 transform hover:scale-125 hover:-translate-y-1"
          >
            <i className={`${link.icon} text-xl`}></i>
          </a>
        ))}
      </div>
      <div className="text-center text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors duration-300">
        &copy; {new Date().getFullYear()} LuxeCard Design.
      </div>
    </footer>
  );
};

export default Footer;