
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
    <Card className="group relative overflow-hidden rounded-[3rem] border-none bg-transparent transition-all duration-700">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[3rem] bg-secondary/20 shadow-sm">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          data-ai-hint="fashion apparel boutique"
        />
        
        {/* Badges */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          {badge && (
            <Badge className="bg-white/90 text-brand-wine border-none px-4 py-1.5 font-bold uppercase tracking-widest text-[9px] shadow-sm backdrop-blur">
              {badge}
            </Badge>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-brand-wine/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-3">
          <Button size="icon" className="rounded-full bg-white text-brand-wine hover:bg-brand-wine hover:text-white transition-all scale-75 group-hover:scale-100 duration-500">
            <Heart className="h-4 w-4" />
          </Button>
          <Link href={`/products/${id}`}>
            <Button size="icon" className="rounded-full bg-white text-brand-wine hover:bg-brand-wine hover:text-white transition-all scale-75 group-hover:scale-100 duration-500 delay-75">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Bottom Cart Action */}
        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <Button 
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.();
            }}
            className="w-full rounded-full bg-white text-brand-wine hover:bg-brand-wine hover:text-white py-6 font-bold uppercase tracking-widest text-[10px] shadow-xl"
          >
            <ShoppingBag className="mr-2 h-3.5 w-3.5" />
            Adicionar
          </Button>
        </div>
      </div>

      <div className="pt-6 px-2 text-center">
        <Link href={`/products/${id}`} className="group/title inline-block">
          <h4 className="text-sm font-headline font-bold text-brand-wine/80 group-hover/title:text-brand-wine transition-colors uppercase tracking-widest mb-2 line-clamp-1">
            {name}
          </h4>
        </Link>
        <div className="flex items-center justify-center gap-3">
          <span className="text-lg font-bold text-brand-wine">{formatCurrency(price)}</span>
          {oldPrice && (
            <span className="text-xs text-muted-foreground line-through decoration-brand-wine/20 italic">
              {formatCurrency(oldPrice)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
