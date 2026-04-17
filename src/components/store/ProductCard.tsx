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
    <div className="group bg-white rounded-[3rem] border border-[#F7E8EA] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 25vw"
          data-ai-hint="roupa feminina"
        />
        
        <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
          {badge ? (
            <Badge className="bg-[#6E3C47] text-white border-none px-5 py-2 font-bold uppercase text-[9px] rounded-full tracking-[0.2em] shadow-lg">
              {badge}
            </Badge>
          ) : <div />}
          
          <button className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#6E3C47] shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-[#6E3C47] hover:text-white">
            <Heart className="h-4 w-4" />
          </button>
        </div>

        {/* Visual de Quick View no Hover */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
          <Link href={`/products/${id}`}>
            <Button className="rounded-full bg-white text-[#6E3C47] font-bold uppercase text-[9px] tracking-[0.3em] px-8 py-6 shadow-2xl hover:bg-[#6E3C47] hover:text-white transition-all transform translate-y-8 group-hover:translate-y-0 duration-700">
              <Eye className="mr-3 h-4 w-4" /> Ver Detalhes
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-10 space-y-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase text-[#C7A17A] tracking-[0.3em]">
            {category || "Curadoria Especial"}
          </p>
          <Link href={`/products/${id}`} className="block group-hover:text-[#6E3C47] transition-colors">
            <h4 className="text-xl font-serif font-bold text-[#2A1F22] truncate">
              {name}
            </h4>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-[#6E3C47]">{formatCurrency(price)}</span>
          {oldPrice && (
            <span className="text-sm text-[#2A1F22]/30 line-through font-light italic">
              {formatCurrency(oldPrice)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <Button 
            onClick={onAddToCart}
            variant="outline"
            className="rounded-full border-[#F7E8EA] text-[#6E3C47] h-14 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#F7E8EA] transition-all"
          >
            Carrinho
          </Button>
          <Button 
            onClick={onBuyNow}
            className="rounded-full bg-[#6E3C47] text-white h-14 text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-[#6E3C47]/10 hover:bg-[#C7A17A] transition-all"
          >
            Comprar
          </Button>
        </div>
      </div>
    </div>
  );
}
