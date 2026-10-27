"use client";

import React, { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ShoppingBag, Loader2, Package, MapPin, Tag, Clock, CheckCircle2, Truck, XCircle, Info, RefreshCw } from 'lucide-react';
import { cn, getItemImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface MyOrdersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  'pending': { label: 'Aguardando Pagamento', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Clock className="h-3 w-3" /> },
  'paid': { label: 'Pagamento Confirmado', color: 'bg-green-50 text-green-700 border-green-100', icon: <CheckCircle2 className="h-3 w-3" /> },
  'processing': { label: 'Em Processamento', color: 'bg-orange-50 text-orange-700 border-orange-100', icon: <Tag className="h-3 w-3" /> },
  'shipped': { label: 'Enviado', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: <Truck className="h-3 w-3" /> },
  'delivered': { label: 'Entregue', color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  'canceled': { label: 'Cancelado', color: 'bg-red-50 text-red-700 border-red-100', icon: <XCircle className="h-3 w-3" /> },
  'refunded': { label: 'Reembolsado', color: 'bg-purple-50 text-purple-700 border-purple-100', icon: <RefreshCw className="h-3 w-3" /> },
  'Pedido recebido': { label: 'Aguardando Pagamento', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Clock className="h-3 w-3" /> },
  'Pago': { label: 'Pagamento Confirmado', color: 'bg-green-50 text-green-700 border-green-100', icon: <CheckCircle2 className="h-3 w-3" /> },
  'Comprado na Shopee': { label: 'Em Processamento', color: 'bg-orange-50 text-orange-700 border-orange-100', icon: <Tag className="h-3 w-3" /> },
  'Enviado': { label: 'Enviado', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: <Truck className="h-3 w-3" /> },
  'Entregue': { label: 'Entregue', color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  'Cancelado': { label: 'Cancelado', color: 'bg-red-50 text-red-700 border-red-100', icon: <XCircle className="h-3 w-3" /> },
};

const itemStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  'aguardando': { label: 'Preparando Pedido', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Clock className="h-3 w-3" /> },
  'comprado': { label: 'Preparando Pedido', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Clock className="h-3 w-3" /> },
  'transito': { label: 'A Caminho', color: 'bg-purple-50 text-purple-700 border-purple-100', icon: <Truck className="h-3 w-3" /> },
  'entregue': { label: 'Entregue', color: 'bg-green-50 text-green-700 border-green-100', icon: <CheckCircle2 className="h-3 w-3" /> },
};

export function MyOrdersDialog({ open, onOpenChange }: MyOrdersDialogProps) {
  const db = useFirestore();
  const { user } = useUser();

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user?.uid || !open) return null;
    return query(
      collection(db, 'orders'), 
      where('userId', '==', user.uid), 
      orderBy('createdAt', 'desc'),
      limit(10)
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
              <p className="text-muted-foreground italic max-w-xs mx-auto">Por favor, realize o login na loja para visualizar seu histórico de pedidos.</p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-accent" />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40">Sincronizando Loja...</p>
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-12">
              {orders.map((order: any) => {
                const status = statusConfig[order.status] || statusConfig['pending'];
                const isPending = order.status === 'pending' || order.status === 'Pedido recebido';
                const isCanceled = order.status === 'canceled' || order.status === 'Cancelado';
                const isRefunded = order.status === 'refunded';
                
                return (
                  <div key={order.id} className="group relative bg-white rounded-[2.5rem] border border-primary/5 shadow-editorial hover:shadow-premium transition-all duration-700 overflow-hidden">
                    <div className="p-8 md:p-10 border-b border-primary/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Pedido #{order.orderNumber || order.id.slice(-6).toUpperCase()}</span>
                           <div className="h-1 w-1 rounded-full bg-accent/30" />
                           <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="space-y-2">
                          <div className={cn("px-4 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 w-fit", status.color)}>
                             {status.icon}
                             {status.label}
                          </div>
                          {isPending && (
                            <p className="text-[9px] text-muted-foreground italic font-light max-w-xs leading-relaxed ml-1">
                              O pedido será preparado assim que o pagamento for aprovado. Pagamentos via boleto podem levar até 3 dias úteis para compensação.
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-left md:text-right space-y-1">
                        <p className="text-[9px] font-bold uppercase text-primary/30 tracking-widest">Total</p>
                        <p className="text-3xl font-headline font-bold text-primary">{formatPrice(order.total || 0)}</p>
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-12">
                      <div className="lg:col-span-7 p-8 md:p-10 space-y-8">
                        <div className="space-y-6">
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                            <Package className="h-3 w-3" /> Sua Seleção ({order.items?.length || 0})
                          </p>
                          <div className="space-y-4">
                            {order.items?.map((item: any, i: number) => {
                              const itemImg = getItemImageUrl(item.image);
                              
                              let itemConfig = itemStatusConfig[item.status || 'aguardando'];
                              if (isPending) {
                                itemConfig = { label: 'Aguardando Pagamento', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Clock className="h-3 w-3" /> };
                              } else if (isCanceled) {
                                itemConfig = { label: 'Cancelado', color: 'bg-red-50 text-red-700 border-red-100', icon: <XCircle className="h-3 w-3" /> };
                              } else if (isRefunded) {
                                itemConfig = { label: 'Reembolsado', color: 'bg-purple-50 text-purple-700 border-purple-100', icon: <RefreshCw className="h-3 w-3" /> };
                              }

                              return (
                                <div key={i} className="flex gap-6 items-center p-4 rounded-3xl bg-secondary/10 border border-transparent hover:border-accent/10 transition-colors">
                                  <div className="w-20 aspect-[3/5] rounded-2xl overflow-hidden shadow-sm shrink-0 relative bg-secondary/20">
                                    {itemImg ? <img src={itemImg} className="h-full w-full object-cover" alt={item.name} /> : <div className="h-full w-full bg-secondary/20" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-sm font-bold text-primary leading-tight line-clamp-1">{item.name}</h5>
                                    <div className="flex gap-3 text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                                      {item.selectedSize && <span>TAM: {item.selectedSize}</span>}
                                      {item.selectedColor && <span className="text-accent">COR: {item.selectedColor}</span>}
                                    </div>
                                    <p className="mt-1 text-[11px] text-muted-foreground italic">Qtd: {item.quantity} • {formatPrice(item.price)}</p>
                                    
                                    <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[8px] font-bold uppercase tracking-widest mt-3", itemConfig.color)}>
                                      {itemConfig.icon}
                                      {itemConfig.label}
                                    </div>
                                  </div>
                                  <p className="text-sm font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-5 bg-secondary/20 p-8 md:p-10 space-y-8">
                         <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                            <MapPin className="h-3 w-3" /> Entrega
                          </p>
                          <div className="space-y-4 text-[11px] text-muted-foreground leading-relaxed italic">
                             <p className="font-bold text-primary not-italic">{order.customer?.name}</p>
                             <p>{order.customer?.address}</p>
                             <p>{order.customer?.city}, {order.customer?.state}</p>
                             <p>CEP: {order.customer?.zip}</p>
                          </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="text-center pt-8">
                <Link href="/meus-pedidos">
                  <Button 
                    onClick={() => onOpenChange(false)}
                    className="rounded-full bg-primary text-white font-bold uppercase tracking-widest text-[10px] h-14 px-12"
                  >
                    Ver Histórico Completo
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center space-y-6">
              <ShoppingBag className="h-12 w-12 text-accent/30 mx-auto" />
              <h3 className="text-xl font-headline font-bold text-primary">Nenhuma peça ainda</h3>
              <p className="text-muted-foreground italic max-w-xs mx-auto">Sua história na Toda Bela começa com a sua primeira escolha.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
