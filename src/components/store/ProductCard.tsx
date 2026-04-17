
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Heart, Eye } from 'lucide-react';
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
    <Card className="group relative overflow-hidden rounded-[3.5rem] border-none bg-transparent transition-all duration-700 hover:translate-y-[-12px]">
      <div className="relative aspect-[3/4.2] overflow-hidden rounded-[3.5rem] bg-secondary/20 shadow-premium">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover grayscale-[0.2] transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          data-ai-hint="boutique fashion clothing"
        />
        
        <div className="absolute top-8 left-8 flex flex-col gap-2">
          {badge && (
            <Badge className="bg-white/90 text-primary border-none px-6 py-2.5 font-bold uppercase tracking-[0.3em] text-[9px] shadow-lg backdrop-blur-md rounded-full">
              {badge}
            </Badge>
          )}
        </div>

        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4">
          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-full bg-white/90 text-primary hover:bg-primary hover:text-white transition-all scale-75 group-hover:scale-100 duration-500 shadow-xl"
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Link href={`/products/${id}`}>
            <Button 
              size="icon" 
              className="rounded-full bg-primary text-white hover:bg-accent hover:text-white transition-all scale-75 group-hover:scale-100 duration-500 delay-75 shadow-xl"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <Button 
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.();
            }}
            className="w-full rounded-full bg-white text-primary hover:bg-primary hover:text-white py-8 font-bold uppercase tracking-[0.4em] text-[10px] shadow-2xl transition-all duration-500"
          >
            <ShoppingBag className="mr-3 h-4 w-4" />
            Adicionar à Sacola
          </Button>
        </div>
      </div>

      <div className="pt-10 px-6 text-center space-y-4">
        <Link href={`/products/${id}`} className="group/link inline-block max-w-full">
          <h4 className="text-[13px] font-bold text-primary/70 group-hover/link:text-primary transition-colors uppercase tracking-[0.25em] line-clamp-1">
            {name}
          </h4>
        </Link>
        <div className="flex items-center justify-center gap-5">
          <span className="text-2xl font-bold text-primary">{formatCurrency(price)}</span>
          {oldPrice && (
            <span className="text-sm text-muted-foreground/50 line-through decoration-primary/20 italic font-light">
              {formatCurrency(oldPrice)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
