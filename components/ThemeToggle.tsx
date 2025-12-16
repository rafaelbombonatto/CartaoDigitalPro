import React from 'react';

interface ThemeToggleProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="absolute top-4 right-4 z-50 p-2 rounded-full 
                 bg-black/5 dark:bg-white/10 
                 backdrop-blur-md 
                 border border-black/10 dark:border-white/20 
                 text-gold-dark dark:text-gold 
                 hover:bg-black/10 dark:hover:bg-white/20 
                 transition-all duration-300
                 shadow-lg"
      aria-label="Toggle Theme"
    >
      <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'} text-xl w-6 h-6 flex items-center justify-center`}></i>
    </button>
  );
};

export default ThemeToggle;