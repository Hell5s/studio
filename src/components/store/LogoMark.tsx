
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <div className={cn("flex items-center gap-3 md:gap-6 group cursor-pointer select-none", className)}>
      {/* Icone Monograma de Luxo */}
      <div className="relative flex h-14 w-14 md:h-20 md:w-20 items-center justify-center shrink-0">
        {/* Aura de Brilho de Fundo (Apenas no Hover) */}
        <div className="absolute inset-0 rounded-full bg-accent/5 scale-50 opacity-0 group-hover:scale-125 group-hover:opacity-100 transition-all duration-1000 ease-out blur-xl" />
        
        {/* Selo Externo Decorativo */}
        <div className="absolute inset-0 rounded-full border border-accent/10 scale-90 group-hover:scale-105 transition-transform duration-700 ease-out" />
        
        {/* Container Principal do Monograma */}
        <div className="relative flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-full bg-white shadow-sm border border-primary/5 transition-all duration-700 group-hover:shadow-md group-hover:-translate-y-1">
          <svg viewBox="0 0 100 100" className="h-5 w-5 md:h-8 md:w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M35 30H65M50 30V70M40 70H60"
              stroke="#6E3C47"
              strokeWidth="3"
              strokeLinecap="round"
              className="group-hover:stroke-primary transition-colors duration-700"
            />
            <path
              d="M50 45C68 45 78 52 78 62C78 72 68 78 50 78"
              stroke="#C7A17A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="1 2"
            />
            <circle 
              cx="50" 
              cy="50" 
              r="46" 
              stroke="url(#goldGradient)" 
              strokeWidth="0.75" 
              strokeDasharray="2 8" 
              className="animate-spin-slow" 
            />
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C7A17A" />
                <stop offset="50%" stopColor="#F7E8EA" />
                <stop offset="100%" stopColor="#C7A17A" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Logotipo em Texto Editorial */}
      <div className="flex flex-col text-left">
        <div className="relative">
          <h1 className="font-headline text-3xl md:text-5xl font-bold tracking-tight text-primary leading-none mb-0.5 md:mb-1 transition-all duration-700 group-hover:text-black">
            Toda <span className="italic font-light text-accent/90">Bela</span>
          </h1>
          <div className="absolute -left-1.5 md:-left-2 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-accent/40 group-hover:h-6 md:group-hover:h-8 transition-all duration-700" />
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          <div className="h-[0.5px] w-5 md:w-8 bg-accent/20 group-hover:w-12 group-hover:bg-accent/40 transition-all duration-700" />
          <p className="text-[7px] md:text-[9px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-accent/70 font-semibold group-hover:text-accent transition-colors">
            MODA FEMININA
          </p>
        </div>
      </div>
    </div>
  );
}
