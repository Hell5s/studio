import React from 'react';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
  variant?: 'default' | 'white' | 'dark' | 'icon';
  className?: string;
}

export function LogoMark({ variant = 'default', className }: LogoMarkProps) {
  const isWhite = variant === 'white';
  const isIcon = variant === 'icon';

  const colors = {
    primary: isWhite ? 'text-white' : 'text-[#6E3C47]',
    accent: isWhite ? 'text-white/80' : 'text-[#C7A17A]',
  };

  if (isIcon) {
    return (
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-full bg-white border border-[#F7E8EA] shadow-sm", className)}>
        <svg viewBox="0 0 100 100" className="h-6 w-6" fill="none">
          <circle cx="50" cy="50" r="45" stroke="#C7A17A" strokeWidth="1.5" />
          <path 
            d="M35 35H65M50 35V65M40 65H60" 
            stroke="#6E3C47" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center group cursor-pointer transition-all duration-500", className)}>
      <div className="flex flex-col items-center">
        <h1 className={cn(
          "text-3xl md:text-4xl font-bold tracking-tight leading-none transition-transform duration-500 group-hover:scale-[1.02] font-serif",
          colors.primary
        )}>
          Toda Bela
        </h1>
        <div className="flex items-center gap-2 mt-1 w-full justify-center">
          <div className="h-[0.5px] w-4 bg-[#C7A17A]/40" />
          <p className={cn(
            "text-[9px] uppercase font-bold tracking-[0.4em]",
            colors.accent
          )}>
            Moda Feminina
          </p>
          <div className="h-[0.5px] w-4 bg-[#C7A17A]/40" />
        </div>
      </div>
    </div>
  );
}
