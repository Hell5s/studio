
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';

const BANNERS = [
  {
    id: 1,
    top: "Nova Coleção 2026",
    title: "Elegância que transforma",
    subtitle: "Peças exclusivas com até 40% OFF",
    buttonText: "COMPRAR AGORA",
    image: "https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=1600&q=80",
    hint: "fashion high-end"
  },
  {
    id: 2,
    top: "OFERTAS EXCLUSIVAS",
    title: "SALE: Até 50% OFF",
    subtitle: "Oportunidade única para renovar seu guarda-roupa hoje",
    buttonText: "APROVEITAR",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
    hint: "fashion sale"
  },
  {
    id: 3,
    top: "TENDÊNCIA",
    title: "Mais Vendidos",
    subtitle: "As peças favoritas do momento selecionadas para você",
    buttonText: "VER AGORA",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
    hint: "fashion trend"
  }
];

interface HeroProps {
  onShopNow?: () => void;
}

export function Hero({ onShopNow }: HeroProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    duration: 30,
    skipSnaps: false
  }, [
    Autoplay({ delay: 5000, stopOnInteraction: false })
  ]);
  
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  return (
    <section className="relative h-[65vh] md:h-[85vh] w-full overflow-hidden bg-[#FDF8F5]">
      {/* Carrossel Principal */}
      <div className="h-full w-full" ref={emblaRef}>
        <div className="flex h-full w-full">
          {BANNERS.map((banner) => (
            <div key={banner.id} className="relative h-full w-full flex-[0_0_100%] min-w-0">
              {/* Imagem de Fundo com Fade-in suave */}
              <div className="absolute inset-0">
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover animate-in fade-in duration-1000"
                  priority={banner.id === 1}
                  data-ai-hint={banner.hint}
                />
                {/* Overlay Editorial de Luxo */}
                <div className="absolute inset-0 bg-black/35 backdrop-blur-[0.5px]" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-transparent" />
              </div>

              {/* Conteúdo do Banner */}
              <div className="container relative h-full mx-auto px-6 flex items-center">
                <div className="max-w-2xl space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <div className="space-y-3 md:space-y-5">
                    <span className="inline-block text-[10px] md:text-[11px] font-bold uppercase tracking-[0.6em] text-[#C7A17A] drop-shadow-sm">
                      {banner.top}
                    </span>
                    <h2 className="text-3xl md:text-7xl font-serif font-bold text-white leading-[1.1] tracking-tight">
                      {banner.title}
                    </h2>
                    <p className="text-base md:text-xl text-white/90 font-light italic max-w-lg leading-relaxed">
                      {banner.subtitle}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4 md:pt-6">
                    <Button 
                      onClick={onShopNow}
                      className="rounded-full bg-[#6E3C47] text-white px-8 md:px-12 h-14 md:h-16 text-[11px] font-bold uppercase tracking-[0.4em] shadow-2xl hover:bg-[#C7A17A] border-none transition-all duration-500 transform hover:scale-105 active:scale-95"
                    >
                      {banner.buttonText}
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={onShopNow}
                      className="rounded-full text-white px-8 md:px-12 h-14 md:h-16 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-white/10 transition-all group border border-white/30 backdrop-blur-sm"
                    >
                      Ver Detalhes <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles de Navegação (Setas) */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 hidden md:flex justify-between px-10 pointer-events-none">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={scrollPrev}
          className="h-14 w-14 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white hover:text-[#6E3C47] transition-all pointer-events-auto shadow-2xl"
        >
          <ChevronLeft className="h-7 w-7" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={scrollNext}
          className="h-14 w-14 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white hover:text-[#6E3C47] transition-all pointer-events-auto shadow-2xl"
        >
          <ChevronRight className="h-7 w-7" />
        </Button>
      </div>

      {/* Indicadores (Dots) */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4">
        {BANNERS.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "h-2 transition-all duration-700 rounded-full",
              selectedIndex === index 
                ? "w-12 bg-[#C7A17A]" 
                : "w-3 bg-white/40 hover:bg-white/60"
            )}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
