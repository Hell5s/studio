
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
    <section className="container mx-auto px-4 md:px-6 py-20 md:py-32 border-t border-gray-100 bg-white">
      <div className="flex flex-col items-center text-center space-y-4 md:space-y-6 mb-16 md:mb-24">
        <div className="flex items-center gap-3">
           <div className="h-px w-8 md:w-12 bg-black/10" />
           <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] text-gray-400">Curadoria Especial</span>
           <div className="h-px w-8 md:w-12 bg-black/10" />
        </div>
        <h2 className="text-3xl md:text-6xl font-bold uppercase tracking-tighter text-[#111] leading-none">
          Você também <span className="italic font-light text-gray-400">vai gostar</span>
        </h2>
        <p className="text-gray-400 font-light italic text-sm md:text-lg max-w-xl mx-auto">
          Peças selecionadas para elevar sua presença e harmonizar com sua essência Toda Bela.
        </p>
      </div>

      {!isLoading && products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12">
           {products.map((p) => (
             <ProductCard key={p.id} {...p} />
           ))}
        </div>
      ) : isLoading ? (
        <div className="py-20 text-center text-gray-300 italic font-light animate-pulse">
          Sincronizando tendências...
        </div>
      ) : (
        <div className="py-20 text-center text-gray-300 italic font-light">
          Explore nossa coleção completa na página inicial.
        </div>
      )}

      <div className="mt-16 md:mt-24 text-center">
        <Link href="/">
           <Button variant="outline" className="rounded-full px-12 h-14 md:h-16 uppercase text-[10px] md:text-[11px] font-bold tracking-[0.3em] border-black/10 hover:bg-black hover:text-white transition-all duration-700 hover:scale-105 shadow-sm">
              Ver Coleção Completa
           </Button>
        </Link>
      </div>
    </section>
  );
}
