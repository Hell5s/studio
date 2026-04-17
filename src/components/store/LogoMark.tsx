import React from 'react';
import { Sparkles } from 'lucide-react';

export function LogoMark() {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className="absolute inset-0 bg-primary rounded-full opacity-5 group-hover:scale-110 transition-transform duration-700" />
        <div className="relative bg-white h-10 w-10 rounded-full flex items-center justify-center shadow-md border border-primary/5">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="flex flex-col">
        <h1 className="text-2xl font-headline font-black tracking-tight text-primary leading-none">Toda Bela</h1>
        <p className="text-[9px] uppercase font-bold tracking-[0.4em] text-accent mt-1">Maison de Mode</p>
      </div>
    </div>
  );
}