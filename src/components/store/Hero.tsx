
"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroProps {
  onShopNow?: () => void;
}

export function Hero({ onShopNow }: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#FDF8F5] pt-20">
      {/* Background Decorativo */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,#F7E8EA_0%,transparent_50%)]" />
      
      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Lado Esquerdo: Conteúdo Editorial */}
        <div className="space-y-10 md:space-y-14 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="space-y-6 md:space-y-8">
            <h2 className="text-6xl md:text-[7.5rem] font-serif font-bold leading-[0.9] tracking-tighter">
              <span className="text-[#6E3C47] block">Noites</span>
              <span className="text-[#C7A17A] italic block ml-8 md:ml-16">inesquecíveis</span>
              <span className="text-[#6E3C47] block">pedem</span>
              <span className="text-[#C7A17A] italic block ml-4 md:ml-8">looks</span>
              <span className="text-[#6E3C47] block">poderosos</span>
            </h2>
            
            <p className="max-w-md text-base md:text-lg text-[#2A1F22]/60 font-light italic leading-relaxed">
              A Toda Bela nasceu para vestir mulheres que não temem o protagonismo, 
              através de uma curadoria fashion atemporal.
            </p>
          </div>

          <Button 
            onClick={onShopNow}
            className="rounded-full bg-[#6E3C47] text-white px-12 h-20 text-[11px] font-bold uppercase tracking-[0.5em] shadow-2xl hover:bg-[#C7A17A] transition-all duration-700 transform hover:scale-105"
          >
            Comprar Coleção <ArrowRight className="ml-4 h-4 w-4" />
          </Button>
        </div>

        {/* Lado Direito: Imagem Editorial com Card Flutuante */}
        <div className="relative aspect-[4/5] md:aspect-[5/6] w-full animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
          <div className="relative h-full w-full rounded-[4rem] md:rounded-[6rem] overflow-hidden shadow-editorial border border-black/5">
            <Image
              src="https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=1200&q=80"
              alt="Editorial Toda Bela"
              fill
              className="object-cover"
              priority
              data-ai-hint="fashion trio"
            />
          </div>

          {/* Card Flutuante: L'Essence 2024 */}
          <div className="absolute -bottom-8 -left-8 md:-bottom-12 md:-left-12 w-64 md:w-80 glass-morphism p-8 md:p-10 rounded-[3rem] shadow-2xl border-white/50 animate-float-editorial">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-[#C7A17A]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#C7A17A]">Destaque</span>
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-[#6E3C47] mb-3">L'Essence 2026</h3>
                <p className="text-[11px] text-[#2A1F22]/50 font-light italic leading-relaxed">
                  Curadoria manual de peças que transcendem a estação.
                </p>
              </div>
              <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#6E3C47] hover:text-[#C7A17A] transition-colors group">
                Ver Peças <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Decoração Visual (Borda Branca Curva) */}
          <div className="absolute -top-10 -right-10 w-64 h-64 border-[1px] border-white/40 rounded-[5rem] pointer-events-none hidden md:block" />
        </div>
      </div>

      {/* Badge de Rodapé da Hero */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block opacity-10">
        <span className="text-[100px] font-serif font-bold text-[#6E3C47] select-none">Toda Bela</span>
      </div>
    </section>
  );
}
