
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
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section className="relative w-full min-h-[85vh] flex items-center bg-[#F5F1ED] overflow-hidden pt-20 md:pt-0">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
        <svg viewBox="0 0 500 500" className="w-full h-full text-[#6E4B3A] fill-current">
          <path d="M50,250 Q150,50 250,250 T450,250" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M0,350 Q100,150 200,350 T400,350" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="container mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* LADO ESQUERDO: TIPOGRAFIA OVERSIZED */}
        <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-left-10 duration-1000">
          <div className="space-y-0 leading-[0.85] md:leading-[0.9]">
            <h2 className="text-6xl md:text-8xl lg:text-[9rem] font-serif font-bold text-[#6E4B3A] tracking-tighter">
              Noites
            </h2>
            <h2 className="text-5xl md:text-7xl lg:text-[8rem] font-serif italic font-light text-[#C8A96A] tracking-tight ml-4 md:ml-12">
              inesquecíveis
            </h2>
            <h2 className="text-5xl md:text-7xl lg:text-[7rem] font-serif font-light text-[#6E4B3A] tracking-tighter">
              pedem
            </h2>
            <div className="flex items-baseline gap-4 md:gap-8">
              <h2 className="text-5xl md:text-7xl lg:text-[7rem] font-serif italic font-light text-[#6E4B3A] tracking-tight">
                looks
              </h2>
              <h2 className="text-6xl md:text-8xl lg:text-[9rem] font-serif font-bold text-[#6E4B3A] tracking-tighter uppercase">
                poderosos
              </h2>
            </div>
          </div>

          <div className="max-w-md space-y-8">
            <p className="text-sm md:text-lg text-[#6E4B3A]/70 font-light italic leading-relaxed">
              A Toda Bela nasceu para vestir mulheres que não temem o protagonismo, através de uma curadoria fashion atemporal.
            </p>
            <Button 
              onClick={onShopNow}
              className="rounded-full bg-[#6E4B3A] text-white px-10 md:px-16 h-16 md:h-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] shadow-2xl hover:bg-[#C8A96A] transition-all duration-700 transform hover:scale-105"
            >
              COMPRAR COLEÇÃO <ArrowRight className="ml-4 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* LADO DIREITO: SLIDER DE IMAGENS + CARD FLUTUANTE */}
        <div className="relative h-[50vh] md:h-[75vh] w-full animate-in fade-in slide-in-from-right-10 duration-1000 delay-300">
          <div className="relative w-full h-full rounded-[3rem] md:rounded-[5rem] overflow-hidden shadow-editorial border-8 border-white">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={cn(
                  "absolute inset-0 transition-opacity duration-[1500ms] ease-in-out",
                  currentImage === idx ? "opacity-100 z-10" : "opacity-0 z-0"
                )}
              >
                <Image
                  src={img.url}
                  alt="Modelo Toda Bela"
                  fill
                  className={cn(
                    "object-cover transition-transform duration-[4000ms] ease-linear",
                    currentImage === idx ? "scale-105" : "scale-100"
                  )}
                  priority={idx === 0}
                  data-ai-hint={img.hint}
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-[#6E4B3A]/20 to-transparent pointer-events-none z-20" />
          </div>

          {/* CARD FLUTUANTE PREMIUM (L'ESSENCE) */}
          <div className="absolute -bottom-6 -left-6 md:-bottom-12 md:-left-12 z-30 glass-morphism p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-editorial max-w-[280px] md:max-w-[340px] border border-white/40 animate-float-editorial">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-5 w-5 text-[#C8A96A]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#C8A96A]">Destaque Maison</span>
            </div>
            <h4 className="text-2xl md:text-3xl font-serif font-bold text-[#6E4B3A] mb-2">L'Essence 2024</h4>
            <p className="text-[10px] md:text-xs text-[#6E4B3A]/60 font-light italic leading-relaxed mb-6">
              A sofisticação traduzida em tecidos nobres e cortes que esculpem a confiança feminina.
            </p>
            <Button 
              variant="outline"
              className="w-full rounded-full h-12 md:h-14 border-[#C8A96A]/20 text-[#6E4B3A] text-[9px] font-bold uppercase tracking-[0.3em] hover:bg-[#6E4B3A] hover:text-white transition-all"
            >
              VER PEÇAS
            </Button>
          </div>

          {/* Indicadores do Slider */}
          <div className="absolute top-8 right-8 z-30 flex flex-col gap-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className={cn(
                  "h-1.5 transition-all duration-500 rounded-full",
                  currentImage === i ? "w-8 bg-white" : "w-4 bg-white/40 hover:bg-white/60"
                )}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Ornamentos Laterais */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C8A96A]/20 to-transparent" />
    </section>
  );
}
