
"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingCart } from 'lucide-react';

interface HeroProps {
  onShopNow?: () => void;
}

export function Hero({ onShopNow }: HeroProps) {
  return (
    <section className="relative min-h-[85vh] flex items-center bg-[#FFF9F7] overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 py-20 mt-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <div className="space-y-4">
              <span className="text-sm font-bold uppercase tracking-widest text-[#C7A17A]">
                Nova Coleção
              </span>
              <h2 className="text-5xl md:text-7xl font-bold text-[#6E3C47] leading-tight tracking-tight">
                Estilo e Elegância <br /> para você
              </h2>
              <p className="text-lg text-[#2A1F22]/70 max-w-lg leading-relaxed">
                Descubra looks modernos e versáteis que acompanham você em todas as ocasiões. Peças selecionadas para realçar sua beleza natural.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={onShopNow}
                className="rounded-full bg-[#6E3C47] hover:bg-[#6E3C47]/90 text-white px-10 py-7 text-sm font-bold uppercase tracking-widest shadow-xl flex items-center gap-3 transition-transform hover:scale-105"
              >
                Comprar agora <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={onShopNow}
                className="rounded-full border-[#6E3C47] text-[#6E3C47] px-10 py-7 text-sm font-bold uppercase tracking-widest hover:bg-[#F7E8EA] transition-all"
              >
                Ver produtos
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-6 border-t border-[#F7E8EA]">
              <div>
                <p className="text-2xl font-bold text-[#6E3C47]">+2.000</p>
                <p className="text-[10px] uppercase font-bold text-[#C7A17A]">Clientes Satisfeitas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#6E3C47]">100%</p>
                <p className="text-[10px] uppercase font-bold text-[#C7A17A]">Compra Segura</p>
              </div>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right duration-700 delay-200">
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=800&q=80"
                alt="Moda Feminina Toda Bela"
                fill
                className="object-cover"
                priority
                data-ai-hint="mulher moda"
              />
            </div>
            {/* Tag Flutuante de Preço */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-[#F7E8EA] animate-bounce-slow">
              <p className="text-[10px] font-bold text-[#C7A17A] uppercase mb-1">Destaque</p>
              <p className="text-xl font-bold text-[#6E3C47]">R$ 189,90</p>
              <button className="mt-2 text-[10px] font-bold uppercase text-[#6E3C47] flex items-center gap-1">
                Ver Detalhes <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
