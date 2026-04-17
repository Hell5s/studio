"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Truck, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export function Hero() {
  const db = useFirestore();
  const bannersQuery = useMemoFirebase(() => {
    return query(collection(db, 'banners'), where('active', '==', true));
  }, [db]);
  const { data: banners } = useCollection(bannersQuery);

  const heroData = banners?.[0] || {
    title: "Noites inesquecíveis pedem looks poderosos",
    subtitle: "A Toda Bela nasceu para vestir mulheres que não temem o protagonismo, através de uma curadoria fashion atemporal e sofisticada.",
    campaign: "L'Essence 2024",
    campaignText: "Nova Coleção • Preview",
    image: "https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=1200&q=1600"
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      {/* Decorative Asymmetric Backgrounds */}
      <div className="absolute top-0 right-0 w-[45%] h-full bg-secondary/30 -skew-x-6 translate-x-12 hidden lg:block" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[150px] -translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 md:px-12 relative z-10 pt-48 pb-20">
        <div className="grid lg:grid-cols-12 gap-16 xl:gap-24 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-6 space-y-12 animate-in fade-in slide-in-from-left-12 duration-1000">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-px w-16 bg-accent/40" />
                <span className="text-[11px] font-bold uppercase tracking-[0.8em] text-accent">
                  {heroData.campaignText}
                </span>
              </div>
              
              <h2 className="text-6xl md:text-[7.5rem] xl:text-[9rem] font-headline font-bold text-primary text-editorial leading-[0.85] tracking-tighter">
                {heroData.title.split(' ').map((word, i) => (
                  <span key={i} className={i % 3 === 1 ? "block text-accent italic font-light ml-8 md:ml-16" : "block"}>
                    {word}{" "}
                  </span>
                ))}
              </h2>
              
              <p className="max-w-md text-lg text-muted-foreground/80 leading-relaxed font-light italic">
                {heroData.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-6 pt-4">
              <Button className="rounded-full bg-primary hover:bg-primary/90 text-white px-12 py-9 text-[11px] font-bold uppercase tracking-[0.4em] shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 group">
                Comprar Coleção <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-2 transition-transform" />
              </Button>
              <Button variant="outline" className="rounded-full border-primary/10 text-primary px-12 py-9 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-white hover:border-primary/30 transition-all">
                Explorar Looks
              </Button>
            </div>

            {/* Social Proof & Trust Integration */}
            <div className="flex flex-wrap items-center gap-12 pt-12 border-t border-primary/5">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-14 w-14 rounded-full border-[3px] border-white overflow-hidden bg-secondary shadow-lg relative">
                      <Image 
                        src={`https://picsum.photos/seed/face-${i+20}/100/100`} 
                        alt="Client" 
                        fill 
                        className="object-cover grayscale brightness-110" 
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-widest">+2k Clientes</span>
                  <div className="flex text-accent mt-1">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 fill-current" />)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8 text-primary/40">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-accent" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Todo Brasil</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Maison Segura</span>
                </div>
              </div>
            </div>
          </div>

          {/* Asymmetric Image Composition */}
          <div className="lg:col-span-6 relative flex justify-end animate-in fade-in slide-in-from-right-12 duration-1000 delay-300 mt-12 lg:mt-0">
            <div className="relative w-full max-w-[580px]">
              {/* Main Campaign Image */}
              <div className="relative aspect-[4/5.5] rounded-[6rem] overflow-hidden border-[16px] border-white shadow-premium z-20 group">
                <Image
                  src={heroData.image}
                  alt="Editorial Toda Bela"
                  fill
                  className="object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  priority
                  data-ai-hint="fashion editorial woman"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-60" />
              </div>

              {/* Floating Glass Context Card */}
              <div className="absolute -left-12 bottom-20 z-30 w-80 glass p-12 rounded-[4rem] shadow-premium animate-float border-white/60">
                <div className="h-12 w-12 bg-accent/20 rounded-full flex items-center justify-center mb-8">
                  <Sparkles className="h-5 w-5 text-accent" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-4">Maison D'Or</p>
                <h4 className="text-3xl font-headline font-bold text-primary mb-4 leading-tight">{heroData.campaign}</h4>
                <p className="text-xs text-muted-foreground/80 leading-relaxed font-light italic mb-8">
                  Curadoria artesanal de peças que transcendem estações e celebram a presença feminina.
                </p>
                <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-primary hover:text-accent transition-colors group">
                  Ver Coleção <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Decorative Geometric Elements */}
              <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-accent/10 -z-10 blur-[100px]" />
              <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-[4rem] border border-accent/20 -z-10 rotate-12 hidden md:block" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}