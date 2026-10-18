"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Share2, Star, Minus, Plus, ShoppingBag, Camera, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, getItemImageUrl } from '@/lib/utils';
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
import { Checkbox } from "@/components/ui/checkbox";
import { ProductDescription } from './ProductDescription';

interface ProductInfoProps {
  product: any;
  onAddToCart?: (product: any, openCart?: boolean) => void;
  relatedProducts?: any[];
  onColorSelect?: (variation: any) => void;
}

export function ProductInfo({ product, onAddToCart, onColorSelect }: ProductInfoProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  // Mixed colors state
  const [isMixingColors, setIsMixingColors] = useState(false);
  const [colorCounts, setColorCounts] = useState<Record<number, number>>({});

  const colorVariations = useMemo(() => {
    if (product.variations && Array.isArray(product.variations) && product.variations.length > 0) {
      return product.variations;
    }
    if (product.colors && Array.isArray(product.colors)) {
      return product.colors.map((c: string) => ({ color: c, image: product.image }));
    }
    return [];
  }, [product]);

  // Sync mixing mode with quantity
  useEffect(() => {
    if (quantity < 2 && isMixingColors) {
      setIsMixingColors(false);
    }
  }, [quantity, isMixingColors]);

  // Sync counts when quantity changes or mixing is toggled
  useEffect(() => {
    if (!isMixingColors) return;

    const totalDistributed = Object.values(colorCounts).reduce((acc, c) => acc + c, 0);
    
    if (totalDistributed !== quantity) {
      if (selectedColorIndex !== null && totalDistributed === 0) {
        // Initial assignment to selected color
        setColorCounts({ [selectedColorIndex]: quantity });
      } else if (quantity < totalDistributed) {
        // Remove from last populated color
        const newCounts = { ...colorCounts };
        let diff = totalDistributed - quantity;
        const keys = Object.keys(newCounts).map(Number).reverse();
        for (const k of keys) {
          if (newCounts[k] >= diff) {
            newCounts[k] -= diff;
            diff = 0;
            break;
          } else {
            diff -= newCounts[k];
            newCounts[k] = 0;
          }
        }
        setColorCounts(newCounts);
      }
      // If quantity increased, we let the user manually add the missing pieces
    }
  }, [quantity, isMixingColors, selectedColorIndex]);

  const distributedCount = useMemo(() => {
    return Object.values(colorCounts).reduce((acc, c) => acc + c, 0);
  }, [colorCounts]);

  const remainingToDistribute = quantity - distributedCount;

  const validateSelection = () => {
    if (product.sizes?.length && !selectedSize) {
      toast({ title: "Escolha o tamanho", description: "Selecione um tamanho antes de prosseguir.", variant: "destructive" });
      return false;
    }

    if (isMixingColors) {
      if (distributedCount !== quantity) {
        toast({ 
          title: "Distribua as cores", 
          description: `Você escolheu ${quantity} peças. Distribua todas entre as cores desejadas (faltam ${remainingToDistribute}).`, 
          variant: "destructive" 
        });
        return false;
      }
    } else {
      if (colorVariations.length > 0 && selectedColorIndex === null) {
        toast({ title: "Escolha a cor", description: "Selecione uma cor antes de prosseguir.", variant: "destructive" });
        return false;
      }
    }
    return true;
  };

  const performAddToCart = (openCart: boolean) => {
    if (isMixingColors) {
      const activeColorIndices = Object.keys(colorCounts).map(Number).filter(idx => colorCounts[idx] > 0);
      
      activeColorIndices.forEach((idx, i) => {
        const variant = colorVariations[idx];
        const colorName = variant.color || `Opção ${idx + 1}`;
        const isLast = i === activeColorIndices.length - 1;
        
        onAddToCart?.({
          ...product,
          quantity: colorCounts[idx],
          selectedSize,
          selectedColor: colorName
        }, isLast ? openCart : false);
      });
    } else {
      onAddToCart?.({ ...product, quantity, selectedSize, selectedColor }, openCart);
    }
  };

  const handleBuyNowClick = () => {
    if (!validateSelection()) return;
    performAddToCart(true);
  };

  const handleAddToCartClick = () => {
    if (!validateSelection()) return;
    performAddToCart(false);
    toast({
      title: "Item adicionado!",
      description: "A peça foi reservada no seu carrinho.",
    });
  };

  const updateColorCount = (idx: number, delta: number) => {
    const current = colorCounts[idx] || 0;
    const newVal = current + delta;
    
    if (newVal < 0) return;
    if (delta > 0 && distributedCount >= quantity) return;

    setColorCounts(prev => ({ ...prev, [idx]: newVal }));
  };

  const scrollToReviews = () => {
    const el = document.getElementById('avaliacoes');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const isValidUrl = (url: any) => typeof url === 'string' && url.length > 0 && (url.startsWith('http') || url.startsWith('/'));

  return (
    <div className="space-y-10">
      <div className="space-y-4">
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
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Cor: <span className="text-primary font-black ml-2">
                {isMixingColors ? 'MIX DE CORES' : (selectedColor || 'SELECIONE')}
              </span>
            </p>
            {quantity >= 2 && colorVariations.length >= 2 && (
              <label className="flex items-center gap-2 cursor-pointer group">
                <Checkbox 
                  checked={isMixingColors} 
                  onCheckedChange={(v) => setIsMixingColors(!!v)}
                  className="rounded-sm border-primary/20 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                />
                <span className="text-[9px] font-bold uppercase tracking-widest text-primary/40 group-hover:text-primary transition-colors">Quero cores diferentes</span>
              </label>
            )}
          </div>

          {isMixingColors && (
            <p className="text-[10px] font-bold text-accent uppercase tracking-widest animate-in fade-in slide-in-from-left-2">
              Distribua {quantity} peças entre as cores {remainingToDistribute > 0 && `(faltam ${remainingToDistribute})`}
            </p>
          )}

          <div className="flex flex-wrap gap-3 md:gap-4">
            {colorVariations.map((v: any, idx: number) => {
              const imgUrl = getItemImageUrl(v.image || product.image);
              const hasValidImage = isValidUrl(imgUrl);
              const displayName = v.color || `Opção ${idx + 1}`;
              const isSelected = selectedColorIndex === idx;
              const mixCount = colorCounts[idx] || 0;

              return (
                <div key={idx} className="flex flex-col items-center gap-3">
                  <button
                    onClick={() => {
                      if (isMixingColors) return;
                      setSelectedColor(displayName);
                      setSelectedColorIndex(idx);
                      onColorSelect?.(v);
                    }}
                    className={cn(
                      "group flex flex-col items-center gap-3 transition-all min-h-[44px] relative",
                      isMixingColors ? "cursor-default" : (isSelected ? "opacity-100" : "opacity-60 hover:opacity-100")
                    )}
                  >
                    <div className={cn(
                      "relative h-20 md:h-24 w-16 md:w-20 overflow-hidden border-2 transition-all shadow-md bg-secondary/20",
                      !isMixingColors && isSelected ? "border-primary ring-4 ring-primary/5 scale-105" : "border-transparent",
                      isMixingColors && mixCount > 0 ? "border-accent scale-105" : ""
                    )}>
                      {hasValidImage ? (
                        <Image 
                          src={imgUrl} 
                          alt={displayName} 
                          fill 
                          className="object-cover" 
                          quality={90}
                          sizes="100px"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Camera className="h-5 w-5 text-primary/10" />
                        </div>
                      )}
                      
                      {isMixingColors && mixCount > 0 && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                           <div className="bg-accent text-primary font-black text-xs h-7 w-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                             {mixCount}
                           </div>
                        </div>
                      )}
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest",
                      (!isMixingColors && isSelected) || (isMixingColors && mixCount > 0) ? "text-primary" : "text-muted-foreground"
                    )}>
                      {displayName}
                    </span>
                  </button>

                  {isMixingColors && (
                    <div className="flex items-center gap-1 bg-white border border-primary/5 rounded-full p-0.5 shadow-sm animate-in zoom-in-95">
                      <button 
                        onClick={() => updateColorCount(idx, -1)}
                        className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-secondary transition-colors text-xs"
                      >−</button>
                      <span className="text-[10px] font-bold w-4 text-center">{mixCount}</span>
                      <button 
                        onClick={() => updateColorCount(idx, 1)}
                        className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-secondary transition-colors text-xs"
                      >+</button>
                    </div>
                  )}
                </div>
              );
            })}
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
      </div>

      <div className="space-y-4 pt-4">
        <button
          onClick={handleBuyNowClick}
          className="w-full h-14 md:h-16 text-[12px] md:text-[14px] font-bold uppercase tracking-[0.3em] bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-500 rounded-none shadow-2xl min-h-[54px]"
        >
          COMPRAR AGORA
        </button>
        
        <button
          onClick={handleAddToCartClick}
          className="w-full h-12 md:h-14 flex items-center justify-center text-[10px] md:text-[12px] font-bold uppercase tracking-[0.2em] border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-500 rounded-none gap-3 min-h-[44px]"
        >
          <ShoppingBag className="h-4 w-4" />
          ADICIONAR AO MEU CARRINHO
        </button>
      </div>

      <div className="border-t border-primary/5 pt-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="description" className="border-b border-primary/5">
            <AccordionTrigger className="px-0 py-6 hover:no-underline text-[12px] font-bold uppercase tracking-[0.3em] text-primary/80 [&>svg]:hidden flex justify-between">
              <span>DESCRIÇÃO EDITORIAL</span>
              <Plus className="h-5 w-5 shrink-0 text-accent transition-transform duration-200 data-[state=open]:rotate-45" />
            </AccordionTrigger>
            <AccordionContent className="pb-10 text-[13px] md:text-[14px] text-muted-foreground leading-relaxed font-light">
              <div className="space-y-4">
                <ProductDescription text={product.longDescription || product.description || ''} productName={product.name} />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="shipping" className="border-b border-primary/5">
             <AccordionTrigger className="px-0 py-6 hover:no-underline text-[12px] font-bold uppercase tracking-[0.3em] text-primary/80 [&>svg]:hidden flex justify-between">
              <span>ENTREGA & PRAZOS</span>
              <Plus className="h-5 w-5 shrink-0 text-accent transition-transform duration-200 data-[state=open]:rotate-45" />
            </AccordionTrigger>
            <AccordionContent className="pb-10 text-[13px] md:text-[14px] text-muted-foreground leading-relaxed italic font-light">
              Nossas peças são enviadas com seguro e embalagem premium. O prazo estimado de entrega é de 10 a 20 dias úteis, garantindo que sua escolha chegue em perfeitas condições.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
