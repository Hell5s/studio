
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <div className={cn("flex items-center gap-4 group cursor-pointer", className)}>
      <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-premium border border-primary/5 transition-transform duration-700 group-hover:-translate-y-1">
        <svg viewBox="0 0 100 100" className="h-8 w-8" fill="none">
          <circle cx="50" cy="50" r="45" stroke="#C7A17A" strokeWidth="2" strokeDasharray="2 4" />
          <path
            d="M35 40C35 36.6 37.6 34 41 34H65C68.4 34 71 36.6 71 40V42C71 45.4 68.4 48 65 48H56V80H44V48H41C37.6 48 35 45.4 35 42V40Z"
            fill="#6E3C47"
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <h1 className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-primary leading-none">
          Toda <span className="italic font-light text-accent">Bela</span>
        </h1>
        <p className="text-[7px] uppercase tracking-[0.4em] text-accent font-bold mt-1">
          MODA FEMININA
        </p>
      </div>
    </div>
  );
}
