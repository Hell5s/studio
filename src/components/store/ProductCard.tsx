
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Eye, ShoppingCart } from 'lucide-react';
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
    <div className="group bg-white rounded-3xl border border-[#F7E8EA] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 25vw"
          data-ai-hint="roupa feminina"
        />
        
        {badge && (
          <Badge className="absolute top-4 left-4 bg-[#6E3C47] text-white border-none px-4 py-1.5 font-bold uppercase text-[9px] rounded-full">
            {badge}
          </Badge>
        )}

        {/* Ações de Hover */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Link href={`/products/${id}`}>
            <Button size="icon" variant="secondary" className="rounded-full shadow-lg">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-6 space-y-3">
        <p className="text-[10px] font-bold uppercase text-[#C7A17A] tracking-widest">
          {category || "Toda Bela"}
        </p>
        <Link href={`/products/${id}`} className="block group-hover:text-[#6E3C47] transition-colors">
          <h4 className="text-base font-bold text-[#2A1F22] truncate">
            {name}
          </h4>
        </Link>
        
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-[#6E3C47]">{formatCurrency(price)}</span>
          {oldPrice && (
            <span className="text-xs text-[#2A1F22]/40 line-through">
              {formatCurrency(oldPrice)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button 
            onClick={onAddToCart}
            variant="outline"
            className="rounded-full border-[#6E3C47] text-[#6E3C47] h-10 text-[10px] font-bold uppercase tracking-wider hover:bg-[#F7E8EA]"
          >
            Carrinho
          </Button>
          <Button 
            onClick={onBuyNow}
            className="rounded-full bg-[#6E3C47] text-white h-10 text-[10px] font-bold uppercase tracking-wider shadow-md hover:bg-[#6E3C47]/90"
          >
            Comprar
          </Button>
        </div>
      </div>
    </div>
  );
}
