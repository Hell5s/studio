
"use client";

import React, { useState } from 'react';
import { ShoppingBag, Share2, Star, Minus, Plus, Ruler, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';

interface ProductInfoProps {
  product: any;
  onAddToCart?: (product: any, openCart?: boolean) => void;
  relatedProducts?: any[];
}

export function ProductInfo({ product, onAddToCart, relatedProducts }: ProductInfoProps) {
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const validateSelection = () => {
    if ((product.sizes?.length && !selectedSize) || (product.colors?.length && !selectedColor)) {
      toast({
        title: "Opções Pendentes",
        description: "Escolha seu tamanho e cor preferidos.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleAddToCartClick = () => {
    if (!validateSelection()) return;
    const cartProduct = { ...product, quantity, selectedSize, selectedColor };
    onAddToCart?.(cartProduct, false);
    toast({
      title: "Item no Carrinho",
      description: `${product.name} foi adicionado.`
    });
  };

  const handleBuyNowClick = () => {
    if (!validateSelection()) return;
    const cartProduct = { ...product, quantity, selectedSize, selectedColor };
    onAddToCart?.(cartProduct, true);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Toda Bela Boutique</span>
           <button className="text-muted-foreground/40 hover:text-primary transition-colors">
              <Share2 className="h-4 w-4" />
           </button>
        </div>
        <h1 className="text-2xl font-headline font-bold text-primary leading-tight">
          {product.name}
        </h1>
        <div className="flex items-center gap-2 text-accent pt-1">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-3 w-3 fill-current" />)}
          </div>
          <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">23 Comentário(s)</span>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-1 border-b border-primary/5 pb-6">
        <div className="flex items-baseline gap-4">
          <span className="text-3xl font-bold text-primary">{formatCurrency(product.price)}</span>
          {product.oldPrice && (
            <span className="text-sm text-muted-foreground/40 line-through italic">
              {formatCurrency(product.oldPrice)}
            </span>
          )}
        </div>
        <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">
          Ou 10x de {formatCurrency(product.price / 10)} sem juros
        </p>
      </div>

      {/* Selections */}
      <div className="space-y-8 pt-2">
        {/* Colors Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Cores</span>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color: string) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "group relative flex items-center justify-center h-10 px-4 rounded-full border transition-all",
                    selectedColor === color 
                      ? "bg-primary text-white border-primary shadow-lg" 
                      : "bg-white text-primary/60 border-primary/5 hover:border-accent/40"
                  )}
                >
                  <span className="text-[9px] font-bold uppercase tracking-widest">{color}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sizes and Quantity Row */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Tamanho</span>
            <div className="flex items-center bg-secondary/40 rounded-full p-0.5 border border-primary/5">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center text-xs font-bold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {product.sizes?.map((size: string) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border",
                  selectedSize === size 
                    ? "bg-primary text-white border-primary shadow-md" 
                    : "bg-white text-primary/40 border-primary/10 hover:border-primary/40"
                )}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6 pt-1">
             <button className="flex items-center gap-2 text-[9px] font-bold text-primary/40 uppercase tracking-widest hover:text-accent transition-colors">
                <HelpCircle className="h-3 w-3" /> Descubra seu tamanho
             </button>
             <button className="flex items-center gap-2 text-[9px] font-bold text-primary/40 uppercase tracking-widest hover:text-accent transition-colors">
                <Ruler className="h-3 w-3" /> Tabela de medidas
             </button>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-6">
        <Button 
          onClick={handleBuyNowClick}
          className="w-full h-16 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-black text-white hover:bg-primary transition-all duration-700 shadow-2xl active:scale-95"
        >
          Compre Agora
        </Button>
        <button 
          onClick={handleAddToCartClick}
          className="w-full mt-4 text-[9px] font-bold uppercase tracking-[0.3em] text-primary/40 hover:text-primary transition-colors py-2"
        >
          Adicionar ao Carrinho
        </button>
      </div>

      {/* Complete the Look Small Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-primary/5 space-y-4">
           <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">Complete o Look</h4>
           <div className="flex gap-3">
              {relatedProducts.slice(0, 2).map((item) => (
                <Link key={item.id} href={`/products/${item.id}`} className="group relative h-24 w-20 overflow-hidden rounded-xl bg-secondary/20">
                  <Image src={item.image} alt={item.name} fill className="object-cover transition-transform group-hover:scale-110" />
                </Link>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
