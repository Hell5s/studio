"use client";

import React, { useState, useMemo } from 'react';
import { Share2, Star, Minus, Plus, Ruler, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useFirestore, useUser, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProductInfoProps {
  product: any;
  onAddToCart?: (product: any, openCart?: boolean) => void;
  relatedProducts?: any[];
}

export function ProductInfo({ product, onAddToCart }: ProductInfoProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const colorVariations = useMemo(() => {
    if (product.variations && Array.isArray(product.variations) && product.variations.length > 0) {
      return product.variations;
    }
    if (product.colors && Array.isArray(product.colors)) {
      return product.colors.map((c: string) => ({ color: c, image: product.image }));
    }
    return [];
  }, [product]);

  const validateSelection = () => {
    if ((product.sizes?.length && !selectedSize) || (colorVariations.length > 0 && !selectedColor)) {
      toast({
        title: "Escolha as opções",
        description: "Selecione o tamanho e a cor antes de prosseguir.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleBuyNowClick = () => {
    if (!validateSelection()) return;
    const cartProduct = { ...product, quantity, selectedSize, selectedColor };
    onAddToCart?.(cartProduct, true);
  };

  const handleAddToCartClick = () => {
    if (!validateSelection()) return;
    const cartProduct = { ...product, quantity, selectedSize, selectedColor };
    onAddToCart?.(cartProduct, false);
    toast({
      title: "Item adicionado!",
      description: "A peça foi reservada no seu carrinho.",
    });
  };

  const scrollToReviews = () => {
    const el = document.getElementById('avaliacoes');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-6 px-1 md:px-0">
      <div className="space-y-1.5 md:space-y-1">
        <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">MARCA: TODA BELA</p>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-sm md:text-[16px] font-bold text-primary leading-[1.3] uppercase tracking-tight">
            {product.name}
          </h1>
          <button className="text-gray-400 hover:text-primary transition-colors pt-0.5 shrink-0">
            <Share2 className="h-5 w-5 stroke-[1.5]" />
          </button>
        </div>
        <button onClick={scrollToReviews} className="flex items-center gap-2 pt-1">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-3 w-3 fill-current text-accent" />
            ))}
          </div>
          <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avaliar peça!</span>
        </button>
      </div>

      <div className="space-y-0.5 border-y border-primary/5 py-4">
        <div className="flex items-baseline gap-3">
          <p className="text-2xl md:text-[28px] font-bold text-primary leading-none">
            {formatCurrency(product.price)}
          </p>
          {product.oldPrice && (
            <p className="text-xs md:text-sm text-muted-foreground line-through italic">
              {formatCurrency(product.oldPrice)}
            </p>
          )}
        </div>
        <p className="text-[11px] md:text-[13px] text-accent font-medium italic">
          Até 10x de {formatCurrency(product.price / 10)} sem juros
        </p>
      </div>

      {colorVariations.length > 0 && (
        <div className="space-y-4">
          <p className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            Selecione a Cor: <span className="text-primary font-black ml-1">{selectedColor || ''}</span>
          </p>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {colorVariations.map((v: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedColor(v.color)}
                className={cn(
                  "group flex flex-col items-center gap-2 transition-all",
                  selectedColor === v.color ? "opacity-100" : "opacity-70 hover:opacity-100"
                )}
              >
                <div className={cn(
                  "relative h-16 md:h-20 w-12 md:w-16 overflow-hidden border-2 transition-all shadow-sm",
                  selectedColor === v.color ? "border-primary ring-2 ring-primary/10 scale-105" : "border-transparent"
                )}>
                  <Image 
                    src={v.image || product.image} 
                    alt={v.color} 
                    fill 
                    className="object-cover" 
                  />
                </div>
                <span className={cn(
                  "text-[7px] md:text-[8px] font-bold uppercase tracking-tight",
                  selectedColor === v.color ? "text-primary" : "text-muted-foreground/60"
                )}>
                  {v.color}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <p className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-widest">Tamanho</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {product.sizes?.map((size: string) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "min-w-[44px] md:min-w-[48px] h-9 md:h-10 px-2 md:px-3 flex items-center justify-center text-[11px] md:text-[12px] font-bold transition-all border",
                  selectedSize === size
                    ? "border-primary bg-primary text-white shadow-md"
                    : "border-gray-200 text-gray-400 hover:border-primary/40"
                )}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="flex items-center border border-gray-200 bg-white shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-9 md:h-10 w-9 md:w-10 flex items-center justify-center hover:bg-secondary transition-colors border-r border-gray-200"
            >
              <Minus className="h-3 w-3 text-gray-400" />
            </button>
            <span className="w-9 md:w-10 text-center text-[12px] md:text-[13px] font-bold text-primary">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="h-9 md:h-10 w-9 md:w-10 flex items-center justify-center hover:bg-secondary transition-colors border-l border-gray-200"
            >
              <Plus className="h-3 w-3 text-gray-400" />
            </button>
          </div>
        </div>

        <button className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold text-primary/60 uppercase tracking-wider hover:text-primary transition-colors pt-1">
          <Ruler className="h-3.5 w-3.5" />
          TABELA DE MEDIDAS
        </button>
      </div>

      <div className="space-y-3 pt-2 md:pt-4">
        <Button
          onClick={handleBuyNowClick}
          className="w-full h-12 md:h-14 text-[11px] md:text-[13px] font-bold uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-500 rounded-none shadow-lg"
        >
          COMPRE AGORA
        </Button>
        
        <Button
          variant="outline"
          onClick={handleAddToCartClick}
          className="w-full h-10 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] border-primary text-primary hover:bg-primary hover:text-white transition-all duration-500 rounded-none gap-2.5"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          ADICIONAR AO CARRINHO
        </Button>
      </div>

      <div className="border-t border-primary/5 pt-2">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="description" className="border-b border-primary/5">
            <AccordionTrigger className="px-0 py-4 md:py-5 hover:no-underline text-[11px] md:text-[12px] font-bold uppercase tracking-[0.2em] text-primary/80 [&>svg]:hidden flex justify-between">
              <span>Descrição Editorial</span>
              <Plus className="h-4 w-4 shrink-0 text-accent transition-transform duration-200 data-[state=open]:rotate-45" />
            </AccordionTrigger>
            <AccordionContent className="pb-6 text-[12px] md:text-[13px] text-muted-foreground leading-relaxed italic font-light">
              {product.longDescription || product.description}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reviews" className="border-b border-primary/5">
            <button
              onClick={scrollToReviews}
              className="flex w-full items-center justify-between py-4 md:py-5 text-[11px] md:text-[12px] font-bold uppercase tracking-[0.2em] text-primary/80 hover:opacity-70 transition-opacity"
            >
              <span>Avaliações</span>
              <Plus className="h-4 w-4 text-accent" />
            </button>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
