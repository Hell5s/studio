'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { preload } from 'react-dom';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, limit, doc } from 'firebase/firestore';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Helper function to build optimized Cloudinary URLs for banners
const buildBannerUrl = (url: string, isMobile: boolean, zoom: number, type: 'image' | 'video' = 'image', isPoster = false) => {
  if (!url || !url.includes('cloudinary.com')) return url;

  let params = '';

  if (type === 'image' || isPoster) {
    // Image logic: calculate width based on device and zoom
    const width = isMobile 
      ? 2800 
      : Math.min(4096, Math.round(2880 * (zoom ? zoom / 100 : 1)));
    
    params = `f_auto,q_auto:best,w_${width},c_limit,e_sharpen:30`;
    
    if (isPoster) {
      params = `so_0,${params}`;
      return url.replace('/upload/', `/upload/${params}/`).replace(/\.[^/.]+$/, ".jpg");
    }
  } else {
    // Video logic: higher resolution for desktop, optimized for mobile
    const width = isMobile ? 1920 : 2560;
    params = `f_auto,q_auto:best,vc_auto,w_${width},c_limit`;
  }

  return url.replace('/upload/', `/upload/${params}/`);
};

const HeroSlide = React.memo(({ banner, idx, isActive, isLoaded, isMobile, onShopNow, settings }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive]);

  const optimizedUrl = buildBannerUrl(banner.imageUrl, isMobile, banner.imageZoom || 100, 'image');
  const optimizedVideoUrl = buildBannerUrl(banner.imageUrl, isMobile, 100, 'video');
  const posterUrl = buildBannerUrl(banner.imageUrl, isMobile, banner.imageZoom || 100, 'image', true);

  const activePosition = isMobile 
    ? (banner.mobileImagePosition || banner.imagePosition || { x: 50, y: 50 })
    : (banner.imagePosition || { x: 50, y: 50 });
    
  const activeZoom = isMobile
    ? (banner.mobileImageZoom || banner.imageZoom || 100)
    : (banner.imageZoom || 100);

  return (
    <div className="relative flex-[0_0_100%] min-w-0 h-full w-full bg-[#1a0a0e]">
      {isLoaded && (
        <>
          {banner.mediaType === 'video' ? (
            <video
              ref={videoRef}
              key={optimizedVideoUrl}
              muted
              loop
              playsInline
              preload="metadata"
              poster={posterUrl}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                objectPosition: `${activePosition.x}% ${activePosition.y}%`,
                objectFit: 'cover'
              }}
            >
              <source src={optimizedVideoUrl} type="video/mp4" />
            </video>
          ) : (
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: `url(${optimizedUrl})`,
                backgroundSize: activeZoom === 100 ? 'cover' : `${activeZoom}%`,
                backgroundPosition: `${activePosition.x}% ${activePosition.y}%`,
                backgroundRepeat: 'no-repeat',
              }} 
              role="img"
              aria-label={banner.title || "Banner Toda Bela"}
            />
          )}
        </>
      )}
      
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      <div className={cn(
        "container mx-auto h-full px-5 md:px-12 pl-6 md:pl-16 flex items-end pb-16 md:pb-28 relative z-10 pointer-events-none",
        "max-md:absolute max-md:bottom-[20px] max-md:left-[16px] max-md:h-auto max-md:pb-0 max-md:px-0 max-md:pl-0 max-md:items-start"
      )}>
        <div className={cn(
          "max-w-2xl space-y-4 md:space-y-10 transition-[opacity,transform] duration-700 ease-out pointer-events-auto",
          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}>
          <div className="space-y-2 md:space-y-4">
            <h1 className="text-base md:text-3xl font-headline font-semibold text-white uppercase tracking-[0.08em] leading-[0.9]">
              {banner.title || ''}
            </h1>
            <p className="text-xs md:text-sm text-white/90 font-light italic max-w-lg leading-relaxed">
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
  );
});

HeroSlide.displayName = 'HeroSlide';

