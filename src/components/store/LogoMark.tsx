import React from 'react';
import { Sparkles } from 'lucide-react';

export function LogoMark() {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="relative flex h-10 w-10 items-center justify-center">
        <div className="absolute inset-0 bg-primary/10 rounded-full group-hover:scale-125 transition-transform duration-700 ease-out" />
        <div className="relative bg-white h-8 w-8 rounded-full flex items-center justify-center shadow-sm border border-primary/5">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="flex flex-col">
        <h1 className="text-xl font-headline font-black tracking-tight text-primary leading-none">Toda Bela</h1>
        <p className="text-[8px] uppercase font-bold tracking-[0.5em] text-accent mt-0.5 ml-0.5">Maison de Mode</p>
      </div>
    </div>
  );
}