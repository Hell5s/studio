
"use client";

import React, { useState, useMemo } from 'react';
import { ShoppingBag, Loader2, X, ArrowRight, User, MapPin, Truck, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from '@/lib/utils';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: any[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  total: number;
  onSuccess: () => void;
}

export function CheckoutDialog({ open, onOpenChange, cartItems, onUpdateQuantity, onRemoveItem, total, onSuccess }: CheckoutDialogProps) {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [step, setStep] = useState<'cart' | 'checkout' | 'pix'>('cart');
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_base64: string; payment_id: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    zipCode: '',
    address: '',
    city: '',
    state: ''
  });

  const [selectedShipping, setSelectedShipping] = useState({ name: 'PAC', price: 0, time: '15-20 dias' });

  const finalTotal = total + selectedShipping.price;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleZipCodeSearch = async (val: string) => {
    const cep = val.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, zipCode: cep }));
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address: data.logradouro,
            city: data.localidade,
            state: data.uf
          }));
        }
      } catch (e) {
        console.error("CEP error:", e);
      }
    }
  };

  const handleGeneratePix = async () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.zipCode) {
      toast({ title: "Dados incompletos", description: "Por favor, preencha todas as informações de entrega.", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Acesso necessário", description: "Faça login para continuar com seu pedido.", variant: "destructive" });
      return;
    }

    setIsGeneratingPix(true);
    try {
      const orderId = `PED-${Date.now()}`;
      
      // Salva o pedido no Firestore
      await setDoc(doc(db, 'orders', orderId), {
        orderNumber: orderId,
        userId: user.uid,
        customer: {
          name: formData.name,
          email: formData.email || user.email || '',
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
        status: "Aguardando pagamento",
        trackingCode: "Aguardando envio",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Gera o PIX chamando o endpoint de pagamentos
      const response = await fetch('/api/checkout/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: {
            transaction_amount: finalTotal,
            description: `Pedido Toda Bela - ${orderId}`,
            payment_method_id: 'pix',
            payer: {
              email: formData.email || user.email || '',
              first_name: formData.name.split(' ')[0],
              last_name: formData.name.split(' ').slice(1).join(' ') || 'Cliente',
              identification: { type: 'CPF', number: '00000000000' }
            },
            external_reference: orderId
          }
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || 'Erro ao processar o pagamento PIX');

      setPixData(data);
      setStep('pix');
    } catch (error: any) {
      toast({ title: "Erro ao gerar PIX", description: error.message, variant: "destructive" });
    } finally {
      setIsGeneratingPix(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => {
        if (!o) {
            setStep('cart');
            setPixData(null);
        }
        onOpenChange(o);
    }}>
      <SheetContent
        side="right"
        className="w-full max-w-[420px] p-0 flex flex-col bg-white border-l border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 shrink-0">
          <SheetHeader className="p-0 space-y-0">
            <SheetTitle className="text-xs font-bold text-primary uppercase tracking-[0.3em]">
              {step === 'cart' ? 'MINHA SELEÇÃO' : step === 'checkout' ? 'DADOS DE ENTREGA' : 'PAGAMENTO PIX'}
            </SheetTitle>
          </SheetHeader>
          <button onClick={() => onOpenChange(false)} className="text-primary/20 hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {step === 'cart' ? (
            cartItems.length === 0 ? (
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
    
                  <div className="pt-8 border-t border-primary/5 space-y-6">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-primary/40">
                      <span>SUBTOTAL</span>
                      <span className="text-sm text-primary">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              )
          ) : step === 'checkout' ? (
            <div className="p-6 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-accent">
                            <User className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Identificação</span>
                        </div>
                        <div className="grid gap-3">
                            <Input placeholder="Nome Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-11 rounded-xl bg-secondary/10 border-none" />
                            <Input placeholder="WhatsApp / Telefone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="h-11 rounded-xl bg-secondary/10 border-none" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-accent">
                            <MapPin className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Entrega</span>
                        </div>
                        <div className="grid gap-3">
                            <Input placeholder="CEP" maxLength={9} value={formData.zipCode} onChange={e => handleZipCodeSearch(e.target.value)} className="h-11 rounded-xl bg-secondary/10 border-none" />
                            <Input placeholder="Endereço e Número" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-11 rounded-xl bg-secondary/10 border-none" />
                            <div className="grid grid-cols-2 gap-3">
                                <Input placeholder="Cidade" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="h-11 rounded-xl bg-secondary/10 border-none" />
                                <Input placeholder="Estado" maxLength={2} value={formData.state} onChange={e => setFormData({...formData, state: e.target.value.toUpperCase()})} className="h-11 rounded-xl bg-secondary/10 border-none" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-accent">
                            <Truck className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Opções de Envio</span>
                        </div>
                        <div className="grid gap-3">
                            <button 
                                onClick={() => setSelectedShipping({ name: 'PAC', price: 0, time: '15-20 dias' })}
                                className={cn("p-4 rounded-xl border text-left flex justify-between items-center transition-all", selectedShipping.name === 'PAC' ? "border-primary bg-primary/5 shadow-sm" : "border-gray-100 hover:bg-gray-50")}
                            >
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold uppercase">PAC Econômico</p>
                                    <p className="text-[9px] text-muted-foreground italic">15-20 dias úteis</p>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-600">GRÁTIS</span>
                            </button>
                            <button 
                                onClick={() => setSelectedShipping({ name: 'SEDEX', price: 29.90, time: '5-7 dias' })}
                                className={cn("p-4 rounded-xl border text-left flex justify-between items-center transition-all", selectedShipping.name === 'SEDEX' ? "border-primary bg-primary/5 shadow-sm" : "border-gray-100 hover:bg-gray-50")}
                            >
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold uppercase">SEDEX Express</p>
                                    <p className="text-[9px] text-muted-foreground italic">5-7 dias úteis</p>
                                </div>
                                <span className="text-[10px] font-bold">R$ 29,90</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-primary/5 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-primary/40">
                        <span>Subtotal</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-primary/40">
                        <span>Frete</span>
                        <span className={cn(selectedShipping.price === 0 && "text-emerald-600 font-bold")}>{selectedShipping.price === 0 ? 'Grátis' : formatCurrency(selectedShipping.price)}</span>
                    </div>
                </div>
            </div>
          ) : step === 'pix' && pixData ? (
            <div className="p-6 flex flex-col items-center space-y-6 text-center animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Pague com PIX</h3>
                <p className="text-[11px] text-muted-foreground">Escaneie o QR Code ou copie o código abaixo</p>
              </div>
              
              <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <img 
                  src={`data:image/png;base64,${pixData.qr_code_base64}`}
                  alt="QR Code PIX"
                  className="h-48 w-48"
                />
              </div>
          
              <div className="w-full space-y-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Código PIX Copia e Cola</p>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value={pixData.qr_code}
                    className="flex-1 text-[10px] border border-gray-100 rounded-xl px-4 py-3 bg-gray-50 outline-none truncate font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pixData.qr_code);
                      toast({ title: "Código copiado!", description: "Agora basta pagar no app do seu banco." });
                    }}
                    className="px-4 py-3 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors shrink-0"
                  >
                    Copiar
                  </button>
                </div>
              </div>
          
              <div className="p-4 bg-green-50 rounded-xl border border-green-100 w-full text-left">
                <p className="text-[11px] text-green-700 font-medium space-y-1">
                  <span className="block">✓ Valor: {formatCurrency(finalTotal)}</span>
                  <span className="block">✓ O pagamento é confirmado automaticamente</span>
                  <span className="block">✓ Acompanhe em Meus Pedidos</span>
                </p>
              </div>
          
              <button
                onClick={() => {
                  onSuccess();
                  onOpenChange(false);
                  setStep('cart');
                  setPixData(null);
                }}
                className="text-[10px] text-gray-400 uppercase tracking-widest underline hover:text-primary transition-colors font-bold"
              >
                Fechar e acompanhar pedido
              </button>
            </div>
          ) : null}
        </div>

        {step !== 'pix' && cartItems.length > 0 && (
          <div className="shrink-0 border-t border-primary/5 bg-white p-6">
            <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">TOTAL</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(finalTotal)}</span>
            </div>
            <button
              onClick={step === 'cart' ? () => setStep('checkout') : step === 'checkout' ? handleGeneratePix : undefined}
              disabled={isGeneratingPix}
              className="w-full h-16 bg-primary text-white text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-accent transition-all duration-700 flex items-center justify-center gap-4 shadow-2xl"
            >
              {isGeneratingPix ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {step === 'cart' ? 'FINALIZAR SELEÇÃO' : 'GERAR PIX'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <p className="text-[8px] text-center text-muted-foreground uppercase mt-4 tracking-widest opacity-60">Ambiente seguro com criptografia SSL</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
