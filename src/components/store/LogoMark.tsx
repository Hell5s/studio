
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <div className={cn("flex items-center gap-3 md:gap-8 group cursor-pointer select-none", className)}>
      {/* Icone Monograma de Luxo */}
      <div className="relative flex h-12 w-12 md:h-16 md:w-16 items-center justify-center shrink-0">
        {/* Glow Aura */}
        <div className="absolute inset-0 rounded-full bg-accent/5 scale-50 opacity-0 group-hover:scale-150 group-hover:opacity-100 transition-all duration-1000 ease-out blur-2xl" />
        
        {/* Monogram Seal */}
        <div className="relative flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-full bg-white shadow-premium border border-primary/5 transition-all duration-700 group-hover:-translate-y-1">
          <svg viewBox="0 0 100 100" className="h-6 w-6 md:h-8 md:w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M30 35C30 35 45 25 50 45C55 65 70 55 70 55"
              stroke="#6E3C47"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="group-hover:stroke-primary transition-colors duration-700"
            />
            <path
              d="M40 30V70M30 70H50M50 30H70"
              stroke="#C7A17A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="1 3"
            />
            <circle 
              cx="50" 
              cy="50" 
              r="48" 
              stroke="url(#goldGradient)" 
              strokeWidth="0.5" 
              strokeDasharray="4 12" 
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

      {/* Logotipo Editorial */}
      <div className="flex flex-col text-left">
        <div className="relative">
          <h1 className="font-headline text-2xl md:text-4xl font-bold tracking-tight text-primary leading-none transition-all duration-700 group-hover:text-black">
            Toda <span className="italic font-light text-accent">Bela</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3 mt-1">
          <div className="h-[0.5px] w-6 bg-accent/30 group-hover:w-10 group-hover:bg-accent/60 transition-all duration-700" />
          <p className="text-[7px] md:text-[8px] uppercase tracking-[0.5em] text-accent font-bold group-hover:text-primary transition-colors duration-700">
            MODA FEMININA
          </p>
        </div>
      </div>
    </div>
  );
}

