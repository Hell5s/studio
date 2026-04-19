
"use client";

import React, { useState, useMemo } from 'react';
import { ShoppingBag, Share2, Star, Minus, Plus, Ruler, HelpCircle, ShieldCheck, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
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

export function ProductInfo({ product, onAddToCart, relatedProducts }: ProductInfoProps) {
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
      {/* Header Info - Matches Kaisan layout */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
           <span className="text-[9px] font-bold uppercase tracking-widest text-primary/40">Marca: Toda Bela</span>
           <button className="text-muted-foreground/30 hover:text-primary transition-colors">
              <Share2 className="h-4 w-4" />
           </button>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-primary leading-tight uppercase tracking-tight">
          {product.name} | REF: {product.sku || product.id.slice(-6).toUpperCase()}
        </h1>
        <button onClick={scrollToReviews} className="flex items-center gap-2 text-accent pt-1 hover:opacity-70 transition-opacity">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-2.5 w-2.5 fill-current" />)}
          </div>
          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest underline underline-offset-4 decoration-accent/10">23 Comentário(s)</span>
        </button>
      </div>

      {/* Pricing - Matches Kaisan style */}
      <div className="space-y-0.5 border-b border-primary/5 pb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-primary">{formatCurrency(product.price)}</span>
          {product.oldPrice && (
            <span className="text-sm text-muted-foreground/40 line-through italic">
              {formatCurrency(product.oldPrice)}
            </span>
          )}
        </div>
        <p className="text-[11px] font-bold text-primary/80 uppercase tracking-widest">
          10x de {formatCurrency(product.price / 10)} sem juros
        </p>
      </div>

      {/* Colors Swatches */}
      {product.colors && product.colors.length > 0 && (
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Cores disponíveis</span>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color: string) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "group relative flex items-center justify-center h-12 w-12 rounded-lg border transition-all overflow-hidden",
                  selectedColor === color 
                    ? "border-primary ring-1 ring-primary" 
                    : "border-primary/5 hover:border-accent/40"
                )}
                title={color}
              >
                 <Image src={product.image} alt={color} fill className="object-cover opacity-80" />
                 {selectedColor === color && <div className="absolute inset-0 bg-primary/10" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sizes and Quantity Row - Compact layout like reference */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Tamanho</span>
          <div className="flex items-center bg-secondary/30 rounded-lg p-1 border border-primary/5">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-white transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center text-xs font-bold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-white transition-colors"
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
                "w-12 h-12 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all border",
                selectedSize === size 
                  ? "bg-white border-primary shadow-sm ring-1 ring-primary" 
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

      {/* Primary Action Buttons - Matches Kaisan CTA */}
      <div className="space-y-3 pt-4">
        <Button 
          onClick={handleBuyNowClick}
          className="w-full h-14 text-xs font-black uppercase tracking-[0.2em] bg-black text-white hover:bg-primary transition-all duration-500 active:scale-95 rounded-none"
        >
          Compre Agora
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleAddToCartClick}
            className="flex-[3] h-12 text-[10px] font-bold uppercase tracking-widest border-primary/10 text-primary hover:bg-secondary/50 rounded-none"
          >
            Adicionar ao carrinho
          </Button>
          <Button 
            variant="outline" 
            onClick={handleToggleFavorite}
            className={cn(
              "flex-1 h-12 rounded-none border-primary/10 transition-all",
              isFavorited ? "bg-primary text-white" : "bg-white hover:bg-primary/5 text-primary/40"
            )}
          >
            <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
          </Button>
        </div>
      </div>

      {/* Complete the Look Small Section - Matches reference */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="pt-6 border-t border-primary/5 space-y-4">
           <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Complete o Look</h4>
           <div className="flex gap-3">
              {relatedProducts.slice(0, 3).map((item) => (
                <Link key={item.id} href={`/products/${item.id}`} className="group relative h-24 w-20 overflow-hidden rounded-lg bg-secondary/20 shadow-sm border border-primary/5">
                  <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                </Link>
              ))}
           </div>
        </div>
      )}

      {/* Integrated Accordions in Sidebar - Matches Kaisan style */}
      <Accordion type="single" collapsible className="w-full pt-4">
        <AccordionItem value="item-1" className="border-b border-primary/5">
          <AccordionTrigger className="hover:no-underline py-4 group text-[10px] font-bold uppercase tracking-widest text-primary/80">
            Descrição do Produto
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-[12px] text-muted-foreground leading-relaxed font-light italic">
            <p>{product.longDescription || product.description}</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" className="border-b border-primary/5">
          <AccordionTrigger className="hover:no-underline py-4 group text-[10px] font-bold uppercase tracking-widest text-primary/80">
            Cuidados com seu produto
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-[12px] text-muted-foreground leading-relaxed font-light italic">
            <p className="mb-2">Para preservar a essência desta peça Toda Bela:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Lavagem à mão com sabão neutro.</li>
              <li>Secagem à sombra para manter a cor.</li>
              <li>Evitar máquinas de secar.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3" className="border-b border-primary/5">
          <button 
            onClick={scrollToReviews}
            className="flex flex-1 items-center justify-between py-4 font-medium transition-all text-[10px] font-bold uppercase tracking-widest text-primary/80 w-full text-left"
          >
            Avaliações
            <span className="text-accent text-[9px] font-black">★ 4.9</span>
          </button>
        </AccordionItem>
      </Accordion>

      {/* Trust & Benefits */}
      <div className="grid grid-cols-1 gap-3 pt-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/10">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Compra Segura</span>
            <span className="text-[9px] text-muted-foreground italic">Troca grátis em até 7 dias</span>
          </div>
        </div>
      </div>
    </div>
  );
}
