
"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export function Hero() {
  const db = useFirestore();

  // Fetch Banners from Firestore
  const bannersQuery = useMemoFirebase(() => {
    return query(collection(db, 'banners'), where('active', '==', true));
  }, [db]);
  const { data: banners, isLoading } = useCollection(bannersQuery);

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-secondary/10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Expanded fallbacks for a dynamic rotating experience
  const displayBanners = banners && banners.length > 0 ? banners : [
    {
      id: 'fallback-1',
      title: "O seu novo closet online com essência.",
      subtitle: "A Toda Bela nasceu para vestir mulheres confiantes com uma curadoria fashion, feminina e contemporânea.",
      campaign: "Essência Urbana",
      campaignText: "Coleção Primavera-Verão 2024",
      image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 'fallback-2',
      title: "Sinta a leveza da estação em cada look.",
      subtitle: "Tecidos fluidos e cores suaves que realçam sua beleza natural com sofisticação.",
      campaign: "Brisa de Verão",
      campaignText: "Lançamento Exclusivo",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 'fallback-3',
      title: "Noites inesquecíveis pedem looks poderosos.",
      subtitle: "Brilho, recortes e modelagens que celebram sua presença em qualquer evento.",
      campaign: "Glow Night",
      campaignText: "Moda Festa",
      image: "https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 'fallback-4',
      title: "Minimalismo que fala por si só.",
      subtitle: "Peças essenciais e atemporais para a mulher que valoriza o clean e o sofisticado.",
      campaign: "Pure Minimal",
      campaignText: "Essenciais",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  return (
    <section className="relative overflow-hidden bg-secondary/30">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {displayBanners.map((banner, index) => (
            <CarouselItem key={banner.id}>
              <div className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 min-h-[600px] flex items-center">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blush via-background to-brand-rose/20 opacity-50" />
                
                <div className="relative container mx-auto px-4 md:px-8">
                  <div className="grid lg:grid-cols-2 items-center gap-12 lg:gap-20">
                    <div className="space-y-8 max-w-2xl text-left">
                      <div>
                        <span className="inline-flex rounded-full border border-primary/20 bg-white/60 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary backdrop-blur">
                          {banner.campaignText || "Lançamento Exclusivo"}
                        </span>
                        <h2 className="mt-8 text-5xl md:text-7xl font-headline font-semibold leading-[1.1] tracking-tight text-foreground">
                          {banner.title}
                        </h2>
                        <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
                          {banner.subtitle}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-4">
                        <Button className="rounded-full px-8 py-7 text-base font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                          Comprar agora
                        </Button>
                        <Button variant="outline" className="rounded-full px-8 py-7 text-base font-semibold bg-white/50 backdrop-blur hover:bg-brand-blush/80">
                          Ver Coleção
                        </Button>
                      </div>

                      <div className="hidden sm:grid grid-cols-2 gap-4">
                        {[
                          "Moda feminina moderna",
                          "Peças para toda ocasião",
                          "Visual sofisticado e leve",
                          "Curadoria exclusiva"
                        ].map((item) => (
                          <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/40 p-4 text-sm font-medium text-foreground/80 shadow-sm backdrop-blur">
                            <div className="h-1.5 w-1.5 rounded-full bg-brand-plum" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full bg-brand-rose/30 blur-[80px] animate-pulse" />
                      <div className="absolute -right-8 -bottom-8 h-64 w-64 rounded-full bg-brand-gold/10 blur-[100px]" />
                      
                      <div className="relative overflow-hidden rounded-[2.5rem] border-[12px] border-white/60 bg-white/40 shadow-2xl backdrop-blur-sm">
                        <div className="relative aspect-[4/5] w-full">
                          <Image
                            src={banner.image}
                            alt={banner.campaign || "Banner Toda Bela"}
                            fill
                            className="object-cover transition duration-700 group-hover:scale-105"
                            priority={index === 0}
                            data-ai-hint="fashion banner"
                          />
                        </div>
                        
                        <div className="absolute bottom-8 left-8 right-8 rounded-3xl bg-white/90 p-6 shadow-2xl backdrop-blur transition-transform group-hover:-translate-y-2">
                          <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-primary/60 mb-2">Destaque</p>
                          <p className="text-2xl font-headline font-semibold text-foreground">{banner.campaign}</p>
                          <p className="mt-1 text-sm text-muted-foreground italic">Looks femininos com sofisticação e conforto</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious className="left-8 h-12 w-12 border-none bg-white/20 text-foreground hover:bg-white/80 backdrop-blur" />
          <CarouselNext className="right-8 h-12 w-12 border-none bg-white/20 text-foreground hover:bg-white/80 backdrop-blur" />
        </div>
      </Carousel>
    </section>
  );
}
