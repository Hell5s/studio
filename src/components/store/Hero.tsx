
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
    title: "Noites inesquecíveis pedem looks poderosos",
    subtitle: "A elegância é a única beleza que nunca desaparece. Descubra nossa nova curadoria de peças que celebram a sua presença.",
    campaign: "Glow Night Edition",
    campaignText: "Nova Coleção Moda Festa",
    image: "https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=1200&q=1600"
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#FFF9F7]">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-blush/30 -skew-x-12 translate-x-1/2" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-rose/20 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 md:px-8 relative z-10 pt-20">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-6 space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="h-px w-12 bg-brand-gold" />
                <span className="text-[11px] font-bold uppercase tracking-[0.5em] text-brand-gold">
                  {heroData.campaignText}
                </span>
              </div>
              <h2 className="text-6xl md:text-8xl font-headline font-bold text-brand-wine leading-[0.9] tracking-tight">
                {heroData.title.split(' ').map((word, i) => (
                  <span key={i} className={i % 3 === 0 ? "block" : "inline-block mr-4"}>
                    {word}
                  </span>
                ))}
              </h2>
              <p className="max-w-md text-lg text-muted-foreground leading-relaxed font-light italic">
                {heroData.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-5">
              <Button className="rounded-full bg-brand-wine hover:bg-brand-wine/90 text-white px-10 py-8 text-sm font-bold uppercase tracking-widest shadow-2xl shadow-brand-wine/20 transition-all hover:scale-105">
                Comprar Coleção
              </Button>
              <Button variant="outline" className="rounded-full border-brand-wine/20 text-brand-wine px-10 py-8 text-sm font-bold uppercase tracking-widest hover:bg-brand-blush/50">
                Explorar Looks
              </Button>
            </div>

            {/* Social Proof & Features */}
            <div className="flex flex-wrap items-center gap-8 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-brand-rose" />
                  ))}
                </div>
                <div className="flex flex-col">
                  <div className="flex text-brand-gold">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 fill-current" />)}
                  </div>
                  <span className="text-[10px] font-bold text-brand-wine/60 uppercase tracking-tighter">
                    +2.000 clientes satisfeitas
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-brand-wine/40">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase">Envio Nacional</span>
                </div>
                <div className="h-4 w-px bg-brand-wine/10" />
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase">Compra Segura</span>
                </div>
              </div>
            </div>
          </div>

          {/* Editorial Image Section */}
          <div className="lg:col-span-6 relative flex justify-end animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
            <div className="relative w-full max-w-[500px]">
              {/* Main Image Frame */}
              <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden border-[16px] border-white shadow-[0_40px_100px_-20px_rgba(110,60,71,0.15)] z-20">
                <Image
                  src={heroData.image}
                  alt="Editorial Fashion"
                  fill
                  className="object-cover"
                  priority
                  data-ai-hint="fashion model editorial"
                />
              </div>

              {/* Floating Decorative Card */}
              <div className="absolute -left-12 bottom-12 z-30 w-64 bg-white/70 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-white/50 group hover:-translate-y-2 transition-transform duration-500">
                <div className="h-1 w-12 bg-brand-gold mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-1">Destaque</p>
                <h4 className="text-xl font-headline font-bold text-brand-wine mb-2">{heroData.campaign}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed italic mb-4 line-clamp-2">
                  Modelagem exclusiva pensada na silhueta da mulher contemporânea.
                </p>
                <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-wine group-hover:gap-4 transition-all">
                  Ver Peça <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Background Shapes */}
              <div className="absolute -right-8 -top-8 h-48 w-48 rounded-[3rem] bg-brand-rose opacity-40 -z-10 rotate-12" />
              <div className="absolute -right-20 bottom-20 h-32 w-32 rounded-full border-2 border-brand-gold/20 -z-10" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
