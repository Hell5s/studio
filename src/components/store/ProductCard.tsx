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
  category?: string;
  onAddToCart?: () => void;
}

export function ProductCard({
  id,
  name,
  price,
  oldPrice,
  badge,
  image,
  category,
  onAddToCart
}: ProductCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card className="group relative overflow-hidden rounded-[3.5rem] border-none bg-transparent transition-all duration-700">
      <div className="relative aspect-[3/4.2] overflow-hidden rounded-[3.5rem] bg-secondary/30 shadow-editorial">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-all duration-1000 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 25vw"
          data-ai-hint="boutique fashion clothing"
        />
        
        {/* Badges */}
        <div className="absolute top-8 left-8 flex flex-col gap-2">
          {badge && (
            <Badge className="bg-white/90 text-primary border-none px-6 py-2 font-bold uppercase tracking-widest text-[9px] shadow-lg rounded-full">
              {badge}
            </Badge>
          )}
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4">
          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-full bg-white/90 text-primary hover:bg-primary hover:text-white transition-all scale-75 group-hover:scale-100 duration-500"
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Link href={`/products/${id}`}>
            <Button 
              size="icon" 
              className="rounded-full bg-primary text-white hover:bg-accent transition-all scale-75 group-hover:scale-100 duration-500 delay-75"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Quick Add Button */}
        <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-[105%] group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
          <Button 
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.();
            }}
            className="w-full rounded-full bg-white text-primary hover:bg-primary hover:text-white h-16 font-bold uppercase tracking-widest text-[10px] shadow-2xl transition-all"
          >
            <ShoppingBag className="mr-3 h-4 w-4" />
            Adicionar à Sacola
          </Button>
        </div>
      </div>

      <div className="pt-10 px-4 text-center space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent/60">
          {category || "Maison Toda Bela"}
        </p>
        <Link href={`/products/${id}`} className="block">
          <h4 className="text-lg font-headline font-bold text-primary group-hover:text-accent transition-colors">
            {name}
          </h4>
        </Link>
        <div className="flex items-center justify-center gap-4">
          <span className="text-2xl font-bold text-primary">{formatCurrency(price)}</span>
          {oldPrice && (
            <span className="text-sm text-muted-foreground/40 line-through italic font-light">
              {formatCurrency(oldPrice)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}