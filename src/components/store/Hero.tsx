
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';

export function Hero({ onShopNow }: { onShopNow?: () => void }) {
  const db = useFirestore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const bannersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'banners'), 
      where('active', '==', true), 
      limit(5)
    );
  }, [db]);

  const { data: banners, isLoading } = useCollection(bannersQuery);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: false })
  ]);

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

  const defaultHero = {
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
    title: "Energy Potência",
    subtitle: "Sua nova definição de sofisticação, propósito e movimento.",
    ctaText: "Conferir Looks"
  };

  const displayBanners = banners && banners.length > 0 ? banners : [defaultHero];

  if (isLoading) {
    return (
      <section className="relative w-full h-[60vh] md:h-[90vh] min-h-[500px] md:min-h-[700px] overflow-hidden bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-white/20" />
      </section>
    );
  }

  return (
    <section className="relative w-full h-[60vh] md:h-[90vh] min-h-[500px] md:min-h-[700px] overflow-hidden bg-black group">
      <div className="h-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {displayBanners.map((banner, idx) => (
            <div key={idx} className="relative flex-[0_0_100%] min-w-0 h-full">
              <Image
                src={banner.imageUrl}
                alt={banner.title || "Boutique Toda Bela"}
                fill
                quality={100}
                unoptimized={true}
                className="object-cover opacity-80 transition-transform duration-[20s] hover:scale-110"
                priority={idx === 0}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              
              <div className="container mx-auto h-full px-6 md:px-12 flex items-end pb-16 md:pb-24 relative z-10">
                <div className={cn(
                  "max-w-2xl space-y-6 md:space-y-8 transition-all duration-1000",
                  selectedIndex === idx ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
                )}>
                  <div className="space-y-3 md:space-y-4">
                    <h1 className="text-3xl md:text-7xl font-headline font-bold text-white uppercase tracking-tighter leading-tight">
                      {banner.title ? (
                        <>
                           {banner.title.split(' ')[0]} <br className="hidden md:block" />
                           <span className="italic font-light text-accent">{banner.title.split(' ').slice(1).join(' ')}</span>
                        </>
                      ) : (
                        <>
                          Energy <br className="hidden md:block" />
                          <span className="italic font-light text-accent">Potência</span>
                        </>
                      )}
                    </h1>
                    <p className="text-sm md:text-xl text-white/80 font-light italic max-w-xs md:max-w-lg leading-relaxed">
                      {banner.subtitle || "Sua nova definição de sofisticação, propósito e movimento."}
                    </p>
                  </div>
                  <Button 
                    onClick={onShopNow}
                    className="rounded-full bg-white text-primary px-8 md:px-12 h-12 md:h-16 text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] shadow-xl hover:bg-accent hover:text-white transition-all"
                  >
                    {banner.ctaText || "Conferir Looks"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles de Navegação */}
      {displayBanners.length > 1 && (
        <>
          <button 
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 z-30 hidden md:flex"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 z-30 hidden md:flex"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Indicadores de Paginação */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {displayBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={cn(
                  "h-1 transition-all duration-500 rounded-full",
                  selectedIndex === i ? "w-10 bg-accent" : "w-4 bg-white/30"
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
