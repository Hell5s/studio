
"use client";

import React from 'react';
import { ProductCard } from '@/components/store/ProductCard';

interface RelatedProductsProps {
  products: any[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section className="space-y-20">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-[1px] w-12 bg-accent/30" />
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-accent">Personal Stylist</span>
          <div className="h-[1px] w-12 bg-accent/30" />
        </div>
        <h3 className="text-4xl md:text-6xl font-headline font-bold text-primary">Complete seu <span className="italic font-light">Universo</span></h3>
        <p className="text-sm md:text-lg text-muted-foreground italic font-light max-w-xl">Peças selecionadas pelo nosso time para criar combinações irresistíveis com sua escolha atual.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  );
}
