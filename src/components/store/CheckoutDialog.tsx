"use client";

import React, { useState, useMemo } from 'react';
import { ShoppingBag, CreditCard, Truck, Loader2, CheckCircle2, ShieldCheck, MapPin, Trash2, Plus, Minus, ArrowLeft, X, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from '@/components/ui/separator';
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
    // Simulação de consulta logística
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
          <div className="text-center space-y-4 px-8">
            <div className="h-16 w-16 bg-black rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-black uppercase tracking-wider">Reserva Confirmada!</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Sua seleção foi processada com sucesso. Em instantes você poderá acompanhar o status em sua conta.
            </p>
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
        {/* Header - estilo Kaisan */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          {step === 'checkout' ? (
            <button
              onClick={() => setStep('cart')}
              className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar
            </button>
          ) : (
            <SheetHeader className="p-0 space-y-0">
              <SheetTitle className="text-[13px] font-bold text-black uppercase tracking-wider">
                {step === 'cart' ? 'Meus Produtos' : 'Finalizar Pedido'}
              </SheetTitle>
            </SheetHeader>
          )}
          {step === 'cart' && (
            <div className="flex items-center gap-4">
              <button className="text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">
                Editar
              </button>
            </div>
          )}
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 px-8 text-center space-y-4">
              <ShoppingBag className="h-10 w-10 text-gray-200" />
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-black">Carrinho vazio</h3>
              <p className="text-[12px] text-gray-400">Explore nossa coleção e escolha suas peças.</p>
              <button
                onClick={() => onOpenChange(false)}
                className="mt-2 text-[10px] font-bold uppercase tracking-widest underline underline-offset-4 text-black"
              >
                Continuar comprando
              </button>
            </div>
          ) : step === 'cart' ? (
            <div className="p-5 space-y-0">
              {/* Lista de itens */}
              {cartItems.map((item, idx) => (
                <div key={item.id}>
                  <div className="flex gap-4 py-4">
                    <div className="h-20 w-16 bg-gray-100 overflow-hidden shrink-0">
                      <img src={item.image} className="h-full w-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-[12px] font-semibold text-black leading-tight line-clamp-2">{item.name}</p>
                      <p className="text-[10px] text-gray-400">Sku: {item.sku || item.id?.slice(-6).toUpperCase()}</p>
                      {item.selectedSize && (
                        <p className="text-[10px] text-gray-400">Tamanho: {item.selectedSize}</p>
                      )}
                      <p className="text-[10px] text-gray-400">Quantidade: {item.quantity}</p>
                      <p className="text-[13px] font-bold text-black">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors self-start pt-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {idx < cartItems.length - 1 && <div className="h-px bg-gray-100" />}
                </div>
              ))}

              {/* Subtotal */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center py-2">
                  <span className="text-[12px] font-semibold text-black">Subtotal:</span>
                  <span className="text-[14px] font-bold text-black">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Cupom de desconto */}
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Cupom de desconto"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  className="h-10 text-[12px] rounded-none border-gray-200 flex-1"
                />
                <button className="px-4 h-10 bg-black text-white text-[10px] font-bold uppercase tracking-wider shrink-0 hover:bg-gray-900 transition-colors">
                  Utilizar
                </button>
              </div>

              {/* Calcular frete */}
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Consultar Frete"
                  value={zipCode}
                  onChange={e => setZipCode(e.target.value)}
                  maxLength={9}
                  className="h-10 text-[12px] rounded-none border-gray-200 flex-1"
                />
                <button 
                  onClick={handleCalculateShipping}
                  disabled={isCalculating}
                  className="px-4 h-10 bg-black text-white text-[10px] font-bold uppercase tracking-wider shrink-0 hover:bg-gray-900 transition-colors flex items-center justify-center min-w-[100px]"
                >
                  {isCalculating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Calcular'}
                </button>
              </div>

              {/* Valor final */}
              <div className="pt-4 border-t border-gray-100 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-semibold text-black">Valor final:</span>
                  <span className="text-[16px] font-bold text-black">{formatCurrency(finalTotal)}</span>
                </div>
                <p className="text-[10px] text-gray-400 text-right">
                  Parcele em até 10x de {formatCurrency(finalTotal / 10)} sem juros
                </p>
              </div>

              {/* Info frete grátis */}
              <div className="pt-3 pb-2">
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  <span className="font-bold text-black">FRETE GRÁTIS</span><br />
                  Sul e Sudeste acima de <span className="font-semibold">R$ 249,00</span><br />
                  Demais regiões acima de <span className="font-semibold">R$ 299,00</span>
                </p>
              </div>
            </div>
          ) : (
            /* Formulário de checkout */
            <div className="p-5 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Dados de Entrega</p>
              <div className="space-y-3">
                <Input
                  placeholder="Nome Completo"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="h-11 text-[12px] rounded-none border-gray-200"
                />
                <Input
                  placeholder="WhatsApp para contato"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="h-11 text-[12px] rounded-none border-gray-200"
                />
                <Input
                  placeholder="CEP"
                  value={formData.zipCode}
                  onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                  className="h-11 text-[12px] rounded-none border-gray-200"
                />
                <Input
                  placeholder="Endereço, Número e Complemento"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="h-11 text-[12px] rounded-none border-gray-200"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Cidade"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="h-11 text-[12px] rounded-none border-gray-200"
                  />
                  <Input
                    placeholder="Estado (Ex: SP)"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    className="h-11 text-[12px] rounded-none border-gray-200"
                  />
                </div>
              </div>

              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pt-2">Método de Envio</p>
              <div className="space-y-2">
                {shippingMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedShipping(method)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 border transition-all text-left",
                      selectedShipping.id === method.id
                        ? "border-black bg-black text-white"
                        : "border-gray-200 text-black hover:border-gray-400"
                    )}
                  >
                    <div>
                      <p className="text-[12px] font-semibold">{method.name}</p>
                      <p className={cn("text-[10px]", selectedShipping.id === method.id ? "text-gray-300" : "text-gray-400")}>{method.time}</p>
                    </div>
                    <p className="text-[12px] font-bold">{method.price === 0 ? 'GRÁTIS' : formatCurrency(method.price)}</p>
                  </button>
                ))}
              </div>

              {/* Resumo */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-[11px] text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500">
                  <span>Envio</span>
                  <span>{selectedShipping.price === 0 ? 'Grátis' : formatCurrency(selectedShipping.price)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[12px] font-bold text-black">Valor final:</span>
                  <span className="text-[16px] font-bold text-black">{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botão fixo na base - estilo Kaisan */}
        {cartItems.length > 0 && (
          <div className="shrink-0 border-t border-gray-100">
            <button
              onClick={step === 'cart' ? () => setStep('checkout') : handlePlaceOrder}
              disabled={loading}
              className="w-full h-14 bg-black text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {step === 'cart' ? 'FINALIZAR PEDIDO' : 'CONFIRMAR RESERVA'}
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}