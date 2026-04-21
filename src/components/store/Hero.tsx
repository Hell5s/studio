
"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Loader2, Sparkles } from 'lucide-react';

export function Hero({ onShopNow }: { onShopNow?: () => void }) {
  const db = useFirestore();
  
  const bannersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'banners'), 
      where('active', '==', true), 
      orderBy('createdAt', 'desc'),
      limit(1)
    );
  }, [db]);

  const { data: banners, isLoading } = useCollection(bannersQuery);
  const activeBanner = banners?.[0];

  const defaultHero = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80";

  return (
    <section className="relative w-full h-[80vh] md:h-[90vh] min-h-[500px] md:min-h-[700px] overflow-hidden bg-black">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-white/20" />
        </div>
      ) : (
        <Image
          src={activeBanner?.imageUrl || defaultHero}
          alt={activeBanner?.title || "Boutique Toda Bela"}
          fill
          className="object-cover opacity-85 transition-transform duration-[20s] hover:scale-110"
          priority
        />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/20 to-transparent md:from-black/80" />
      
      <div className="container mx-auto h-full px-6 md:px-12 flex items-end pb-16 md:pb-32 relative z-10">
        <div className="max-w-4xl space-y-8 md:space-y-12 animate-in fade-in slide-in-from-left-10 duration-1000">
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-4xl sm:text-6xl md:text-[9rem] font-headline font-bold text-white uppercase tracking-tighter leading-[0.85]">
              {activeBanner?.title ? (
                <>
                   {activeBanner.title.split(' ')[0]} <br />
                   <span className="italic font-light text-accent">{activeBanner.title.split(' ').slice(1).join(' ')}</span>
                </>
              ) : (
                <>
                  Energy <br />
                  <span className="italic font-light text-accent">Potência</span>
                </>
              )}
            </h1>
            <p className="text-base md:text-3xl text-white/90 font-light italic max-w-xs md:max-w-2xl leading-relaxed">
              {activeBanner?.subtitle || "Sua nova definição de sofisticação, propósito e movimento."}
            </p>
          </div>
          <Button 
            onClick={onShopNow}
            className="rounded-full bg-white text-primary px-10 md:px-20 py-7 md:py-10 text-xs md:text-2xl font-bold uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all min-h-[54px] md:min-h-[80px]"
          >
            {activeBanner?.ctaText || "Conferir Looks"}
          </Button>
        </div>
      </div>
      
      {activeBanner && (
        <div className="absolute top-28 md:top-40 right-6 md:right-16 z-20">
           <div className="px-4 md:px-6 py-2 md:py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2 md:gap-3">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-accent" />
              <span className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-white/40">Visual IA</span>
           </div>
        </div>
      )}
    </section>
  );
}
