
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import data from '@/app/lib/placeholder-images.json';

export function Hero({ onShopNow }: { onShopNow?: () => void }) {
  const [currentImage, setCurrentImage] = useState(0);

  const staticBanners = data.placeholderImages.filter(img => img.id.startsWith('hero-editorial'));

  const fallbackBanners = [
    {
      imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
      title: "Elegância que Inspira",
      subtitle: "Seleção exclusiva de peças que unem sofisticação e conforto.",
      ctaText: "Comprar Agora"
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
      title: "Coleção Boutique",
      subtitle: "Presença e propósito em cada detalhe do seu visual.",
      ctaText: "Ver Looks"
    }
  ];

  const activeBanners = staticBanners.length > 0 ? staticBanners : fallbackBanners;

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  return (
    <section className="relative w-full h-[70vh] md:h-[85vh] min-h-[500px] md:min-h-[600px] overflow-hidden bg-black">
      {/* Imagem de Fundo com Transição */}
      {activeBanners.map((banner: any, idx) => (
        <div
          key={idx}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            currentImage === idx ? "opacity-90 z-10" : "opacity-0 z-0"
          )}
        >
          <div className="relative w-full h-full">
             <Image
              src={banner.imageUrl || banner.url}
              alt="Boutique Toda Bela"
              fill
              className={cn(
                "object-cover transition-transform duration-[20000ms] ease-linear",
                currentImage === idx ? "scale-110" : "scale-100"
              )}
              priority={idx === 0}
            />
          </div>
        </div>
      ))}

      {/* Gradientes de Profundidade */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent z-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20" />

      {/* Conteúdo Editorial */}
      <div className="container mx-auto h-full px-6 md:px-14 flex items-center justify-start relative z-30 pt-16 md:pt-20">
        <div className="max-w-3xl space-y-8 md:space-y-10 animate-in fade-in slide-in-from-left-10 duration-1000">
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-5xl md:text-8xl font-headline font-bold text-white uppercase tracking-tighter leading-[0.95]">
              {(activeBanners[currentImage] as any).title?.split(' ')[0] || "Elegância"} <br />
              <span className="italic font-light text-accent">
                {(activeBanners[currentImage] as any).title?.split(' ').slice(1).join(' ') || "que Inspira"}
              </span>
            </h1>
            <p className="text-base md:text-2xl text-white/90 font-light italic max-w-xl leading-relaxed">
              {(activeBanners[currentImage] as any).subtitle || "Seleção exclusiva para mulheres autênticas."}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 md:gap-5 pt-2">
            <Button 
              onClick={onShopNow}
              className="rounded-full bg-white text-primary px-8 py-6 md:px-12 md:py-8 text-sm md:text-lg font-bold uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
            >
              {(activeBanners[currentImage] as any).ctaText || "Comprar Agora"}
            </Button>
            <Button 
              onClick={onShopNow}
              className="rounded-full border-2 border-white bg-transparent text-white px-8 py-6 md:px-12 md:py-8 text-sm md:text-lg font-bold uppercase tracking-widest hover:bg-white hover:text-primary transition-all"
            >
              Ver Looks
            </Button>
          </div>
        </div>
      </div>

      {/* Indicadores do Slider Centralizados */}
      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3 md:gap-4">
        {activeBanners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentImage(i)}
            className={cn(
              "h-1.5 w-1.5 md:h-2 md:w-2 transition-all duration-500 rounded-full",
              currentImage === i ? "bg-accent scale-125 shadow-[0_0_10px_rgba(199,161,122,0.4)]" : "bg-white/40"
            )}
            aria-label={`Ir para slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
