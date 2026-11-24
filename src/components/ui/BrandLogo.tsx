import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animateEntrance?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  animateEntrance = false,
  className = ''
}) => {
  const sizeMap = {
    sm: { img: 'w-7 h-7', text: 'text-base sm:text-lg' },
    md: { img: 'w-8 h-8 sm:w-9 sm:h-9', text: 'text-lg sm:text-xl' },
    lg: { img: 'w-10 h-10 sm:w-11 sm:h-11', text: 'text-xl sm:text-2xl' },
    xl: { img: 'w-14 h-14 sm:w-16 sm:h-16', text: 'text-2xl sm:text-3xl' }
  };

  const currentSize = sizeMap[size];

  return (
    <div
      className={`flex items-center gap-2.5 sm:gap-3 group select-none ${
        animateEntrance ? 'animate-logo-entrance' : ''
      } ${className}`}
    >
      {/* Brand Emblem on solid black rounded-square badge so white triangles stay crisp in both themes */}
      <div
        className={`relative ${currentSize.img} rounded-xl overflow-hidden bg-black p-[3px] border border-[#232323] group-hover:border-[#B6FF2B] shadow-md transition-all duration-300 shrink-0 ${
          animateEntrance ? 'animate-emblem-entrance' : ''
        }`}
      >
        <img
          src="/assets/aistudio/image_a9a3bddd.png"
          alt="Darkvence Logo"
          className="w-full h-full object-contain rounded-lg"
        />
        {/* Soft lime ambient hover sheen */}
        <div className="absolute inset-0 bg-[#B6FF2B]/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg" />
      </div>

      {/* Typography - Pure DARKVENCE name */}
      {showText && (
        <span className={`${currentSize.text} font-black tracking-tight text-[#0A0A0A] dark:text-white font-display uppercase group-hover:text-[#B6FF2B] transition-colors whitespace-nowrap`}>
          DARKVENCE
        </span>
      )}
    </div>
  );
};
