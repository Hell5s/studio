
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <div className={cn("flex items-center gap-4 group cursor-pointer", className)}>
      {/* Selo Monograma Premium */}
      <div className="relative flex h-14 w-14 items-center justify-center">
        {/* Círculo Externo com Efeito de Anel */}
        <div className="absolute inset-0 rounded-full border border-accent/30 scale-100 group-hover:scale-110 transition-transform duration-700" />
        
        {/* Círculo Interno Principal */}
        <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_4px_20px_-4px_rgba(110,60,71,0.15)] border border-primary/5 transition-all duration-500 group-hover:shadow-[0_8px_30px_-4px_rgba(199,161,122,0.3)]">
          <svg viewBox="0 0 100 100" className="h-6 w-6" fill="none">
            {/* Monograma Estilizado */}
            <path
              d="M35 30H65M50 30V75M40 75H60"
              stroke="#6E3C47"
              strokeWidth="4"
              strokeLinecap="serif"
            />
            <path
              d="M30 40C30 35 35 30 40 30M60 30C65 30 70 35 70 40M70 65C70 70 65 75 60 75M40 75C35 75 30 70 30 65"
              stroke="#C7A17A"
              strokeWidth="2"
              strokeDasharray="2 4"
            />
          </svg>
        </div>
      </div>

      {/* Logotipo Textual Editorial */}
      <div className="flex flex-col text-left">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-primary leading-none mb-1">
          Toda <span className="italic font-light text-accent">Bela</span>
        </h1>
        <div className="flex items-center gap-2">
          <div className="h-px w-4 bg-accent/40" />
          <p className="text-[9px] uppercase tracking-[0.45em] text-accent font-bold">
            Moda Feminina
          </p>
        </div>
      </div>
    </div>
  );
}
