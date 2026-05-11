
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, limit, doc } from 'firebase/firestore';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';

export function Hero({ onShopNow }: { onShopNow?: () => void }) {
  const db = useFirestore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc(settingsRef);

  // Recupera o último banner do cache para evitar "flash" preto/vazio no carregamento
  const [cachedBanner, setCachedBanner] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lastBannerData');
      try {
        return saved ? JSON.parse(saved) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const bannersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'banners'), 
      limit(10)
    );
  }, [db]);

  const { data: banners, isLoading: isBannersLoading } = useCollection(bannersQuery);

  // Atualiza o cache sempre que os banners reais carregarem
  useEffect(() => {
    if (banners && banners.length > 0) {
      localStorage.setItem('lastBannerData', JSON.stringify(banners[0]));
      setCachedBanner(banners[0]);
    }
  }, [banners]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    duration: 30,
    skipSnaps: false
  });

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

  const displayBanners = useMemo(() => {
    // Se temos banners do Firestore, usamos eles
    if (banners && banners.length > 0) {
      return [...banners].sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    // Se não carregou ainda mas temos cache, usamos o cache para evitar tela preta
    if (cachedBanner) {
      return [cachedBanner];
    }
    // Retorna vazio para que os fallbacks de UI assumam
    return [];
  }, [banners, cachedBanner]);

  // Autoplay baseado na duração customizada de cada banner
  useEffect(() => {
    if (!emblaApi || !displayBanners.length) return;
    
    const currentBanner = displayBanners[selectedIndex];
    const delay = (currentBanner?.duration || 6) * 1000;
    
    const timer = setTimeout(() => {
      emblaApi.scrollNext();
    }, delay);
    
    return () => clearTimeout(timer);
  }, [emblaApi, selectedIndex, displayBanners]);

  // 1. ESTADO DE CARREGAMENTO (SKELETON EDITORIAL)
  if (!displayBanners.length && isBannersLoading) {
    return (
      <section
        className="relative w-full overflow-hidden animate-pulse"
        style={{ 
          width: '100%',
          height: '100vh',
          maxHeight: '100vh',
          minHeight: '600px',
          background: 'linear-gradient(135deg, #1a0a0e 0%, #3d1a22 50%, #1a0a0e 100%)'
        }}
      >
        <div className="container mx-auto h-full px-5 md:px-12 pl-6 md:pl-16 flex items-end pb-12 md:pb-20 relative z-10">
          <div className="space-y-4">
            <div className="w-64 h-6 bg-white/10 rounded animate-pulse" />
            <div className="w-48 h-3 bg-white/10 rounded mt-3 animate-pulse" />
            <div className="w-32 h-10 bg-white/10 rounded-full mt-6 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  // 2. ESTADO SEM BANNERS (TELA ELEGANTE LOGO)
  if (!displayBanners.length && !isBannersLoading) {
    return (
      <section
        className="relative w-full overflow-hidden flex items-center justify-center"
        style={{ 
          width: '100%',
          height: '100vh',
          maxHeight: '100vh',
          minHeight: '600px',
          background: 'linear-gradient(135deg, #1a0a0e 0%, #3d1a22 60%, #1a0a0e 100%)'
        }}
      >
        <div className="relative z-10 text-center space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-1000">
           <h1 className="font-headline text-4xl md:text-7xl text-white tracking-[0.1em] uppercase leading-none">
             Toda <span className="italic font-light text-accent">Bela</span>
           </h1>
           <p className="text-[10px] tracking-[0.5em] text-white/40 uppercase font-bold">
             MODA FEMININA
           </p>
        </div>
        
        {/* Decorative circle overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
           <div className="w-[85%] h-[85%] max-w-[650px] max-h-[650px] border border-white/5 rounded-full animate-spin-slow" />
        </div>
      </section>
    );
  }

  return (
    <section 
      className="relative w-full overflow-hidden bg-black group"
      style={{ 
        width: '100%',
        height: '100vh',
        maxHeight: '100vh',
        minHeight: '600px'
      }}
    >
      <div className="h-full w-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full w-full">
          {displayBanners.map((banner: any, idx: number) => (
            <div key={idx} className="relative flex-[0_0_100%] min-w-0 h-full w-full bg-[#1a0a0e]">
              {banner.mediaType === 'video' ? (
                <video
                  key={banner.imageUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    objectPosition: 'center center',
                    willChange: 'transform',
                  }}
                >
                  <source src={banner.imageUrl} type="video/mp4" />
                </video>
              ) : (
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    backgroundImage: `url(${banner.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: banner.imagePosition 
                      ? `${banner.imagePosition.x}% ${banner.imagePosition.y}%` 
                      : 'center center',
                    backgroundRepeat: 'no-repeat',
                  }} 
                  role="img"
                  aria-label={banner.title || "Banner Toda Bela"}
                />
              )}
              
              {/* Overlay suave para legibilidade */}
              <div className="absolute inset-0 bg-black/30 pointer-events-none" />
              
              <div className="container mx-auto h-full px-5 md:px-12 pl-6 md:pl-16 flex items-end pb-12 md:pb-20 relative z-10 pointer-events-none">
                <div className={cn(
                  "max-w-2xl space-y-4 md:space-y-10 transition-all duration-1000 pointer-events-auto",
                  selectedIndex === idx ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                )}>
                  <div className="space-y-2 md:space-y-4">
                    <h1 
                      className="text-lg md:text-4xl font-headline font-bold text-white uppercase tracking-[0.01em] leading-[0.9]"
                    >
                      {banner.title || ''}
                    </h1>
                    <p 
                      className="text-xs md:text-base text-white/90 font-light italic max-w-lg leading-relaxed"
                    >
                      {banner.subtitle || ''}
                    </p>
                  </div>
                  {(banner.ctaText || settings?.heroCta) && (
                    <Button 
                      onClick={onShopNow}
                      className="rounded-full bg-white text-black px-6 py-2 md:px-8 md:py-3 text-[10px] md:text-xs tracking-[0.2em] font-bold uppercase w-fit h-auto hover:bg-accent hover:text-white transition-all shadow-2xl"
                    >
                      {banner.ctaText || settings?.heroCta || 'Conferir'}
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
            className="absolute left-6 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary z-30 hidden md:flex"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={scrollNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary z-30 hidden md:flex"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          
          {/* Indicadores de slide */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {displayBanners.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1 transition-all duration-500 rounded-full",
                  selectedIndex === i ? "w-8 bg-accent" : "w-2 bg-white/30"
                )} 
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
