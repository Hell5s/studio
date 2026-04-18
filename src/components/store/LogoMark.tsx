
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <div className={cn("flex items-center gap-3 group cursor-pointer", className)}>
      <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[#E9D7DB] bg-white shadow-sm transition-all group-hover:border-accent">
        <svg viewBox="0 0 120 120" className="h-7 w-7" fill="none">
          <circle cx="60" cy="60" r="42" stroke="#C7A17A" strokeWidth="4" />
          <path
            d="M44 39C44 35.6863 46.6863 33 50 33H70C73.3137 33 76 35.6863 76 39V41C76 44.3137 73.3137 47 70 47H64V83H56V47H50C46.6863 47 44 44.3137 44 41V39Z"
            fill="#6E3C47"
          />
        </svg>
      </div>
      <div className="leading-none text-left">
        <p className="text-3xl font-semibold tracking-[-0.05em] text-[#6E3C47]">Toda Bela</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-[#C7A17A]">Moda Feminina</p>
      </div>
    </div>
  );
}
