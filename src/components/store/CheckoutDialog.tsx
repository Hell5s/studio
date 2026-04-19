"use client";

import React, { useState, useMemo } from 'react';
import { ShoppingBag, CreditCard, Truck, Loader2, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
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
import { useUser, useFirestore } from '@/firebase';
import { serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: any[];
  total: number;
  onSuccess: () => void;
}

const shippingMethods = [
  { id: 'standard', name: 'Entrega Boutique', time: '15-20 dias', price: 0 },
  { id: 'express', name: 'Entrega Expressa VIP', time: '10-15 dias', price: 19.90 },
];

export function CheckoutDialog({ open, onOpenChange, cartItems, total, onSuccess }: CheckoutDialogProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(shippingMethods[0]);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const finalTotal = useMemo(() => total + selectedShipping.price, [total, selectedShipping]);

  const handlePlaceOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.zipCode) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha as informações de envio para continuar.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Acesso necessário",
        description: "Faça login para salvar seus pedidos e acompanhar a entrega.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const orderId = `PED-${Date.now()}`;
      
      const payload = {
        orderNumber: orderId,
        userId: user.uid,
        customer: {
          name: formData.name,
          email: formData.email.toLowerCase().trim() || user.email?.toLowerCase().trim() || '',
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state.toUpperCase() || 'SP',
          zip: formData.zipCode
        },
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          image: item.image,
          category: item.category || 'Geral'
        })),
        subtotal: total,
        shipping: {
          method: selectedShipping.name,
          price: selectedShipping.price,
          estimatedTime: selectedShipping.time
        },
        total: finalTotal,
        status: "Pedido recebido",
        trackingCode: "Aguardando envio",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'orders', orderId), payload);
      
      setOrderComplete(true);
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
        setOrderComplete(false);
      }, 3500);

    } catch (error: any) {
      console.error("Erro ao processar pedido:", error);
      toast({
        title: "Erro ao processar",
        description: "Não foi possível registrar seu pedido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (orderComplete) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md rounded-[3rem] p-12 border-none shadow-2xl bg-white text-center space-y-6">
          <DialogHeader className="sr-only">
            <DialogTitle>Confirmação de Pedido</DialogTitle>
          </DialogHeader>
          <div className="h-20 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
             <CheckCircle2 className="h-10 w-10 text-primary animate-in zoom-in duration-500" />
          </div>
          <h3 className="text-3xl font-headline font-bold text-primary">Reserva Confirmada!</h3>
          <p className="text-muted-foreground italic font-light leading-relaxed">
            Sua seleção foi processada com sucesso. Em instantes você poderá acompanhar o status em sua conta.
          </p>
          <div className="pt-4">
             <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Prepare o closet</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-0 border-none shadow-2xl bg-background">
        <div className="bg-primary p-10 text-primary-foreground sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
              <ShoppingBag className="h-8 w-8 text-accent" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Finalização Editorial</p>
              <DialogHeader>
                <DialogTitle className="text-3xl font-headline font-bold text-white">Minha Jornada</DialogTitle>
              </DialogHeader>
            </div>
          </div>
          <Button variant="ghost" className="rounded-full text-white/60 hover:text-white" onClick={() => onOpenChange(false)}>Continuar Comprando</Button>
        </div>

        <div className="p-8 md:p-12 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-12">
            {/* Itens */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
                 <ShoppingBag className="h-4 w-4" />
                 <h4 className="text-[11px] font-bold uppercase tracking-[0.3em]">Sua Seleção</h4>
              </div>
              <div className="space-y-6">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex gap-6 items-center">
                    <div className="h-24 w-20 rounded-2xl bg-secondary overflow-hidden shrink-0 shadow-sm border border-primary/5">
                      <img src={item.image} className="h-full w-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-sm font-bold text-primary leading-tight">{item.name}</h4>
                      <p className="text-xs text-primary/40 font-light italic">Quantidade: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Envio */}
            <section className="space-y-8">
              <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
                 <MapPin className="h-4 w-4" />
                 <h4 className="text-[11px] font-bold uppercase tracking-[0.3em]">Dados de Entrega</h4>
              </div>
              <div className="grid gap-4">
                <Input 
                  placeholder="Nome Completo" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="h-14 rounded-2xl bg-secondary/20 border-none px-6 text-sm" 
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <Input 
                    placeholder="WhatsApp para contato" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="h-14 rounded-2xl bg-secondary/20 border-none px-6 text-sm" 
                  />
                  <Input 
                    placeholder="CEP" 
                    value={formData.zipCode}
                    onChange={e => setFormData({...formData, zipCode: e.target.value})}
                    className="h-14 rounded-2xl bg-secondary/20 border-none px-6 text-sm" 
                  />
                </div>
                <Input 
                  placeholder="Endereço, Número e Complemento" 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="h-14 rounded-2xl bg-secondary/20 border-none px-6 text-sm" 
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="Cidade" 
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                    className="h-14 rounded-2xl bg-secondary/20 border-none px-6 text-sm" 
                  />
                  <Input 
                    placeholder="Estado (Ex: SP)" 
                    value={formData.state}
                    onChange={e => setFormData({...formData, state: e.target.value})}
                    className="h-14 rounded-2xl bg-secondary/20 border-none px-6 text-sm" 
                  />
                </div>
              </div>
            </section>

            {/* Método de Frete */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
                 <Truck className="h-4 w-4" />
                 <h4 className="text-[11px] font-bold uppercase tracking-[0.3em]">Método de Envio</h4>
              </div>
              <div className="grid gap-4">
                {shippingMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedShipping(method)}
                    className={cn(
                      "flex items-center justify-between p-6 rounded-3xl border transition-all text-left",
                      selectedShipping.id === method.id 
                        ? "bg-primary text-white border-primary shadow-lg" 
                        : "bg-white border-primary/5 hover:border-accent/20"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", selectedShipping.id === method.id ? "bg-white/10" : "bg-secondary")}>
                        <Truck className={cn("h-5 w-5", selectedShipping.id === method.id ? "text-accent" : "text-primary/40")} />
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-tight">{method.name}</p>
                        <p className={cn("text-[10px] italic font-light", selectedShipping.id === method.id ? "text-white/60" : "text-muted-foreground")}>{method.time}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold">{method.price === 0 ? 'GRÁTIS' : formatCurrency(method.price)}</p>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Sumário */}
          <div className="lg:col-span-5">
            <div className="p-8 rounded-[3rem] bg-white shadow-2xl border border-primary/5 space-y-8 lg:sticky lg:top-32">
              <h5 className="text-[11px] font-bold uppercase tracking-[0.4em] text-accent text-center">Resumo Final</h5>
              
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase text-primary/40">
                  <span>Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase text-primary/40">
                  <span>Envio Boutique</span>
                  <span className="text-accent">{selectedShipping.price === 0 ? 'VIP Grátis' : formatCurrency(selectedShipping.price)}</span>
                </div>
                <Separator className="bg-primary/5" />
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-bold uppercase text-primary">Total</span>
                  <span className="text-4xl font-headline font-bold text-primary">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-secondary/20 border border-primary/5 space-y-4">
                <div className="flex items-center gap-3 text-primary/60">
                  <CreditCard className="h-4 w-4 text-accent" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Pagamento na Entrega</span>
                </div>
                <p className="text-[10px] text-primary/40 italic leading-relaxed">
                  Garanta suas peças hoje. O pagamento é processado via WhatsApp após a conferência editorial do estoque.
                </p>
              </div>

              <div className="flex items-center gap-3 justify-center text-[9px] font-bold uppercase tracking-widest text-primary/20">
                <ShieldCheck className="h-4 w-4" />
                Ambiente 100% Criptografado
              </div>

              <Button 
                className="w-full h-20 rounded-full bg-primary text-white font-bold uppercase tracking-[0.5em] text-[10px] shadow-2xl hover:bg-accent transition-all duration-700 hover:scale-105 active:scale-95"
                onClick={handlePlaceOrder}
                disabled={loading || cartItems.length === 0}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <CheckCircle2 className="h-5 w-5 mr-3" />}
                Confirmar Reserva
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
