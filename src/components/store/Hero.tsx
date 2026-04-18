
"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function Hero({ onShopNow }: { onShopNow?: () => void }) {
  return (
    <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-black">
      <Image
        src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80"
        alt="Boutique Toda Bela"
        fill
        className="object-cover opacity-90 transition-transform duration-[20s] hover:scale-110"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
      <div className="container mx-auto h-full px-6 flex items-end pb-24 relative z-10">
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-10 duration-1000">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-[9rem] font-headline font-bold text-white uppercase tracking-tighter leading-[0.95]">
              Energy <br />
              <span className="italic font-light text-accent">Potência</span>
            </h1>
            <p className="text-xl md:text-3xl text-white/90 font-light italic max-w-xl">
              Sua nova definição de sofisticação e movimento.
            </p>
          </div>
          <Button 
            onClick={onShopNow}
            className="rounded-full bg-white text-primary px-12 py-8 text-lg md:text-xl font-bold uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
          >
            Conferir Looks
          </Button>
        </div>
      </div>
    </section>
  );
}
