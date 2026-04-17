
"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Truck, ShieldCheck } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export function Hero() {
  const db = useFirestore();
  const bannersQuery = useMemoFirebase(() => {
    return query(collection(db, 'banners'), where('active', '==', true));
  }, [db]);
  const { data: banners } = useCollection(bannersQuery);

  const heroData = banners?.[0] || {
    title: "O Closet Online para Mulheres Protagonistas",
    subtitle: "A Toda Bela nasceu para vestir mulheres confiantes com uma curadoria fashion, feminina e atual.",
    campaign: "Essência Urbana",
    campaignText: "Looks que marcam presença",
    image: "https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=1200&q=1600"
  };

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-brand-blush/20">
      {/* Editorial Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-rose/20 -skew-x-12 translate-x-1/4" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-gold/10 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 md:px-8 relative z-10 pt-20">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-6 space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px w-12 bg-brand-gold" />
                <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-brand-gold">
                  {heroData.campaignText}
                </span>
              </div>
              <h2 className="text-6xl md:text-8xl font-headline font-bold text-brand-wine leading-[0.9] tracking-tighter">
                {heroData.title.split(' ').map((word, i) => (
                  <span key={i} className={i % 2 !== 0 ? "block text-brand-gold italic font-light" : "block"}>{word} </span>
                ))}
              </h2>
              <p className="max-w-md text-lg text-muted-foreground leading-relaxed font-light italic">
                {heroData.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-5">
              <Button className="rounded-full bg-brand-wine hover:bg-brand-plum text-white px-10 py-8 text-[10px] font-bold uppercase tracking-[0.3em] shadow-2xl shadow-brand-wine/30 transition-all hover:scale-105">
                Comprar Coleção
              </Button>
              <Button variant="outline" className="rounded-full border-brand-wine/20 text-brand-wine px-10 py-8 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white">
                Explorar Looks
              </Button>
            </div>

            {/* Prova Social Premium */}
            <div className="flex flex-wrap items-center gap-8 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white overflow-hidden bg-brand-rose">
                      <Image src={`https://picsum.photos/seed/${i+50}/100/100`} alt="Client" width={40} height={40} className="grayscale" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-brand-wine uppercase tracking-widest">+2k Clientes</span>
                  <div className="flex text-brand-gold">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 fill-current" />)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-brand-wine/40">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Brasil Todo</span>
                </div>
                <div className="h-4 w-px bg-brand-wine/10" />
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Loja Segura</span>
                </div>
              </div>
            </div>
          </div>

          {/* Image Section - Editorial Style */}
          <div className="lg:col-span-6 relative flex justify-end animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
            <div className="relative w-full max-w-[500px]">
              <div className="relative aspect-[4/5] rounded-[5rem] overflow-hidden border-[12px] border-white shadow-2xl z-20">
                <Image
                  src={heroData.image}
                  alt="Editorial Moda"
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                  priority
                  data-ai-hint="editorial fashion model"
                />
              </div>

              {/* Floating Glass Card */}
              <div className="absolute -left-12 bottom-12 z-30 w-64 bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border border-white/50 group hover:-translate-y-2 transition-transform duration-500">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-2">Editorial</p>
                <h4 className="text-xl font-headline font-bold text-brand-wine mb-2">{heroData.campaign}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-light italic mb-4">
                  Curadoria pensada na mulher que valoriza o atemporal.
                </p>
                <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-wine group-hover:gap-4 transition-all">
                  Ver Peças <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-brand-rose opacity-40 -z-10 blur-3xl animate-pulse" />
              <div className="absolute -right-20 bottom-20 h-32 w-32 rounded-[2rem] border-[1px] border-brand-gold/20 -z-10 rotate-12" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
