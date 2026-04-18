
"use client";

import React, { useState } from 'react';
import { ShoppingBag, CreditCard, Truck, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: any[];
  total: number;
  onSuccess: () => void;
}

export function CheckoutDialog({ open, onOpenChange, cartItems, total, onSuccess }: CheckoutDialogProps) {
  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-0 border-none shadow-2xl bg-background">
        <div className="bg-primary p-10 text-primary-foreground sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
              <ShoppingBag className="h-8 w-8 text-accent" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Carrinho Editorial</p>
              <h3 className="text-3xl font-headline font-bold">Minha Seleção</h3>
            </div>
          </div>
          <Button variant="ghost" className="rounded-full text-white/60 hover:text-white" onClick={() => onOpenChange(false)}>Fechar</Button>
        </div>

        <div className="p-10 grid lg:grid-cols-12 gap-12">
          {/* List of Items */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-6">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-6 items-center group">
                  <div className="h-28 w-24 rounded-2xl bg-secondary overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105">
                    <img src={item.image} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[11px] font-bold text-accent uppercase tracking-widest">{item.category}</p>
                    <h4 className="text-lg font-bold text-primary leading-tight">{item.name}</h4>
                    <p className="text-sm text-primary/60 font-light italic">Qtd: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="bg-primary/5" />

            <div className="space-y-8">
              <div className="flex items-center gap-3 text-accent">
                <Truck className="h-5 w-5" />
                <h4 className="text-[11px] font-bold uppercase tracking-widest">Informações de Envio</h4>
              </div>
              <div className="grid gap-4">
                <Input placeholder="Nome Completo" className="h-14 rounded-2xl bg-secondary/30 border-none px-6" />
                <div className="grid md:grid-cols-2 gap-4">
                  <Input placeholder="WhatsApp" className="h-14 rounded-2xl bg-secondary/30 border-none px-6" />
                  <Input placeholder="CEP" className="h-14 rounded-2xl bg-secondary/30 border-none px-6" />
                </div>
                <Input placeholder="Endereço Completo" className="h-14 rounded-2xl bg-secondary/30 border-none px-6" />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="p-8 rounded-[3rem] bg-white shadow-xl border border-primary/5 space-y-8 sticky top-10">
              <div className="space-y-4">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-primary/40">
                  <span>Subtotal</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-primary/40">
                  <span>Entrega</span>
                  <span className="text-accent italic font-light">Calculando...</span>
                </div>
                <Separator className="bg-primary/5" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold uppercase text-primary">Total Estimado</span>
                  <span className="text-3xl font-headline font-bold text-primary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-secondary/30 border border-primary/5">
                <div className="flex items-center gap-3 text-primary/60 mb-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Pagamento na Entrega</span>
                </div>
                <p className="text-[10px] text-primary/40 italic leading-relaxed">
                  Finalize seu pedido e nossa equipe entrará em contato via WhatsApp para combinar a entrega e o pagamento.
                </p>
              </div>

              <Button 
                className="w-full h-16 rounded-full bg-primary text-white font-bold uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:bg-accent transition-all duration-700"
                onClick={onSuccess}
              >
                Garantir Minhas Peças
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
