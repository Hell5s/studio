"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Hero({ onShopNow }: { onShopNow?: () => void }) {
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    {
      url: "https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=1200&q=80",
      hint: "fashion elegant"
    },
    {
      url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
      hint: "fashion minimal"
    },
    {
      url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
      hint: "fashion campaign"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section className="relative w-full min-h-[90vh] flex items-center bg-[#F5F1ED] overflow-hidden pt-16 md:pt-0">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
        <svg viewBox="0 0 500 500" className="w-full h-full text-primary fill-current">
          <path d="M50,250 Q150,50 250,250 T450,250" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className="container mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* LADO ESQUERDO: TEXTO EDITORIAL */}
        <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-left-10 duration-1000">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent">Lançamento Exclusivo</span>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-primary leading-[0.9] tracking-tighter">
              Elegância que se <br />
              <span className="italic font-light text-accent">destaca</span> em <br />
              cada detalhe
            </h2>
          </div>

          <div className="max-w-md space-y-8">
            <p className="text-sm md:text-lg text-primary/70 font-light italic leading-relaxed">
              Peças pensadas para valorizar sua presença em qualquer ocasião. Redescubra sua autenticidade através de nossa curadoria.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={onShopNow}
                className="rounded-full bg-primary text-white px-10 h-14 md:h-16 text-[10px] font-bold uppercase tracking-[0.4em] shadow-xl hover:bg-accent transition-all duration-500 transform hover:scale-105"
              >
                COMPRAR AGORA <ArrowRight className="ml-3 h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                onClick={onShopNow}
                className="rounded-full border-primary/20 text-primary px-10 h-14 md:h-16 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-white transition-all duration-500"
              >
                VER COLEÇÃO
              </Button>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: IMAGEM IMPACTANTE COM SLIDER */}
        <div className="relative h-[60vh] md:h-[80vh] w-full animate-in fade-in slide-in-from-right-10 duration-1000 delay-300">
          <div className="relative w-full h-full rounded-[4rem] overflow-hidden shadow-editorial border-4 border-white">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={cn(
                  "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                  currentImage === idx ? "opacity-100 z-10" : "opacity-0 z-0"
                )}
              >
                <Image
                  src={img.url}
                  alt="Modelo Toda Bela"
                  fill
                  className={cn(
                    "object-cover transition-transform duration-[10000ms] ease-linear",
                    currentImage === idx ? "scale-110" : "scale-100"
                  )}
                  priority={idx === 0}
                  data-ai-hint={img.hint}
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent pointer-events-none z-20" />
          </div>

          {/* CARD FLUTUANTE PREMIUM */}
          <div className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 z-30 glass-morphism p-8 md:p-10 rounded-[3rem] shadow-editorial max-w-[280px] md:max-w-[320px] border border-white/40 animate-float-editorial">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-accent">Essência 2026</span>
            </div>
            <h4 className="text-2xl font-serif font-bold text-primary mb-2">Presença Marcante</h4>
            <p className="text-[10px] text-primary/60 font-light italic leading-relaxed mb-6">
              A sofisticação traduzida em tecidos nobres e cortes que esculpem a confiança feminina.
            </p>
            <Button 
              variant="outline"
              className="w-full rounded-full h-12 border-accent/20 text-primary text-[9px] font-bold uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all"
            >
              CONHECER PEÇAS
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
}
