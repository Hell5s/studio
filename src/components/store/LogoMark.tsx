
"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className }: LogoMarkProps) {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc(settingsRef);

  const brandName = settings?.brandName || 'Toda Bela';
  const brandSubtitle = settings?.brandSubtitle || 'Moda feminina';
  const logoUrl = settings?.headerLogoUrl;

  return (
    <div className={cn("flex items-center gap-2 md:gap-5 group cursor-pointer", className)}>
      {/* Container da bolinha ou imagem customizada */}
      <span id="logo-ball" className="transition-all duration-500 block shrink-0">
        <div className="relative flex h-10 w-10 md:h-16 md:w-16 items-center justify-center rounded-full bg-white shadow-editorial border border-primary/5 transition-all duration-500 group-hover:shadow-premium group-hover:scale-105 group-hover:-translate-y-1 overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} className="w-full h-full object-contain p-2" alt={brandName} />
          ) : (
            <>
              {/* Outer decorative ring - Luxury Watch Style */}
              <div className="absolute inset-[2px] rounded-full border border-primary/5" />
              <div className="absolute inset-[4px] rounded-full border border-dashed border-accent/20 animate-spin-slow group-hover:border-accent/40" />
              
              {/* Monogram Seal - Premium Fashion Monogram */}
              <svg viewBox="0 0 100 100" className="h-7 w-7 md:h-11 md:w-11 relative z-10" fill="none">
                {/* Subtle gradient definition */}
                <defs>
                  <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6E3C47" />
                    <stop offset="100%" stopColor="#C7A17A" />
                  </linearGradient>
                </defs>

                {/* Stylized 'T' - elegant thin lines */}
                <path
                  d="M32 38H68V40.5H51.5V70H48.5V40.5H32V38Z"
                  fill="#6E3C47"
                  className="transition-colors duration-700 group-hover:fill-black"
                />
                
                {/* Stylized 'B' - artistic overlapping curve */}
                <path
                  d="M48 45C58 45 64 49 64 54C64 57.5 61 60 57 61C61.5 62.5 65 66 65 71C65 77 59 81 48 81H40V45H48Z"
                  fill="url(#logo-grad)"
                  fillOpacity="0.4"
                  className="mix-blend-multiply transition-all duration-1000 group-hover:translate-x-1.5 group-hover:opacity-60"
                />
                
                {/* Center dot - Focal point */}
                <circle cx="50" cy="40" r="1.5" fill="#C7A17A" className="animate-pulse" />
              </svg>
            </>
          )}
        </div>
      </span>

      <div className="flex flex-col min-w-0">
        <h1 className="font-headline text-lg md:text-4xl font-bold tracking-tighter text-primary leading-[0.8] transition-colors duration-700 group-hover:text-black truncate">
          {brandName.split(' ')[0]} <span className="italic font-light text-accent">{brandName.split(' ').slice(1).join(' ')}</span>
        </h1>
        <p className="text-[7px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.6em] text-accent font-black whitespace-nowrap mt-0.5">
          {brandSubtitle}
        </p>
      </div>
    </div>
  );
}
