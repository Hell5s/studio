
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';

export function Hero({ onShopNow }: { onShopNow?: () => void }) {
  const db = useFirestore();
  const [currentImage, setCurrentImage] = useState(0);

  // Buscar banners ativos do Firestore
  const bannersQuery = query(
    collection(db, 'banners'), 
    where('active', '==', true),
    orderBy('order', 'asc')
  );
  const { data: banners } = useCollection(bannersQuery);

  // Fallback se não houver banners cadastrados
  const fallbackImages = [
    {
      url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
      title: "Elegância que Inspira",
      subtitle: "Curadoria exclusiva de peças que unem sofisticação e conforto."
    }
  ];

  const activeBanners = banners && banners.length > 0 ? banners : fallbackImages;

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-black">
      {/* Imagem de Fundo com Transição */}
      {activeBanners.map((banner, idx) => (
        <div
          key={idx}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            currentImage === idx ? "opacity-90 z-10" : "opacity-0 z-0"
          )}
        >
          <div className="relative w-full h-full">
             <Image
              src={banner.imageUrl || (banner as any).url}
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
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent z-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-20" />

      {/* Conteúdo Editorial */}
      <div className="container mx-auto h-full px-6 md:px-14 flex items-center justify-start relative z-30 pt-20">
        <div className="max-w-3xl space-y-10 animate-in fade-in slide-in-from-left-10 duration-1000">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-8xl font-serif font-bold text-white uppercase tracking-tighter leading-[0.9]">
              {activeBanners[currentImage]?.title?.split(' ')[0] || "Elegância"} <br />
              <span className="italic font-light text-accent">
                {activeBanners[currentImage]?.title?.split(' ').slice(1).join(' ') || "que Inspira"}
              </span>
            </h1>
            <p className="text-lg md:text-2xl text-white/90 font-light italic max-w-xl leading-relaxed">
              {activeBanners[currentImage]?.subtitle || "Curadoria exclusiva para mulheres autênticas."}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-5 pt-4">
            <Button 
              onClick={onShopNow}
              className="rounded-full bg-white text-primary px-12 py-8 text-lg font-bold uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
            >
              {activeBanners[currentImage]?.ctaText || "Comprar Agora"}
            </Button>
            <Button 
              onClick={onShopNow}
              className="rounded-full border-2 border-white bg-transparent text-white px-12 py-8 text-lg font-bold uppercase tracking-widest hover:bg-white hover:text-primary transition-all"
            >
              Ver Looks
            </Button>
          </div>
        </div>
      </div>

      {/* Indicadores do Slider Centralizados */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-4">
        {activeBanners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentImage(i)}
            className={cn(
              "h-2 w-2 transition-all duration-500 rounded-full",
              currentImage === i ? "bg-accent scale-125 shadow-[0_0_10px_rgba(199,161,122,0.4)]" : "bg-white/40"
            )}
            aria-label={`Ir para slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
