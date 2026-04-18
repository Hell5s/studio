
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
      {/* Monograma Premium Estilizado - Tamanho Aumentado */}
      <div className={cn(
        "mb-3 flex h-14 w-14 md:h-20 md:w-20 items-center justify-center rounded-full border shadow-sm transition-all duration-700 group-hover:border-[#C7A17A] group-hover:shadow-2xl",
        colors.border,
        colors.bg
      )}>
        <svg viewBox="0 0 100 100" className="h-9 w-9 md:h-12 md:w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Círculo Interno Decorativo */}
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" className={colors.accent} />
          
          {/* Monograma TB (Serifado Luxo) */}
          <path 
            d="M32 35H55M43 35V65M38 65H48M52 45C58 45 62 48 62 52.5C62 57 58 60 52 60H43M52 60C60 60 64 63 64 67.5C64 72 60 75 52 75H43" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={colors.primary}
          />
          
          {/* Detalhe de Brilho de Boutique */}
          <circle cx="75" cy="25" r="2" fill="currentColor" className={cn("animate-pulse", colors.accent)} />
        </svg>
      </div>

      {/* Nome da Marca - Tipografia Imponente */}
      <div className={cn("flex flex-col items-center text-center", itemsStart && "items-start text-left")}>
        <h1 className={cn(
          "text-3xl md:text-5xl font-bold tracking-[0.05em] leading-none font-serif italic",
          colors.primary
        )}>
          Toda Bela
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <div className={cn("h-[1px] w-6 bg-current opacity-30", colors.accent)} />
          <p className={cn(
            "text-[9px] md:text-[11px] uppercase font-bold tracking-[0.7em]",
            colors.accent
          )}>
            Moda Feminina
          </p>
          <div className={cn("h-[1px] w-6 bg-current opacity-30", colors.accent)} />
        </div>
      </div>
    </div>
  );
}
