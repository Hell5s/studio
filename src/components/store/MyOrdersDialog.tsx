"use client";

import React, { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ShoppingBag, Loader2, Package, Truck, CheckCircle2, Clock, MapPin, Tag, XCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface MyOrdersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  'Pedido recebido': { label: 'Pedido Recebido', color: 'bg-[#F7E8EA] text-[#6E3C47] border-[#E9C9CF]', icon: <Clock className="h-3 w-3" /> },
  'Pago': { label: 'Pagamento Confirmado', color: 'bg-green-50 text-green-700 border-green-100', icon: <CheckCircle2 className="h-3 w-3" /> },
  'Comprado na Shopee': { label: 'Em Processamento', color: 'bg-orange-50 text-orange-700 border-orange-100', icon: <Tag className="h-3 w-3" /> },
  'Enviado': { label: 'Enviado', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: <Truck className="h-3 w-3" /> },
  'Entregue': { label: 'Entregue', color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  'Cancelado': { label: 'Cancelado', color: 'bg-red-50 text-red-700 border-red-100', icon: <XCircle className="h-3 w-3" /> },
};

export function MyOrdersDialog({ open, onOpenChange }: MyOrdersDialogProps) {
  const db = useFirestore();
  const { user } = useUser();

  // Consulta memoizada e protegida: só dispara se o usuário estiver logado e o modal aberto
  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user?.uid || !open) return null;
    
    return query(
      collection(db, 'orders'), 
      where('userId', '==', user.uid), 
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [db, user?.uid, open]);

  const { data: orders, isLoading } = useCollection(ordersQuery);

  const formatPrice = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const formatDate = (date: any) => {
    if (!date) return 'Recentemente';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-0 border-none shadow-2xl bg-[#FFF9F7]">
        <div className="bg-primary p-10 text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <ShoppingBag className="h-40 w-40" />
          </div>
          <DialogHeader className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent mb-2">Área Exclusiva</p>
            <DialogTitle className="text-4xl font-headline font-bold">
              Minha Jornada <span className="italic font-light text-accent">Toda Bela</span>
            </DialogTitle>
            <DialogDescription className="text-white/60 font-light italic text-lg mt-2">
              Acompanhe o status e detalhes de suas escolhas.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 md:p-12">
          {!user ? (
            <div className="py-20 text-center space-y-6">
              <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mx-auto">
                <Info className="h-10 w-10 text-primary/30" />
              </div>
              <h3 className="text-xl font-headline font-bold text-primary">Acesso Necessário</h3>
              <p className="text-muted-foreground italic max-w-xs mx-auto">Por favor, realize o login na boutique para visualizar seu histórico de pedidos.</p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-accent" />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40">Sincronizando Boutique...</p>
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-12">
              {orders.map((order: any) => {
                const status = statusConfig[order.status] || statusConfig['Pedido recebido'];
                
                return (
                  <div key={order.id} className="group relative bg-white rounded-[2.5rem] border border-primary/5 shadow-editorial hover:shadow-premium transition-all duration-700 overflow-hidden">
                    {/* Order Header */}
                    <div className="p-8 md:p-10 border-b border-primary/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Pedido #{order.orderNumber || order.id.slice(-6).toUpperCase()}</span>
                           <div className="h-1 w-1 rounded-full bg-accent/30" />
                           <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className={cn("px-4 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest flex items-center gap-2", status.color)}>
                              {status.icon}
                              {status.label}
                           </div>
                        </div>
                      </div>
                      
                      <div className="text-left md:text-right space-y-1">
                        <p className="text-[9px] font-bold uppercase text-primary/30 tracking-widest">Investimento Total</p>
                        <p className="text-3xl font-headline font-bold text-primary">{formatPrice(order.total || 0)}</p>
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-0">
                      {/* Items Column */}
                      <div className="lg:col-span-7 p-8 md:p-10 space-y-8">
                        <div className="space-y-6">
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                            <Package className="h-3 w-3" /> Sua Seleção ({order.items?.length || 0} itens)
                          </p>
                          <div className="space-y-4">
                            {order.items?.map((item: any, i: number) => (
                              <div key={i} className="flex gap-6 items-center p-4 rounded-3xl bg-secondary/10 border border-transparent hover:border-accent/10 transition-colors">
                                <div className="h-24 w-20 rounded-2xl overflow-hidden shadow-sm shrink-0">
                                  <img src={item.image} className="h-full w-full object-cover" alt={item.name} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-sm font-bold text-primary leading-tight line-clamp-1">{item.name}</h5>
                                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground italic">
                                    <span>Qtd: {item.quantity}</span>
                                    <span>•</span>
                                    <span>{formatPrice(item.price)}/un</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {order.trackingCode && (
                          <div className="p-6 rounded-[2rem] bg-primary text-primary-foreground space-y-3">
                             <div className="flex items-center gap-3">
                                <Truck className="h-5 w-5 text-accent" />
                                <p className="text-[11px] font-bold uppercase tracking-widest text-accent">Rastreamento da Peça</p>
                             </div>
                             <div className="flex justify-between items-center">
                                <p className="text-lg font-mono font-medium">{order.trackingCode}</p>
                                <button className="text-[9px] font-bold uppercase tracking-widest underline underline-offset-4 decoration-accent">Copiar Código</button>
                             </div>
                          </div>
                        )}
                      </div>

                      {/* Info Column */}
                      <div className="lg:col-span-5 bg-secondary/20 p-8 md:p-10 space-y-10">
                        <div className="space-y-6">
                           <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                            <MapPin className="h-3 w-3" /> Destino de Entrega
                          </p>
                          <div className="space-y-4">
                            <div className="space-y-1">
                               <p className="text-sm font-bold text-primary">{order.customer?.name || order.customerName}</p>
                               <p className="text-[11px] text-muted-foreground italic">{order.customer?.email || order.customerEmail}</p>
                               <p className="text-[11px] text-muted-foreground italic">{order.customer?.phone || order.customerPhone}</p>
                            </div>
                            <Separator className="bg-primary/5" />
                            <div className="space-y-1 text-[11px] text-muted-foreground leading-relaxed italic">
                               <p>{order.customer?.address || order.customerAddress?.street}</p>
                               <p>{order.customer?.city || order.customerAddress?.city}, {order.customer?.state || order.customerAddress?.state}</p>
                               <p>CEP: {order.customer?.zip || order.customerAddress?.zipCode}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 rounded-[2rem] border border-primary/5 bg-white/50 space-y-4">
                           <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-primary/40">
                              <span>Subtotal</span>
                              <span>{formatPrice(order.subtotal || order.total)}</span>
                           </div>
                           <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-accent">
                              <span>Entrega Boutique</span>
                              <span className="italic font-light">VIP Grátis</span>
                           </div>
                           <Separator className="bg-primary/5" />
                           <div className="flex justify-between items-center text-primary">
                              <span className="text-[11px] font-bold uppercase tracking-widest">Investimento Final</span>
                              <span className="text-xl font-bold">{formatPrice(order.total)}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-32 flex flex-col items-center justify-center text-center space-y-8 bg-white/40 rounded-[4rem] border-2 border-dashed border-primary/10">
              <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center text-primary/20">
                <ShoppingBag className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h5 className="text-2xl font-headline font-bold text-primary uppercase tracking-widest">Nenhuma Peça Ainda</h5>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto font-light italic leading-relaxed">
                  Sua história na Toda Bela começa com a sua primeira escolha. Que tal explorar nossos lançamentos?
                </p>
              </div>
              <button 
                onClick={() => onOpenChange(false)}
                className="rounded-full border-2 border-primary px-10 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
              >
                Conhecer a Coleção
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}