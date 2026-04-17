
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  image: string;
  onAddToCart?: () => void;
}

export function ProductCard({
  id,
  name,
  price,
  oldPrice,
  badge,
  image,
  onAddToCart
}: ProductCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card className="group relative overflow-hidden rounded-[2rem] border-none bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      <Link href={`/products/${id}`} className="block relative aspect-[3/4] overflow-hidden cursor-pointer">
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
      </Link>
      <div className="p-6">
        <Link href={`/products/${id}`} className="block group/title">
          <h4 className="text-lg font-headline font-semibold text-foreground line-clamp-1 transition-colors group-hover/title:text-primary">
            {name}
          </h4>
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xl font-bold text-primary">{formatCurrency(price)}</span>
          {oldPrice && (
            <span className="text-sm text-muted-foreground line-through decoration-brand-wine/30">{formatCurrency(oldPrice)}</span>
          )}
        </div>
        <Button 
          onClick={(e) => {
            e.preventDefault();
            onAddToCart?.();
          }}
          className="mt-5 w-full rounded-full bg-foreground text-background hover:bg-primary transition-colors py-6 font-semibold"
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Adicionar ao carrinho
        </Button>
      </div>
    </Card>
  );
}
