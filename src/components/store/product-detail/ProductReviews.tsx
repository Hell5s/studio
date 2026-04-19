"use client";

import React from 'react';
import { Star, CheckCircle2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  user: string;
  headline: string;
  rating: number;
  comment: string;
  size: string;
  recommended: boolean;
}

const mockReviews: Review[] = [
  { id: '1', user: 'LUANA', headline: 'Linda', rating: 5, comment: 'Tecido simplesmente maravilhoso. A modelagem ficou perfeita no corpo, valoriza muito a silhueta. Com certeza comprarei outras cores.', size: 'P', recommended: true },
  { id: '2', user: 'TATIANE', headline: 'Lindo!', rating: 5, comment: 'Entrega muito rápida e embalagem de luxo. A peça é idêntica à foto, sofisticação pura.', size: 'G', recommended: true },
  { id: '3', user: 'ANA JULIA', headline: 'Lindoo, cor maravilhosa, sustentação excelente!', rating: 5, comment: 'Amei o caimento. Achei o tom de rose um pouco mais suave que na foto, mas ainda assim é lindo.', size: 'M', recommended: true },
  { id: '4', user: 'ANA', headline: 'Estou apaixonada nesse top, veste como luva!', rating: 5, comment: 'Tudo me incomoda, me aperta, ele não, ele ficou perfeito, nota mil.', size: 'M', recommended: true },
];

export function ProductReviews({ productId }: { productId: string }) {
  const StarRating = ({ rating, size = "h-2.5 w-2.5" }: { rating: number, size?: string }) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={cn(size, i < rating ? "fill-current text-black" : "text-gray-200")} />
      ))}
    </div>
  );

  return (
    <section id="avaliacoes" className="pt-20 border-t border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <h2 className="text-[14px] font-bold uppercase tracking-widest text-[#444]">Avaliações sobre o produto</h2>
        <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full">
          <CheckCircle2 className="h-4 w-4" />
          Compra 100% verificada
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-4 space-y-12">
          <div className="flex items-center gap-8">
            <div className="h-20 w-20 rounded-full border-4 border-black flex items-center justify-center">
              <span className="text-2xl font-bold">23</span>
            </div>
            <div className="space-y-1">
              <StarRating rating={5} size="h-4 w-4" />
              <p className="text-[12px] font-bold uppercase text-gray-400 tracking-widest">23 avaliações</p>
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Qualidade</span>
              <StarRating rating={5} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Preço</span>
              <StarRating rating={5} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Veste Bem</span>
              <StarRating rating={5} />
            </div>
          </div>

          <button className="w-full py-5 bg-black text-white text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-gray-800">
            FAZER AVALIAÇÃO
          </button>

          <div className="grid grid-cols-2 gap-8 pt-6">
            <div className="space-y-4">
              <h5 className="text-[11px] font-bold uppercase tracking-widest text-gray-300 text-center">Onde usar</h5>
              <ul className="text-center space-y-2 text-[12px] font-medium text-gray-500 italic">
                <li>Dia a dia</li>
                <li>Treino</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="text-[11px] font-bold uppercase tracking-widest text-gray-300 text-center">Vantagens</h5>
              <ul className="text-center space-y-2 text-[12px] font-medium text-gray-500 italic">
                <li>Conforto</li>
                <li>Beleza</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {mockReviews.map((review) => (
            <article key={review.id} className="p-10 bg-white border border-gray-100 space-y-6">
              <StarRating rating={review.rating} size="h-3 w-3" />
              <div className="space-y-3">
                <h4 className="text-[13px] font-bold text-[#444] uppercase">{review.headline}</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed font-light italic">"{review.comment}"</p>
              </div>
              {review.recommended && (
                <div className="flex items-center gap-2 text-[11px] text-gray-400 italic">
                  <div className="h-5 w-5 rounded-full border border-emerald-100 flex items-center justify-center bg-emerald-50">
                    <Check className="h-3 w-3 text-emerald-500" />
                  </div>
                  Sim, recomendaria a um amigo.
                </div>
              )}
              <div className="pt-4 border-t border-gray-50">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  {review.user} | TAMANHO: {review.size}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}