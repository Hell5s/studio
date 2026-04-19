
"use client";

import React, { useState, useMemo } from 'react';
import { ShoppingBag, Share2, Star, Minus, Plus, Ruler, HelpCircle, ShieldCheck, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';
import { useFirestore, useUser, useDoc, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';

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
    <div className="space-y-8">
      {/* Header Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Toda Bela Boutique</span>
           <button className="text-muted-foreground/30 hover:text-primary transition-colors">
              <Share2 className="h-4 w-4" />
           </button>
        </div>
        <h1 className="text-3xl font-headline font-bold text-primary leading-tight">
          {product.name}
        </h1>
        <button onClick={scrollToReviews} className="flex items-center gap-3 text-accent pt-1 hover:opacity-70 transition-opacity">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-3 w-3 fill-current" />)}
          </div>
          <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest underline underline-offset-4 decoration-accent/20">23 Comentário(s)</span>
        </button>
      </div>

      {/* Pricing Card */}
      <div className="p-8 rounded-[2.5rem] bg-secondary/20 border border-primary/5 space-y-2">
        <div className="flex items-baseline gap-4">
          <span className="text-4xl font-bold text-primary">{formatCurrency(product.price)}</span>
          {product.oldPrice && (
            <span className="text-base text-muted-foreground/40 line-through italic">
              {formatCurrency(product.oldPrice)}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-bold text-primary/80 uppercase tracking-widest">
            Ou até 10x de {formatCurrency(product.price / 10)} sem juros
          </p>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">
            5% de desconto no Pix
          </p>
        </div>
      </div>

      {/* Selections */}
      <div className="space-y-10">
        {/* Colors Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 ml-2">Selecione a Cor</span>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((color: string) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "group relative flex items-center justify-center h-12 px-6 rounded-full border transition-all",
                    selectedColor === color 
                      ? "bg-primary text-white border-primary shadow-xl scale-105" 
                      : "bg-white text-primary/60 border-primary/5 hover:border-accent/40"
                  )}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest">{color}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sizes and Quantity Row */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-[9px] font-bold text-primary/40 uppercase tracking-widest hover:text-accent transition-colors">
                <Ruler className="h-3.5 w-3.5" /> Tabela de medidas
              </button>
              <button className="flex items-center gap-2 text-[9px] font-bold text-primary/40 uppercase tracking-widest hover:text-accent transition-colors">
                <HelpCircle className="h-3.5 w-3.5" /> Guia de tamanhos
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-wrap gap-2 flex-1">
              {product.sizes?.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border",
                    selectedSize === size 
                      ? "bg-primary text-white border-primary shadow-lg scale-110" 
                      : "bg-white text-primary/40 border-primary/10 hover:border-primary/40"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-secondary/40 rounded-full p-1.5 border border-primary/5">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="space-y-4 pt-4">
        <Button 
          onClick={handleBuyNowClick}
          className="w-full h-20 rounded-full text-[11px] font-black uppercase tracking-[0.3em] bg-black text-white hover:bg-primary transition-all duration-700 shadow-2xl active:scale-95"
        >
          Compre Agora
        </Button>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={handleAddToCartClick}
            className="flex-[2] h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-primary text-primary hover:bg-secondary/50 transition-all duration-500"
          >
            Adicionar ao carrinho
          </Button>
          <Button 
            variant="outline" 
            onClick={handleToggleFavorite}
            className={cn(
              "flex-1 h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-primary/5 transition-all",
              isFavorited ? "bg-primary text-white" : "bg-white hover:bg-primary/5 text-primary/40"
            )}
          >
            <Heart className={cn("h-4 w-4 mr-2", isFavorited && "fill-current")} />
            {isFavorited ? "Salvo" : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Trust & Benefits */}
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-primary/5">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/10">
          <ShieldCheck className="h-5 w-5 text-accent" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Troca Grátis</span>
            <span className="text-[8px] text-muted-foreground font-light italic">Primeira troca por nossa conta</span>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/10">
          <ShoppingBag className="h-5 w-5 text-accent" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Compra Segura</span>
            <span className="text-[8px] text-muted-foreground font-light italic">Ambiente 100% criptografado</span>
          </div>
        </div>
      </div>

      {/* Complete the Look Small Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-primary/5 space-y-6">
           <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/60 text-center">Combine com sua escolha</h4>
           <div className="flex justify-center gap-4">
              {relatedProducts.slice(0, 3).map((item) => (
                <Link key={item.id} href={`/products/${item.id}`} className="group relative h-28 w-24 overflow-hidden rounded-2xl bg-secondary/20 shadow-sm border border-primary/5">
                  <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                </Link>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
