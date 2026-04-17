
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
    accent: isWhite ? 'text-white/80' : 'text-[#C7A17A]',
    border: isWhite ? 'border-white/20' : 'border-[#F7E8EA]',
    bg: isWhite ? 'bg-white/10' : 'bg-white',
  };

  return (
    <div className={cn(
      "flex flex-col items-center group cursor-pointer transition-all duration-700", 
      itemsStart && "items-start",
      className
    )}>
      {/* Monograma */}
      <div className={cn(
        "mb-1.5 md:mb-2 flex h-8 w-8 md:h-12 md:w-12 items-center justify-center rounded-full border shadow-sm transition-transform duration-700 group-hover:rotate-[360deg]",
        colors.border,
        colors.bg
      )}>
        <svg viewBox="0 0 100 100" className="h-5 w-5 md:h-7 md:w-7" fill="none">
          <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" className={colors.accent} />
          <text 
            x="50%" 
            y="52%" 
            dominantBaseline="middle" 
            textAnchor="middle" 
            className={cn("font-serif text-[18px] md:text-[22px] font-bold", colors.primary)}
          >
            TB
          </text>
        </svg>
      </div>

      {/* Nome */}
      <div className={cn("flex flex-col items-center text-center", itemsStart && "items-start text-left")}>
        <h1 className={cn(
          "text-xl md:text-3xl font-bold tracking-tight leading-none font-serif",
          colors.primary
        )}>
          Toda Bela
        </h1>
        <p className={cn(
          "text-[7px] md:text-[9px] uppercase font-bold tracking-[0.4em] md:tracking-[0.5em] mt-1",
          colors.accent
        )}>
          Moda Feminina
        </p>
      </div>
    </div>
  );
}
