
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
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center bg-[#FFF9F7] overflow-hidden pt-20">
      <div className="absolute top-0 right-0 w-1/2 md:w-1/3 h-full bg-[#F7E8EA]/30 -skew-x-12 translate-x-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
          
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000 order-2 lg:order-1">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-[#F7E8EA]">
                <Sparkles className="h-3 w-3 text-[#C7A17A]" />
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-[#C7A17A]">
                  Moda Feminina
                </span>
              </div>
              
              <h1 className="text-4xl md:text-7xl font-serif font-bold text-[#6E3C47] leading-[1.1] tracking-tight">
                Elegância para quem <br className="hidden md:block" />
                <span className="italic text-[#C7A17A] font-light">sabe</span> o que quer
              </h1>
              
              <p className="text-base md:text-xl text-[#2A1F22]/70 max-w-lg leading-relaxed font-light">
                Peças pensadas para destacar sua presença em qualquer ocasião. Sinta a confiança de vestir a excelência.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 md:gap-6">
              <Button 
                onClick={onShopNow}
                className="flex-1 md:flex-none rounded-full bg-[#6E3C47] text-white px-8 md:px-12 h-14 md:h-16 text-[10px] font-bold uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-all"
              >
                Comprar agora
              </Button>
              <Button 
                variant="outline" 
                onClick={onShopNow}
                className="flex-1 md:flex-none rounded-full border-[#6E3C47] text-[#6E3C47] px-8 md:px-12 h-14 md:h-16 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#F7E8EA] transition-all"
              >
                Ver coleção
              </Button>
            </div>

            <div className="flex items-center gap-8 md:gap-12 pt-8 md:pt-12 border-t border-[#F7E8EA]">
              <div className="space-y-0.5">
                <p className="text-xl md:text-2xl font-serif font-bold text-[#6E3C47]">+2 Mil</p>
                <p className="text-[8px] md:text-[9px] uppercase font-bold text-[#C7A17A] tracking-widest">Clientes</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xl md:text-2xl font-serif font-bold text-[#6E3C47]">100%</p>
                <p className="text-[8px] md:text-[9px] uppercase font-bold text-[#C7A17A] tracking-widest">Seguro</p>
              </div>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right duration-1000 delay-300 order-1 lg:order-2">
            <div className="relative aspect-[4/5] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl border-[6px] md:border-[12px] border-white group">
              <Image
                src="https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=1200&q=1600"
                alt="Moda Feminina Toda Bela"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
              />
            </div>
            
            <div className="absolute -bottom-4 -left-4 md:-bottom-10 md:-left-10 bg-white/95 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-2xl border border-[#F7E8EA] hidden sm:block animate-float-editorial">
              <p className="text-[8px] md:text-[9px] font-bold text-[#C7A17A] uppercase mb-2 tracking-widest">Destaque</p>
              <h4 className="text-lg md:text-xl font-serif font-bold text-[#6E3C47] mb-1">Vestido Satin</h4>
              <p className="text-base md:text-lg font-bold text-[#6E3C47]">R$ 389,90</p>
              <button onClick={onShopNow} className="mt-4 text-[9px] font-bold uppercase text-[#6E3C47] flex items-center gap-2 group/btn">
                Ver Detalhes <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
