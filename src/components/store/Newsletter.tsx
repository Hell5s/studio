
"use client";

import React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, limit, orderBy } from 'firebase/firestore';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Newsletter() {
  const db = useFirestore();

  // Busca uma seleção de produtos para sugerir (os 4 mais recentes)
  const queryItems = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), limit(4), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: products, isLoading } = useCollection(queryItems);

  return (
    <section className="container mx-auto px-4 md:px-6 py-16 md:py-32 border-t border-gray-100 bg-white">
      <div className="flex flex-col items-center text-center space-y-4 md:space-y-6 mb-12 md:mb-24">
        <h2 className="text-3xl md:text-6xl font-headline font-bold text-primary uppercase tracking-tighter leading-none">
          Inspirações <span className="italic font-light text-accent">Extraordinárias</span>
        </h2>
        <p className="text-muted-foreground font-light italic text-base md:text-xl max-w-xl mx-auto">
          Peças selecionadas pela nossa equipe para elevar sua presença e harmonizar com sua essência Toda Bela.
        </p>
      </div>

      {!isLoading && products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12">
           {products.map((p) => (
             <ProductCard key={p.id} {...p} />
           ))}
        </div>
      ) : isLoading ? (
        <div className="py-24 text-center text-gray-300 italic font-light animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Buscando tendências...</span>
        </div>
      ) : (
        <div className="py-24 text-center text-gray-300 italic font-light">
          Explore nossa coleção completa para encontrar o look perfeito.
        </div>
      )}

      <div className="mt-12 md:mt-24 text-center">
        <Link href="/">
           <Button variant="outline" className="rounded-full px-12 md:px-20 h-14 md:h-20 uppercase text-[10px] md:text-sm font-bold tracking-[0.4em] border-primary text-primary hover:bg-primary hover:text-white transition-all duration-700 shadow-xl min-h-[54px]">
              Ver Coleção Completa
           </Button>
        </Link>
      </div>
    </section>
  );
}
