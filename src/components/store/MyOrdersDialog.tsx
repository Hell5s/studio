
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
import { ShoppingBag, Loader2 } from 'lucide-react';

interface MyOrdersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MyOrdersDialog({ open, onOpenChange }: MyOrdersDialogProps) {
  const db = useFirestore();
  const { user } = useUser();

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
  }, [db, user?.uid]);

  const { data: orders, isLoading } = useCollection(ordersQuery);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[3rem] p-0 border-none shadow-2xl overflow-hidden bg-background">
        <div className="bg-primary p-10 text-primary-foreground relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShoppingBag className="h-24 w-24" />
          </div>
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-2xl font-headline font-bold uppercase tracking-widest">
              Minhas Conquistas
            </DialogTitle>
            <DialogDescription className="text-secondary/60 font-light italic">
              Histórico das suas peças selecionadas na Toda Bela.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-10 min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-accent" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Buscando seu histórico...</p>
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="p-6 rounded-[2rem] bg-white border border-primary/5 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">#{order.orderNumber}</p>
                      <h4 className="text-lg font-bold text-primary">{order.status}</h4>
                    </div>
                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                    </span>
                  </div>
                  <div className="flex -space-x-2">
                    {order.items?.slice(0, 3).map((item: any, i: number) => (
                      <div key={i} className="h-10 w-10 rounded-full border-2 border-white overflow-hidden bg-secondary">
                        <img src={item.image} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center text-primary/20">
                <ShoppingBag className="h-10 w-10" />
              </div>
              <p className="text-sm text-muted-foreground italic font-light">Sua galeria de conquistas ainda está vazia.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
