
"use client";

import React, { useState } from 'react';
import { ShoppingBag, Heart, Share2, ShieldCheck, Truck, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ProductInfoProps {
  product: any;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleAddToCart = () => {
    if ((product.sizes?.length && !selectedSize) || (product.colors?.length && !selectedColor)) {
      toast({
        title: "Seleção necessária",
        description: "Por favor, escolha as variações desejadas antes de prosseguir.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Adicionado à sacola",
      description: `${product.name} foi reservado para você.`,
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-10 duration-1000">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Badge className="bg-primary/5 text-primary border-primary/10 px-4 py-1.5 rounded-full font-bold uppercase tracking-[0.3em] text-[9px]">
            {product.badge || "Coleção Exclusiva"}
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
            {product.installments || "até 10x sem juros"}
          </p>
        </div>
      </div>

      <p className="text-lg text-muted-foreground/80 leading-relaxed font-light italic">
        {product.description}
      </p>

      {/* Variation Selectors */}
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

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 pt-6">
        <Button 
          onClick={handleAddToCart}
          className="w-full rounded-full py-10 text-[11px] font-bold uppercase tracking-[0.5em] bg-primary text-white hover:bg-accent transition-all duration-700 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 group"
        >
          <ShoppingBag className="mr-4 h-5 w-5 group-hover:scale-110 transition-transform" />
          Garantir Exclusividade
        </Button>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="rounded-full py-8 text-[10px] font-bold uppercase tracking-[0.3em] border-primary/10 hover:bg-white text-primary">
            <Heart className="mr-2 h-4 w-4" /> Favoritos
          </Button>
          <Button variant="outline" className="rounded-full py-8 text-[10px] font-bold uppercase tracking-[0.3em] border-primary/10 hover:bg-white text-primary">
            <Share2 className="mr-2 h-4 w-4" /> Compartilhar
          </Button>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 gap-4 pt-10">
        {[
          { icon: <Truck className="h-5 w-5" />, title: "Entrega Expressa Boutique", desc: "Frete VIP para todo o país" },
          { icon: <ShieldCheck className="h-5 w-5" />, title: "Compra Protegida", desc: "Segurança absoluta em seus dados" },
          { icon: <Sparkles className="h-5 w-5" />, title: "Curadoria Toda Bela", desc: "Peça selecionada por especialistas" }
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
