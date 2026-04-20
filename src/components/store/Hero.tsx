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
    <section className="relative w-full h-[70vh] md:h-[85vh] min-h-[500px] md:min-h-[600px] overflow-hidden bg-black">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-white/20" />
        </div>
      ) : (
        <Image
          src={activeBanner?.imageUrl || defaultHero}
          alt={activeBanner?.title || "Boutique Toda Bela"}
          fill
          className="object-cover opacity-90 transition-transform duration-[20s] hover:scale-110"
          priority
        />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
      
      <div className="container mx-auto h-full px-4 md:px-6 flex items-end pb-12 md:pb-24 relative z-10">
        <div className="max-w-3xl space-y-6 md:space-y-8 animate-in fade-in slide-in-from-left-10 duration-1000">
          <div className="space-y-2 md:space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-[8rem] font-headline font-bold text-white uppercase tracking-tighter leading-[0.9]">
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
            <p className="text-sm md:text-2xl text-white/90 font-light italic max-w-sm md:max-w-xl leading-relaxed">
              {activeBanner?.subtitle || "Sua nova definição de sofisticação e movimento."}
            </p>
          </div>
          <Button 
            onClick={onShopNow}
            className="rounded-full bg-white text-primary px-8 md:px-12 py-6 md:py-8 text-sm md:text-xl font-bold uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
          >
            {activeBanner?.ctaText || "Conferir Looks"}
          </Button>
        </div>
      </div>
      
      {activeBanner && (
        <div className="absolute top-24 md:top-32 right-4 md:right-10 z-20">
           <div className="px-3 md:px-4 py-1.5 md:py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-1.5 md:gap-2">
              <Sparkles className="h-2.5 md:h-3 w-2.5 md:w-3 text-accent" />
              <span className="text-[7px] md:text-[8px] font-bold uppercase tracking-widest text-white/40">Visual IA</span>
           </div>
        </div>
      )}
    </section>
  );
}
