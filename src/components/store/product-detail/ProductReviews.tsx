
"use client";

import React from 'react';
import { Star, User, CheckCircle2, ThumbsUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  variant?: string;
  date: string;
  verified: boolean;
}

const mockReviews: Review[] = [
  { id: '1', user: 'Mariana S.', rating: 5, comment: 'Tecido simplesmente maravilhoso. A modelagem ficou perfeita no corpo, valoriza muito a silhueta. Com certeza comprarei outras cores.', variant: 'Preto / M', date: '15 Jan 2024', verified: true },
  { id: '2', user: 'Fernanda L.', rating: 5, comment: 'Entrega muito rápida e embalagem de luxo. A peça é idêntica à foto, sofisticação pura.', variant: 'Rose / P', date: '02 Fev 2024', verified: true },
  { id: '3', user: 'Beatriz G.', rating: 4, comment: 'Amei o caimento. Achei o tom de rose um pouco mais suave que na foto, mas ainda assim é lindo.', variant: 'Rose / G', date: '28 Dez 2023', verified: true },
];

export function ProductReviews({ productId }: { productId: string }) {
  return (
    <section id="avaliacoes" className="space-y-16">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        {/* Rating Summary Card */}
        <div className="w-full md:w-80 p-10 rounded-[3rem] bg-secondary/10 space-y-8">
           <div className="text-center space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Avaliação Geral</p>
              <p className="text-7xl font-headline font-bold text-primary">4.9</p>
              <div className="flex justify-center gap-1 text-accent">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-5 w-5 fill-current" />)}
              </div>
              <p className="text-xs text-muted-foreground italic font-light pt-2">Baseado em 24 experiências</p>
           </div>

           <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-4 group">
                  <span className="text-[10px] font-bold text-primary/40 w-4">{rating}</span>
                  <Progress value={rating === 5 ? 90 : rating === 4 ? 10 : 0} className="h-1.5 flex-1 bg-white" />
                </div>
              ))}
           </div>
        </div>

        {/* Reviews List */}
        <div className="flex-1 space-y-12">
          <div className="flex items-center justify-between border-b border-primary/5 pb-8">
             <h4 className="text-2xl font-headline font-bold text-primary">Vozes da <span className="italic font-light text-accent">Boutique</span></h4>
             <select className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-primary/40 outline-none">
                <option>Mais Recentes</option>
                <option>Melhores Notas</option>
             </select>
          </div>

          <div className="divide-y divide-primary/5 space-y-12">
            {mockReviews.map((review) => (
              <article key={review.id} className="pt-12 first:pt-0 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-accent">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h5 className="text-sm font-bold text-primary">{review.user}</h5>
                        {review.verified && (
                          <div className="flex items-center gap-1 text-[8px] font-black uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Compra Verificada
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 italic">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-accent">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn("h-3 w-3", i < review.rating ? "fill-current" : "text-primary/10")} />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-base text-muted-foreground leading-relaxed font-light italic">"{review.comment}"</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-primary/30">Opção: {review.variant}</p>
                    <button className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-primary/40 hover:text-accent transition-colors">
                      <ThumbsUp className="h-3 w-3" /> Útil (3)
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
