
import React from 'react';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
  variant?: 'default' | 'white' | 'dark' | 'icon';
  className?: string;
}

/**
 * Toda Bela - Maison de Mode
 * Versão Refinada: Monograma circular premium com tipografia serifada luxuosa.
 */
export function LogoMark({ variant = 'default', className }: LogoMarkProps) {
  const isWhite = variant === 'white';
  const isIcon = variant === 'icon';

  const colors = {
    primary: isWhite ? 'text-white' : 'text-primary',
    accent: isWhite ? 'text-white/80' : 'text-accent',
    border: isWhite ? 'border-accent/20' : 'border-accent/30',
  };

  if (isIcon) {
    return (
      <div className={cn("relative flex h-14 w-14 items-center justify-center group", className)}>
        <div className={cn(
          "absolute inset-0 border-[1px] rounded-full transition-transform duration-1000 group-hover:rotate-90",
          colors.border
        )} />
        <svg viewBox="0 0 120 120" className="h-7 w-7 relative z-10" fill="none">
          <circle cx="60" cy="60" r="42" stroke="currentColor" strokeWidth="2" className={cn(colors.accent)} />
          <path
            d="M44 39C44 35.6863 46.6863 33 50 33H70C73.3137 33 76 35.6863 76 39V41C76 44.3137 73.3137 47 70 47H64V83H56V47H50C46.6863 47 44 44.3137 44 41V39Z"
            fill="currentColor"
            className={cn(colors.primary)}
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-4 group cursor-pointer", className)}>
      {/* Monogram Seal */}
      <div className="relative flex h-14 w-14 items-center justify-center shrink-0">
        <div className={cn(
          "absolute inset-0 border-[1px] rounded-full scale-100 group-hover:scale-110 transition-transform duration-1000",
          colors.border
        )} />
        <svg viewBox="0 0 120 120" className="h-7 w-7 relative z-10" fill="none">
          <circle cx="60" cy="60" r="42" stroke="currentColor" strokeWidth="2" className={cn(colors.accent)} />
          <path
            d="M44 39C44 35.6863 46.6863 33 50 33H70C73.3137 33 76 35.6863 76 39V41C76 44.3137 73.3137 47 70 47H64V83H56V47H50C46.6863 47 44 44.3137 44 41V39Z"
            fill="currentColor"
            className={cn(colors.primary)}
          />
        </svg>
      </div>
      
      {/* Brand Typography */}
      <div className="flex flex-col">
        <h1 className={cn(
          "text-3xl md:text-4xl font-headline font-bold tracking-tighter leading-none transition-colors",
          colors.primary
        )}>
          Toda Bela
        </h1>
        <p className={cn(
          "text-[9px] uppercase font-bold tracking-[0.4em] mt-1.5",
          colors.accent
        )}>
          Maison de Mode
        </p>
      </div>
    </div>
  );
}
