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
    border: isWhite ? 'border-white/20' : 'border-[#F7E8EA]',
  };

  if (isIcon) {
    return (
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF9F7] border border-[#F7E8EA] shadow-sm", className)}>
        <svg viewBox="0 0 100 100" className="h-6 w-6" fill="none">
          <circle cx="50" cy="50" r="45" stroke="#C7A17A" strokeWidth="2" />
          <path 
            d="M35 35H65M50 35V65M40 65H60" 
            stroke="#6E3C47" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center group cursor-pointer transition-all duration-500", className)}>
      <div className="flex items-center gap-4">
        {/* Monograma Sofisticado */}
        <div className="hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-[#C7A17A]/30 bg-white shadow-sm group-hover:border-[#C7A17A] transition-colors duration-500">
          <span className={cn("text-xs font-bold tracking-tighter", colors.primary)}>TB</span>
        </div>
        
        <div className="flex flex-col items-center md:items-start">
          <h1 className={cn(
            "text-3xl md:text-4xl font-bold tracking-tight leading-none transition-transform duration-500 group-hover:scale-[1.02]",
            colors.primary,
            "font-serif" // Assume-se que a fonte serifada está configurada ou cairá para o sistema
          )}>
            Toda Bela
          </h1>
          <div className="flex items-center gap-2 mt-1 w-full justify-center md:justify-start">
            <div className="h-[1px] w-4 bg-[#C7A17A]/40" />
            <p className={cn(
              "text-[9px] uppercase font-bold tracking-[0.4em]",
              colors.accent
            )}>
              Maison
            </p>
            <div className="h-[1px] w-4 bg-[#C7A17A]/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
