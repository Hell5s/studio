
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
    <section className="relative min-h-[85vh] flex items-center bg-[#FDF8F5] overflow-hidden pt-28 md:pt-32">
      {/* Textura e Profundidade de Fundo */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[120%] bg-[#F7E8EA] rounded-full blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[100%] bg-[#FDF8F5] rounded-full blur-[100px]" />
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
          
          {/* Coluna de Texto */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000 order-2 lg:order-1">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-1 py-1">
                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.5em] text-[#C7A17A]">
                  Nova Coleção 2026
                </span>
                <div className="h-px w-12 bg-[#C7A17A]/30" />
              </div>
              
              <h1 className="text-5xl md:text-8xl font-serif font-bold text-[#2A1F22] leading-[1.05] tracking-tight">
                Elegância que <br className="hidden md:block" />
                <span className="italic font-light text-[#C7A17A]">transforma</span>
              </h1>
              
              <p className="text-lg md:text-xl text-[#2A1F22]/60 max-w-md leading-relaxed font-light italic">
                Peças exclusivas com até 40% OFF. Design minimalista pensado para a mulher contemporânea.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button 
                onClick={onShopNow}
                className="rounded-full bg-[#42261E] text-white px-10 h-16 text-[11px] font-bold uppercase tracking-[0.3em] shadow-2xl hover:bg-[#2A1F22] hover:scale-105 transition-all duration-500"
              >
                Comprar Agora
              </Button>
              <Button 
                variant="ghost" 
                onClick={onShopNow}
                className="rounded-full text-[#42261E] px-10 h-16 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[#F7E8EA]/30 transition-all group"
              >
                Ver Produtos <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Selos de Confiança Discretos */}
            <div className="flex items-center gap-10 pt-12 border-t border-[#42261E]/5">
              <div className="flex flex-col">
                <span className="text-2xl font-serif font-bold text-[#42261E]">Premium</span>
                <span className="text-[9px] uppercase tracking-widest text-[#C7A17A] font-bold">Qualidade</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-serif font-bold text-[#42261E]">Exclusivo</span>
                <span className="text-[9px] uppercase tracking-widest text-[#C7A17A] font-bold">Curadoria</span>
              </div>
            </div>
          </div>

          {/* Coluna da Imagem */}
          <div className="relative animate-in fade-in slide-in-from-right duration-1000 delay-300 order-1 lg:order-2">
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(66,38,30,0.15)] group">
              <Image
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
                alt="Elegância Feminina Toda Bela"
                fill
                className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                priority
                data-ai-hint="fashion minimal"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#42261E]/10 via-transparent to-transparent opacity-40" />
            </div>
            
            {/* Detalhe Flutuante */}
            <div className="absolute -bottom-6 -right-6 md:-bottom-12 md:-right-12 bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-[#FDF8F5] hidden sm:block animate-float-editorial">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#C7A17A] uppercase tracking-[0.3em]">Must Have</p>
                <h4 className="text-xl font-serif font-bold text-[#42261E]">Blazer Minimal</h4>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-[#42261E]">R$ 489,90</span>
                  <span className="text-xs text-[#C7A17A] line-through">R$ 629,00</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
