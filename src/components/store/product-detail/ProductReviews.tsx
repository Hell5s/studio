
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
    <section id="avaliacoes" className="pt-20 border-t border-primary/5">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Avaliações sobre o produto</h2>
        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Compra 100% verificada
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Left Column: Stats & Meta */}
        <div className="lg:col-span-4 space-y-10">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-full border-2 border-black flex items-center justify-center">
              <span className="text-xl font-bold">23</span>
            </div>
            <div className="space-y-1">
              <StarRating rating={5} size="h-3.5 w-3.5" />
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">23 avaliações</p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <StarRating rating={5} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Qualidade</span>
              </div>
            </div>
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <StarRating rating={5} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Preço</span>
              </div>
            </div>
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <StarRating rating={5} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Veste Bem</span>
              </div>
            </div>
          </div>

          <button className="w-full py-5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.3em] transition-all hover:bg-primary active:scale-95">
            Fazer Avaliação
          </button>

          <div className="grid grid-cols-2 gap-8 pt-6">
            <div className="space-y-4">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-primary/40 text-center">Onde usar</h5>
              <ul className="text-center space-y-2 text-[11px] font-light text-muted-foreground italic">
                <li>Conforto</li>
                <li>Lindo</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-primary/40 text-center">Vantagens</h5>
              <ul className="text-center space-y-2 text-[11px] font-light text-muted-foreground italic">
                <li>Treino</li>
                <li>Academia</li>
                <li>Balada</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-8 space-y-4">
          {mockReviews.map((review) => (
            <article key={review.id} className="p-8 bg-white border border-primary/5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <StarRating rating={review.rating} />
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-primary">{review.headline}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-light italic">{review.comment}</p>
              </div>
              {review.recommended && (
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 italic">
                  <div className="h-4 w-4 rounded-full border border-primary/10 flex items-center justify-center">
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  Sim, recomendaria a um amigo.
                </div>
              )}
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                {review.user} | Tamanho: {review.size}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
