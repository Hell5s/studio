
import React from 'react';

export function LogoMark() {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div className="absolute inset-0 bg-brand-wine rotate-45 rounded-xl transition-transform group-hover:rotate-90 duration-700 opacity-10" />
        <svg viewBox="0 0 120 120" className="h-9 w-9 relative z-10" fill="none">
          <path
            d="M33 31C33 25.4772 37.4772 21 43 21H77C82.5228 21 87 25.4772 87 31V33C87 38.5228 82.5228 43 77 43H67V99H53V43H43C37.4772 43 33 38.5228 33 33V31Z"
            fill="#6E3C47"
          />
          <circle cx="60" cy="60" r="54" stroke="#C7A17A" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
      </div>
      <div className="flex flex-col">
        <h1 className="text-2xl font-headline font-bold tracking-[0.2em] text-brand-wine uppercase leading-none">Toda Bela</h1>
        <p className="text-[9px] uppercase font-bold tracking-[0.5em] text-brand-gold mt-1 ml-0.5">Maison de Mode</p>
      </div>
    </div>
  );
}
