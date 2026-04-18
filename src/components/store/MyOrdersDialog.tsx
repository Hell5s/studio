
"use client";

import React from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ShoppingBag, Loader2, Package, Clock, CheckCircle2, Truck, XCircle, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const statusColors: Record<string, string> = {
  'Pendente': 'bg-amber-100 text-amber-700 border-amber-200',
  'Pago': 'bg-blue-100 text-blue-700 border-blue-200',
  'Enviado': 'bg-purple-100 text-purple-700 border-purple-200',
  'Entregue': 'bg-green-100 text-green-700 border-green-200',
  'Cancelado': 'bg-red-100 text-red-700 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
  'Pendente': <Clock className="h-3 w-3" />,
  'Pago': <CheckCircle2 className="h-3 w-3" />,
  'Enviado': <Truck className="h-3 w-3" />,
  'Entregue': <CheckCircle2 className="h-3 w-3" />,
  'Cancelado': <XCircle className="h-3 w-3" />,
};

interface MyOrdersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MyOrdersDialog({ open, onOpenChange }: MyOrdersDialogProps) {
  const db = useFirestore();
  const { user } = useUser();

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user?.email) return null;
    return query(
      collection(db, 'orders'),
      where('customerEmail', '==', user.email),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.email]);

  const { data: orders, isLoading } = useCollection(ordersQuery);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-0 border-none shadow-2xl bg-background">
        <div className="bg-primary p-10 text-primary-foreground relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShoppingBag className="h-24 w-24" />
          </div>
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-2xl font-headline font-bold uppercase tracking-widest">
              Meus Pedidos
            </DialogTitle>
            <DialogDescription className="text-secondary/60 font-light italic">
              Histórico das suas conquistas na Toda Bela.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-10 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-accent/40 mx-auto" />
              <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-primary/40">Buscando seu histórico...</p>
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="p-6 rounded-[2rem] bg-white border border-primary/5 hover:shadow-lg transition-all group"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">
                        Pedido #{order.id.slice(-6).toUpperCase()}
                      </p>
                      <h4 className="font-bold text-primary">
                        {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('pt-BR') : 'Recentemente'}
                      </h4>
                    </div>
                    
                    <Badge className={`rounded-full border px-4 py-1 flex items-center gap-2 font-bold uppercase text-[8px] tracking-widest ${statusColors[order.status || 'Pendente']}`}>
                      {statusIcons[order.status || 'Pendente']}
                      {order.status || 'Pendente'}
                    </Badge>
                  </div>

                  <Separator className="my-5 bg-primary/5" />

                  <div className="flex justify-between items-end">
                    <div className="flex -space-x-3 overflow-hidden">
                      {order.items?.slice(0, 4).map((item: any, i: number) => (
                        <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white overflow-hidden bg-muted">
                          <img src={item.image} className="h-full w-full object-cover" alt={item.name} />
                        </div>
                      ))}
                      {order.items?.length > 4 && (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-primary ring-2 ring-white">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Total do Pedido</p>
                      <p className="text-xl font-bold text-primary">{formatCurrency(order.total)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-6">
              <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center text-primary/20 mx-auto">
                <Package className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h5 className="text-xl font-headline font-bold text-primary/40 uppercase tracking-widest">Nenhum pedido ainda</h5>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto font-light italic">Parece que você ainda não realizou compras com este e-mail. Que tal começar agora?</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
