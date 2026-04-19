"use client";

import React, { useState, useMemo } from 'react';
import { Share2, Star, Minus, Plus, Ruler, Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useFirestore, useUser, useDoc, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
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

  const favoriteRef = useMemo(() => {
    if (!db || !user?.uid || !product?.id) return null;
    return doc(db, 'users', user.uid, 'favorites', product.id);
  }, [db, user?.uid, product?.id]);

  const { data: favoriteData } = useDoc(favoriteRef);
  const isFavorited = !!favoriteData;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const validateSelection = () => {
    if ((product.sizes?.length && !selectedSize) || (product.colors?.length && !selectedColor)) {
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

  return (
    <div className="space-y-5">
      {/* Cabeçalho - estilo Kaisan */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">MARCA: TODA BELA</p>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-[15px] font-medium text-[#333] leading-[1.3] uppercase tracking-tight">
            {product.name} | REF: {product.sku || product.id.slice(-6).toUpperCase()}
          </h1>
          <button className="text-gray-400 hover:text-black transition-colors pt-0.5 shrink-0">
            <Share2 className="h-5 w-5 stroke-[1.5]" />
          </button>
        </div>
        <button onClick={scrollToReviews} className="flex items-center gap-2 pt-1">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-3 w-3 fill-current text-black" />
            ))}
          </div>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Avaliar!</span>
        </button>
      </div>

      {/* Preço - estilo Kaisan */}
      <div className="space-y-0.5">
        <p className="text-[26px] font-bold text-black leading-none">
          {formatCurrency(product.price)}
        </p>
        <p className="text-[13px] text-gray-500">
          10x de {formatCurrency(product.price / 10)} sem juros
        </p>
      </div>

      {/* Seletor de Cor - miniaturas quadradas */}
      {product.colors && product.colors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.colors.map((color: string) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={cn(
                "relative h-16 w-14 overflow-hidden border-2 transition-all",
                selectedColor === color ? "border-black" : "border-transparent"
              )}
              title={color}
            >
              <Image src={product.image} alt={color} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Tamanho + Quantidade na mesma linha - estilo Kaisan */}
      <div className="space-y-2">
        <p className="text-[12px] font-medium text-gray-500">Tamanho</p>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {product.sizes?.map((size: string) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "min-w-[52px] h-9 px-3 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all border",
                  selectedSize === size
                    ? "border-black border-2 text-black bg-white"
                    : "border-gray-200 text-gray-500 bg-white hover:border-gray-400"
                )}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="flex items-center border border-gray-200 rounded bg-white shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-9 w-9 flex items-center justify-center hover:bg-gray-50 transition-colors border-r border-gray-200"
            >
              <Minus className="h-3 w-3 text-gray-400" />
            </button>
            <span className="w-9 text-center text-[13px] font-bold">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="h-9 w-9 flex items-center justify-center hover:bg-gray-50 transition-colors border-l border-gray-200"
            >
              <Plus className="h-3 w-3 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Links de tamanho - estilo Kaisan */}
        <div className="flex items-center gap-5 pt-1">
          <button className="flex items-center gap-1.5 text-[10px] font-bold text-black uppercase tracking-wider hover:opacity-60 transition-opacity">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
            </svg>
            DESCUBRA SEU TAMANHO
          </button>
          <button className="flex items-center gap-1.5 text-[10px] font-bold text-black uppercase tracking-wider hover:opacity-60 transition-opacity">
            <Ruler className="h-3.5 w-3.5" />
            TABELA DE MEDIDAS
          </button>
        </div>
      </div>

      {/* Botões de Ação - estilo Toda Bela Premium */}
      <div className="space-y-3">
        <Button
          onClick={handleBuyNowClick}
          className="w-full h-14 text-[13px] font-bold uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-500 rounded-none shadow-xl shadow-primary/10"
        >
          COMPRE AGORA
        </Button>
        
        <Button
          variant="outline"
          onClick={handleAddToCartClick}
          className="w-full h-14 text-[13px] font-bold uppercase tracking-[0.2em] border-primary text-primary hover:bg-primary hover:text-white transition-all duration-500 rounded-none gap-3"
        >
          <ShoppingBag className="h-4 w-4" />
          ADICIONAR AO CARRINHO
        </Button>
      </div>

      {/* Acordeons - estilo Kaisan */}
      <div className="border-t border-gray-100">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="description" className="border-b border-gray-100">
            <AccordionTrigger className="px-0 py-4 hover:no-underline text-[14px] font-light text-[#333] [&>svg]:hidden flex justify-between">
              <span>Descrição do Produto</span>
              <Plus className="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 data-[state=open]:rotate-45" />
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-[12px] text-gray-500 leading-relaxed">
              {product.longDescription || product.description}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reviews" className="border-b border-gray-100">
            <button
              onClick={scrollToReviews}
              className="flex w-full items-center justify-between py-4 text-[14px] font-light text-[#333] hover:opacity-70 transition-opacity"
            >
              <span>Avaliações</span>
              <Plus className="h-4 w-4 text-gray-400" />
            </button>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
