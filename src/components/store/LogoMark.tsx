import React from 'react';
import { Sparkles } from 'lucide-react';

export function LogoMark() {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="relative flex h-10 w-10 items-center justify-center">
        <div className="absolute inset-0 bg-primary rounded-full opacity-10 group-hover:scale-110 transition-transform duration-500" />
        <div className="relative bg-white h-8 w-8 rounded-full flex items-center justify-center shadow-sm border border-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="flex flex-col">
        <h1 className="text-lg font-headline font-bold tracking-tight text-foreground leading-none">Toda Bela</h1>
        <p className="text-[8px] uppercase font-bold tracking-[0.3em] text-primary/60 mt-0.5">Maison de Mode</p>
      </div>
    </div>
  );
}