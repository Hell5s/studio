
"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Truck, ShieldCheck, Heart } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export function Hero() {
  const db = useFirestore();
  const bannersQuery = useMemoFirebase(() => {
    return query(collection(db, 'banners'), where('active', '==', true));
  }, [db]);
  const { data: banners } = useCollection(bannersQuery);

  const heroData = banners?.[0] || {
    title: "Mundo de Magia e Diversão para os Pequenos",
    subtitle: "Roupas e acessórios escolhidos com carinho para transformar cada momento da infância em uma aventura inesquecível.",
    campaign: "Coleção Estelar",
    campaignText: "Novidades Encantadas",
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1200&q=1600"
  };

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#F0F9FF]">
      {/* Playful Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-sky/10 -skew-x-12 translate-x-1/4" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-gold/10 rounded-full blur-[100px]" />
      <div className="absolute top-20 left-1/2 w-40 h-40 bg-brand-lavender/30 rounded-full blur-[80px]" />

      <div className="container mx-auto px-4 md:px-8 relative z-10 pt-20">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-6 space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-12 bg-brand-gold rounded-full" />
                <span className="text-[11px] font-bold uppercase tracking-[0.5em] text-brand-gold">
                  {heroData.campaignText}
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-headline font-bold text-foreground leading-[1.1] tracking-tight">
                {heroData.title}
              </h2>
              <p className="max-w-md text-lg text-muted-foreground leading-relaxed font-medium">
                {heroData.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-5">
              <Button className="rounded-full bg-brand-sky hover:bg-brand-sky/90 text-white px-10 py-8 text-sm font-bold uppercase tracking-widest shadow-2xl shadow-brand-sky/20 transition-all hover:scale-105">
                Ver Brinquedos
              </Button>
              <Button variant="outline" className="rounded-full border-brand-sky/20 text-brand-sky px-10 py-8 text-sm font-bold uppercase tracking-widest hover:bg-white">
                Coleção Roupas
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-8 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-brand-sky/20 flex items-center justify-center">
                      <Star className="h-4 w-4 text-brand-sky fill-brand-sky" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                    +5.000 Mamães Felizes
                  </span>
                  <div className="flex text-brand-gold">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 fill-current" />)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-brand-sky" />
                  <span className="text-[10px] font-bold uppercase">Frete Grátis*</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand-sky" />
                  <span className="text-[10px] font-bold uppercase">Loja Segura</span>
                </div>
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="lg:col-span-6 relative flex justify-end animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
            <div className="relative w-full max-w-[500px]">
              <div className="relative aspect-[4/5] rounded-[5rem] overflow-hidden border-[12px] border-white shadow-2xl z-20">
                <Image
                  src={heroData.image}
                  alt="Encanto Kids"
                  fill
                  className="object-cover"
                  priority
                  data-ai-hint="happy child playing"
                />
              </div>

              <div className="absolute -left-12 bottom-12 z-30 w-64 bg-white/90 backdrop-blur-xl p-6 rounded-[3rem] shadow-2xl border border-white group hover:-translate-y-2 transition-transform duration-500">
                <div className="h-1 w-12 bg-brand-sky mb-4 rounded-full" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-sky mb-1">Favorito</p>
                <h4 className="text-xl font-headline font-bold text-foreground mb-2">{heroData.campaign}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-4 line-clamp-2">
                  Qualidade e conforto que as crianças amam e os pais confiam.
                </p>
                <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-sky group-hover:gap-4 transition-all">
                  Explorar <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Playful Shapes */}
              <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-brand-gold opacity-20 -z-10 animate-bounce-slow" />
              <div className="absolute -right-20 bottom-20 h-32 w-32 rounded-[2rem] border-4 border-brand-sky/20 -z-10 rotate-12" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
