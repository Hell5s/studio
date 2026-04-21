"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <div className={cn("flex items-center gap-2 md:gap-5 group cursor-pointer", className)}>
      <div className="relative flex h-10 w-10 md:h-16 md:w-16 items-center justify-center rounded-full bg-white shadow-editorial border border-primary/5 transition-all duration-1000 group-hover:shadow-premium group-hover:scale-105 group-hover:-translate-y-1 shrink-0">
        {/* Animated decorative jewelry ring */}
        <div className="absolute inset-[2px] rounded-full border border-dashed border-accent/20 animate-spin-slow group-hover:border-accent/50" />
        
        {/* Monogram Seal */}
        <svg viewBox="0 0 100 100" className="h-6 w-6 md:h-10 md:w-10 relative z-10" fill="none">
          {/* Stylized 'T' */}
          <path
            d="M32 32H68V36H52V72H48V36H32V32Z"
            fill="#6E3C47"
            className="transition-colors duration-700 group-hover:fill-accent"
          />
          {/* Stylized 'B' */}
          <path
            d="M52 42H64C69.5 42 74 46.5 74 52C74 55.8 71.5 59 68 60.5C71.5 62 74 65.2 74 69C74 74.5 69.5 79 64 79H48V42H52Z"
            fill="#C7A17A"
            className="opacity-60 mix-blend-multiply transition-all duration-1000 group-hover:translate-x-1 group-hover:opacity-90"
          />
          <circle cx="50" cy="50" r="48" stroke="#C7A17A" strokeWidth="0.5" strokeOpacity="0.2" />
        </svg>
      </div>

      <div className="flex flex-col min-w-0">
        <h1 className="font-headline text-lg md:text-4xl font-bold tracking-tighter text-primary leading-[0.8] transition-colors duration-700 group-hover:text-black truncate">
          Toda <span className="italic font-light text-accent">Bela</span>
        </h1>
        <p className="text-[7px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.6em] text-accent font-black whitespace-nowrap mt-0.5">
          Moda feminina
        </p>
      </div>
    </div>
  );
}
