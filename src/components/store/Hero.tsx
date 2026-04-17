"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
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
    title: "A Presença que o Tempo não Apaga",
    subtitle: "A Toda Bela nasceu para vestir mulheres que decidem ser protagonistas de sua própria jornada, com uma curadoria de luxo atemporal.",
    campaign: "Éditorial L'Aura",
    campaignText: "Lançamento Exclusivo • Maison 2024",
    image: "https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=1200&q=80"
  };

  return (
    <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-background">
      {/* Decorative skewed element */}
      <div className="absolute top-0 right-0 w-[45%] h-full bg-secondary/30 -skew-x-12 translate-x-20 hidden lg:block" />
      <div className="absolute top-1/2 left-0 w-[40rem] h-[40rem] bg-accent/5 rounded-full blur-[180px] -translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-6 md:px-12 relative z-10 pt-48 pb-20">
        <div className="grid lg:grid-cols-12 gap-20 xl:gap-32 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-left-12 duration-1000">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-[1px] w-20 bg-accent/40" />
                <span className="text-[10px] font-bold uppercase tracking-[0.8em] text-accent">
                  {heroData.campaignText}
                </span>
              </div>
              
              <h2 className="text-6xl md:text-[6rem] xl:text-[7.5rem] font-headline font-bold text-primary leading-[0.92] tracking-tighter max-w-4xl">
                {heroData.title.split(' ').map((word, i) => (
                  <span key={i} className={i === 2 || i === 3 ? "text-accent italic font-light" : ""}>
                    {word}{" "}
                  </span>
                ))}
              </h2>
              
              <p className="max-w-xl text-xl text-muted-foreground/80 leading-relaxed font-light italic">
                {heroData.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-8 pt-4">
              <Button 
                onClick={onShopNow}
                className="rounded-full bg-primary hover:bg-accent text-white px-14 py-10 text-[11px] font-bold uppercase tracking-[0.4em] shadow-editorial transition-all hover:scale-105 group"
              >
                Comprar Coleção <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-2 transition-transform" />
              </Button>
              <Button variant="outline" className="rounded-full border-primary/10 text-primary px-14 py-10 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-white transition-all">
                Ver Editoriais
              </Button>
            </div>

            {/* Quick Benefits Badges */}
            <div className="grid sm:grid-cols-2 gap-4 pt-10">
              {[
                { text: "Curadoria Internacional", icon: <Sparkles className="h-3.5 w-3.5 text-accent" /> },
                { text: "Design Atemporal", icon: <Sparkles className="h-3.5 w-3.5 text-accent" /> },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 rounded-3xl border border-primary/5 bg-white/60 px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground backdrop-blur shadow-sm">
                  {item.icon}
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Visual Content */}
          <div className="lg:col-span-5 relative flex justify-end animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
            <div className="relative w-full max-w-[500px]">
              {/* Main Image */}
              <div className="relative aspect-[4/5.5] rounded-[4rem] overflow-hidden border-[12px] border-white shadow-editorial z-20 group">
                <Image
                  src={heroData.image}
                  alt="Editorial Toda Bela"
                  fill
                  className="object-cover transition-all duration-1000 group-hover:scale-105"
                  priority
                  data-ai-hint="fashion campaign editorial"
                />
              </div>

              {/* Floating Editorial Card */}
              <div className="absolute -left-12 bottom-12 z-30 w-80 glass-morphism p-10 rounded-[3rem] shadow-editorial animate-float-editorial border-white/60">
                <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-accent mb-4">Édition Limitée</p>
                <h4 className="text-2xl font-headline font-bold text-primary mb-3 leading-tight">{heroData.campaign}</h4>
                <p className="text-xs text-muted-foreground/80 leading-relaxed font-light italic mb-6">
                  Descubra a coleção que redefine a elegância para a mulher contemporânea.
                </p>
                <button className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.5em] text-primary hover:text-accent transition-colors group">
                  Explorar <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}