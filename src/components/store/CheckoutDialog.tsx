"use client";

import React, { useState, useMemo } from 'react';
import { ShoppingBag, Loader2, CheckCircle2, ArrowLeft, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUser, useFirestore } from '@/firebase';
import { serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: any[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  total: number;
  onSuccess: () => void;
}

const shippingMethods = [
  { id: 'standard', name: 'Entrega Boutique', time: '15-20 dias', price: 0 },
  { id: 'express', name: 'Entrega Expressa VIP', time: '10-15 dias', price: 19.90 },
];

export function CheckoutDialog({ open, onOpenChange, cartItems, onUpdateQuantity, onRemoveItem, total, onSuccess }: CheckoutDialogProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [loading, setLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(shippingMethods[0]);
  const [coupon, setCoupon] = useState('');
  const [zipCode, setZipCode] = useState('');

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

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleCalculateShipping = () => {
    const cleanZip = zipCode.replace(/\D/g, '');
    if (cleanZip.length < 8) {
      toast({
        title: "CEP Incompleto",
        description: "Por favor, informe um CEP válido com 8 dígitos.",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setFormData(prev => ({ ...prev, zipCode: zipCode }));
      
      const firstDigit = cleanZip[0];
      if (['0', '1', '2', '3'].includes(firstDigit)) {
        toast({
          title: "Frete Disponível",
          description: "Sua região possui frete grátis nas compras acima de R$ 249,00.",
        });
      } else {
        toast({
          title: "Frete Calculado",
          description: "Entrega disponível para sua localidade via transportadora boutique.",
        });
      }
    }, 1200);
  };

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
          category: item.category || 'Geral',
          selectedSize: item.selectedSize || null,
          selectedColor: item.selectedColor || null
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
        setStep('cart');
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

  if (orderComplete) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full max-w-[420px] p-0 flex flex-col items-center justify-center bg-white">
          <div className="text-center space-y-6 px-10">
            <div className="h-24 w-24 bg-black rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-headline font-bold text-primary uppercase tracking-widest">Reserva Confirmada!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed italic font-light">
                Sua seleção extraordinária foi processada com sucesso. Em instantes você poderá acompanhar o status em sua conta.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-[420px] p-0 flex flex-col bg-white border-l border-gray-100 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 shrink-0">
          {step === 'checkout' ? (
            <button
              onClick={() => setStep('cart')}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 hover:text-primary transition-colors min-h-[44px]"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
          ) : (
            <SheetHeader className="p-0 space-y-0">
              <SheetTitle className="text-xs font-bold text-primary uppercase tracking-[0.3em]">
                {step === 'cart' ? 'MINHA SELEÇÃO' : 'FINALIZAR PEDIDO'}
              </SheetTitle>
            </SheetHeader>
          )}
          <button onClick={() => onOpenChange(false)} className="text-primary/20 hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-32 px-10 text-center space-y-6">
              <div className="h-20 w-20 bg-secondary/30 rounded-full flex items-center justify-center text-primary/10">
                <ShoppingBag className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Sua bolsa está vazia</h3>
                <p className="text-[12px] text-muted-foreground italic font-light">Inicie sua jornada editorial escolhendo peças exclusivas.</p>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] underline underline-offset-8 text-accent min-h-[44px]"
              >
                Explorar Boutique
              </button>
            </div>
          ) : step === 'cart' ? (
            <div className="p-6 space-y-8">
              {/* Item List */}
              <div className="space-y-0">
                {cartItems.map((item, idx) => (
                  <div key={item.id}>
                    <div className="flex gap-6 py-6 group">
                      <div className="h-24 w-18 md:h-32 md:w-24 bg-secondary/20 overflow-hidden shrink-0 rounded-sm">
                        <img src={item.image} className="h-full w-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" alt={item.name} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className="text-[11px] font-bold text-primary leading-tight uppercase tracking-tight line-clamp-2">{item.name}</p>
                        <div className="flex flex-wrap gap-4 text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                          {item.selectedSize && <span>TAM: {item.selectedSize}</span>}
                          {item.selectedColor && <span className="text-accent">COR: {item.selectedColor}</span>}
                        </div>
                        <div className="flex flex-col pt-2">
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">Qtd: {item.quantity}</p>
                          <div className="flex items-center gap-3 pt-1">
                            <button
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="h-7 w-7 border border-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-xs"
                            >
                              −
                            </button>
                            <span className="text-[11px] font-bold w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="h-7 w-7 border border-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-xs"
                            >
                              +
                            </button>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <p className="text-sm font-bold text-primary">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-primary/10 hover:text-destructive transition-colors self-start min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {idx < cartItems.length - 1 && <div className="h-px bg-primary/5" />}
                  </div>
                ))}
              </div>

              {/* Calculated Totals */}
              <div className="pt-8 border-t border-primary/5 space-y-6">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-primary/40">
                  <span>SUBTOTAL</span>
                  <span className="text-sm text-primary">{formatCurrency(total)}</span>
                </div>

                <div className="space-y-4">
                   <div className="flex gap-3">
                    <Input
                      placeholder="CUPOM EDITORIAL"
                      value={coupon}
                      onChange={e => setCoupon(e.target.value.toUpperCase())}
                      className="h-14 text-[10px] rounded-none border-primary/10 flex-1 uppercase tracking-widest font-bold placeholder:font-light"
                    />
                    <button className="px-8 h-14 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] shrink-0 hover:bg-accent transition-all min-h-[44px]">
                      APLICAR
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <Input
                      placeholder="CONSULTAR CEP"
                      value={zipCode}
                      onChange={e => setZipCode(e.target.value)}
                      maxLength={9}
                      className="h-14 text-[10px] rounded-none border-primary/10 flex-1 tracking-widest font-bold placeholder:font-light"
                    />
                    <button 
                      onClick={handleCalculateShipping}
                      disabled={isCalculating}
                      className="px-8 h-14 bg-secondary text-primary text-[10px] font-bold uppercase tracking-[0.2em] shrink-0 hover:bg-primary hover:text-white transition-all min-h-[44px] flex items-center justify-center min-w-[120px]"
                    >
                      {isCalculating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'CALCULAR'}
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-primary/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">VALOR FINAL</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(finalTotal)}</span>
                  </div>
                  <p className="text-[10px] text-accent font-bold uppercase tracking-widest text-right italic">
                    Parcele em 10x de {formatCurrency(finalTotal / 10)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <div className="p-6 space-y-10">
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">DADOS DE DESTINO</p>
                <div className="space-y-4">
                  <Input
                    placeholder="Nome Completo para Identificação"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="h-14 text-[11px] rounded-none border-primary/10 px-6 font-medium"
                  />
                  <Input
                    placeholder="WhatsApp VIP (Acompanhamento)"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="h-14 text-[11px] rounded-none border-primary/10 px-6 font-medium"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="CEP"
                      value={formData.zipCode}
                      onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                      className="h-14 text-[11px] rounded-none border-primary/10 px-6 font-medium"
                    />
                    <Input
                      placeholder="Estado (Ex: SP)"
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                      className="h-14 text-[11px] rounded-none border-primary/10 px-6 font-medium"
                    />
                  </div>
                  <Input
                    placeholder="Endereço, Número e Complemento"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="h-14 text-[11px] rounded-none border-primary/10 px-6 font-medium"
                  />
                  <Input
                    placeholder="Cidade"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="h-14 text-[11px] rounded-none border-primary/10 px-6 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">MÉTODO DE ENVIO</p>
                <div className="space-y-4">
                  {shippingMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedShipping(method)}
                      className={cn(
                        "w-full flex items-center justify-between p-6 border transition-all duration-500 text-left min-h-[80px]",
                        selectedShipping.id === method.id
                          ? "border-primary bg-primary text-white shadow-xl"
                          : "border-primary/10 text-primary hover:border-accent"
                      )}
                    >
                      <div className="space-y-1">
                        <p className="text-[11px] font-black uppercase tracking-widest">{method.name}</p>
                        <p className={cn("text-[10px] italic font-light", selectedShipping.id === method.id ? "text-white/60" : "text-muted-foreground")}>{method.time}</p>
                      </div>
                      <p className="text-sm font-bold">{method.price === 0 ? 'GRÁTIS' : formatCurrency(method.price)}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkout Summary */}
              <div className="pt-10 border-t border-primary/10 space-y-4">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-primary/40">
                  <span>SUBTOTAL</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-primary/40">
                  <span>TAXA DE ENVIO</span>
                  <span className="text-accent">{selectedShipping.price === 0 ? 'GRÁTIS' : formatCurrency(selectedShipping.price)}</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-primary">VALOR FINAL</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Button */}
        {cartItems.length > 0 && (
          <div className="shrink-0 border-t border-primary/5 bg-white p-4">
            <button
              onClick={step === 'cart' ? () => setStep('checkout') : handlePlaceOrder}
              disabled={loading}
              className="w-full h-16 bg-primary text-white text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-accent transition-all duration-700 disabled:opacity-50 flex items-center justify-center gap-4 shadow-2xl min-h-[54px]"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : step === 'cart' ? 'FINALIZAR SELEÇÃO' : 'CONFIRMAR RESERVA'}
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
