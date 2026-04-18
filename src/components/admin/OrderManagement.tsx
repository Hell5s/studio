
"use client";

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Loader2, 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle,
  MoreVertical,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
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
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const ordersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: orders, isLoading } = useCollection(ordersQuery);

  const filteredOrders = orders?.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-accent/40" />
          <Input 
            placeholder="Buscar por ID ou nome..." 
            className="pl-14 h-16 rounded-full border-none bg-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
              ) : filteredOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-secondary/10 transition-colors">
                  <td className="px-10 py-6">
                    <span className="font-bold text-primary font-mono text-xs">#{order.id.slice(-6).toUpperCase()}</span>
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
              ))}
            </tbody>
          </table>
          
          {(!filteredOrders || filteredOrders.length === 0) && !isLoading && (
            <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
              <div className="h-24 w-24 rounded-full bg-secondary/50 flex items-center justify-center text-primary/20">
                <ShoppingBag className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h5 className="text-xl font-headline font-bold text-primary/40 uppercase tracking-widest">Nenhum pedido ainda</h5>
                <p className="text-xs text-muted-foreground max-w-xs font-light italic">Os pedidos aparecerão aqui em tempo real assim que os clientes finalizarem o carrinho.</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

    