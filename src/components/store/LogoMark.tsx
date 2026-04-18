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
      {/* Monograma Premium */}
      <div className={cn(
        "mb-2 flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-full border shadow-sm transition-all duration-700 group-hover:border-[#C7A17A] group-hover:shadow-xl",
        colors.border,
        colors.bg
      )}>
        <svg viewBox="0 0 100 100" className="h-6 w-6 md:h-8 md:w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Círculo Interno Decorativo */}
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" className={colors.accent} />
          
          {/* Monograma TB Estilizado (Serifado Luxo) */}
          <path 
            d="M35 35H55M45 35V65M40 65H50M55 45C60 45 63 48 63 52.5C63 57 60 60 55 60H45M55 60C62 60 65 63 65 67.5C65 72 62 75 55 75H45" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="serif" 
            strokeLinejoin="round"
            className={colors.primary}
          />
          
          {/* Detalhe de Brilho */}
          <circle cx="75" cy="25" r="1.5" fill="currentColor" className={cn("animate-pulse", colors.accent)} />
        </svg>
      </div>

      {/* Nome da Marca com Tipografia Editorial */}
      <div className={cn("flex flex-col items-center text-center", itemsStart && "items-start text-left")}>
        <h1 className={cn(
          "text-xl md:text-3xl font-bold tracking-[0.05em] leading-none font-serif italic",
          colors.primary
        )}>
          Toda Bela
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <div className={cn("h-[1px] w-4 bg-current opacity-30", colors.accent)} />
          <p className={cn(
            "text-[7px] md:text-[9px] uppercase font-bold tracking-[0.6em]",
            colors.accent
          )}>
            Moda Feminina
          </p>
          <div className={cn("h-[1px] w-4 bg-current opacity-30", colors.accent)} />
        </div>
      </div>
    </div>
  );
}
