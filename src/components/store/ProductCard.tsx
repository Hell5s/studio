
"use client";

import React from 'react';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface ProductCardProps {
  id: number;
  name: string;
  price: string;
  oldPrice?: string;
  badge?: string;
  category: string;
  image: string;
  onAddToCart?: () => void;
}

export function ProductCard({
  name,
  price,
  oldPrice,
  badge,
  category,
  image,
  onAddToCart
}: ProductCardProps) {
  return (
    <Card className="group relative overflow-hidden rounded-[2rem] border-none bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          data-ai-hint="fashion product"
        />
        {badge && (
          <Badge className="absolute left-4 top-4 bg-white/90 text-primary hover:bg-white/100 border-none px-3 py-1 font-semibold">
            {badge}
          </Badge>
        )}
      </div>
      <div className="p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">{category}</p>
        <h4 className="text-lg font-headline font-semibold text-foreground line-clamp-1">{name}</h4>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xl font-bold text-primary">{price}</span>
          {oldPrice && (
            <span className="text-sm text-muted-foreground line-through decoration-brand-wine/30">{oldPrice}</span>
          )}
        </div>
        <Button 
          onClick={onAddToCart}
          className="mt-5 w-full rounded-full bg-foreground text-background hover:bg-primary transition-colors py-6 font-semibold"
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Adicionar ao carrinho
        </Button>
      </div>
    </Card>
  );
}
