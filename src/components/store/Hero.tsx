"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onShopNow?: () => void;
}

export function Hero({ onShopNow }: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-[#FFF9F7] overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 py-20 mt-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-10 animate-in fade-in slide-in-from-left duration-1000">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-[1px] w-8 bg-[#C7A17A]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#C7A17A]">
                  Curadoria Exclusiva
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-serif font-bold text-[#6E3C47] leading-[1.1] tracking-tight">
                Elegância para quem sabe o que quer
              </h2>
              <p className="text-lg text-[#2A1F22]/70 max-w-lg leading-relaxed font-light">
                Peças pensadas para destacar sua presença em qualquer ocasião. Sinta a confiança de vestir o que há de melhor na moda feminina.
              </p>
            </div>

            <div className="flex flex-wrap gap-5">
              <Button 
                onClick={onShopNow}
                className="rounded-full bg-[#6E3C47] hover:opacity-90 text-white px-10 py-7 text-xs font-bold uppercase tracking-[0.2em] shadow-2xl shadow-[#6E3C47]/20 transition-transform hover:scale-105"
              >
                Comprar agora
              </Button>
              <Button 
                variant="outline" 
                onClick={onShopNow}
                className="rounded-full border-[#6E3C47] text-[#6E3C47] px-10 py-7 text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#F7E8EA] transition-all"
              >
                Ver coleção
              </Button>
            </div>

            <div className="flex items-center gap-10 pt-10 border-t border-[#F7E8EA]">
              <div className="space-y-1">
                <p className="text-2xl font-serif font-bold text-[#6E3C47]">+2 Mil</p>
                <p className="text-[9px] uppercase font-bold text-[#C7A17A] tracking-widest">Clientes Satisfeitas</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-serif font-bold text-[#6E3C47]">100%</p>
                <p className="text-[9px] uppercase font-bold text-[#C7A17A] tracking-widest">Compra Segura</p>
              </div>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right duration-1000 delay-300">
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(110,60,71,0.15)] border-8 border-white">
              <Image
                src="https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=1000&q=80"
                alt="Moda Feminina Toda Bela"
                fill
                className="object-cover"
                priority
                data-ai-hint="mulher moda"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-white/90 backdrop-blur-md p-8 rounded-[2rem] shadow-2xl border border-[#F7E8EA] hidden md:block">
              <p className="text-[10px] font-bold text-[#C7A17A] uppercase mb-2 tracking-widest">Destaque da Semana</p>
              <p className="text-2xl font-serif font-bold text-[#6E3C47]">R$ 249,90</p>
              <div className="mt-4 h-[1px] w-full bg-[#F7E8EA]" />
              <button className="mt-4 text-[9px] font-bold uppercase text-[#6E3C47] flex items-center gap-2 group">
                Ver Detalhes <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
