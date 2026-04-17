
"use client";

import React from 'react';
import { ProductCard } from '@/components/store/ProductCard';

interface RelatedProductsProps {
  products: any[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section className="space-y-16">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-0.5 w-10 bg-accent/40" />
          <span className="text-[11px] font-bold uppercase tracking-[0.8em] text-accent">L'Inspiration</span>
          <div className="h-0.5 w-10 bg-accent/40" />
        </div>
        <h3 className="text-4xl md:text-6xl font-headline font-bold text-primary text-editorial">Complete seu Universo</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  );
}
