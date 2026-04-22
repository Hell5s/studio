
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
    <section className="relative w-full h-[50vh] md:h-[65vh] min-h-[400px] md:min-h-[500px] overflow-hidden bg-black">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-white/20" />
        </div>
      ) : (
        <Image
          src={activeBanner?.imageUrl || defaultHero}
          alt={activeBanner?.title || "Boutique Toda Bela"}
          fill
          className="object-cover opacity-80 transition-transform duration-[20s] hover:scale-110"
          priority
        />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      <div className="container mx-auto h-full px-6 md:px-12 flex items-end pb-12 md:pb-20 relative z-10">
        <div className="max-w-2xl space-y-6 md:space-y-8 animate-in fade-in slide-in-from-left-10 duration-1000">
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-2xl md:text-5xl font-headline font-bold text-white uppercase tracking-tighter leading-tight">
              {activeBanner?.title ? (
                <>
                   {activeBanner.title.split(' ')[0]} <br className="hidden md:block" />
                   <span className="italic font-light text-accent">{activeBanner.title.split(' ').slice(1).join(' ')}</span>
                </>
              ) : (
                <>
                  Energy <br className="hidden md:block" />
                  <span className="italic font-light text-accent">Potência</span>
                </>
              )}
            </h1>
            <p className="text-xs md:text-lg text-white/80 font-light italic max-w-xs md:max-w-lg leading-relaxed">
              {activeBanner?.subtitle || "Sua nova definição de sofisticação, propósito e movimento."}
            </p>
          </div>
          <Button 
            onClick={onShopNow}
            className="rounded-full bg-white text-primary px-8 md:px-12 h-12 md:h-14 text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] shadow-xl hover:bg-accent hover:text-white transition-all"
          >
            {activeBanner?.ctaText || "Conferir Looks"}
          </Button>
        </div>
      </div>
      
      {activeBanner && (
        <div className="absolute top-24 md:top-36 right-6 md:right-16 z-20">
           <div className="px-3 md:px-5 py-1.5 md:py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-accent" />
              <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white/40">Visual IA</span>
           </div>
        </div>
      )}
    </section>
  );
}
