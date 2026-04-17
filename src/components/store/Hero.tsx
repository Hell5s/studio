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
    <section className="relative min-h-[95vh] flex items-center bg-[#FFF9F7] overflow-hidden">
      {/* Elementos de fundo para profundidade */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#F7E8EA]/30 -skew-x-12 translate-x-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-6 md:px-12 pt-32 pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          <div className="space-y-12 animate-in fade-in slide-in-from-left duration-1000">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm border border-[#F7E8EA]">
                <Sparkles className="h-3 w-3 text-[#C7A17A]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#C7A17A]">
                  Curadoria Exclusiva
                </span>
              </div>
              
              <h2 className="text-5xl md:text-8xl font-serif font-bold text-[#6E3C47] leading-[1] tracking-tight">
                Elegância que se <br />
                <span className="italic text-[#C7A17A] font-light">destaca</span> em <br />
                cada detalhe
              </h2>
              
              <p className="text-xl text-[#2A1F22]/70 max-w-lg leading-relaxed font-light">
                Peças pensadas para valorizar sua presença em qualquer ocasião. Sinta a confiança de vestir o que há de melhor na moda feminina.
              </p>
            </div>

            <div className="flex flex-wrap gap-6">
              <Button 
                onClick={onShopNow}
                className="rounded-full bg-[#6E3C47] hover:bg-[#6E3C47]/90 text-white px-12 py-8 text-xs font-bold uppercase tracking-[0.3em] shadow-2xl shadow-[#6E3C47]/20 transition-all hover:scale-105"
              >
                Comprar agora
              </Button>
              <Button 
                variant="outline" 
                onClick={onShopNow}
                className="rounded-full border-[#6E3C47] text-[#6E3C47] px-12 py-8 text-xs font-bold uppercase tracking-[0.3em] hover:bg-[#F7E8EA] transition-all"
              >
                Ver coleção
              </Button>
            </div>

            <div className="flex items-center gap-12 pt-12 border-t border-[#F7E8EA]">
              <div className="space-y-2">
                <p className="text-3xl font-serif font-bold text-[#6E3C47]">+2 Mil</p>
                <p className="text-[10px] uppercase font-bold text-[#C7A17A] tracking-widest">Clientes Satisfeitas</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-serif font-bold text-[#6E3C47]">100%</p>
                <p className="text-[10px] uppercase font-bold text-[#C7A17A] tracking-widest">Compra Segura</p>
              </div>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right duration-1000 delay-300">
            <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(110,60,71,0.15)] border-[12px] border-white group">
              <Image
                src="https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=1200&q=1600"
                alt="Moda Feminina Toda Bela"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
                data-ai-hint="mulher moda"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#6E3C47]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            
            {/* Card Flutuante */}
            <div className="absolute -bottom-12 -left-12 bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-[#F7E8EA] hidden md:block animate-float-editorial">
              <p className="text-[10px] font-bold text-[#C7A17A] uppercase mb-3 tracking-[0.3em]">Destaque da Semana</p>
              <h4 className="text-2xl font-serif font-bold text-[#6E3C47] mb-1">Vestido Rouge</h4>
              <p className="text-xl font-bold text-[#6E3C47]">R$ 389,90</p>
              <div className="mt-6 h-[1px] w-full bg-[#F7E8EA]" />
              <button onClick={onShopNow} className="mt-6 text-[10px] font-bold uppercase text-[#6E3C47] flex items-center gap-3 group/btn">
                Ver Detalhes <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
