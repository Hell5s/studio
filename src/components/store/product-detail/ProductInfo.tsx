
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
    <div className="space-y-10">
      <div className="space-y-4">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">MARCA: TODA BELA</p>
        <div className="flex items-start justify-between gap-8">
          <h1 className="text-2xl md:text-3xl font-bold text-primary leading-tight uppercase tracking-tight">
            {product.name}
          </h1>
          <button className="text-gray-400 hover:text-primary transition-colors pt-2 shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Share2 className="h-6 w-6 stroke-[1.5]" />
          </button>
        </div>
        <button onClick={scrollToReviews} className="flex items-center gap-3 pt-2 group min-h-[44px]">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-4 w-4 fill-current text-accent" />
            ))}
          </div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors underline underline-offset-4">Ver Avaliações</span>
        </button>
      </div>

      <div className="space-y-2 border-y border-primary/5 py-8">
        <div className="flex items-baseline gap-4">
          <p className="text-3xl md:text-4xl font-bold text-primary leading-none">
            {formatCurrency(product.price)}
          </p>
          {product.oldPrice && (
            <p className="text-sm md:text-lg text-muted-foreground line-through italic font-light">
              {formatCurrency(product.oldPrice)}
            </p>
          )}
        </div>
        <p className="text-xs md:text-sm text-accent font-bold uppercase tracking-widest">
          Até 10x de {formatCurrency(product.price / 10)} sem juros
        </p>
      </div>

      {colorVariations.length > 0 && (
        <div className="space-y-6">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            Cor: <span className="text-primary font-black ml-2">{selectedColor || 'SELECIONE'}</span>
          </p>
          <div className="flex flex-wrap gap-3 md:gap-4">
            {colorVariations.map((v: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedColor(v.color)}
                className={cn(
                  "group flex flex-col items-center gap-3 transition-all min-h-[44px]",
                  selectedColor === v.color ? "opacity-100" : "opacity-60 hover:opacity-100"
                )}
              >
                <div className={cn(
                  "relative h-20 md:h-24 w-16 md:w-20 overflow-hidden border-2 transition-all shadow-md",
                  selectedColor === v.color ? "border-primary ring-4 ring-primary/5 scale-105" : "border-transparent"
                )}>
                  <Image 
                    src={v.image || product.image} 
                    alt={v.color} 
                    fill 
                    className="object-cover" 
                  />
                </div>
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-widest",
                  selectedColor === v.color ? "text-primary" : "text-muted-foreground"
                )}>
                  {v.color}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Tamanho</p>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap gap-3">
            {product.sizes?.map((size: string) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "min-w-[54px] md:min-w-[60px] h-11 md:h-12 px-4 flex items-center justify-center text-[12px] md:text-[13px] font-bold transition-all border min-h-[44px]",
                  selectedSize === size
                    ? "border-primary bg-primary text-white shadow-xl"
                    : "border-gray-200 text-gray-400 hover:border-primary/40"
                )}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="flex items-center border border-gray-200 bg-white shrink-0 shadow-sm">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-11 md:h-12 w-11 md:w-12 flex items-center justify-center hover:bg-secondary transition-colors border-r border-gray-200 min-h-[44px] min-w-[44px]"
            >
              <Minus className="h-4 w-4 text-gray-400" />
            </button>
            <span className="w-11 md:w-12 text-center text-sm md:text-base font-bold text-primary">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="h-11 md:h-12 w-11 md:w-12 flex items-center justify-center hover:bg-secondary transition-colors border-l border-gray-200 min-h-[44px] min-w-[44px]"
            >
              <Plus className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        <button className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-primary/60 uppercase tracking-widest hover:text-primary transition-colors pt-2 min-h-[44px]">
          <Ruler className="h-4 w-4" />
          TABELA DE MEDIDAS COMPLETA
        </button>
      </div>

      <div className="space-y-4 pt-4">
        <Button
          onClick={handleBuyNowClick}
          className="w-full h-14 md:h-16 text-[12px] md:text-[14px] font-bold uppercase tracking-[0.3em] bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-500 rounded-none shadow-2xl min-h-[54px]"
        >
          FINALIZAR COMPRA AGORA
        </Button>
        
        <Button
          variant="outline"
          onClick={handleAddToCartClick}
          className="w-full h-12 md:h-14 text-[10px] md:text-[12px] font-bold uppercase tracking-[0.2em] border-primary text-primary hover:bg-primary hover:text-white transition-all duration-500 rounded-none gap-3 min-h-[44px]"
        >
          <ShoppingBag className="h-4 w-4" />
          ADICIONAR AO MEU CARRINHO
        </Button>
      </div>

      <div className="border-t border-primary/5 pt-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="description" className="border-b border-primary/5">
            <AccordionTrigger className="px-0 py-6 hover:no-underline text-[12px] font-bold uppercase tracking-[0.3em] text-primary/80 [&>svg]:hidden flex justify-between">
              <span>DESCRIÇÃO EDITORIAL</span>
              <Plus className="h-5 w-5 shrink-0 text-accent transition-transform duration-200 data-[state=open]:rotate-45" />
            </AccordionTrigger>
            <AccordionContent className="pb-10 text-[13px] md:text-[14px] text-muted-foreground leading-relaxed italic font-light">
              <div className="space-y-4">
                {product.longDescription || product.description}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="shipping" className="border-b border-primary/5">
             <AccordionTrigger className="px-0 py-6 hover:no-underline text-[12px] font-bold uppercase tracking-[0.3em] text-primary/80 [&>svg]:hidden flex justify-between">
              <span>ENTREGA & PRAZOS</span>
              <Plus className="h-5 w-5 shrink-0 text-accent transition-transform duration-200 data-[state=open]:rotate-45" />
            </AccordionTrigger>
            <AccordionContent className="pb-10 text-[13px] text-muted-foreground leading-relaxed italic font-light">
              Nossas peças são enviadas com seguro e embalagem premium. O prazo estimado de entrega é de 10 a 20 dias úteis, garantindo que sua escolha chegue em perfeitas condições.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
