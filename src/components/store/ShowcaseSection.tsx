"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, documentId } from 'firebase/firestore';
import { ProductCard } from './ProductCard';
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShowcaseSectionProps {
  id: string;
  eyebrow: string;
  title: string;
  linkText: string;
  linkUrl: string;
  productIds: string[];
  onAddToCart?: (product: any) => void;
}

export function ShowcaseSection({ id, eyebrow, title, linkText, linkUrl, productIds, onAddToCart }: ShowcaseSectionProps) {
  const db = useFirestore();
  // Até 8 peças por vitrine na home; o restante fica em "Ver todas as peças".
  const MAX_ITEMS = 8;

  const validProductIds = useMemo(() => (productIds || []).slice(0, 30), [productIds]);

  const productsQuery = useMemoFirebase(() => {
    if (!db || validProductIds.length === 0) return null;
    return query(collection(db, 'products'), where(documentId(), 'in', validProductIds));
  }, [db, validProductIds]);

  const { data: rawProducts, isLoading } = useCollection(productsQuery);

  const products = useMemo(() => {
    if (!rawProducts) return [];
    return validProductIds
      .map(id => rawProducts.find(p => p.id === id))
      .filter((p: any) => p && p.published !== false)
      .slice(0, MAX_ITEMS);
  }, [rawProducts, validProductIds]);

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 md:px-6 py-12 md:py-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-px w-12 bg-accent" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.6em] text-accent">
              {eyebrow}
            </span>
          </div>
          <h2 className="text-3xl md:text-6xl font-headline font-bold text-primary uppercase tracking-tighter leading-none">
            {title}
          </h2>
        </div>
        
        {linkText && (
          <Link 
            href={linkUrl || `/vitrine/${id}`} 
            className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary/60 underline underline-offset-8 hover:text-accent transition-colors"
          >
            {linkText}
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-12 animate-pulse">
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="aspect-[3/5] bg-secondary/50 rounded-2xl" />
           ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-12 md:px-0 md:pb-0 items-stretch md:items-start">
            {products.map((product: any) => (
              <div
                key={product.id}
                className="w-full min-w-0 md:w-auto md:shrink-0 md:snap-align-none h-full"
              >
                <ProductCard 
                  {...product} 
                  onAddToCart={(selectedP) => onAddToCart?.(selectedP || product)}
                />
              </div>
            ))}
          </div>

          {linkUrl && products.length > 0 && (
            <div className="md:hidden mt-8">
              <Link href={linkUrl || `/vitrine/${id}`}>
                <button
                  className="w-full rounded-full border border-primary bg-transparent px-3 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary transition-all active:scale-95"
                >
                  {linkText || "Ver todas as peças"}
                </button>
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}