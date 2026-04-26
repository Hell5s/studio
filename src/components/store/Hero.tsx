"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
  
  // Cache do último banner para carregamento instantâneo
  const [cachedBannerUrl, setCachedBannerUrl] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lastBannerUrl');
    }
    return null;
  });

  const bannersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'banners'), 
      where('active', '==', true), 
      limit(5)
    );
  }, [db]);

  const { data: banners } = useCollection(bannersQuery);

  // Salva o banner no cache quando carregar do Firestore
  useEffect(() => {
    if (banners && banners.length > 0 && banners[0].imageUrl) {
      localStorage.setItem('lastBannerUrl', banners[0].imageUrl);
      setCachedBannerUrl(banners[0].imageUrl);
    }
  }, [banners]);

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
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=max&w=1600&q=80",
    title: "",
    subtitle: "",
    ctaText: "Conferir",
    imagePosition: { x: 50, y: 20 },
    mediaType: 'image'
  };

  // Prioriza Banners reais > Banner em Cache > Banner Default
  const displayBanners = banners && banners.length > 0 
    ? banners 
    : cachedBannerUrl 
      ? [{ imageUrl: cachedBannerUrl, title: '', subtitle: '', ctaText: 'Conferir', imagePosition: { x: 50, y: 20 }, mediaType: 'image' }]
      : [defaultHero];

  return (
    <section 
      className="relative w-full overflow-hidden bg-black group"
      style={{ height: '100vh' }}
    >
      <div className="h-full w-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full w-full">
          {displayBanners.map((banner: any, idx: number) => (
            <div key={idx} className="relative flex-[0_0_100%] min-w-0 h-full w-full">
              {banner.mediaType === 'video' ? (
                <video
                  src={banner.imageUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${banner.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: banner.imagePosition 
                      ? `${banner.imagePosition.x}% ${banner.imagePosition.y}%` 
                      : 'center 20%',
                    backgroundRepeat: 'no-repeat',
                  }} 
                  aria-label={banner.title || "Banner Toda Bela"}
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              
              <div className="container mx-auto h-full px-6 md:px-12 flex items-end pb-16 md:pb-24 relative z-10 pointer-events-none">
                <div className={cn(
                  "max-w-2xl space-y-6 md:space-y-8 transition-all duration-1000 pointer-events-auto",
                  selectedIndex === idx ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
                )}>
                  <div className="space-y-3 md:space-y-4">
                    <h1 className="text-3xl md:text-7xl font-headline font-bold text-white uppercase tracking-tighter leading-tight">
                      {banner.title || ''}
                    </h1>
                    <p className="text-sm md:text-xl text-white/80 font-light italic max-w-xs md:max-w-lg leading-relaxed">
                      {banner.subtitle || ''}
                    </p>
                  </div>
                  {banner.ctaText && (
                    <Button 
                      onClick={onShopNow}
                      className="rounded-full bg-white text-primary px-8 md:px-12 h-12 md:h-16 text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] shadow-xl hover:bg-accent hover:text-white transition-all"
                    >
                      {banner.ctaText}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
