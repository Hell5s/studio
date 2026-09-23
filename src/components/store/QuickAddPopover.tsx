"use client";

import React, { useState, useMemo } from 'react';
import { Camera } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn, getItemImageUrl } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface QuickAddPopoverProps {
  product: any;
  onConfirm: (product: any) => void;
  trigger: React.ReactNode;
}

export function QuickAddPopover({ product, onConfirm, trigger }: QuickAddPopoverProps) {
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const imageUrl = useMemo(() => getItemImageUrl(product.image), [product.image]);

  const colorVariations = useMemo(() => {
    if (product.variations && Array.isArray(product.variations) && product.variations.length > 0) {
      return product.variations;
    }
    if (product.colors && Array.isArray(product.colors)) {
      return product.colors.map((c: string) => ({ color: c, image: product.image }));
    }
    return [];
  }, [product]);

  const hasSizes = product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0;
  const hasColors = colorVariations.length > 0;

  const isSelectionComplete = useMemo(() => {
    const sizeOk = !hasSizes || selectedSize;
    const colorOk = !hasColors || selectedColor;
    return sizeOk && colorOk;
  }, [hasSizes, hasColors, selectedSize, selectedColor]);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSelectionComplete) return;
    
    onConfirm({
      ...product,
      quantity: 1,
      selectedSize,
      selectedColor
    });

    toast({
      title: "Item adicionado!",
      description: "O item foi reservado na sua sacola."
    });
    
    setOpen(false);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent 
        align="center" 
        className="w-[280px] sm:w-[320px] rounded-[1.5rem] shadow-2xl p-0 border-none bg-white overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="p-5 space-y-6">
          {/* Header */}
          <div className="flex gap-4 items-center border-b border-primary/5 pb-4">
            <div className="h-14 w-12 rounded-lg bg-secondary/20 overflow-hidden shrink-0 border border-primary/5 relative">
              {imageUrl ? (
                <Image src={imageUrl} alt={product.name} fill className="object-cover" sizes="50px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Camera className="h-4 w-4 text-primary/10" /></div>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-primary uppercase truncate leading-tight tracking-tight">{product.name}</h4>
              <p className="text-sm font-headline font-bold text-accent">{formatCurrency(product.price)}</p>
            </div>
          </div>

          {/* Color Selection */}
          {hasColors && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Cor: <span className="text-primary font-black ml-1">{selectedColor || 'Selecione'}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {colorVariations.map((v: any, idx: number) => {
                  const swatchImg = getItemImageUrl(v.image || product.image);
                  return (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedColor(v.color);
                      }}
                      className={cn(
                        "relative h-12 w-10 overflow-hidden border-2 transition-all bg-secondary/10 rounded-md",
                        selectedColor === v.color ? "border-primary scale-105" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      {swatchImg ? (
                        <Image 
                          src={swatchImg} 
                          alt={v.color} 
                          fill 
                          className="object-cover" 
                          sizes="40px" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Camera className="h-3 w-3 text-primary/10" /></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {hasSizes && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tamanho</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedSize(size);
                    }}
                    className={cn(
                      "h-9 min-w-[42px] px-2 flex items-center justify-center text-[11px] font-bold transition-all border rounded-md uppercase",
                      selectedSize === size
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 text-gray-400 hover:border-primary/40"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action */}
          <Button
            onClick={handleAdd}
            disabled={!isSelectionComplete}
            className="w-full h-11 bg-primary text-white font-bold uppercase tracking-widest text-[10px] rounded-full shadow-lg hover:bg-accent transition-all duration-300"
          >
            ADICIONAR
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}