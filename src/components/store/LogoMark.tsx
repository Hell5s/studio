
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <div className={cn("flex items-center gap-5 group cursor-pointer select-none", className)}>
      {/* Premium Seal Monogram */}
      <div className="relative flex h-16 w-16 items-center justify-center">
        {/* Decorative Outer Aura */}
        <div className="absolute inset-0 rounded-full border border-accent/20 scale-100 group-hover:scale-110 transition-transform duration-1000 ease-out" />
        
        {/* Main Monogram Container */}
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_10px_40px_-10px_rgba(110,60,71,0.15)] border border-primary/5 transition-all duration-700 group-hover:shadow-[0_15px_50px_-10px_rgba(199,161,122,0.3)]">
          <svg viewBox="0 0 100 100" className="h-7 w-7" fill="none">
            {/* Architectural 'T' & 'B' Monogram */}
            <path
              d="M30 35H70M50 35V75"
              stroke="#6E3C47"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="group-hover:stroke-accent transition-colors duration-700"
            />
            <path
              d="M50 45C65 45 75 50 75 60C75 70 65 75 50 75"
              stroke="#C7A17A"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Spinning dotted ring for premium feel */}
            <circle 
              cx="50" 
              cy="50" 
              r="48" 
              stroke="#C7A17A" 
              strokeWidth="0.5" 
              strokeDasharray="1 6" 
              className="animate-spin-slow" 
            />
          </svg>
        </div>
      </div>

      {/* Editorial Text Logo */}
      <div className="flex flex-col text-left">
        <h1 className="font-headline text-4xl font-bold tracking-[-0.03em] text-primary leading-none mb-1.5 transition-colors group-hover:text-black">
          Toda <span className="italic font-light text-accent/90">Bela</span>
        </h1>
        <div className="flex items-center gap-3">
          <div className="h-[0.5px] w-6 bg-accent/30 group-hover:w-10 transition-all duration-700" />
          <p className="text-[10px] uppercase tracking-[0.6em] text-accent/80 font-medium">
            MAISON
          </p>
        </div>
      </div>
    </div>
  );
}
