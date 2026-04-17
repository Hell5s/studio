import React from 'react';
import { Sparkles } from 'lucide-react';

export function LogoMark() {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className="absolute inset-0 bg-primary rounded-full opacity-20 group-hover:scale-110 transition-transform duration-500" />
        <div className="relative bg-white h-10 w-10 rounded-full flex items-center justify-center shadow-sm border border-primary/20">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
      </div>
      <div className="flex flex-col">
        <h1 className="text-xl font-headline font-bold tracking-tight text-foreground leading-none">Encanto Kids</h1>
        <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-primary mt-1">Mundo Mágico</p>
      </div>
    </div>
  );
}