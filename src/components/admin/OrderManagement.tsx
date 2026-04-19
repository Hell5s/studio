
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
  ExternalLink,
  Copy,
  ExternalLink as LinkIcon,
  Tag
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
  'pending': 'bg-amber-50 text-amber-700 border-amber-100',
  'paid': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'ordered': 'bg-blue-50 text-blue-700 border-blue-100',
  'shipped': 'bg-purple-50 text-purple-700 border-purple-100',
  'delivered': 'bg-green-50 text-green-700 border-green-100',
  'canceled': 'bg-red-50 text-red-700 border-red-100',
};

const statusLabels: Record<string, string> = {
  'pending': 'Pendente',
  'paid': 'Pago',
  'ordered': 'Comprado no Fornecedor',
  'shipped': 'Enviado',
  'delivered': 'Entregue',
  'canceled': 'Cancelado',
};

export function OrderManagement() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const ordersQuery = useMemoFirebase(() => query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100)), [db]);
  const { data: orders, isLoading } = useCollection(ordersQuery);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    const s = searchTerm.toLowerCase().trim();
    if (!s) return orders;
    return orders.filter(o => o.orderNumber?.toLowerCase().includes(s) || o.customer?.name?.toLowerCase().includes(s));
  }, [orders, searchTerm]);

  const updateStatus = (orderId: string, newStatus: string) => {
    updateDocumentNonBlocking(doc(db, 'orders', orderId), { 
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
    toast({ title: "Status Atualizado", description: `Movido para ${statusLabels[newStatus]}` });
  };

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: msg });
  };

  return (
    <div className="space-y-8">
      <div className="relative w-full md:w-96 group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por Pedido ou Cliente..." 
          className="pl-12 h-12 rounded-full border-none bg-white shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="rounded-[1.5rem] border-none bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
              <tr>
                <th className="px-8 py-5">Pedido / Data</th>
                <th className="px-8 py-5">Cliente / Local</th>
                <th className="px-8 py-5 text-center">Itens</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Total</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={6} className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin text-accent mx-auto" /></td></tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={() => setSelectedOrder(order)}>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-primary">#{order.orderNumber}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{new Date(order.createdAt?.toDate ? order.createdAt.toDate() : order.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{order.customer?.name}</span>
                      <span className="text-[10px] text-muted-foreground">{order.customer?.city}, {order.customer?.state}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex justify-center -space-x-2">
                       {order.items?.slice(0, 3).map((it: any, idx: number) => (
                         <div key={idx} className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden"><img src={it.image} className="h-full w-full object-cover" /></div>
                       ))}
                       {order.items?.length > 3 && <div className="h-8 w-8 rounded-full bg-secondary text-[10px] font-bold flex items-center justify-center border-2 border-white">+{order.items.length - 3}</div>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge className={`rounded-full px-3 py-1 border text-[9px] uppercase tracking-widest font-bold ${statusColors[order.status || 'pending']}`}>
                      {statusLabels[order.status || 'pending']}
                    </Badge>
                  </td>
                  <td className="px-8 py-6 text-right font-bold text-primary">R$ {order.total?.toFixed(2)}</td>
                  <td className="px-8 py-6 text-right" onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl p-2 border-none shadow-xl bg-white">
                        {Object.keys(statusLabels).map(s => (
                          <DropdownMenuItem key={s} onClick={() => updateStatus(order.id, s)} className="text-[11px] font-bold uppercase tracking-tight py-2 rounded-lg cursor-pointer hover:bg-secondary">Mover para {statusLabels[s]}</DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detalhes do Pedido - FOCO EM DROPSHIPPING */}
      <Dialog open={!!selectedOrder} onOpenChange={o => !o && setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-none shadow-2xl bg-[#F4F6F8]">
          {selectedOrder && (
            <>
              <div className="bg-[#2A1F22] p-8 text-white flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-primary"><ShoppingBag className="h-5 w-5" /></div>
                  <h3 className="text-xl font-bold">Pedido #{selectedOrder.orderNumber}</h3>
                </div>
                <Badge className={`rounded-full px-5 py-2 uppercase font-bold text-[10px] ${statusColors[selectedOrder.status]}`}>{statusLabels[selectedOrder.status]}</Badge>
              </div>

              <div className="p-10 grid lg:grid-cols-[1fr_320px] gap-10">
                <div className="space-y-10">
                  {/* Dados de Dropshipping - CRÍTICO */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 text-accent border-b border-gray-200 pb-3">
                       <Tag className="h-5 w-5" />
                       <h4 className="text-[11px] font-bold uppercase tracking-widest">Itens e Fornecedores</h4>
                    </div>
                    <div className="space-y-4">
                      {selectedOrder.items?.map((item: any, i: number) => (
                        <Card key={i} className="p-6 border-none shadow-sm bg-white space-y-6">
                           <div className="flex gap-6 items-center">
                             <img src={item.image} className="h-20 w-16 object-cover rounded-xl" />
                             <div className="flex-1">
                               <h5 className="font-bold text-primary">{item.name}</h5>
                               <p className="text-[10px] uppercase font-bold text-muted-foreground">{item.selectedSize} / {item.selectedColor}</p>
                             </div>
                             <div className="text-right"><p className="font-bold text-primary">R$ {item.price?.toFixed(2)}</p><p className="text-[10px] text-muted-foreground">Qtd: {item.quantity}</p></div>
                           </div>
                           
                           {/* Bloco do Fornecedor */}
                           <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                              <div className="space-y-1">
                                 <p className="text-[10px] font-bold uppercase text-accent tracking-widest">Fornecedor: {item.supplierName || 'Manual'}</p>
                                 <p className="text-xs text-muted-foreground italic">Custo estimado: R$ {item.supplierCost || '0.00'}</p>
                              </div>
                              <div className="flex gap-2">
                                 {item.supplierUrl && (
                                   <Button size="sm" onClick={() => window.open(item.supplierUrl, '_blank')} className="h-8 bg-primary text-white text-[9px] uppercase font-bold rounded-lg px-4">
                                     <LinkIcon className="h-3 w-3 mr-2" /> Abrir Site
                                   </Button>
                                 )}
                                 <Button variant="outline" size="sm" onClick={() => copyToClipboard(item.supplierUrl, "Link copiado!")} className="h-8 text-[9px] font-bold uppercase rounded-lg border-gray-200"><Copy className="h-3 w-3" /></Button>
                              </div>
                           </div>
                        </Card>
                      ))}
                    </div>
                  </section>

                  {/* Endereço de Envio */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 text-primary border-b border-gray-200 pb-3">
                       <MapPin className="h-5 w-5" />
                       <h4 className="text-[11px] font-bold uppercase tracking-widest">Endereço do Cliente</h4>
                    </div>
                    <Card className="p-8 border-none shadow-sm bg-white space-y-4">
                       <div className="flex justify-between items-start">
                          <div>
                            <p className="text-lg font-bold text-primary">{selectedOrder.customer?.name}</p>
                            <p className="text-sm text-muted-foreground">{selectedOrder.customer?.email}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`${selectedOrder.customer?.name}\n${selectedOrder.customer?.address}\n${selectedOrder.customer?.city}-${selectedOrder.customer?.state}\nCEP: ${selectedOrder.customer?.zip}`, "Endereço Copiado!")} className="text-accent text-[9px] font-bold uppercase">Copiar Dados</Button>
                       </div>
                       <Separator className="bg-gray-50" />
                       <p className="text-sm italic text-primary/80 leading-relaxed font-light">
                         {selectedOrder.customer?.address}, {selectedOrder.customer?.city} - {selectedOrder.customer?.state}<br />
                         CEP: {selectedOrder.customer?.zip}
                       </p>
                    </Card>
                  </section>
                </div>

                <div className="space-y-6">
                   <Card className="p-8 rounded-[2rem] bg-[#2A1F22] text-white space-y-6 shadow-xl border-none">
                      <h5 className="text-[10px] font-bold uppercase tracking-widest text-accent">Resumo Financeiro</h5>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm opacity-60"><span>Subtotal</span><span>R$ {selectedOrder.subtotal?.toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm opacity-60"><span>Frete</span><span>R$ {selectedOrder.shipping?.price?.toFixed(2) || '0.00'}</span></div>
                        <Separator className="bg-white/10" />
                        <div className="flex justify-between items-end"><span className="text-xs uppercase font-bold">Total</span><span className="text-2xl font-bold text-accent">R$ {selectedOrder.total?.toFixed(2)}</span></div>
                      </div>
                   </Card>

                   <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Observações Internas</Label>
                      <Textarea value={selectedOrder.internalNotes} onChange={e => updateDocumentNonBlocking(doc(db, 'orders', selectedOrder.id), { internalNotes: e.target.value })} placeholder="Ex: Cliente solicitou embrulho especial." className="bg-white border-none shadow-sm min-h-[120px] rounded-2xl p-4" />
                   </div>

                   <Button className="w-full py-6 bg-accent text-primary font-bold uppercase tracking-widest text-[10px] rounded-2xl shadow-lg" onClick={() => updateStatus(selectedOrder.id, 'ordered')}>
                      Marcar como Comprado
                   </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
