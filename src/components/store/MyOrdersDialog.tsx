"use client";

import React from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ShoppingBag, Loader2, Package, Clock, Truck, CheckCircle2 } from 'lucide-react';

interface MyOrdersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusIcons: Record<string, React.ReactNode> = {
  'Pendente': <Clock className="h-4 w-4 text-amber-500" />,
  'Pedido recebido': <Clock className="h-4 w-4 text-amber-500" />,
  'Pago': <CheckCircle2 className="h-4 w-4 text-blue-500" />,
  'Enviado': <Truck className="h-4 w-4 text-purple-500" />,
  'Entregue': <CheckCircle2 className="h-4 w-4 text-green-500" />,
};

export function MyOrdersDialog({ open, onOpenChange }: MyOrdersDialogProps) {
  const db = useFirestore();
  const { user } = useUser();

  // Otimização: A consulta só é disparada se o diálogo estiver aberto
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

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[3rem] p-0 border-none shadow-2xl bg-background">
        <div className="bg-primary p-10 text-primary-foreground relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShoppingBag className="h-24 w-24" />
          </div>
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-2xl font-headline font-bold uppercase tracking-widest">
              Minha Galeria de Pedidos
            </DialogTitle>
            <DialogDescription className="text-secondary/60 font-light italic">
              Acompanhe suas conquistas na Toda Bela Boutique.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-10 min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-accent" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Sincronizando seu histórico...</p>
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order: any) => (
                <div key={order.id} className="p-6 rounded-[2.5rem] bg-white border border-primary/5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Pedido #{order.orderNumber || order.id.slice(-6).toUpperCase()}</span>
                        <div className="h-1 w-1 rounded-full bg-accent/30" />
                        <span className="text-[9px] text-muted-foreground italic">
                          {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('pt-BR') : 'Recentemente'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusIcons[order.status] || <Package className="h-4 w-4 text-accent" />}
                        <h4 className="text-lg font-bold text-primary leading-none">{order.status || 'Pendente'}</h4>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold uppercase text-accent tracking-widest mb-1">Total Seleção</p>
                      <span className="text-xl font-headline font-bold text-primary">
                        {formatCurrency(order.total || order.subtotal || 0)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="h-12 w-10 rounded-xl border-2 border-white overflow-hidden bg-secondary shadow-sm">
                        <img src={item.image} className="h-full w-full object-cover" alt={item.name} title={item.name} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center text-primary/20">
                <ShoppingBag className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h5 className="text-xl font-headline font-bold text-primary/40 uppercase tracking-widest">Nenhuma Peça Ainda</h5>
                <p className="text-xs text-muted-foreground max-w-xs font-light italic">Sua história na Toda Bela começa com a sua primeira escolha.</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}