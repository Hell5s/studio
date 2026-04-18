
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
  variant?: 'default' | 'white';
  className?: string;
  itemsStart?: boolean;
}

export function LogoMark({ variant = 'default', className, itemsStart }: LogoMarkProps) {
  const isWhite = variant === 'white';
  
  const colors = {
    primary: isWhite ? 'text-white' : 'text-[#6E3C47]',
    accent: isWhite ? 'text-white/60' : 'text-[#C7A17A]',
  };

  return (
    <div className={cn(
      "flex items-center gap-3 group cursor-pointer transition-all duration-700", 
      className
    )}>
      {/* Ícone Minimalista Estilo Selo */}
      <div className="relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border border-[#F7E8EA] bg-white shadow-sm group-hover:border-[#C7A17A] transition-all duration-700">
        <svg viewBox="0 0 100 100" className="h-6 w-6 md:h-7 md:w-7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M30 40C30 30 40 25 50 25C60 25 70 30 70 40C70 50 60 55 50 55M50 55V75M40 75H60" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            className={colors.primary}
          />
          <circle cx="75" cy="25" r="2" fill="currentColor" className={colors.accent} />
        </svg>
      </div>

      {/* Tipografia Editorial */}
      <div className={cn("flex flex-col", itemsStart ? "items-start" : "items-center")}>
        <h1 className={cn(
          "text-xl md:text-2xl font-bold tracking-[0.02em] leading-tight font-serif",
          colors.primary
        )}>
          Toda Bela
        </h1>
        <p className={cn(
          "text-[8px] md:text-[9px] uppercase font-bold tracking-[0.4em] opacity-80",
          colors.accent
        )}>
          MAISON DE MODE
        </p>
      </div>
    </div>
  );
}
