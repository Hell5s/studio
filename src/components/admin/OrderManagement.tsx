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
  ShoppingBag,
  MapPin,
  Package,
  ExternalLink
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const statusColors: Record<string, string> = {
  'Pedido recebido': 'bg-[#F7E8EA] text-[#6E3C47] border-[#E9C9CF]',
  'Pago': 'bg-green-100 text-green-700 border-green-200',
  'Comprado na Shopee': 'bg-orange-100 text-orange-700 border-orange-200',
  'Enviado': 'bg-blue-100 text-blue-700 border-blue-200',
  'Entregue': 'bg-green-100 text-green-700 border-green-200',
  'Cancelado': 'bg-red-100 text-red-700 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
  'Pedido recebido': <Clock className="h-3 w-3" />,
  'Pago': <CheckCircle2 className="h-3 w-3" />,
  'Comprado na Shopee': <ShoppingBag className="h-3 w-3" />,
  'Enviado': <Truck className="h-3 w-3" />,
  'Entregue': <CheckCircle2 className="h-3 w-3" />,
  'Cancelado': <XCircle className="h-3 w-3" />,
};

export function OrderManagement() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const adminDocRef = useMemoFirebase(() => {
    return user?.uid ? doc(db, 'roles_admin', user.uid) : null;
  }, [db, user?.uid]);
  
  const { data: adminRole, isLoading: isAdminLoading } = useDoc(adminDocRef);
  const isActuallyAdmin = !!adminRole;

  const ordersQuery = useMemoFirebase(() => {
    if (!db || isAdminLoading || !isActuallyAdmin) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100));
  }, [db, isActuallyAdmin, isAdminLoading]);

  const { data: orders, isLoading: isOrdersLoading } = useCollection(ordersQuery);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    const s = searchTerm.toLowerCase().trim().replace('#', '');
    if (!s) return orders;

    return orders.filter(order => 
      order.id.toLowerCase().includes(s) ||
      order.customer?.name?.toLowerCase().includes(s) ||
      order.customer?.email?.toLowerCase().includes(s) ||
      order.customer?.phone?.toLowerCase().includes(s) ||
      order.status?.toLowerCase().includes(s) ||
      order.orderNumber?.toLowerCase().includes(s)
    );
  }, [orders, searchTerm]);

  const updateStatus = (orderId: string, newStatus: string) => {
    if (!isActuallyAdmin) return;
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
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  if (isAdminLoading) {
    return (
      <div className="py-20 text-center flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Autenticando...</p>
      </div>
    );
  }

  if (!isActuallyAdmin && !isAdminLoading) {
    return (
      <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-primary/5">
        <XCircle className="h-12 w-12 text-destructive/20 mx-auto mb-6" />
        <h4 className="text-xl font-headline font-bold text-primary mb-2">Acesso Restrito</h4>
        <p className="text-sm text-muted-foreground italic font-light max-w-xs mx-auto">
          Painel exclusivo para administradores da Toda Bela.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-accent/40 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Buscar por ID, Pedido ou Nome..." 
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
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pedido / Cliente</th>
                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Logística</th>
                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Peças</th>
                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</th>
                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {isOrdersLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-accent/40 mx-auto" />
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/10 transition-colors group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-primary font-mono text-xs">{order.orderNumber || `#${order.id.slice(-6).toUpperCase()}`}</span>
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">{order.customer?.name || 'Cliente'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-primary/60 uppercase">{order.shipping?.method || 'Padrão'}</span>
                        <span className="text-[9px] text-muted-foreground italic">{order.customer?.city}, {order.customer?.state}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex justify-center -space-x-3">
                        {order.items?.slice(0, 3).map((item: any, i: number) => (
                          <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white overflow-hidden bg-muted">
                            <img src={item.image} className="h-full w-full object-cover" alt={item.name} title={item.name} />
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
                      <Badge className={`rounded-full border px-3 py-1 flex items-center gap-2 w-fit font-bold uppercase text-[8px] tracking-widest ${statusColors[order.status || 'Pedido recebido']}`}>
                        {statusIcons[order.status || 'Pedido recebido']}
                        {order.status || 'Pedido recebido'}
                      </Badge>
                    </td>
                    <td className="px-10 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl p-2 border-primary/5 shadow-xl bg-white">
                          {Object.keys(statusColors).map((status) => (
                            <DropdownMenuItem 
                              key={status}
                              onClick={() => updateStatus(order.id, status)}
                              className="rounded-xl text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 cursor-pointer hover:bg-secondary"
                            >
                              Mover para {status}
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
                        <h5 className="text-xl font-headline font-bold text-primary/40 uppercase tracking-widest">Nenhum Pedido</h5>
                        <p className="text-xs text-muted-foreground max-w-xs font-light italic">Os pedidos aparecerão aqui em tempo real.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detalhes do Pedido */}
      <Dialog open={!!selectedOrder} onOpenChange={(o) => !o && setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-0 border-none shadow-2xl bg-[#FFF9F7]">
          {selectedOrder && (
            <>
              <div className="bg-primary p-10 text-primary-foreground flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                    <Package className="h-8 w-8 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Detalhes do Pedido</p>
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-headline font-bold text-white">{selectedOrder.orderNumber || 'Pedido Boutique'}</DialogTitle>
                    </DialogHeader>
                  </div>
                </div>
                <Badge className={cn("rounded-full px-6 py-2 uppercase tracking-widest text-[9px] font-bold", statusColors[selectedOrder.status])}>
                  {selectedOrder.status}
                </Badge>
              </div>

              <div className="p-10 grid md:grid-cols-[1fr_300px] gap-10">
                <div className="space-y-10">
                  {/* Cliente */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 text-accent">
                       <MapPin className="h-4 w-4" />
                       <h4 className="text-[11px] font-bold uppercase tracking-[0.3em]">Dados do Cliente e Envio</h4>
                    </div>
                    <div className="p-8 rounded-[2rem] bg-white shadow-sm border border-primary/5 space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-primary/30 tracking-widest">Nome Completo</p>
                          <p className="text-sm font-bold text-primary">{selectedOrder.customer?.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-primary/30 tracking-widest">WhatsApp</p>
                          <p className="text-sm font-bold text-primary">{selectedOrder.customer?.phone}</p>
                        </div>
                      </div>
                      <Separator className="bg-primary/5" />
                      <div>
                        <p className="text-[10px] font-bold uppercase text-primary/30 tracking-widest">Endereço de Entrega</p>
                        <p className="text-sm font-light italic text-primary/80">
                          {selectedOrder.customer?.address}, {selectedOrder.customer?.city} - {selectedOrder.customer?.state}<br />
                          CEP: {selectedOrder.customer?.zip}
                        </p>
                      </div>
                      <div className="pt-2">
                        <Badge variant="outline" className="rounded-full border-accent/20 text-accent text-[9px] px-3">
                          <Truck className="h-3 w-3 mr-2" /> {selectedOrder.shipping?.method}
                        </Badge>
                      </div>
                    </div>
                  </section>

                  {/* Itens */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 text-accent">
                       <ShoppingBag className="h-4 w-4" />
                       <h4 className="text-[11px] font-bold uppercase tracking-[0.3em]">Peças Selecionadas</h4>
                    </div>
                    <div className="space-y-4">
                      {selectedOrder.items?.map((item: any, i: number) => (
                        <div key={i} className="flex gap-6 items-center p-4 rounded-3xl bg-white shadow-sm border border-primary/5">
                           <img src={item.image} className="h-20 w-16 object-cover rounded-xl shadow-sm" alt={item.name} />
                           <div className="flex-1">
                              <p className="text-sm font-bold text-primary">{item.name}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{item.category}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-sm font-bold text-primary">{formatCurrency(item.price)}</p>
                              <p className="text-[9px] text-muted-foreground">Qtd: {item.quantity}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <div className="p-8 rounded-[2rem] bg-primary text-white space-y-6">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-accent">Resumo Financeiro</h5>
                    <div className="space-y-4">
                      <div className="flex justify-between text-xs">
                        <span className="opacity-60">Subtotal</span>
                        <span className="font-bold">{formatCurrency(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="opacity-60">Frete</span>
                        <span className="font-bold">{formatCurrency(selectedOrder.shipping?.price || 0)}</span>
                      </div>
                      <Separator className="bg-white/10" />
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold uppercase">Total</span>
                        <span className="text-2xl font-bold text-accent">{formatCurrency(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-[2rem] bg-secondary border border-primary/5 space-y-4">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 text-center">Ações Rápidas</p>
                     <Button 
                        variant="outline" 
                        className="w-full rounded-full h-12 text-[10px] font-bold uppercase border-primary/10"
                        onClick={() => window.open(`https://wa.me/${selectedOrder.customer?.phone?.replace(/\D/g, '')}`, '_blank')}
                     >
                        WhatsApp Cliente
                     </Button>
                     {selectedOrder.trackingCode === "Aguardando envio" && (
                        <Button 
                          className="w-full rounded-full h-12 text-[10px] font-bold uppercase bg-accent text-white"
                          onClick={() => updateStatus(selectedOrder.id, 'Pago')}
                        >
                          Confirmar Pagamento
                        </Button>
                     )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