export function Hero({ onShopNow }: { onShopNow?: () => void }) {
  const db = useFirestore();
  const isMobile = !!useIsMobile();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(new Set([0]));
  
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc(settingsRef);

  const [cachedBanner, setCachedBanner] = useState<any>(null);

  useEffect(() => {
    setHasHydrated(true);
    const saved = localStorage.getItem('lastBannerData');
    if (saved) {
      try {
        setCachedBanner(JSON.parse(saved));
      } catch (e) {
        console.warn("Erro ao carregar banner do cache:", e);
      }
    }
  }, []);

  const bannersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'banners'), 
      limit(10)
    );
  }, [db]);

  const { data: banners, isLoading: isBannersLoading } = useCollection(bannersQuery);

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
    if (!hasHydrated) return [];
    if (banners && banners.length > 0) {
      return [...banners].sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    if (cachedBanner) {
      return [cachedBanner];
    }
    return [];
  }, [banners, cachedBanner, hasHydrated]);

  // Handle slide liberation and pre-decoding
  useEffect(() => {
    if (displayBanners.length > 0) {
      const nextIndex = (selectedIndex + 1) % displayBanners.length;
      
      setLoadedIndices(prev => {
        if (prev.has(selectedIndex) && prev.has(nextIndex)) return prev;
        const newSet = new Set(prev);
        newSet.add(selectedIndex);
        newSet.add(nextIndex);
        return newSet;
      });

      // Warm up liberated images with EXACT same URL
      [selectedIndex, nextIndex].forEach(idx => {
        const banner = displayBanners[idx];
        if (banner && banner.mediaType !== 'video') {
          const url = buildBannerUrl(banner.imageUrl, isMobile, banner.imageZoom || 100, 'image');
          const img = new window.Image();
          img.src = url;
          img.decode().catch(() => {});
        }
      });
    }
  }, [selectedIndex, displayBanners, isMobile]);

  // Preload critical first image with EXACT same URL
  useEffect(() => {
    if (displayBanners.length > 0) {
      const first = displayBanners[0];
      if (first.mediaType !== 'video') {
        const url = buildBannerUrl(first.imageUrl, isMobile, first.imageZoom || 100, 'image');
        if (url && url.includes('cloudinary.com')) {
          try {
            preload(url, { as: 'image', fetchPriority: 'high' } as any);
          } catch (e) {}
        }
      }
    }
  }, [displayBanners, isMobile]);

  useEffect(() => {
    if (!emblaApi || !displayBanners.length) return;
    
    const currentBanner = displayBanners[selectedIndex];
    const delay = (currentBanner?.duration || 6) * 1000;
    
    const timer = setTimeout(() => {
      emblaApi.scrollNext();
    }, delay);
    
    return () => clearTimeout(timer);
  }, [emblaApi, selectedIndex, displayBanners]);

  if (!hasHydrated || (!displayBanners.length && !isBannersLoading)) {
    return (
      <section
        className="relative w-full h-[70vh] md:h-screen min-h-[450px] md:min-h-[600px] max-h-screen overflow-hidden flex items-center justify-center bg-[#1a0a0e]"
      >
        <div className="relative z-10 text-center space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-1000">
           <h1 className="font-headline text-4xl md:text-7xl text-white tracking-[0.1em] uppercase leading-none">
             Toda <span className="italic font-light text-accent">Bela</span>
           </h1>
           <p className="text-[10px] tracking-[0.5em] text-white/40 uppercase font-bold">
             MODA FEMININA
           </p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
           <div className="w-[85%] h-[85%] max-w-[650px] max-h-[650px] border border-white/5 rounded-full animate-spin-slow" />
        </div>
      </section>
    );
  }

  if (!displayBanners.length && isBannersLoading) {
    return (
      <section
        className="relative w-full h-[70vh] md:h-screen min-h-[450px] md:min-h-[600px] max-h-screen overflow-hidden animate-pulse bg-[#1a0a0e]"
      >
        <div className="container mx-auto h-full px-5 md:px-12 pl-6 md:pl-16 flex items-end pb-16 md:pb-28 relative z-10">
          <div className="space-y-4">
            <div className="w-64 h-6 bg-white/10 rounded" />
            <div className="w-48 h-3 bg-white/10 rounded mt-3" />
            <div className="w-32 h-10 bg-white/10 rounded-full mt-6" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="relative w-full h-[70vh] md:h-screen min-h-[450px] md:min-h-[600px] max-h-screen overflow-hidden bg-black group"
      style={{ 
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        perspective: '1000px',
        transform: 'translateZ(0)'
      }}
    >
      <div className="h-full w-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full w-full" style={{ willChange: 'transform' }}>
          {displayBanners.map((banner: any, idx: number) => (
            <HeroSlide 
              key={idx}
              banner={banner}
              idx={idx}
              isActive={selectedIndex === idx}
              isLoaded={loadedIndices.has(idx)}
              isMobile={isMobile}
              onShopNow={onShopNow}
              settings={settings}
            />
          ))}
        </div>
      </div>

      {displayBanners.length > 1 && (
        <>
          <button 
            onClick={scrollPrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-black/40 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary z-30 hidden md:flex"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={scrollNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-black/40 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary z-30 hidden md:flex"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </section>
  );
}
