
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, limit, doc } from 'firebase/firestore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';

export function Hero({ onShopNow }: { onShopNow?: () => void }) {
  const db = useFirestore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc(settingsRef);

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
      limit(50)
    );
  }, [db]);

  const { data: banners } = useCollection(bannersQuery);

  useEffect(() => {
    if (banners && banners.length > 0 && banners[0].imageUrl) {
      localStorage.setItem('lastBannerUrl', banners[0].imageUrl);
      setCachedBannerUrl(banners[0].imageUrl);
    }
  }, [banners]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

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
    let list = banners && banners.length > 0 
      ? banners 
      : cachedBannerUrl 
        ? [{ imageUrl: cachedBannerUrl, title: '', subtitle: '', ctaText: settings?.heroCta || 'Conferir', mediaType: 'image', duration: 6, imagePosition: { x: 50, y: 50 } }]
        : [];
    
    return [...list].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [banners, cachedBannerUrl, settings]);

  useEffect(() => {
    if (!emblaApi || !displayBanners.length) return;
    
    const currentBanner = displayBanners[selectedIndex];
    const delay = (currentBanner?.duration || 6) * 1000;
    
    const timer = setTimeout(() => {
      emblaApi.scrollNext();
    }, delay);
    
    return () => clearTimeout(timer);
  }, [emblaApi, selectedIndex, displayBanners]);

  if (!displayBanners.length) {
    return (
      <section
        className="relative w-full overflow-hidden flex items-center justify-center"
        style={{ 
          width: '100%',
          aspectRatio: '16/9',
          maxHeight: '95vh',
          minHeight: '400px',
          background: 'linear-gradient(135deg, #1a0a0e 0%, #2d1219 50%, #1a0a0e 100%)' 
        }}
      >
        <div className="text-center space-y-4 animate-pulse">
          <div className="h-px w-32 bg-accent/30 mx-auto" />
          <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-white/20">
            {settings?.storeName || 'Toda Bela'}
          </p>
          <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-accent/30">
            {settings?.tagline || 'Moda Feminina'}
          </p>
          <div className="h-px w-32 bg-accent/30 mx-auto" />
        </div>
      </section>
    );
  }

  return (
    <section 
      className="relative w-full overflow-hidden bg-black group"
      style={{ 
        width: '100%',
        aspectRatio: '16/9',
        maxHeight: '95vh',
        minHeight: '400px'
      }}
    >
      <div className="h-full w-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full w-full">
          {displayBanners.map((banner: any, idx: number) => (
            <div key={idx} className="relative flex-[0_0_100%] min-w-0 h-full w-full">
              {banner.mediaType === 'video' ? (
                <video
                  key={banner.imageUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  disablePictureInPicture
                  disableRemotePlayback
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center center',
                    imageRendering: 'auto',
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <source src={banner.imageUrl} type="video/mp4" />
                </video>
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
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
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              
              <div className="container mx-auto h-full px-6 md:px-12 relative z-10 pointer-events-none">
                <div className={cn(
                  "absolute bottom-[40px] left-[24px] text-left max-w-2xl space-y-6 md:space-y-8 transition-all duration-1000 pointer-events-auto",
                  selectedIndex === idx ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
                )}>
                  <div className="space-y-3 md:space-y-4">
                    <h1 className="text-xl md:text-5xl font-headline font-bold text-white uppercase tracking-tighter leading-tight">
                      {banner.title || ''}
                    </h1>
                    <p className="text-sm md:text-xl text-white/80 font-light italic max-w-xs md:max-w-lg leading-relaxed">
                      {banner.subtitle || ''}
                    </p>
                  </div>
                  {(banner.ctaText || settings?.heroCta) && (
                    <Button 
                      onClick={onShopNow}
                      className="rounded-full bg-transparent border-[1.5px] border-white text-white backdrop-blur-sm px-[22px] py-[10px] text-[0.72rem] font-bold uppercase tracking-[0.12em] shadow-xl hover:bg-white hover:text-[#222] transition-all w-fit h-auto"
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
