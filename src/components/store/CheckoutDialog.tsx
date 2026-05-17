
"use client";

import React, { useMemo } from 'react';
import { ShoppingBag, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from '@/hooks/use-toast';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: any[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  total: number;
  onSuccess: () => void;
}

export function CheckoutDialog({ open, onOpenChange, cartItems, onUpdateQuantity, onRemoveItem, total }: CheckoutDialogProps) {
  const router = useRouter();
  const { toast } = useToast();

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleGoToCheckout = () => {
    if (cartItems.length === 0) {
      toast({ title: "Sacola vazia", description: "Adicione peças antes de finalizar.", variant: "destructive" });
      return;
    }
    
    // Salva itens para o checkout carregar instantaneamente
    sessionStorage.setItem('checkout_items', JSON.stringify(cartItems));
    
    onOpenChange(false);
    router.push('/checkout');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-[420px] p-0 flex flex-col bg-white border-l border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 shrink-0">
          <SheetHeader className="p-0 space-y-0">
            <SheetTitle className="text-xs font-bold text-primary uppercase tracking-[0.3em]">
              MINHA SELEÇÃO
            </SheetTitle>
          </SheetHeader>
          <button onClick={() => onOpenChange(false)} className="text-primary/20 hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-32 px-10 text-center space-y-6">
              <div className="h-20 w-20 bg-secondary/30 rounded-full flex items-center justify-center text-primary/10">
                <ShoppingBag className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Sua bolsa está vazia</h3>
                <p className="text-[12px] text-muted-foreground italic font-light">Inicie sua jornada editorial escolhendo peças exclusivas.</p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-8">
              <div className="space-y-0">
                {cartItems.map((item, idx) => (
                  <div key={item.id}>
                    <div className="flex gap-6 py-6 group">
                      <div className="h-24 w-18 md:h-32 md:w-24 bg-secondary/20 overflow-hidden shrink-0 rounded-sm">
                        <img src={item.image} className="h-full w-full object-cover" alt={item.name} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className="text-[11px] font-bold text-primary leading-tight uppercase tracking-tight line-clamp-2">{item.name}</p>
                        <div className="flex flex-wrap gap-4 text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                          {item.selectedSize && <span>TAM: {item.selectedSize}</span>}
                          {item.selectedColor && <span className="text-accent">COR: {item.selectedColor}</span>}
                        </div>
                        <div className="flex items-center gap-3 pt-3">
                            <button onClick={() => onUpdateQuantity(item.id, -1)} className="h-7 w-7 border border-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-xs">−</button>
                            <span className="text-[11px] font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.id, 1)} className="h-7 w-7 border border-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-xs">+</button>
                        </div>
                      </div>
                      <button onClick={() => onRemoveItem(item.id)} className="text-primary/10 hover:text-destructive self-start p-2"><X className="h-4 w-4" /></button>
                    </div>
                    {idx < cartItems.length - 1 && <div className="h-px bg-primary/5" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="shrink-0 border-t border-primary/5 bg-white p-6">
            <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">SUBTOTAL</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
            </div>
            <button
              onClick={handleGoToCheckout}
              className="w-full h-16 bg-primary text-white text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-accent transition-all duration-700 flex items-center justify-center gap-4 shadow-2xl"
            >
              FINALIZAR COMPRA
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-[8px] text-center text-muted-foreground uppercase mt-4 tracking-widest opacity-60">Frete e descontos calculados no checkout</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
