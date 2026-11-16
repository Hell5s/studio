'use client';

import React from 'react';
import { Share2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRatingStat } from './useReviewStats';
import { formatBRL, installmentText, lowStockCount, promoEnd } from './utils';

// Nome, nota, preço e parcela. Aparece no alto da página no celular e na coluna lateral no computador.
export function ProductHeading({ product, className, as: Tag = 'h1' }: { product: any; className?: string; as?: 'h1' | 'h2' }) {
  const rating = useRatingStat(product.id);
  const price = Number(product.price) || 0;
  const oldPrice = Number(product.oldPrice) || 0;
  const hasOld = oldPrice > price;
  const end = hasOld ? promoEnd(product) : null;
  const low = lowStockCount(product);

  const share = async () => {
    const data = { title: product.name, url: window.location.href };
    if (navigator.share) await navigator.share(data).catch(() => {});
    else await navigator.clipboard?.writeText(data.url).catch(() => {});
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-start justify-between gap-4">
        <Tag className="text-2xl md:text-3xl font-bold text-primary leading-tight uppercase tracking-tight">{product.name}</Tag>
        <button onClick={share} aria-label="Compartilhar" className="text-gray-600 hover:text-primary transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center">
          <Share2 className="h-6 w-6 stroke-[1.5]" />
        </button>
      </div>

      {rating && (
        <button
          onClick={() => document.getElementById('avaliacoes')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="flex items-center gap-2 min-h-[44px] text-sm text-primary"
        >
          <Star className="h-4 w-4 fill-accent text-accent" />
          <b>{rating.avg}</b>
          <span className="underline underline-offset-4 text-gray-700">({rating.count} {rating.count === 1 ? 'avaliação' : 'avaliações'})</span>
        </button>
      )}

      <div className="space-y-1 border-y border-primary/10 py-5">
        <div className="flex flex-wrap items-baseline gap-3">
          <p className="text-3xl md:text-4xl font-bold text-primary leading-none">{formatBRL(price)}</p>
          {hasOld && <p className="text-base text-gray-600 line-through">{formatBRL(oldPrice)}</p>}
        </div>
        {end && <p className="text-xs font-bold text-red-700">Promoção até {end.toLocaleDateString('pt-BR')}</p>}
        <p className="text-sm text-primary/80 font-medium">ou {installmentText(price)}</p>
        {low !== null && <p className="text-sm font-bold text-red-700">Últimas peças: restam {low}</p>}
      </div>
    </div>
  );
}
