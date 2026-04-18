
"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

export function Hero({ onShopNow }: { onShopNow?: () => void }) {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })]);

  const banners = [
    {
      id: 1,
      top: "Nova Coleção 2026",
      title: "Elegância que transforma",
      sub: "Peças exclusivas com até 40% OFF",
      btn: "COMPRAR AGORA",
      img: "https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=1600&q=80",
      hint: "fashion elegant"
    },
    {
      id: 2,
      top: "Oportunidade única",
      title: "SALE: Até 50% OFF",
      sub: "Só hoje: Curadoria selecionada com preços especiais",
      btn: "APROVEITAR",
      img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
      hint: "fashion sale"
    },
    {
      id: 3,
      top: "Trend Alert",
      title: "Mais Vendidos",
      sub: "As peças favoritas do momento em nossa Maison",
      btn: "VER AGORA",
      img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
      hint: "fashion trend"
    }
  ];

  return (
    <section className="relative w-full overflow-hidden bg-background">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          {banners.map((banner) => (
            <div key={banner.id} className="embla__slide relative flex-[0_0_100%] min-h-[60vh] md:min-h-[85vh] flex items-center justify-center">
              {/* Imagem de Fundo com Overlay */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={banner.img}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority={banner.id === 1}
                  data-ai-hint={banner.hint}
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
              </div>

              {/* Conteúdo do Banner */}
              <div className="container relative z-10 mx-auto px-6 text-center text-white">
                <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <span className="inline-block text-[10px] md:text-xs font-bold uppercase tracking-[0.5em] text-accent/90">
                    {banner.top}
                  </span>
                  <h2 className="text-4xl md:text-8xl font-serif font-bold leading-tight tracking-tight">
                    {banner.title}
                  </h2>
                  <p className="text-sm md:text-xl font-light italic opacity-90 tracking-wide max-w-2xl mx-auto">
                    {banner.sub}
                  </p>
                  <div className="pt-6 md:pt-10">
                    <Button 
                      onClick={onShopNow}
                      className="rounded-full bg-white text-[#6E3C47] px-10 md:px-16 h-16 md:h-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] shadow-2xl hover:bg-accent hover:text-white transition-all duration-700 transform hover:scale-105"
                    >
                      {banner.btn} <ArrowRight className="ml-4 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicadores Minimalistas */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {banners.map((_, i) => (
          <div key={i} className="h-1 w-8 md:w-12 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-white/60 w-0 group-data-[active=true]:w-full transition-all duration-[4000ms] ease-linear" />
          </div>
        ))}
      </div>
    </section>
  );
}
