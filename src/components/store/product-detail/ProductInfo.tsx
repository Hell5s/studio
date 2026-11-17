"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Minus, Plus, ShoppingBag, Camera } from 'lucide-react';
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
import { SizeGuide } from './SizeGuide';
import { ProductHeading } from './ProductHeading';
import { ShippingCalculator } from './ShippingCalculator';
import { formatBRL, sizeLabel } from './utils';
import { trackEvent } from '@/lib/metaPixel';

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
  const botoesRef = useRef<HTMLDivElement>(null);
  const [botoesVisiveis, setBotoesVisiveis] = useState(true);
  useEffect(() => {
    const el = botoesRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setBotoesVisiveis(e.isIntersecting));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
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

  useEffect(() => {
    trackEvent('ViewContent', {
      content_ids: [product.id], contents: [{ id: String(product.id), quantity: 1, item_price: Number(product.price) || 0 }],
      content_type: 'product', content_name: product.name,
      value: Number(product.price) || 0, currency: 'BRL',
    });
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const goToOptions = () => document.getElementById('opcoes')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const validateSelection = () => {
    if (product.sizes?.length && !selectedSize) {
      toast({ title: "Escolha o tamanho", description: "Selecione um tamanho antes de prosseguir.", variant: "destructive" });
      goToOptions();
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
        goToOptions();
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
        
        // Define a imagem da cor específica ou mantém a do produto como fallback
        const colorImage = getItemImageUrl(variant.image) || getItemImageUrl(product.image);
        
        onAddToCart?.({
          ...product,
          image: colorImage,
          quantity: colorCounts[idx],
          selectedSize,
          selectedColor: colorName
        }, isLast ? openCart : false);
      });
    } else {
      const variant = selectedColorIndex !== null ? colorVariations[selectedColorIndex] : null;
      const colorImage = variant ? (getItemImageUrl(variant.image) || getItemImageUrl(product.image)) : getItemImageUrl(product.image);
      
      onAddToCart?.({ 
        ...product, 
        image: colorImage,
        quantity, 
        selectedSize, 
        selectedColor 
      }, openCart);
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

  const isValidUrl = (url: any) => typeof url === 'string' && url.length > 0 && (url.startsWith('http') || url.startsWith('/'));

  return (
    <div className="space-y-8">
      <ProductHeading product={product} as="h1" className="hidden lg:block" />

      {colorVariations.length > 0 && (
        <div id="opcoes" className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">
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
                <span className="text-xs font-bold uppercase tracking-widest text-primary/70 group-hover:text-primary transition-colors">Quero cores diferentes</span>
              </label>
            )}
          </div>

          {isMixingColors && (
            <p className="text-xs font-bold text-accent uppercase tracking-widest animate-in fade-in slide-in-from-left-2">
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
                      "text-xs font-bold uppercase tracking-widest",
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
                      <span className="text-xs font-bold w-4 text-center">{mixCount}</span>
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
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">Tamanho</p>
          <SizeGuide description={product.description} sizes={product.sizes} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap gap-3">
            {product.sizes?.map((size: string) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "min-w-[54px] md:min-w-[60px] h-11 md:h-12 px-4 flex items-center justify-center text-xs md:text-[13px] font-bold transition-all border min-h-[44px]",
                  selectedSize === size
                    ? "border-primary bg-primary text-white shadow-xl"
                    : "border-gray-300 text-gray-700 hover:border-primary/60"
                )}
              >
                {sizeLabel(size)}
              </button>
            ))}
          </div>

          <div className="flex items-center border border-gray-200 bg-white shrink-0 shadow-sm">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-11 md:h-12 w-11 md:w-12 flex items-center justify-center hover:bg-secondary transition-colors border-r border-gray-200 min-h-[44px] min-w-[44px]"
            >
              <Minus className="h-4 w-4 text-gray-600" />
            </button>
            <span className="w-11 md:w-12 text-center text-sm md:text-base font-bold text-primary">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="h-11 md:h-12 w-11 md:w-12 flex items-center justify-center hover:bg-secondary transition-colors border-l border-gray-200 min-h-[44px] min-w-[44px]"
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div ref={botoesRef} className="space-y-4 pt-4">
        <button
          onClick={handleBuyNowClick}
          className="w-full h-14 md:h-16 text-xs md:text-[14px] font-bold uppercase tracking-[0.3em] bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-500 rounded-none shadow-2xl min-h-[54px]"
        >
          COMPRAR AGORA
        </button>
        
        <button
          onClick={handleAddToCartClick}
          className="w-full h-12 md:h-14 flex items-center justify-center text-xs md:text-xs font-bold uppercase tracking-[0.2em] border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-500 rounded-none gap-3 min-h-[44px]"
        >
          <ShoppingBag className="h-4 w-4" />
          ADICIONAR AO MEU CARRINHO
        </button>
      </div>

      <ShippingCalculator subtotal={(Number(product.price) || 0) * quantity} />

      {/* Barra fixa no rodapé (celular e tablet) */}
      <div className={`lg:hidden fixed inset-x-0 bottom-0 z-40 ${botoesVisiveis ? "hidden" : "flex"} items-center gap-3 border-t border-primary/10 bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]`}>
        <div className="min-w-0">
          <p className="text-lg font-bold leading-tight text-primary">{formatBRL((Number(product.price) || 0) * quantity)}</p>
          <p className="truncate text-xs text-gray-700">{quantity > 1 ? `${quantity} peças` : 'à vista'}</p>
        </div>
        <button onClick={handleAddToCartClick} aria-label="Adicionar à sacola" className="h-12 w-12 shrink-0 border border-primary text-primary flex items-center justify-center">
          <ShoppingBag className="h-5 w-5" />
        </button>
        <button onClick={handleBuyNowClick} className="h-12 flex-1 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-widest">
          Comprar
        </button>
      </div>

      <div className="border-t border-primary/5 pt-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="description" className="border-b border-primary/5">
            <AccordionTrigger className="px-0 py-6 hover:no-underline text-xs font-bold uppercase tracking-[0.3em] text-primary/80 [&>svg]:hidden flex justify-between">
              <span>DESCRIÇÃO EDITORIAL</span>
              <Plus className="h-5 w-5 shrink-0 text-accent transition-transform duration-200 data-[state=open]:rotate-45" />
            </AccordionTrigger>
            <AccordionContent className="pb-10 text-[13px] md:text-[14px] text-muted-foreground leading-relaxed font-light">
              <div className="space-y-4">
                <ProductDescription text={product.longDescription || product.description || ''} productName={product.name} />
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </div>
    </div>
  );
}
