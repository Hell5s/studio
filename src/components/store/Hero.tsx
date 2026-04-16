
import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Hero() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-fashion');
  
  const highlights = [
    "Moda feminina moderna",
    "Peças para toda ocasião",
    "Visual sofisticado e leve",
    "Curadoria exclusiva"
  ];

  return (
    <section className="relative overflow-hidden bg-secondary/30 pt-16 pb-24 lg:pt-24 lg:pb-32">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blush via-background to-brand-rose/20 opacity-50" />
      
      <div className="relative container mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 items-center gap-12 lg:gap-20">
          <div className="space-y-8 max-w-2xl">
            <div>
              <span className="inline-flex rounded-full border border-primary/20 bg-white/60 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary backdrop-blur">
                Coleção Primavera-Verão 2024
              </span>
              <h2 className="mt-8 text-5xl md:text-7xl font-headline font-semibold leading-[1.1] tracking-tight text-foreground">
                O seu novo <span className="text-primary italic">closet</span> online com essência.
              </h2>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
                A Toda Bela nasceu para vestir mulheres confiantes com uma curadoria fashion, feminina e contemporânea.
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

            <div className="grid sm:grid-cols-2 gap-4">
              {highlights.map((item) => (
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
                  src={heroImg?.imageUrl || "https://picsum.photos/seed/hero/800/1000"}
                  alt="Modelo Toda Bela"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              
              <div className="absolute bottom-8 left-8 right-8 rounded-3xl bg-white/90 p-6 shadow-2xl backdrop-blur transition-transform group-hover:-translate-y-2">
                <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-primary/60 mb-2">Coleção Destaque</p>
                <p className="text-2xl font-headline font-semibold text-foreground">Essência Urbana</p>
                <p className="mt-1 text-sm text-muted-foreground italic">Looks femininos com sofisticação e conforto</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
