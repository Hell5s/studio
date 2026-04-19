
"use client";

import React, { useState } from 'react';
import { ShoppingBag, Heart, Share2, ShieldCheck, Truck, Sparkles, CreditCard, Star, Minus, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useDoc, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';

interface ProductInfoProps {
  product: any;
  onAddToCart?: (product: any, openCart?: boolean) => void;
}

export function ProductInfo({ product, onAddToCart }: ProductInfoProps) {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const stringId = String(product?.id);

  const favoriteRef = React.useMemo(() => {
    if (!db || !user?.uid || !stringId) return null;
    return doc(db, 'users', user.uid, 'favorites', stringId);
  }, [db, user?.uid, stringId]);

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
        title: "Opções Pendentes",
        description: "Escolha seu tamanho e cor preferidos.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Acesso necessário",
        description: "Faça login para salvar suas peças favoritas.",
        variant: "destructive"
      });
      return;
    }

    if (!favoriteRef) return;

    if (isFavorited) {
      deleteDocumentNonBlocking(favoriteRef);
      toast({ title: "Removido dos favoritos" });
    } else {
      setDocumentNonBlocking(favoriteRef, {
        productId: stringId,
        productName: product.name,
        productImage: product.image,
        addedAt: serverTimestamp()
      }, { merge: true });
      toast({ title: "Salvo nos seus favoritos!" });
    }
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
    <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-1000">
      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className="bg-accent/10 text-accent border-none px-3 py-1 rounded-full font-bold uppercase tracking-widest text-[8px]">
            {product.badge || "Exclusividade Boutique"}
          </Badge>
          <div className="flex items-center gap-1 text-accent">
            {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-3 w-3 fill-current" />)}
            <span className="text-[10px] font-bold text-primary/40 ml-2 uppercase tracking-widest">(24 Avaliações)</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-headline font-bold text-primary leading-[1.1] tracking-tighter">
          {product.name}
        </h1>

        <div className="flex flex-col gap-1 pt-2">
          <div className="flex items-end gap-4">
            <span className="text-4xl font-bold text-primary">{formatCurrency(product.price)}</span>
            {product.oldPrice && (
              <span className="text-lg text-muted-foreground/40 line-through font-light italic mb-1">
                {formatCurrency(product.oldPrice)}
              </span>
            )}
          </div>
          <p className="text-[11px] font-bold text-accent uppercase tracking-[0.2em]">
            Ou 10x de {formatCurrency(product.price / 10)} sem juros
          </p>
        </div>
      </div>

      {/* Description Summary */}
      <p className="text-base text-muted-foreground leading-relaxed font-light italic border-l-2 border-primary/5 pl-6">
        {product.description}
      </p>

      {/* Variations & Selection */}
      <div className="space-y-8 pt-4">
        {/* Colors Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Cor: <span className="text-primary">{selectedColor || "Escolha uma opção"}</span></span>
            </div>
            <div className="flex flex-wrap gap-4">
              {product.colors.map((color: string) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "group relative flex items-center justify-center h-12 px-6 rounded-2xl border transition-all duration-500 overflow-hidden",
                    selectedColor === color 
                      ? "bg-primary text-white border-primary shadow-xl scale-105" 
                      : "bg-white text-primary/40 border-primary/5 hover:border-accent/40"
                  )}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest z-10">{color}</span>
                  <div className={cn("absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity", selectedColor === color && "hidden")} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sizes Selection */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Tamanho: <span className="text-primary">{selectedSize || "Selecione"}</span></span>
              <button className="text-[10px] font-bold text-accent uppercase underline underline-offset-4 decoration-accent/20 hover:text-primary transition-colors">Guia de Medidas</button>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center text-xs font-bold transition-all duration-500 border",
                    selectedSize === size 
                      ? "bg-primary text-white border-primary shadow-xl scale-110" 
                      : "bg-white text-primary/40 border-primary/10 hover:bg-secondary/50 hover:text-primary"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity and Fav Group */}
        <div className="flex items-center gap-6 pt-4">
           <div className="flex items-center bg-secondary/30 rounded-2xl p-1 border border-primary/5">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-12 w-12 rounded-xl flex items-center justify-center hover:bg-white transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-bold">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="h-12 w-12 rounded-xl flex items-center justify-center hover:bg-white transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
           </div>
           
           <Button 
            variant="outline" 
            onClick={handleToggleFavorite}
            className={cn(
              "flex-1 h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-primary/5 transition-all",
              isFavorited ? "bg-primary text-white" : "bg-white hover:bg-primary/5 text-primary/40"
            )}
          >
            <Heart className={cn("mr-2 h-4 w-4", isFavorited && "fill-current")} /> 
            {isFavorited ? "Peça Favoritada" : "Desejo"}
          </Button>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="space-y-4 pt-8">
        <Button 
          onClick={handleBuyNowClick}
          className="w-full h-20 rounded-[2rem] text-sm font-bold uppercase tracking-[0.15em] bg-primary text-white hover:bg-black transition-all duration-700 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 group"
        >
          <CreditCard className="mr-3 h-5 w-5" />
          Finalizar Pedido
          <ChevronRight className="ml-2 h-4 w-4 opacity-0 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
        </Button>
        
        <Button 
          onClick={handleAddToCartClick}
          variant="outline"
          className="w-full h-16 rounded-[2rem] text-[10px] font-bold uppercase tracking-widest border-primary/10 text-primary/60 hover:bg-secondary/50 transition-all duration-500"
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Manter no Carrinho
        </Button>
      </div>

      {/* Trust Context */}
      <div className="grid grid-cols-2 gap-4 pt-10">
        <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-secondary/20 border border-primary/5 group hover:bg-white transition-all">
          <Truck className="h-6 w-6 text-accent mb-3 group-hover:scale-110 transition-transform" />
          <p className="text-[9px] font-bold uppercase tracking-widest text-primary">Frete Expresso</p>
          <p className="text-[8px] text-muted-foreground italic mt-1">Sua peça em até 10 dias</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-secondary/20 border border-primary/5 group hover:bg-white transition-all">
          <ShieldCheck className="h-6 w-6 text-accent mb-3 group-hover:scale-110 transition-transform" />
          <p className="text-[9px] font-bold uppercase tracking-widest text-primary">Pagamento Seguro</p>
          <p className="text-[8px] text-muted-foreground italic mt-1">Ambiente criptografado</p>
        </div>
      </div>
    </div>
  );
}
