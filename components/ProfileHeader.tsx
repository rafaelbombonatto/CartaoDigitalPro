import React from 'react';
import { ProfileData } from '../types';

interface ProfileHeaderProps {
  data: ProfileData;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ data }) => {
  return (
    <div className="flex flex-col items-center text-center mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <div className="relative group cursor-pointer mb-5">
        <div className="absolute -inset-1 bg-gradient-to-r from-gold via-white to-gold rounded-full opacity-75 blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <img 
          src={data.avatarUrl} 
          alt={data.name} 
          className="relative w-32 h-32 rounded-full object-cover border-[3px] border-gold shadow-2xl transform transition-transform duration-500 hover:scale-105 bg-gray-200"
        />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-wide mb-1 drop-shadow-lg transition-colors duration-300">
        {data.name}
      </h1>
      
      <h2 className="text-sm font-medium text-gold-dark dark:text-gold uppercase tracking-[0.2em] mb-1 transition-colors duration-300">
        {data.title}
      </h2>

      {data.document && data.document.value && (
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4 tracking-wider uppercase">
          {data.document.label}: {data.document.value}
        </p>
      )}
      
      <p className="text-gray-600 dark:text-gray-200 text-sm font-light max-w-xs leading-relaxed italic border-l-2 border-gold pl-4 text-left mx-4 bg-black/5 dark:bg-white/5 py-2 rounded-r-lg transition-colors duration-300">
        "{data.bio}"
      </p>
    </div>
  );
};

export default ProfileHeader;