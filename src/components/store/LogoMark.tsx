
import React from 'react';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
  variant?: 'default' | 'white' | 'dark' | 'icon';
  className?: string;
}

/**
 * Toda Bela - Maison de Mode
 * Uma logo premium que equilibra o clássico editorial com o minimalismo moderno.
 */
export function LogoMark({ variant = 'default', className }: LogoMarkProps) {
  const isWhite = variant === 'white';
  const isIcon = variant === 'icon';

  const colors = {
    primary: isWhite ? 'text-white' : 'text-primary',
    accent: isWhite ? 'text-white/80' : 'text-accent',
    border: isWhite ? 'border-white/30' : 'border-accent/30',
    line: isWhite ? 'bg-white/40' : 'bg-accent/40',
  };

  if (isIcon) {
    return (
      <div className={cn("relative flex h-16 w-16 items-center justify-center group", className)}>
        {/* Outer Fine Seal */}
        <div className={cn(
          "absolute inset-0 border-[1px] rounded-full transition-transform duration-1000 group-hover:rotate-90",
          colors.border
        )} />
        {/* Inner Monogram */}
        <div className="relative flex flex-col items-center">
          <span className={cn(
            "text-xl font-headline font-bold tracking-tighter leading-none",
            colors.primary
          )}>
            TB
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center group cursor-pointer", className)}>
      {/* Monogram Seal - Premium Floating Element */}
      <div className="relative flex h-16 w-16 items-center justify-center mb-4">
        <div className={cn(
          "absolute inset-0 border-[1px] rounded-full scale-100 group-hover:scale-110 transition-transform duration-1000 ease-out",
          colors.border
        )} />
        <div className={cn(
          "absolute inset-1 border-[1px] rounded-full opacity-30 group-hover:rotate-45 transition-transform duration-1000",
          colors.border
        )} />
        <div className="relative flex flex-col items-center justify-center">
          <span className={cn(
            "text-lg font-headline font-bold tracking-tighter leading-none",
            colors.primary
          )}>
            TB
          </span>
        </div>
      </div>
      
      {/* Brand Typography - Editorial Presence */}
      <div className="flex flex-col items-center space-y-2">
        <h1 className={cn(
          "text-4xl md:text-5xl font-headline font-bold tracking-tight leading-none transition-colors",
          colors.primary
        )}>
          Toda Bela
        </h1>
        <div className="flex items-center gap-4">
          <div className={cn("h-[1px] w-6", colors.line)} />
          <p className={cn(
            "text-[10px] uppercase font-bold tracking-[0.6em] whitespace-nowrap",
            colors.accent
          )}>
            Maison de Mode
          </p>
          <div className={cn("h-[1px] w-6", colors.line)} />
        </div>
      </div>
    </div>
  );
}
