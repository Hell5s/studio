
"use client";

import React, { useState } from 'react';
import { ShoppingBag, Heart, Share2, ShieldCheck, Truck, Sparkles, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useDoc, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';

interface ProductInfoProps {
  product: any;
  onAddToCart?: () => void;
}

export function ProductInfo({ product, onAddToCart }: ProductInfoProps) {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const stringId = String(product?.id);

  const favoriteRef = React.useMemo(() => {
    if (!db || !user?.uid || !stringId) return null;
    return doc(db, 'users', user.uid, 'favorites', stringId);
  }, [db, user?.uid, stringId]);

  const { data: favoriteData } = useDoc(favoriteRef);
  const isFavorited = !!favoriteData;

  const handleToggleFavorite = () => {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const validateSelection = () => {
    if ((product.sizes?.length && !selectedSize) || (product.colors?.length && !selectedColor)) {
      toast({
        title: "Seleção necessária",
        description: "Por favor, escolha as variações desejadas antes de prosseguir.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateSelection()) return;
    onAddToCart?.();
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;
    onAddToCart?.(); // Adiciona e já abre o carrinho (padrão do sistema agora)
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-10 duration-1000">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Badge className="bg-primary/5 text-primary border-primary/10 px-4 py-1.5 rounded-full font-bold uppercase tracking-[0.3em] text-[9px]">
            {product.badge || "Seleção Exclusiva"}
          </Badge>
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">
            {product.category}
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary leading-tight tracking-tighter">
          {product.name}
        </h1>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-6">
            <span className="text-4xl font-bold text-primary">{formatCurrency(product.price)}</span>
            {product.oldPrice && (
              <span className="text-lg text-muted-foreground/50 line-through decoration-accent/30 font-light italic">
                {formatCurrency(product.oldPrice)}
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-accent uppercase tracking-[0.2em]">
            até 10x de {formatCurrency(product.price / 10)} sem juros
          </p>
        </div>
      </div>

      <p className="text-lg text-muted-foreground/80 leading-relaxed font-light italic">
        {product.description}
      </p>

      <div className="space-y-8">
        {product.colors && product.colors.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">Cor: {selectedColor || "Selecione"}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((color: string) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border",
                    selectedColor === color 
                      ? "bg-primary text-white border-primary shadow-lg scale-105" 
                      : "bg-white text-primary/60 border-primary/5 hover:border-primary/20"
                  )}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.sizes && product.sizes.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">Tamanho: {selectedSize || "Selecione"}</span>
              <button className="text-[10px] font-bold text-accent uppercase underline underline-offset-4 decoration-accent/30">Guia de Medidas</button>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center text-xs font-bold transition-all duration-300 border",
                    selectedSize === size 
                      ? "bg-primary text-white border-primary shadow-lg scale-105" 
                      : "bg-white text-primary/60 border-primary/5 hover:border-primary/20"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button 
            onClick={handleAddToCart}
            variant="outline"
            className="w-full rounded-full py-8 text-[10px] font-bold uppercase tracking-[0.3em] border-primary text-primary hover:bg-secondary/50 transition-all duration-500"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Adicionar ao carrinho
          </Button>
          <Button 
            onClick={handleBuyNow}
            className="w-full rounded-full py-8 text-[10px] font-bold uppercase tracking-[0.5em] bg-primary text-white hover:bg-black transition-all duration-700 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 group"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Comprar Agora
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            onClick={handleToggleFavorite}
            className={cn(
              "rounded-full py-8 text-[10px] font-bold uppercase tracking-[0.3em] border-primary/10 transition-all",
              isFavorited ? "bg-[#6E3C47] text-white" : "hover:bg-white text-primary"
            )}
          >
            <Heart className={cn("mr-2 h-4 w-4", isFavorited && "fill-current")} /> 
            {isFavorited ? "Favoritado" : "Favoritos"}
          </Button>
          <Button variant="outline" className="rounded-full py-8 text-[10px] font-bold uppercase tracking-[0.3em] border-primary/10 hover:bg-white text-primary">
            <Share2 className="mr-2 h-4 w-4" /> Compartilhar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 pt-10">
        {[
          { icon: <Truck className="h-5 w-5" />, title: "Entrega Expressa Boutique", desc: "Frete VIP para todo o país" },
          { icon: <ShieldCheck className="h-5 w-5" />, title: "Compra Protegida", desc: "Segurança absoluta em seus dados" },
          { icon: <Sparkles className="h-5 w-5" />, title: "Selo Toda Bela", desc: "Peça selecionada por especialistas" }
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-6 p-6 rounded-3xl bg-secondary/30 border border-primary/5">
            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-accent shadow-sm">
              {item.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{item.title}</p>
              <p className="text-[9px] text-muted-foreground/70 italic mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
