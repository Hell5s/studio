"use client";

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle,
  MoreVertical,
  X,
  ShoppingBag
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, limit } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';

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

export function OrderManagement() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Verificação extra de segurança para a consulta
  const adminDocRef = useMemoFirebase(() => {
    return user ? doc(db, 'roles_admin', user.uid) : null;
  }, [db, user]);
  const { data: adminRole } = useDoc(adminDocRef);
  const isActuallyAdmin = !!adminRole;

  const ordersQuery = useMemoFirebase(() => {
    // SÓ DISPARA A CONSULTA SE FOR ADMIN CONFIRMADO
    if (!db || !isActuallyAdmin) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100));
  }, [db, isActuallyAdmin]);

  const { data: orders, isLoading } = useCollection(ordersQuery);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    const s = searchTerm.toLowerCase().trim().replace('#', '');
    if (!s) return orders;

    return orders.filter(order => 
      order.id.toLowerCase().includes(s) ||
      order.customerName?.toLowerCase().includes(s) ||
      order.customerEmail?.toLowerCase().includes(s) ||
      order.customerPhone?.toLowerCase().includes(s) ||
      order.status?.toLowerCase().includes(s)
    );
  }, [orders, searchTerm]);

  const updateStatus = (orderId: string, newStatus: string) => {
    const orderRef = doc(db, 'orders', orderId);
    updateDocumentNonBlocking(orderRef, { 
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
    toast({
      title: "Status Atualizado",
      description: `O pedido foi marcado como ${newStatus}.`,
    });
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (!isActuallyAdmin && !isLoading) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground italic">Acesso restrito ao painel administrativo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-accent/40 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Buscar por ID ou nome..." 
            className="pl-14 pr-12 h-16 rounded-full border-none bg-white shadow-sm focus:ring-2 focus:ring-primary/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-accent/40 hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <Card className="rounded-[3rem] border-none bg-white shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/20 border-b border-primary/5">
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ID do Pedido</th>
                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data</th>
                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Itens</th>
                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</th>
                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-accent/40 mx-auto" />
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-primary font-mono text-xs">#{order.id.slice(-6).toUpperCase()}</span>
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">{order.customerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-[11px] text-muted-foreground">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('pt-BR') : 'Agora mesmo'}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex -space-x-3 overflow-hidden">
                        {order.items?.slice(0, 3).map((item: any, i: number) => (
                          <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white overflow-hidden bg-muted">
                            <img src={item.image} className="h-full w-full object-cover" alt={item.name} />
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-primary ring-2 ring-white">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 font-bold text-primary">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-6">
                      <Badge className={`rounded-full border px-3 py-1 flex items-center gap-2 w-fit font-bold uppercase text-[8px] tracking-widest ${statusColors[order.status || 'Pendente']}`}>
                        {statusIcons[order.status || 'Pendente']}
                        {order.status || 'Pendente'}
                      </Badge>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl p-2 border-primary/5 shadow-xl">
                          {Object.keys(statusColors).map((status) => (
                            <DropdownMenuItem 
                              key={status}
                              onClick={() => updateStatus(order.id, status)}
                              className="rounded-xl text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 cursor-pointer hover:bg-secondary"
                            >
                              Mudar para {status}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
                      <div className="h-24 w-24 rounded-full bg-secondary/50 flex items-center justify-center text-primary/20">
                        <ShoppingBag className="h-12 w-12" />
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-xl font-headline font-bold text-primary/40 uppercase tracking-widest">Nenhum pedido encontrado</h5>
                        <p className="text-xs text-muted-foreground max-w-xs font-light italic">Tente buscar por um ID diferente ou pelo nome da cliente.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}