import React from 'react';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
  variant?: 'default' | 'white' | 'dark' | 'icon';
  className?: string;
}

export function LogoMark({ variant = 'default', className }: LogoMarkProps) {
  const isWhite = variant === 'white';
  
  const colors = {
    primary: isWhite ? 'text-white' : 'text-[#6E3C47]',
    accent: isWhite ? 'text-white/80' : 'text-[#C7A17A]',
    border: isWhite ? 'border-white/20' : 'border-[#F7E8EA]',
    bg: isWhite ? 'bg-white/10' : 'bg-white',
  };

  return (
    <div className={cn("flex flex-col items-center group cursor-pointer transition-all duration-700", className)}>
      {/* Selo Monogramático Refinado */}
      <div className={cn(
        "mb-2 flex h-14 w-14 items-center justify-center rounded-full border shadow-sm transition-transform duration-700 group-hover:rotate-[360deg]",
        colors.border,
        colors.bg
      )}>
        <svg viewBox="0 0 100 100" className="h-8 w-8" fill="none">
          <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" className={colors.accent} />
          <path 
            d="M35 35H65M50 35V65M42 65H58" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="serif" 
            className={colors.primary}
          />
          <text 
            x="50%" 
            y="52%" 
            dominantBaseline="middle" 
            textAnchor="middle" 
            className={cn("font-serif text-[10px] font-light italic", colors.accent)}
          >
            TB
          </text>
        </svg>
      </div>

      {/* Logotipo */}
      <div className="flex flex-col items-center text-center">
        <h1 className={cn(
          "text-3xl md:text-4xl font-bold tracking-tight leading-none transition-all duration-500 group-hover:tracking-widest font-serif",
          colors.primary
        )}>
          Toda Bela
        </h1>
        <div className="flex items-center gap-3 mt-2 w-full justify-center opacity-80">
          <div className="h-[0.5px] w-6 bg-[#C7A17A]/40" />
          <p className={cn(
            "text-[9px] uppercase font-bold tracking-[0.5em]",
            colors.accent
          )}>
            Moda Feminina
          </p>
          <div className="h-[0.5px] w-6 bg-[#C7A17A]/40" />
        </div>
      </div>
    </div>
  );
}
