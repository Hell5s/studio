
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Hero({ onShopNow }: { onShopNow?: () => void }) {
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    {
      url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
      hint: "fashion lifestyle"
    },
    {
      url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
      hint: "fashion summer"
    },
    {
      url: "https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=1600&q=80",
      hint: "fashion elegant"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-black">
      {/* Imagem de Fundo com Transição */}
      {images.map((img, idx) => (
        <div
          key={idx}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            currentImage === idx ? "opacity-90 z-10" : "opacity-0 z-0"
          )}
        >
          <Image
            src={img.url}
            alt="Modelo Toda Bela"
            fill
            className={cn(
              "object-cover transition-transform duration-[15000ms] ease-linear",
              currentImage === idx ? "scale-110" : "scale-100"
            )}
            priority={idx === 0}
            data-ai-hint={img.hint}
          />
        </div>
      ))}

      {/* Gradientes de Profundidade */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent z-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-20" />

      {/* Conteúdo Editorial */}
      <div className="container mx-auto h-full px-6 md:px-14 flex items-center justify-start relative z-30 pt-20">
        <div className="max-w-3xl space-y-10 animate-in fade-in slide-in-from-left-10 duration-1000">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-8xl font-serif font-bold text-white uppercase tracking-tighter leading-[0.9]">
              Elegância <br />
              <span className="italic font-light text-accent">que Inspira</span>
            </h1>
            <p className="text-lg md:text-2xl text-white/90 font-light italic max-w-xl leading-relaxed">
              Curadoria exclusiva de peças que unem sofisticação e conforto para mulheres que desejam marcar presença com autenticidade.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-5 pt-4">
            <Button 
              onClick={onShopNow}
              className="rounded-full bg-white text-primary px-12 py-8 text-lg font-bold uppercase tracking-widest shadow-2xl hover:scale-105 transition-all border-none"
            >
              Comprar Agora
            </Button>
            <Button 
              onClick={onShopNow}
              className="rounded-full border-2 border-white bg-transparent text-white px-12 py-8 text-lg font-bold uppercase tracking-widest hover:bg-white hover:text-primary transition-all"
            >
              Ver Looks
            </Button>
          </div>
        </div>
      </div>

      {/* Indicadores do Slider */}
      <div className="absolute bottom-10 right-10 z-30 flex gap-3">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentImage(i)}
            className={cn(
              "h-1.5 transition-all duration-500 rounded-full",
              currentImage === i ? "w-12 bg-accent" : "w-3 bg-white/30"
            )}
          />
        ))}
      </div>
    </section>
  );
}
