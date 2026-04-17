
import React from 'react';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
  variant?: 'default' | 'white' | 'dark' | 'icon';
  className?: string;
}

export function LogoMark({ variant = 'default', className }: LogoMarkProps) {
  const isWhite = variant === 'white';
  const isIcon = variant === 'icon';

  const colors = {
    primary: isWhite ? 'text-white' : 'text-[#6E3C47]',
    accent: isWhite ? 'text-white/80' : 'text-[#C7A17A]',
  };

  if (isIcon) {
    return (
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF9F7] border border-[#F7E8EA]", className)}>
        <span className={cn("text-xl font-bold", colors.primary)}>T</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center group cursor-pointer", className)}>
      <h1 className={cn(
        "text-3xl md:text-4xl font-bold tracking-tighter leading-none transition-transform duration-500 group-hover:scale-105",
        colors.primary
      )}>
        Toda Bela
      </h1>
      <p className={cn(
        "text-[10px] uppercase font-bold tracking-[0.3em] mt-1",
        colors.accent
      )}>
        Moda Feminina
      </p>
    </div>
  );
}
