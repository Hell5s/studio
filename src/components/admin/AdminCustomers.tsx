
"use client";

import React from 'react';
import { Users, Mail, Phone, ShoppingBag, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

export function AdminCustomers() {
  const db = useFirestore();
  const q = useMemoFirebase(() => query(collection(db, 'orders')), [db]);
  const { data: orders } = useCollection(q);

  // Agrupar clientes por e-mail para estatísticas simples
  const customers = React.useMemo(() => {
    if (!orders) return [];
    const map = new Map();
    orders.forEach(o => {
      const email = o.customer?.email?.toLowerCase();
      if (!email) return;
      if (!map.has(email)) {
        map.set(email, { 
          name: o.customer.name, 
          email: email, 
          phone: o.customer.phone,
          ordersCount: 0,
          totalSpent: 0
        });
      }
      const c = map.get(email);
      c.ordersCount += 1;
      c.totalSpent += o.total || 0;
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  return (
    <div className="space-y-8">
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Pesquisar por nome ou e-mail..." className="pl-11 rounded-full border-none shadow-sm bg-white" />
      </div>

      <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
            <tr>
              <th className="px-8 py-5">Cliente</th>
              <th className="px-8 py-5">Contato</th>
              <th className="px-8 py-5 text-center">Pedidos</th>
              <th className="px-8 py-5 text-right">Total Gasto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.map((c, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">{c.name[0]}</div>
                    <span className="font-bold text-primary">{c.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><Mail className="h-3 w-3" /> {c.email}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="h-3 w-3" /> {c.phone}</div>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                   <Badge variant="outline" className="rounded-full border-primary/10 text-primary">{c.ordersCount} pedidos</Badge>
                </td>
                <td className="px-8 py-6 text-right font-bold text-primary">
                  R$ {c.totalSpent.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
