
"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, documentId } from 'firebase/firestore';
import { ProductCard } from './ProductCard';
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShowcaseSectionProps {
  eyebrow: string;
  title: string;
  linkText: string;
  linkUrl: string;
  productIds: string[];
}

export function ShowcaseSection({ eyebrow, title, linkText, linkUrl, productIds }: ShowcaseSectionProps) {
  const db = useFirestore();

  // Firestore "in" query has a limit of 30 items. 
  // Adicionado fallback de array vazio para evitar erros se productIds estiver undefined.
  const validProductIds = useMemo(() => (productIds || []).slice(0, 30), [productIds]);

  const productsQuery = useMemoFirebase(() => {
    if (!db || validProductIds.length === 0) return null;
    return query(collection(db, 'products'), where(documentId(), 'in', validProductIds));
  }, [db, validProductIds]);

  const { data: rawProducts, isLoading } = useCollection(productsQuery);

  // Mantém a ordem exata escolhida no admin (o Firestore 'in' não garante ordem)
  const products = useMemo(() => {
    if (!rawProducts) return [];
    return validProductIds
      .map(id => rawProducts.find(p => p.id === id))
      .filter(Boolean);
  }, [rawProducts, validProductIds]);

  // Se não estiver carregando e não houver produtos válidos, não renderiza a seção.
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
        
        {linkText && linkUrl && (
          <Link href={linkUrl} className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary/60 underline underline-offset-8 hover:text-accent transition-colors">
            {linkText}
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 md:py-40 space-y-6">
          <Loader2 className="h-12 w-12 animate-spin text-accent/30" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Sincronizando Vitrine...</p>
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-3 snap-x snap-mandatory scroll-smooth pb-4 px-4 [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-12 md:px-0 md:pb-0 -mx-4 md:mx-0 items-start">
          {products.map((product) => (
            <div key={product.id} className="w-[45vw] shrink-0 snap-start md:w-auto md:shrink md:snap-align-none">
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
