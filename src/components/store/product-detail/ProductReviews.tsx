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

const StarRating = ({ rating, size = "h-3 w-3" }: { rating: number; size?: string }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star key={i} className={cn(size, i < rating ? "fill-current text-black" : "text-gray-200 fill-current")} />
    ))}
  </div>
);

export function ProductReviews({ productId }: { productId: string }) {
  return (
    <section id="avaliacoes" className="pt-16 border-t border-gray-100">
      {/* Header - estilo Kaisan */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-black">
          Avaliações sobre o produto
        </h2>
        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Compra 100% verificada
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Coluna esquerda: Stats */}
        <div className="lg:col-span-4 space-y-8">
          {/* Número e estrelas */}
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-full border-2 border-black flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-black">23</span>
            </div>
            <div className="space-y-1">
              <StarRating rating={5} size="h-3.5 w-3.5" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">23 avaliações</p>
            </div>
          </div>

          {/* Categorias */}
          <div className="space-y-3">
            {[
              { label: 'Qualidade', rating: 5 },
              { label: 'Preço', rating: 5 },
              { label: 'Veste Bem', rating: 5 },
            ].map(({ label, rating }) => (
              <div key={label} className="flex items-center gap-3">
                <StarRating rating={rating} size="h-2.5 w-2.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
              </div>
            ))}
          </div>

          {/* Botão fazer avaliação */}
          <button className="w-full py-4 bg-black text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gray-900 transition-colors">
            Fazer Avaliação
          </button>

          {/* Onde usar / Vantagens */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Onde usar</h5>
              <ul className="text-center space-y-1.5">
                <li className="text-[11px] text-gray-500">Conforto</li>
                <li className="text-[11px] text-gray-500">Lindo</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Vantagens</h5>
              <ul className="text-center space-y-1.5">
                <li className="text-[11px] text-gray-500">Treino</li>
                <li className="text-[11px] text-gray-500">Academia</li>
                <li className="text-[11px] text-gray-500">Balada</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Coluna direita: Reviews */}
        <div className="lg:col-span-8 space-y-3">
          {mockReviews.map((review) => (
            <article key={review.id} className="p-6 border border-gray-100 space-y-3 bg-white hover:border-gray-200 transition-colors">
              <StarRating rating={review.rating} size="h-3 w-3" />
              <div className="space-y-1.5">
                <h4 className="text-[13px] font-semibold text-black">{review.headline}</h4>
                <p className="text-[12px] text-gray-500 leading-relaxed italic">{review.comment}</p>
              </div>
              {review.recommended && (
                <div className="flex items-center gap-2 text-[10px] text-gray-400 italic">
                  <div className="h-3.5 w-3.5 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
                    <Check className="h-2 w-2" />
                  </div>
                  Sim, recomendaria a um amigo.
                </div>
              )}
              <p className="text-[10px] font-bold uppercase tracking-widest text-black">
                {review.user} | Tamanho: {review.size}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
