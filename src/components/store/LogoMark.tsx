
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
        <div className="relative flex h-10 w-10 md:h-16 md:w-16 items-center justify-center rounded-full bg-white shadow-editorial border border-primary/5 transition-all duration-700 group-hover:shadow-premium group-hover:scale-110 group-hover:-translate-y-1 overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} className="w-full h-full object-contain p-2" alt={brandName} />
          ) : (
            <>
              {/* Luxury Ornamental Rings */}
              <div className="absolute inset-[3px] rounded-full border-[0.5px] border-accent/30" />
              <div className="absolute inset-[6px] rounded-full border-[0.5px] border-dotted border-primary/10 animate-spin-slow group-hover:border-accent/50" />
              
              {/* Premium Monogram Seal */}
              <svg viewBox="0 0 100 100" className="h-6 w-6 md:h-10 md:w-10 relative z-10" fill="none">
                <defs>
                  <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C7A17A" />
                    <stop offset="50%" stopColor="#E5C9A9" />
                    <stop offset="100%" stopColor="#C7A17A" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Stylized Interlocking 'T' */}
                <path
                  d="M30 35H70V38H51.5V72H48.5V38H30V35Z"
                  fill="#6E3C47"
                  className="transition-all duration-700 group-hover:fill-black"
                />
                
                {/* Artistic Curvy 'B' with Gold Gradient */}
                <path
                  d="M45 42C55 42 65 45 65 52C65 57 60 59 55 60C62 62 68 67 68 74C68 82 58 86 45 86H38V42H45ZM45 61C52 61 58 59 58 52C58 46 52 45 45 45H42V61H45ZM45 83C53 83 61 80 61 74C61 68 53 64 45 64H42V83H45Z"
                  fill="url(#gold-gradient)"
                  fillOpacity="0.85"
                  className="transition-all duration-1000 group-hover:translate-x-1"
                />
                
                {/* Decorative Diamond Dot */}
                <rect x="48.5" y="31" width="3" height="3" transform="rotate(45 50 32.5)" fill="#C7A17A" className="animate-pulse" />
              </svg>
            </>
          )}
        </div>
      </span>

      <div className="flex flex-col min-w-0">
        <h1 className="font-headline text-lg md:text-4xl font-bold tracking-tighter text-primary leading-[0.8] transition-colors duration-700 group-hover:text-black truncate">
          {brandName.split(' ')[0]} <span className="italic font-light text-accent">{brandName.split(' ').slice(1).join(' ')}</span>
        </h1>
        <p className="text-[7px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.6em] text-accent font-black whitespace-nowrap mt-0.5 transition-all duration-500 group-hover:tracking-[0.7em]">
          {brandSubtitle}
        </p>
      </div>
    </div>
  );
}
