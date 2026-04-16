
import React from 'react';

export function LogoMark() {
  const wine = "#6E3C47";
  const gold = "#C7A17A";

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/80 shadow-sm backdrop-blur">
        <svg viewBox="0 0 120 120" className="h-8 w-8" fill="none">
          <path
            d="M33 31C33 25.4772 37.4772 21 43 21H77C82.5228 21 87 25.4772 87 31V33C87 38.5228 82.5228 43 77 43H67V99H53V43H43C37.4772 43 33 38.5228 33 33V31Z"
            fill={wine}
          />
          <circle cx="60" cy="60" r="54" stroke={gold} strokeWidth="4" />
        </svg>
      </div>
      <div>
        <p className="text-[10px] uppercase font-medium tracking-[0.35em] text-brand-wine/70 leading-none">Store</p>
        <h1 className="text-xl font-headline font-semibold tracking-[0.1em] text-brand-wine">Toda Bela</h1>
      </div>
    </div>
  );
}
