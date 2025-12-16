import React from 'react';

interface BackgroundProps {
  imageUrl: string;
}

const Background: React.FC<BackgroundProps> = ({ imageUrl }) => {
  return (
    <>
      {/* Background Image - Fixed position behind content */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transform scale-105 transition-all duration-700"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      />
      {/* Dynamic Overlay - Reduced opacity so the house is clearly visible */}
      <div className="fixed inset-0 z-0 bg-white/30 dark:bg-black/30 backdrop-blur-[1px] transition-colors duration-500" />
    </>
  );
};

export default Background;