
import React from 'react';

export function LogoMark() {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className="absolute inset-0 bg-brand-gold rounded-2xl rotate-6 transition-transform group-hover:rotate-12 duration-500 opacity-20" />
        <div className="relative bg-white h-10 w-10 rounded-xl flex items-center justify-center shadow-sm border border-brand-gold/10">
          <svg viewBox="0 0 120 120" className="h-6 w-6" fill="none">
            <path
              d="M33 31C33 25.4772 37.4772 21 43 21H77C82.5228 21 87 25.4772 87 31V33C87 38.5228 82.5228 43 77 43H67V99H53V43H43C37.4772 43 33 38.5228 33 33V31Z"
              fill="#6E3C47"
            />
            <circle cx="60" cy="60" r="54" stroke="#C7A17A" strokeWidth="4" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col">
        <h1 className="text-xl font-headline font-bold tracking-[0.2em] text-brand-wine leading-none">Toda Bela</h1>
        <p className="text-[9px] uppercase font-bold tracking-[0.4em] text-brand-gold mt-1">Maison</p>
      </div>
    </div>
  );
}
