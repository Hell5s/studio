
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <div className={cn("flex flex-col items-center group cursor-pointer", className)}>
      <div className="relative flex items-center justify-center mb-1">
        {/* Monograma Serifado de Alta Costura */}
        <div className="h-14 w-14 md:h-16 md:w-16 rounded-full border border-accent/20 flex items-center justify-center bg-white shadow-sm group-hover:border-accent group-hover:shadow-md transition-all duration-700">
          <span className="text-2xl md:text-3xl font-serif font-bold text-[#6E3C47] tracking-tighter">
            TB
          </span>
        </div>
        {/* Detalhe Dourado */}
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent border-2 border-white shadow-sm" />
      </div>

      <div className="text-center">
        <h1 className="text-xl md:text-2xl font-bold tracking-[0.05em] leading-tight font-serif text-[#6E3C47]">
          Toda Bela
        </h1>
        <p className="text-[8px] md:text-[9px] uppercase font-bold tracking-[0.4em] text-accent opacity-80">
          MAISON DE MODE
        </p>
      </div>
    </div>
  );
}
