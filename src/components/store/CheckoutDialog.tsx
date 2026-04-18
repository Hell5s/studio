
"use client";

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  User, 
  Phone, 
  CheckCircle2, 
  Loader2,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: any[];
  total: number;
  onSuccess: () => void;
}

export function CheckoutDialog({ open, onOpenChange, cartItems, total, onSuccess }: CheckoutDialogProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.street) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha seus dados de entrega.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const orderData = {
      customerName: formData.name,
      customerEmail: formData.email || null,
      customerPhone: formData.phone,
      customerAddress: {
        zipCode: formData.zipCode,
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state
      },
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      total: total,
      status: 'Pendente',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      const docRef = await addDocumentNonBlocking(collection(db, 'orders'), orderData);
      setSuccess(docRef?.id || "ORDER_ID");
      toast({
        title: "Pedido Realizado!",
        description: "Sua nova conquista Toda Bela está reservada.",
      });
      setLoading(false);
      setTimeout(() => {
        onSuccess();
        setSuccess(null);
        setFormData({
          name: '', email: '', phone: '', zipCode: '', street: '', 
          number: '', complement: '', neighborhood: '', city: '', state: ''
        });
      }, 5000);
    } catch (error) {
      toast({
        title: "Erro ao finalizar",
        description: "Não foi possível processar seu pedido agora.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
          <div className="bg-primary p-12 text-center text-white space-y-6">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="h-12 w-12 text-accent" />
              </div>
            </div>
            <h2 className="text-4xl font-serif font-bold">Pedido Confirmado</h2>
            <p className="text-accent text-[11px] font-bold uppercase tracking-[0.3em]">
              Seu ID: {success.slice(-6).toUpperCase()}
            </p>
          </div>
          <div className="p-12 text-center space-y-8">
            <p className="text-primary/70 italic font-light leading-relaxed">
              Obrigada por escolher a Toda Bela. Em breve você receberá atualizações sobre o seu envio em seu WhatsApp/E-mail.
            </p>
            <Button 
              onClick={() => onOpenChange(false)}
              className="w-full h-16 rounded-full bg-primary text-white font-bold uppercase tracking-widest text-[10px]"
            >
              Voltar para a Loja
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto rounded-[3rem] p-0 border-none shadow-2xl bg-[#FFF9F7]">
        <div className="bg-primary p-10 text-primary-foreground sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
              <ShoppingBag className="h-8 w-8 text-accent" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Finalização de Compra</p>
              <h3 className="text-3xl font-headline font-bold">Sua Próxima Conquista</h3>
            </div>
          </div>
          <Button variant="ghost" className="rounded-full text-white/60 hover:text-white" onClick={() => onOpenChange(false)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>

        <form onSubmit={handleCompleteOrder} className="p-10 grid lg:grid-cols-12 gap-12">
          {/* Informações da Cliente */}
          <div className="lg:col-span-7 space-y-12">
            <section className="space-y-8">
              <div className="flex items-center gap-3 text-accent">
                <User className="h-5 w-5" />
                <h4 className="text-[11px] font-bold uppercase tracking-widest">Identificação</h4>
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label className="ml-4 text-[10px] font-bold uppercase tracking-widest text-primary/40">Nome Completo</Label>
                  <Input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Como devemos te chamar?"
                    className="h-14 rounded-full bg-white border-none shadow-sm px-6"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="ml-4 text-[10px] font-bold uppercase tracking-widest text-primary/40">WhatsApp</Label>
                    <Input 
                      required
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                      className="h-14 rounded-full bg-white border-none shadow-sm px-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="ml-4 text-[10px] font-bold uppercase tracking-widest text-primary/40">E-mail (Opcional)</Label>
                    <Input 
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="seu@email.com"
                      className="h-14 rounded-full bg-white border-none shadow-sm px-6"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-8">
              <div className="flex items-center gap-3 text-accent">
                <MapPin className="h-5 w-5" />
                <h4 className="text-[11px] font-bold uppercase tracking-widest">Endereço de Entrega</h4>
              </div>
              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="ml-4 text-[10px] font-bold uppercase tracking-widest text-primary/40">CEP</Label>
                    <Input 
                      required
                      value={formData.zipCode}
                      onChange={e => setFormData({...formData, zipCode: e.target.value})}
                      placeholder="00000-000"
                      className="h-14 rounded-full bg-white border-none shadow-sm px-6"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="ml-4 text-[10px] font-bold uppercase tracking-widest text-primary/40">Rua / Avenida</Label>
                  <Input 
                    required
                    value={formData.street}
                    onChange={e => setFormData({...formData, street: e.target.value})}
                    placeholder="Endereço completo"
                    className="h-14 rounded-full bg-white border-none shadow-sm px-6"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="ml-4 text-[10px] font-bold uppercase tracking-widest text-primary/40">Número</Label>
                    <Input 
                      required
                      value={formData.number}
                      onChange={e => setFormData({...formData, number: e.target.value})}
                      className="h-14 rounded-full bg-white border-none shadow-sm px-6"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="ml-4 text-[10px] font-bold uppercase tracking-widest text-primary/40">Complemento</Label>
                    <Input 
                      value={formData.complement}
                      onChange={e => setFormData({...formData, complement: e.target.value})}
                      placeholder="Apto, Bloco, etc"
                      className="h-14 rounded-full bg-white border-none shadow-sm px-6"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                   <div className="space-y-2">
                    <Label className="ml-4 text-[10px] font-bold uppercase tracking-widest text-primary/40">Bairro</Label>
                    <Input 
                      required
                      value={formData.neighborhood}
                      onChange={e => setFormData({...formData, neighborhood: e.target.value})}
                      className="h-14 rounded-full bg-white border-none shadow-sm px-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="ml-4 text-[10px] font-bold uppercase tracking-widest text-primary/40">Cidade</Label>
                    <Input 
                      required
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                      className="h-14 rounded-full bg-white border-none shadow-sm px-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="ml-4 text-[10px] font-bold uppercase tracking-widest text-primary/40">UF</Label>
                    <Input 
                      required
                      value={formData.state}
                      onChange={e => setFormData({...formData, state: e.target.value})}
                      className="h-14 rounded-full bg-white border-none shadow-sm px-6"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Resumo e Pagamento */}
          <div className="lg:col-span-5 space-y-8">
            <div className="sticky top-28 space-y-8">
              <div className="p-8 rounded-[3rem] bg-white shadow-xl border border-primary/5 space-y-8">
                <div className="flex items-center gap-3 text-accent">
                  <CreditCard className="h-5 w-5" />
                  <h4 className="text-[11px] font-bold uppercase tracking-widest">Resumo do Pedido</h4>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                  {cartItems.map((item, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <div className="h-16 w-12 rounded-xl bg-muted overflow-hidden shrink-0 shadow-sm">
                        <img src={item.image} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-primary truncate uppercase">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground/60">Qtd: {item.quantity}</p>
                      </div>
                      <p className="text-xs font-bold text-primary">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <Separator className="bg-primary/5" />

                <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    <span>Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-green-600">
                    <span>Frete</span>
                    <span>Grátis</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-bold uppercase text-primary">Total</span>
                    <span className="text-3xl font-serif font-bold text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-secondary/30 border border-primary/5 space-y-2">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Pagamento na Entrega / Pix</p>
                  <p className="text-[10px] text-primary/60 italic leading-relaxed">
                    Nossa equipe entrará em contato para confirmar o pagamento via Pix ou combinar a entrega.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-16 rounded-full bg-primary text-white font-bold uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:bg-accent transition-all duration-500"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmar Pedido"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
