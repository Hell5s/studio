
import React from 'react';
import { Star } from 'lucide-react';

export function LogoMark() {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className="absolute inset-0 bg-brand-sky rounded-2xl rotate-6 transition-transform group-hover:rotate-12 duration-500 opacity-20" />
        <div className="relative bg-white h-10 w-10 rounded-xl flex items-center justify-center shadow-sm border border-brand-sky/10">
          <Star className="h-6 w-6 text-brand-sky fill-brand-sky" />
        </div>
      </div>
      <div className="flex flex-col">
        <h1 className="text-xl font-headline font-bold tracking-tight text-brand-sky leading-none">Encanto Kids</h1>
        <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-brand-gold mt-1">Mundo de Diversão</p>
      </div>
    </div>
  );
}
