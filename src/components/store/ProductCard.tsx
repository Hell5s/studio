
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Eye, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  image: string;
  category?: string;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

export function ProductCard({
  id,
  name,
  price,
  oldPrice,
  badge,
  image,
  category,
  onAddToCart,
  onBuyNow
}: ProductCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="group bg-white rounded-[1.5rem] md:rounded-[3.5rem] border border-accent/5 overflow-hidden shadow-sm hover:shadow-editorial transition-all duration-700 flex flex-col h-full">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-[1.5s] group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, 25vw"
          data-ai-hint="fashion clothes"
        />
        
        <div className="absolute top-3 left-3 right-3 md:top-8 md:left-8 md:right-8 flex justify-between items-start z-10">
          {badge ? (
            <Badge className="bg-primary text-white border-none px-3 md:px-6 py-1.5 md:py-2.5 font-bold uppercase text-[7px] md:text-[9px] rounded-full tracking-[0.2em] md:tracking-[0.3em] shadow-xl">
              {badge}
            </Badge>
          ) : <div />}
          
          <button className="h-8 w-8 md:h-11 md:w-11 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-primary shadow-lg md:opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-primary hover:text-white transform translate-y-0 md:translate-y-2 md:group-hover:translate-y-0">
            <Heart className="h-3.5 w-3.5 md:h-4.5 md:w-4.5" />
          </button>
        </div>

        {/* Quick View no Hover (Desktop) */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 hidden md:flex items-center justify-center">
          <Link href={`/products/${id}`}>
            <Button className="rounded-full bg-white text-primary font-bold uppercase text-[9px] tracking-[0.4em] px-10 py-7 shadow-2xl hover:bg-primary hover:text-white transition-all transform translate-y-12 group-hover:translate-y-0 duration-700">
              <Eye className="mr-3 h-4 w-4" /> Detalhes
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-4 md:p-10 space-y-3 md:space-y-8 flex-1 flex flex-col justify-between">
        <div className="space-y-0.5 md:space-y-2">
          <p className="text-[7px] md:text-[10px] font-bold uppercase text-accent tracking-[0.2em] md:tracking-[0.4em]">
            {category || "Curadoria Especial"}
          </p>
          <Link href={`/products/${id}`} className="block group-hover:text-primary transition-colors">
            <h4 className="text-sm md:text-2xl font-serif font-bold text-primary truncate leading-tight">
              {name}
            </h4>
          </Link>
        </div>
        
        <div className="space-y-3 md:space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-5">
            <span className="text-base md:text-3xl font-bold text-primary">{formatCurrency(price)}</span>
            {oldPrice && (
              <span className="text-[10px] md:text-base text-primary/30 line-through font-light italic">
                {formatCurrency(oldPrice)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
            <Button 
              onClick={onAddToCart}
              variant="outline"
              className="rounded-full border-accent/10 text-primary h-9 md:h-16 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-secondary transition-all"
            >
              <ShoppingBag className="h-3 w-3 md:hidden mr-1" />
              Carrinho
            </Button>
            <Button 
              onClick={onBuyNow}
              className="rounded-full bg-primary text-white h-9 md:h-16 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-xl shadow-primary/10 hover:bg-accent transition-all duration-500"
            >
              Comprar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
