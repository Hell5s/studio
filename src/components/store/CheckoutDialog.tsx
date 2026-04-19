"use client";

import React, { useState } from 'react';
import { ShoppingBag, CreditCard, Truck, Loader2, CheckCircle2 } from 'lucide-react';
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

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: any[];
  total: number;
  onSuccess: () => void;
}

export function CheckoutDialog({ open, onOpenChange, cartItems, total, onSuccess }: CheckoutDialogProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const handlePlaceOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      toast({
        title: "Campos necessários",
        description: "Por favor, preencha os dados de envio para garantir suas peças.",
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
        userId: user.uid, // OBRIGATÓRIO: Vincula o pedido ao usuário logado
        customer: {
          name: formData.name,
          email: formData.email.toLowerCase().trim() || user.email?.toLowerCase().trim() || '',
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state || 'SP',
          zip: formData.zipCode
        },
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          image: item.image
        })),
        subtotal: total,
        total: total,
        status: "Pedido recebido",
        trackingCode: "Aguardando envio",
        createdAt: serverTimestamp(), // OBRIGATÓRIO
        updatedAt: serverTimestamp()  // OBRIGATÓRIO
      };

      await setDoc(doc(db, 'orders', orderId), payload);
      
      setOrderComplete(true);
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
        setOrderComplete(false);
      }, 3000);

    } catch (error: any) {
      console.error("Erro ao processar pedido:", error);
      toast({
        title: "Erro ao processar",
        description: error.message || "Não foi possível registrar seu pedido.",
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
            <DialogTitle>Pedido Recebido</DialogTitle>
          </DialogHeader>
          <div className="h-20 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
             <CheckCircle2 className="h-10 w-10 text-primary animate-in zoom-in duration-500" />
          </div>
          <h3 className="text-3xl font-headline font-bold text-primary">Pedido Recebido!</h3>
          <p className="text-muted-foreground italic font-light leading-relaxed">
            Sua seleção foi reservada com sucesso. Acompanhe o status em "Meus Pedidos" no menu superior.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

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
              <DialogHeader>
                <DialogTitle className="text-3xl font-headline font-bold text-white">Minha Seleção</DialogTitle>
              </DialogHeader>
            </div>
          </div>
          <Button variant="ghost" className="rounded-full text-white/60 hover:text-white" onClick={() => onOpenChange(false)}>Fechar</Button>
        </div>

        <div className="p-10 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-6">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-6 items-center group">
                  <div className="h-28 w-24 rounded-2xl bg-secondary overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105">
                    <img src={item.image} className="h-full w-full object-cover" alt={item.name} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[11px] font-bold text-accent uppercase tracking-widest">{item.category}</p>
                    <h4 className="text-lg font-bold text-primary leading-tight">{item.name}</h4>
                    <p className="text-sm text-primary/60 font-light italic">Qtd: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(item.price * item.quantity)}
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
                <Input 
                  placeholder="Nome Completo" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="h-14 rounded-2xl bg-secondary/30 border-none px-6" 
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <Input 
                    placeholder="WhatsApp para contato" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="h-14 rounded-2xl bg-secondary/30 border-none px-6" 
                  />
                  <Input 
                    placeholder="CEP" 
                    value={formData.zipCode}
                    onChange={e => setFormData({...formData, zipCode: e.target.value})}
                    className="h-14 rounded-2xl bg-secondary/30 border-none px-6" 
                  />
                </div>
                <Input 
                  placeholder="Endereço Completo com Número" 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="h-14 rounded-2xl bg-secondary/30 border-none px-6" 
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <Input 
                    placeholder="Cidade" 
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                    className="h-14 rounded-2xl bg-secondary/30 border-none px-6" 
                  />
                  <Input 
                    placeholder="Estado (Ex: SP)" 
                    value={formData.state}
                    onChange={e => setFormData({...formData, state: e.target.value})}
                    className="h-14 rounded-2xl bg-secondary/30 border-none px-6" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="p-8 rounded-[3rem] bg-white shadow-xl border border-primary/5 space-y-8 sticky top-10">
              <div className="space-y-4">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-primary/40">
                  <span>Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-primary/40">
                  <span>Entrega</span>
                  <span className="text-accent italic font-light">VIP Grátis</span>
                </div>
                <Separator className="bg-primary/5" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold uppercase text-primary">Total Final</span>
                  <span className="text-3xl font-headline font-bold text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-secondary/30 border border-primary/5">
                <div className="flex items-center gap-3 text-primary/60 mb-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Pagamento na Entrega</span>
                </div>
                <p className="text-[10px] text-primary/40 italic leading-relaxed">
                  Garanta suas peças agora. Nossa equipe enviará o link de pagamento ou detalhes do PIX via WhatsApp após o processamento.
                </p>
              </div>

              <Button 
                className="w-full h-16 rounded-full bg-primary text-white font-bold uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:bg-accent transition-all duration-700"
                onClick={handlePlaceOrder}
                disabled={loading || cartItems.length === 0}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Garantir Minhas Peças
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}