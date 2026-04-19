"use client";

import React, { useState, useMemo } from 'react';
import { ShoppingBag, Share2, Star, Minus, Plus, Ruler, Heart } from 'lucide-react';
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

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

  const handleAddToCartClick = () => {
    if (!validateSelection()) return;
    const cartProduct = { ...product, quantity, selectedSize, selectedColor };
    onAddToCart?.(cartProduct, false);
    toast({
      title: "Adicionado ao Carrinho",
      description: "Você pode continuar navegando ou finalizar a compra."
    });
  };

  const handleBuyNowClick = () => {
    if (!validateSelection()) return;
    const cartProduct = { ...product, quantity, selectedSize, selectedColor };
    onAddToCart?.(cartProduct, true);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Acesso necessário", description: "Faça login para favoritar.", variant: "destructive" });
      return;
    }
    if (!favoriteRef) return;
    if (isFavorited) {
      deleteDocumentNonBlocking(favoriteRef);
      toast({ title: "Removido dos favoritos" });
    } else {
      setDocumentNonBlocking(favoriteRef, {
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        addedAt: serverTimestamp()
      }, { merge: true });
      toast({ title: "Salvo nos favoritos!" });
    }
  };

  const scrollToReviews = () => {
    const el = document.getElementById('avaliacoes');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info - Matches Kaisan Reference */}
      <div className="space-y-1">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">MARCA: TODA BELA</p>
        <div className="flex items-start justify-between gap-4">
           <h1 className="text-[17px] font-medium text-[#444] leading-[1.3] uppercase tracking-tight">
             {product.name} | REF: {product.sku || product.id.slice(-6).toUpperCase()}
           </h1>
           <button className="text-gray-400 hover:text-black transition-colors pt-1">
              <Share2 className="h-6 w-6 stroke-[1.5]" />
           </button>
        </div>
        <button onClick={scrollToReviews} className="flex items-center gap-2 text-gray-300 pt-1">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-3.5 w-3.5 fill-current" />)}
          </div>
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Avaliar!</span>
        </button>
      </div>

      {/* Pricing - Matches Kaisan Reference */}
      <div className="space-y-1">
        <p className="text-[28px] font-bold text-black leading-none">
          {formatCurrency(product.price)}
        </p>
        <p className="text-[14px] font-medium text-gray-500">
          10x de {formatCurrency(product.price / 10)} sem juros
        </p>
      </div>

      {/* Colors Swatches - Small images as in reference */}
      {product.colors && product.colors.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color: string) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "relative h-20 w-16 overflow-hidden border transition-all",
                  selectedColor === color ? "border-black border-2" : "border-gray-200"
                )}
                title={color}
              >
                 <Image src={product.image} alt={color} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sizes and Quantity Row - Compact as in reference */}
      <div className="space-y-3">
        <p className="text-[13px] font-medium text-gray-500">Tamanho</p>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {product.sizes?.map((size: string) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "min-w-[60px] h-10 px-4 rounded-full flex items-center justify-center text-[12px] font-medium transition-all border",
                  selectedSize === size 
                    ? "bg-white border-black text-black border-2" 
                    : "bg-white text-gray-400 border-gray-200"
                )}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="flex items-center border border-gray-200 rounded-md bg-white">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-9 w-9 flex items-center justify-center hover:bg-gray-50 transition-colors border-r border-gray-200"
              >
                <Minus className="h-3 w-3 text-gray-400" />
              </button>
              <span className="w-10 text-center text-[13px] font-bold">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="h-9 w-9 flex items-center justify-center hover:bg-gray-50 transition-colors border-l border-gray-200"
              >
                <Plus className="h-3 w-3 text-gray-400" />
              </button>
          </div>
        </div>

        {/* Action Links - Matches Reference Icons */}
        <div className="flex items-center gap-6 pt-2">
          <button className="flex items-center gap-2 text-[10px] font-bold text-black uppercase tracking-wider hover:opacity-70 transition-opacity">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
             </svg>
             DESCUBRA SEU TAMANHO
          </button>
          <button className="flex items-center gap-2 text-[10px] font-bold text-black uppercase tracking-wider hover:opacity-70 transition-opacity">
            <Ruler className="h-4 w-4" /> TABELA DE MEDIDAS
          </button>
        </div>
      </div>

      {/* Primary Action Button - Matches Reference (Big Black Block) */}
      <div className="pt-2">
        <Button 
          onClick={handleBuyNowClick}
          className="w-full h-16 text-[15px] font-bold uppercase tracking-[0.1em] bg-black text-white hover:bg-gray-900 transition-all rounded-none"
        >
          COMPRE AGORA
        </Button>
      </div>

      {/* Compact Accordions - Matches Reference Style */}
      <div className="space-y-[-1px] pt-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="description" className="border">
            <AccordionTrigger className="px-6 py-4 hover:no-underline text-[15px] font-light text-[#444] [&[data-state=open]>svg]:rotate-45">
              Descrição do Produto
              <Plus className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 text-[13px] text-gray-500 leading-relaxed italic">
              {product.longDescription || product.description}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="care" className="border">
            <AccordionTrigger className="px-6 py-4 hover:no-underline text-[15px] font-light text-[#444] [&[data-state=open]>svg]:rotate-45">
              Cuidados com seu produto
              <Plus className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 text-[13px] text-gray-500 leading-relaxed italic">
              Lavar à mão para preservar as fibras. Secar à sombra.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reviews" className="border">
            <button 
              onClick={scrollToReviews}
              className="flex w-full items-center justify-between px-6 py-4 text-[15px] font-light text-[#444] hover:bg-gray-50 transition-colors"
            >
              Avaliações
              <Plus className="h-4 w-4 text-gray-400" />
            </button>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
