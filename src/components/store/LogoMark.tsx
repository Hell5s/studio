"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <div className={cn("flex flex-col items-center group cursor-pointer", className)}>
      <div className="relative flex items-center justify-center mb-2">
        {/* Monograma Sofisticado */}
        <div className="relative h-14 w-14 md:h-16 md:w-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[0.5px] border-accent/20 animate-[spin_40s_linear_infinite]" />
          <div className="absolute inset-1 rounded-full border-[1.5px] border-accent/40 flex items-center justify-center bg-white shadow-sm group-hover:border-accent group-hover:shadow-md transition-all duration-700">
            <span className="text-2xl md:text-3xl font-serif font-light text-primary leading-none tracking-tighter">
              T<span className="text-accent italic font-normal -ml-0.5">B</span>
            </span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-xl md:text-2xl font-serif font-bold tracking-[0.2em] text-primary uppercase leading-none">
          Toda Bela
        </h1>
      </div>
    </div>
  );
}
