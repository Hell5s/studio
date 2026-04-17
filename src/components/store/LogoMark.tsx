import React from 'react';

export function LogoMark() {
  return (
    <div className="flex flex-col items-center group cursor-pointer">
      {/* Refined Monogram Seal */}
      <div className="relative flex h-14 w-14 items-center justify-center mb-1">
        <div className="absolute inset-0 border border-accent/30 rounded-full scale-90 group-hover:scale-110 transition-transform duration-1000 ease-out" />
        <div className="absolute inset-0 border-[0.5px] border-accent/10 rounded-full scale-100 group-hover:rotate-45 transition-transform duration-1000" />
        <div className="relative flex flex-col items-center justify-center">
          <span className="text-[16px] font-headline font-bold text-primary tracking-tighter leading-none">TB</span>
          <div className="h-[1px] w-3 bg-accent/40 mt-1" />
        </div>
      </div>
      
      {/* Brand Typography */}
      <div className="flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-primary leading-none">
          Toda Bela
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="h-[0.5px] w-6 bg-accent/30" />
          <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-accent">Maison de Mode</p>
          <div className="h-[0.5px] w-6 bg-accent/30" />
        </div>
      </div>
    </div>
  );
}