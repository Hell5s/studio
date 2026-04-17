
"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';

interface HeroProps {
  onShopNow?: () => void;
}

export function Hero({ onShopNow }: HeroProps) {
  const db = useFirestore();
  const bannersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'banners'), where('active', '==', true), limit(1));
  }, [db]);
  const { data: banners } = useCollection(bannersQuery);

  const heroData = banners?.[0] || {
    title: "Noites inesquecíveis pedem looks poderosos.",
    subtitle: "A Toda Bela nasceu para vestir mulheres que não temem o protagonismo, com uma curadoria fashion atemporal para ocasiões especiais.",
    campaign: "L'Essence 2024",
    campaignText: "Nova coleção • Preview",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80"
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      <div className="absolute top-0 right-0 w-[40%] h-full bg-secondary/20 -skew-x-6 translate-x-12 hidden lg:block" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[150px] -translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 md:px-12 relative z-10 pt-48 pb-20">
        <div className="grid lg:grid-cols-12 gap-16 xl:gap-24 items-center">
          
          <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-left-12 duration-1000">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-px w-16 bg-accent/40" />
                <span className="text-[11px] font-bold uppercase tracking-[0.8em] text-accent">
                  {heroData.campaignText}
                </span>
              </div>
              
              <h2 className="text-6xl md:text-[6.5rem] xl:text-[8rem] font-headline font-bold text-primary leading-[0.92] tracking-tighter max-w-4xl">
                {heroData.title.split(' ').map((word, i) => (
                  <span key={i} className={word.toLowerCase() === 'inesquecíveis' ? "text-accent italic font-light" : ""}>
                    {word}{" "}
                  </span>
                ))}
              </h2>
              
              <p className="max-w-xl text-xl text-muted-foreground/80 leading-relaxed font-light italic">
                {heroData.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-6 pt-4">
              <Button 
                onClick={onShopNow}
                className="rounded-full bg-primary hover:bg-primary/90 text-white px-12 py-9 text-[11px] font-bold uppercase tracking-[0.4em] shadow-2xl shadow-primary/20 transition-all hover:scale-105 group"
              >
                Comprar Coleção <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-2 transition-transform" />
              </Button>
              <Button variant="outline" className="rounded-full border-primary/10 text-primary px-12 py-9 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-white transition-all">
                Explorar Looks
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-8">
              {[
                "Moda feminina moderna",
                "Peças para toda ocasião",
                "Visual sofisticado e leve",
                "Curadoria exclusiva",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-primary/5 bg-white/50 px-6 py-4 text-sm text-muted-foreground backdrop-blur shadow-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-end animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
            <div className="relative w-full max-w-[500px]">
              <div className="relative aspect-[4/5.5] rounded-[4rem] overflow-hidden border-[12px] border-white shadow-premium z-20 group">
                <Image
                  src={heroData.image}
                  alt="Editorial Toda Bela"
                  fill
                  className="object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  priority
                />
              </div>

              <div className="absolute -left-12 bottom-12 z-30 w-72 glass p-10 rounded-[3rem] shadow-premium animate-float border-white/60">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-4">Editorial</p>
                <h4 className="text-2xl font-headline font-bold text-primary mb-3 leading-tight">{heroData.campaign}</h4>
                <p className="text-xs text-muted-foreground/80 leading-relaxed font-light italic mb-6">
                  {heroData.campaignText}
                </p>
                <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-primary hover:text-accent transition-colors group">
                  Ver Peças <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
