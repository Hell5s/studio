
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <div className={cn("flex flex-col items-center group cursor-pointer", className)}>
      <div className="relative flex items-center justify-center mb-4">
        {/* Luxury Monogram Container */}
        <div className="relative h-20 w-20 md:h-24 md:w-24 flex items-center justify-center">
          {/* Animated Delicate Outer Ring */}
          <div className="absolute inset-0 rounded-full border-[0.5px] border-accent/20 animate-[spin_30s_linear_infinite]" />
          
          {/* Inner Sophisticated Ring */}
          <div className="absolute inset-2 rounded-full border-[1.5px] border-accent/40 flex items-center justify-center bg-white shadow-2xl shadow-primary/5 group-hover:border-accent group-hover:scale-105 transition-all duration-700 ease-out">
            <div className="text-center relative">
              <span className="block text-4xl md:text-5xl font-serif font-light text-primary leading-none tracking-tighter">
                T<span className="text-accent italic font-normal -ml-1">B</span>
              </span>
              {/* Subtle Gold Dot */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-accent" />
            </div>
          </div>
          
          {/* Floating Luxury Ornaments */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 h-2 w-2 rounded-full bg-accent shadow-lg border-2 border-white" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 h-2 w-2 rounded-full bg-accent shadow-lg border-2 border-white" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-4xl font-serif font-bold tracking-[0.15em] text-primary uppercase leading-none">
          Toda Bela
        </h1>
        <div className="flex items-center justify-center gap-4">
          <div className="h-[0.5px] w-12 bg-accent/30" />
          <p className="text-[10px] md:text-[11px] uppercase font-bold tracking-[0.6em] text-accent whitespace-nowrap">
            Maison de Mode
          </p>
          <div className="h-[0.5px] w-12 bg-accent/30" />
        </div>
      </div>
    </div>
  );
}
