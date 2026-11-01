"use client";

import React, { useState, useMemo } from 'react';
import {
  Search,
  Loader2,
  CheckCircle2,
  Truck,
  MoreVertical,
  ShoppingBag,
  MapPin,
  Copy,
  ExternalLink as LinkIcon,
  Tag,
  Trash2,
  AlertCircle,
  AlertTriangle,
  History,
  Undo2,
  PackageCheck,
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, limit, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, getItemImageUrl } from '@/lib/utils';
import { PRIVATE_PRODUCTS_COLLECTION } from '@/lib/product-private';
import { toNumber } from '@/lib/pricing';
import {
  deriveOrderStatus,
  itemStage,
  nextItemStage,
  stageIndex,
  toDate,
  trackingUrl,
  type ItemStage,
} from '@/lib/fulfillment';

// Dados da compra no fornecedor (nº do pedido, valor pago) e histórico ficam em
// ordersPrivate/{orderId}, porque o pedido em "orders" é lido pela cliente.
const PRIVATE_ORDERS_COLLECTION = 'ordersPrivate';

const statusColors: Record<string, string> = {
  'pending': 'bg-amber-50 text-amber-700 border-amber-100',
  'paid': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'ordered': 'bg-blue-50 text-blue-700 border-blue-100',
  'shipped': 'bg-purple-50 text-purple-700 border-purple-100',
  'delivered': 'bg-green-50 text-green-700 border-green-100',
  'canceled': 'bg-red-50 text-red-700 border-red-100',
  'refunded': 'bg-gray-100 text-gray-600 border-gray-200',
};

const statusLabels: Record<string, string> = {
  'pending': 'Pendente',
  'paid': 'Pago',
  'ordered': 'Comprado no Fornecedor',
  'shipped': 'Enviado',
  'delivered': 'Entregue',
  'canceled': 'Cancelado',
  'refunded': 'Reembolsado',
};

const itemStatusLabels: Record<ItemStage, string> = {
  'aguardando': 'Comprar no fornecedor',
  'comprado': 'Comprado — aguardando envio',
  'transito': 'Em trânsito',
  'entregue': 'Entregue',
};

const itemStatusColors: Record<ItemStage, string> = {
  'aguardando': 'bg-amber-50 text-amber-700 border-amber-100',
  'comprado': 'bg-blue-50 text-blue-700 border-blue-100',
  'transito': 'bg-purple-50 text-purple-700 border-purple-100',
  'entregue': 'bg-green-50 text-green-700 border-green-100',
};

// Abas como lista de tarefas: cada uma mostra o que precisa da sua ação.
const tabs = [
  { value: 'all', label: 'Todos' },
  { value: 'paid', label: 'Comprar no fornecedor', task: true },
  { value: 'ordered', label: 'Aguardando rastreio', task: true },
  { value: 'shipped', label: 'Em trânsito', task: true },
  { value: 'delivered', label: 'Entregue' },
  { value: 'pending', label: 'Aguardando pagamento' },
  { value: 'canceled', label: 'Cancelado' },
];

const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
const formatDateTime = (v: any) => toDate(v)?.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) || '';
const hasAmountMismatch = (order: any) => order.paymentStatus === 'amount_mismatch' || !!order.paymentAmountMismatch;

export function OrderManagement() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);
  const [statusChange, setStatusChange] = useState<{ order: any; status: string } | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const ordersQuery = useMemoFirebase(() => query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(300)), [db]);
  const { data: orders, isLoading } = useCollection(ordersQuery);

  const privateOrdersQuery = useMemoFirebase(() => collection(db, PRIVATE_ORDERS_COLLECTION), [db]);
  const { data: privateOrders } = useCollection(privateOrdersQuery);
  const privateOrderById = useMemo(
    () => new Map((privateOrders || []).map((p: any) => [p.id, p])),
    [privateOrders]
  );

  // Fornecedor e custo de cada produto (ficam em productsPrivate, só o admin lê).
  const privateProductsQuery = useMemoFirebase(() => collection(db, PRIVATE_PRODUCTS_COLLECTION), [db]);
  const { data: privateProducts } = useCollection(privateProductsQuery);
  const privateById = useMemo(
    () => new Map((privateProducts || []).map((p: any) => [p.id, p])),
    [privateProducts]
  );
  const supplierInfo = (item: any) => {
    const priv: any = privateById.get(item.productId || item.id) || {};
    return {
      name: item.supplierName || priv.supplierName || priv.vendorName,
      url: item.supplierUrl || priv.supplierUrl || priv.sourceUrl,
      cost: toNumber(item.supplierCost || priv.cost),
    };
  };

  // O pedido aberto vem sempre da lista em tempo real, para refletir cada mudança.
  const selectedOrder = useMemo(
    () => orders?.find(o => o.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );
  const selectedPrivate: any = selectedOrder ? privateOrderById.get(selectedOrder.id) || {} : {};

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    orders?.forEach(o => { c[o.status || 'pending'] = (c[o.status || 'pending'] || 0) + 1; });
    return c;
  }, [orders]);

  const mismatchCount = useMemo(() => orders?.filter(hasAmountMismatch).length || 0, [orders]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let result = [...orders];

    if (activeTab !== 'all') {
      result = result.filter(o => (o.status || 'pending') === activeTab);
    }

    // Abas de tarefa: mais antigo primeiro (quem esperou mais vem antes).
    if (tabs.find(t => t.value === activeTab)?.task) {
      result.sort((a, b) => (toDate(a.createdAt)?.getTime() || 0) - (toDate(b.createdAt)?.getTime() || 0));
    }

    const s = searchTerm.toLowerCase().trim();
    if (s) {
      result = result.filter(o =>
        o.orderNumber?.toLowerCase().includes(s) ||
        o.customer?.name?.toLowerCase().includes(s)
      );
    }

    return result;
  }, [orders, searchTerm, activeTab]);

  const addHistory = (orderId: string, text: string, extra: Record<string, any> = {}) =>
    setDoc(doc(db, PRIVATE_ORDERS_COLLECTION, orderId), {
      ...extra,
      history: arrayUnion({ at: new Date().toISOString(), text }),
    }, { merge: true });

  const confirmStatusChange = async () => {
    if (!statusChange) return;
    const { order, status } = statusChange;
    setStatusChange(null);
    try {
      await updateDoc(doc(db, 'orders', order.id), { status, updatedAt: new Date() });
      await addHistory(order.id, `Status alterado manualmente para "${statusLabels[status]}"`);
      toast({ title: "Status atualizado", description: `Pedido #${order.orderNumber}: ${statusLabels[status]}` });
    } catch (e) {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    }
  };

  // Avança (ou volta) uma peça de etapa. O status do pedido acompanha sozinho e,
  // ao virar "Enviado", a função do Firebase manda o e-mail de rastreio.
  const updateItem = async (
    order: any,
    index: number,
    changes: Record<string, any>,
    historyText: string,
    privateItem?: Record<string, any>
  ) => {
    const items = [...(order.items || [])];
    items[index] = { ...items[index], ...changes };
    const newStatus = deriveOrderStatus(order.status, items);
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        items,
        ...(newStatus && newStatus !== order.status ? { status: newStatus } : {}),
        updatedAt: new Date(),
      });
      const statusNote = newStatus && newStatus !== order.status ? ` · pedido agora "${statusLabels[newStatus]}"` : '';
      await addHistory(order.id, historyText + statusNote,
        privateItem ? { items: { [index]: privateItem } } : {});
      toast({ title: "Pedido atualizado", description: historyText + statusNote });
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  };

  const handleDeleteOrder = () => {
    if (!orderToDelete) return;

    try {
      deleteDocumentNonBlocking(doc(db, 'orders', orderToDelete.id));
      toast({
        title: "Pedido excluído",
        description: `O pedido #${orderToDelete.orderNumber} foi removido com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível remover o pedido no momento.",
        variant: "destructive",
      });
    } finally {
      setOrderToDelete(null);
    }
  };

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: msg });
  };

  // Lucro: usa o valor pago ao fornecedor quando registrado, senão o custo do cadastro.
  const finance = useMemo(() => {
    if (!selectedOrder) return null;
    let cost = 0;
    let allReal = true;
    (selectedOrder.items || []).forEach((item: any, i: number) => {
      const paid = selectedPrivate.items?.[i]?.supplierPaid;
      if (paid !== undefined && paid !== null && paid !== '') cost += toNumber(paid);
      else { allReal = false; cost += supplierInfo(item).cost * (item.quantity || 1); }
    });
    const total = toNumber(selectedOrder.total);
    return { cost, profit: total - cost, allReal };
  }, [selectedOrder, selectedPrivate, privateById]);

  const history: any[] = useMemo(
    () => [...(selectedPrivate.history || [])].sort((a, b) => String(b.at).localeCompare(String(a.at))),
    [selectedPrivate]
  );

  return (
    <div className="space-y-8">
      {mismatchCount > 0 && (
        <div className="flex items-start gap-3 p-5 rounded-2xl bg-red-50 border border-red-200 text-red-800">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">{mismatchCount} pedido(s) com pagamento de valor diferente do pedido.</p>
            <p className="text-xs opacity-80">Eles não foram marcados como pagos. Confira no Mercado Pago antes de comprar ou enviar.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por Pedido ou Cliente..."
            className="pl-12 h-12 rounded-full border-none bg-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full xl:w-auto">
          <TabsList className="bg-white border border-primary/5 rounded-full p-1 h-auto flex flex-wrap justify-start gap-1">
            {tabs.map(t => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className={cn(
                  "rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                  t.task
                    ? "data-[state=active]:bg-accent data-[state=active]:text-primary"
                    : "data-[state=active]:bg-primary data-[state=active]:text-white"
                )}
              >
                {t.label}
                {t.value !== 'all' && (counts[t.value] || 0) > 0 && (
                  <span className={cn("rounded-full px-1.5 min-w-[18px] text-[9px]", t.task ? "bg-primary text-white" : "bg-secondary")}>
                    {counts[t.value]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
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
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const items: any[] = order.items || [];
                  const done = items.filter(it => itemStage(it) !== 'aguardando').length;
                  return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={() => setSelectedOrderId(order.id)}>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">#{order.orderNumber}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{toDate(order.createdAt)?.toLocaleDateString('pt-BR')}</span>
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
                         {items.slice(0, 3).map((it: any, idx: number) => {
                           const itImg = getItemImageUrl(it.image);
                           return (
                             <div key={idx} className="w-8 aspect-[3/5] rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm relative">
                               {itImg ? <img src={itImg} className="h-full w-full object-cover" alt="item" /> : <div className="h-full w-full bg-secondary/20" />}
                             </div>
                           );
                         })}
                         {items.length > 3 && <div className="h-8 w-8 rounded-full bg-secondary text-[10px] font-bold flex items-center justify-center border-2 border-white">+{items.length - 3}</div>}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge className={`rounded-full px-3 py-1 border text-[9px] uppercase tracking-widest font-bold ${statusColors[order.status || 'pending']}`}>
                          {statusLabels[order.status || 'pending'] || order.status}
                        </Badge>
                        {hasAmountMismatch(order) && (
                          <span className="flex items-center gap-1 text-[9px] font-bold uppercase text-red-600"><AlertTriangle className="h-3 w-3" /> Valor pago divergente</span>
                        )}
                        {order.status === 'paid' && items.length > 1 && done > 0 && (
                          <span className="text-[9px] text-muted-foreground">{done} de {items.length} peças compradas</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right font-bold text-primary">{formatBRL(toNumber(order.total))}</td>
                    <td className="px-8 py-6 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-8 w-8 text-red-300 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setOrderToDelete(order)}
                          title="Excluir Pedido"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-full h-8 w-8" title="Alterar status manualmente"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl p-2 border-none shadow-xl bg-white">
                            <p className="px-2 pb-2 text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Alterar status manualmente</p>
                            {Object.keys(statusLabels).filter(s => s !== order.status).map(s => (
                              <DropdownMenuItem key={s} onClick={() => setStatusChange({ order, status: s })} className="text-[11px] font-bold uppercase tracking-tight py-2 rounded-lg cursor-pointer hover:bg-secondary">Mover para {statusLabels[s]}</DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-3">
                      {tabs.find(t => t.value === activeTab)?.task ? (
                        <>
                          <CheckCircle2 className="h-10 w-10 text-emerald-500/20" />
                          <p className="text-sm text-muted-foreground italic font-light">Nenhuma tarefa aqui no momento.</p>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-10 w-10 text-primary/10" />
                          <p className="text-sm text-muted-foreground italic font-light">Nenhum pedido encontrado.</p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={o => !o && setSelectedOrderId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-none shadow-2xl bg-[#F4F6F8]">
          {selectedOrder && (
            <>
              <div className="sr-only">
                <DialogTitle>Pedido #{selectedOrder.orderNumber}</DialogTitle>
                <DialogDescription>Detalhes completos do pedido, itens selecionados e endereço de entrega.</DialogDescription>
              </div>

              <div className="bg-[#2A1F22] p-8 text-white flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-primary"><ShoppingBag className="h-5 w-5" /></div>
                  <div>
                    <h3 className="text-xl font-bold">Pedido #{selectedOrder.orderNumber}</h3>
                    <p className="text-[10px] uppercase tracking-widest opacity-50">{toDate(selectedOrder.createdAt)?.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                <Badge className={`rounded-full px-5 py-2 uppercase font-bold text-[10px] ${statusColors[selectedOrder.status]}`}>{statusLabels[selectedOrder.status] || selectedOrder.status}</Badge>
              </div>

              {hasAmountMismatch(selectedOrder) && (
                <div className="mx-10 mt-8 flex items-start gap-3 p-5 rounded-2xl bg-red-50 border border-red-200 text-red-800">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold">Pagamento com valor diferente do pedido</p>
                    {selectedOrder.paymentAmountMismatch && (
                      <p className="text-xs">Pago: {formatBRL(selectedOrder.paymentAmountMismatch.paid)} · Valor do pedido: {formatBRL(selectedOrder.paymentAmountMismatch.expected)}</p>
                    )}
                    <p className="text-xs opacity-80">Não compre nem envie antes de conferir no Mercado Pago (pagamento {selectedOrder.paymentId}).</p>
                  </div>
                </div>
              )}

              <div className="p-10 grid lg:grid-cols-[1fr_320px] gap-10">
                <div className="space-y-10">
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 text-accent border-b border-gray-200 pb-3">
                       <Tag className="h-5 w-5" />
                       <h4 className="text-[11px] font-bold uppercase tracking-widest">Itens e Fornecedores</h4>
                    </div>
                    <div className="space-y-4">
                      {selectedOrder.items?.map((item: any, i: number) => {
                        const itemImg = getItemImageUrl(item.image);
                        const supplier = supplierInfo(item);
                        return (
                          <Card key={i} className="p-6 border-none shadow-sm bg-white space-y-5">
                             <div className="flex gap-6 items-center">
                               <div className="w-16 aspect-[3/5] relative shrink-0">
                                 {itemImg ? (
                                   <img src={itemImg} className="h-full w-full object-cover rounded-xl" alt={item.name} />
                                 ) : (
                                   <div className="h-full w-full rounded-xl bg-secondary/20" />
                                 )}
                               </div>
                               <div className="flex-1 space-y-1">
                                 <h5 className="font-bold text-primary">{item.name}</h5>
                                 <p className="text-[10px] uppercase font-bold text-muted-foreground">{item.selectedSize} / {item.selectedColor}</p>
                                 <Badge className={cn("rounded-full px-3 py-0.5 border text-[9px] uppercase tracking-widest font-bold", itemStatusColors[itemStage(item)])}>
                                   {itemStatusLabels[itemStage(item)]}
                                 </Badge>
                               </div>
                               <div className="text-right"><p className="font-bold text-primary">{formatBRL(toNumber(item.price))}</p><p className="text-[10px] text-muted-foreground">Qtd: {item.quantity}</p></div>
                             </div>

                             <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                   <p className="text-[10px] font-bold uppercase text-accent tracking-widest">Fornecedor: {supplier.name || 'Manual'}</p>
                                   <p className="text-xs text-muted-foreground italic">Custo do cadastro: {formatBRL(supplier.cost * (item.quantity || 1))}</p>
                                </div>
                                <div className="flex gap-2">
                                   {supplier.url && (
                                     <>
                                       <Button size="sm" onClick={() => window.open(supplier.url, '_blank')} className="h-8 bg-primary text-white text-[9px] uppercase font-bold rounded-lg px-4">
                                         <LinkIcon className="h-3 w-3 mr-2" /> Abrir Site
                                       </Button>
                                       <Button variant="outline" size="sm" onClick={() => copyToClipboard(supplier.url, "Link copiado!")} className="h-8 text-[9px] font-bold uppercase rounded-lg border-gray-200"><Copy className="h-3 w-3" /></Button>
                                     </>
                                   )}
                                </div>
                             </div>

                             <ItemFulfillment
                               order={selectedOrder}
                               item={item}
                               index={i}
                               privateItem={selectedPrivate.items?.[i]}
                               suggestedCost={supplier.cost * (item.quantity || 1)}
                               blocked={selectedOrder.status === 'pending' || selectedOrder.status === 'canceled' || selectedOrder.status === 'refunded'}
                               onUpdate={updateItem}
                             />
                          </Card>
                        );
                      })}
                    </div>
                  </section>

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
                            <p className="text-sm text-muted-foreground">{selectedOrder.customer?.phone}</p>
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
                        <div className="flex justify-between text-sm opacity-60"><span>Subtotal</span><span>{formatBRL(toNumber(selectedOrder.subtotal))}</span></div>
                        {toNumber(selectedOrder.couponDiscount) > 0 && (
                          <div className="flex justify-between text-sm opacity-60"><span>Cupom {selectedOrder.couponCode}</span><span>- {formatBRL(toNumber(selectedOrder.couponDiscount))}</span></div>
                        )}
                        <div className="flex justify-between text-sm opacity-60"><span>Frete ({selectedOrder.shipping?.method || '—'})</span><span>{formatBRL(toNumber(selectedOrder.shipping?.price))}</span></div>
                        <Separator className="bg-white/10" />
                        <div className="flex justify-between items-end"><span className="text-xs uppercase font-bold">Total</span><span className="text-2xl font-bold text-accent">{formatBRL(toNumber(selectedOrder.total))}</span></div>
                        {finance && (
                          <>
                            <Separator className="bg-white/10" />
                            <div className="flex justify-between text-sm opacity-60"><span>{finance.allReal ? 'Pago ao fornecedor' : 'Custo (estimado)'}</span><span>- {formatBRL(finance.cost)}</span></div>
                            <div className="flex justify-between items-end">
                              <span className="text-xs uppercase font-bold">{finance.allReal ? 'Lucro' : 'Lucro estimado'}</span>
                              <span className={cn("text-lg font-bold", finance.profit >= 0 ? "text-emerald-300" : "text-red-300")}>{formatBRL(finance.profit)}</span>
                            </div>
                          </>
                        )}
                      </div>
                   </Card>

                   <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Observações Internas</Label>
                      <Textarea defaultValue={selectedPrivate.internalNotes ?? selectedOrder.internalNotes} onBlur={e => updateDocumentNonBlocking(doc(db, PRIVATE_ORDERS_COLLECTION, selectedOrder.id), { internalNotes: e.target.value })} placeholder="Ex: Cliente solicitou embrulho especial." className="bg-white border-none shadow-sm min-h-[120px] rounded-2xl p-4" />
                   </div>

                   <div className="space-y-3">
                      <div className="flex items-center gap-2 ml-1 text-primary">
                        <History className="h-4 w-4" />
                        <Label className="text-[10px] font-bold uppercase tracking-widest">Histórico</Label>
                      </div>
                      <Card className="p-5 border-none shadow-sm bg-white space-y-3">
                        {history.length === 0 && (
                          <p className="text-xs text-muted-foreground italic">Nenhuma etapa registrada ainda.</p>
                        )}
                        {history.map((h, idx) => (
                          <div key={idx} className="text-xs border-l-2 border-accent/40 pl-3">
                            <p className="text-[10px] font-bold text-muted-foreground">{formatDateTime(h.at)}</p>
                            <p className="text-primary/80">{h.text}</p>
                          </div>
                        ))}
                      </Card>
                   </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!statusChange} onOpenChange={(o) => !o && setStatusChange(null)}>
        <AlertDialogContent className="rounded-[2rem] bg-white border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-headline font-bold text-primary">Alterar status manualmente</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-light">
              Mover o pedido <span className="font-bold text-primary">#{statusChange?.order.orderNumber}</span> de "{statusLabels[statusChange?.order.status] || statusChange?.order.status}" para <span className="font-bold text-primary">"{statusChange && statusLabels[statusChange.status]}"</span>?
              {statusChange?.status === 'paid' && statusChange.order.status === 'pending' && (
                <span className="block mt-3 text-red-600 font-medium">Atenção: só marque como pago se você confirmou o pagamento no Mercado Pago.</span>
              )}
              {statusChange?.status === 'shipped' && (
                <span className="block mt-3">A cliente recebe o e-mail de rastreio se as peças tiverem código.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="rounded-full h-12 px-8 border-primary/10 text-primary font-bold uppercase text-[10px] tracking-widest">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange} className="rounded-full h-12 px-8 bg-primary text-white font-bold uppercase text-[10px] tracking-widest">Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!orderToDelete} onOpenChange={(o) => !o && setOrderToDelete(null)}>
        <AlertDialogContent className="rounded-[2rem] bg-white border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-headline font-bold text-primary">
              Excluir Pedido
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground italic font-light">
              Tem certeza que deseja excluir o pedido <span className="font-bold text-primary">#{orderToDelete?.orderNumber}</span>? Esta ação não pode ser desfeita e removerá permanentemente o histórico do banco de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="rounded-full h-12 px-8 border-primary/10 text-primary font-bold uppercase text-[10px] tracking-widest">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              className="rounded-full h-12 px-8 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-[10px] tracking-widest"
            >
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Bloco de etapa de uma peça: mostra o que já foi feito e só o botão do próximo passo.
function ItemFulfillment({
  order,
  item,
  index,
  privateItem,
  suggestedCost,
  blocked,
  onUpdate,
}: {
  order: any;
  item: any;
  index: number;
  privateItem?: any;
  suggestedCost: number;
  blocked: boolean;
  onUpdate: (order: any, index: number, changes: Record<string, any>, historyText: string, privateItem?: Record<string, any>) => Promise<void>;
}) {
  const stage = itemStage(item);
  const next = nextItemStage(item);
  const [supplierOrderNumber, setSupplierOrderNumber] = useState(privateItem?.supplierOrderNumber || '');
  const [supplierPaid, setSupplierPaid] = useState(
    privateItem?.supplierPaid !== undefined ? String(privateItem.supplierPaid) : (suggestedCost ? suggestedCost.toFixed(2) : '')
  );
  const [trackingCode, setTrackingCode] = useState(item.trackingCode || '');
  const [saving, setSaving] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setSaving(true);
    try { await fn(); } finally { setSaving(false); }
  };

  const label = `${item.name}${item.selectedSize ? ` (${item.selectedSize})` : ''}`;
  const stamp = new Date().toISOString();

  const markPurchased = () => run(() => onUpdate(
    order, index,
    { status: 'comprado', purchasedAt: stamp },
    `Comprado no fornecedor: ${label}${supplierOrderNumber ? ` · pedido ${supplierOrderNumber}` : ''}`,
    { supplierOrderNumber: supplierOrderNumber.trim(), supplierPaid: toNumber(supplierPaid), purchasedAt: stamp }
  ));

  const markShipped = () => run(() => onUpdate(
    order, index,
    { status: 'transito', trackingCode: trackingCode.trim().toUpperCase(), shippedAt: stamp },
    `Enviado: ${label} · rastreio ${trackingCode.trim().toUpperCase()}`
  ));

  const markDelivered = () => run(() => onUpdate(
    order, index,
    { status: 'entregue', deliveredAt: stamp },
    `Entregue: ${label}`
  ));

  const stepBack = () => {
    const prev = (['aguardando', 'comprado', 'transito', 'entregue'] as ItemStage[])[stageIndex(stage) - 1];
    if (!prev || !confirm(`Voltar "${label}" para "${itemStatusLabels[prev]}"?`)) return;
    run(() => onUpdate(order, index, { status: prev }, `Etapa desfeita: ${label} voltou para "${itemStatusLabels[prev]}"`));
  };

  return (
    <div className="p-4 rounded-2xl bg-secondary/10 border border-primary/5 space-y-4">
      {/* O que já foi feito nesta peça */}
      {(privateItem?.supplierOrderNumber || privateItem?.supplierPaid !== undefined || item.trackingCode) && (
        <div className="grid sm:grid-cols-3 gap-3 text-[11px]">
          {privateItem?.supplierOrderNumber && (
            <div><p className="text-[9px] uppercase font-bold text-muted-foreground">Pedido no fornecedor</p><p className="font-bold text-primary">{privateItem.supplierOrderNumber}</p></div>
          )}
          {privateItem?.supplierPaid !== undefined && stageIndex(stage) >= 1 && (
            <div><p className="text-[9px] uppercase font-bold text-muted-foreground">Pago ao fornecedor</p><p className="font-bold text-primary">{formatBRL(toNumber(privateItem.supplierPaid))}</p></div>
          )}
          {item.trackingCode && (
            <div>
              <p className="text-[9px] uppercase font-bold text-muted-foreground">Rastreio</p>
              <a href={trackingUrl(item.trackingCode)} target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline underline-offset-2 inline-flex items-center gap-1">
                {item.trackingCode} <LinkIcon className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {blocked ? (
        <p className="flex items-center gap-2 text-[11px] text-muted-foreground italic">
          <AlertCircle className="h-4 w-4" />
          {order.status === 'pending' ? 'Aguardando a confirmação do pagamento para comprar.' : 'Pedido cancelado ou reembolsado.'}
        </p>
      ) : next === 'comprado' ? (
        <div className="grid sm:grid-cols-[1fr_140px_auto] gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-[9px] font-bold uppercase text-muted-foreground">Nº do pedido no fornecedor</Label>
            <Input value={supplierOrderNumber} onChange={e => setSupplierOrderNumber(e.target.value)} placeholder="Opcional" className="h-10 text-xs bg-white border-gray-200 rounded-lg" />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] font-bold uppercase text-muted-foreground">Valor pago (R$)</Label>
            <Input value={supplierPaid} onChange={e => setSupplierPaid(e.target.value)} inputMode="decimal" className="h-10 text-xs bg-white border-gray-200 rounded-lg" />
          </div>
          <Button onClick={markPurchased} disabled={saving} className="h-10 bg-accent text-primary text-[10px] uppercase font-bold rounded-lg px-4">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShoppingBag className="h-4 w-4 mr-2" /> Comprei</>}
          </Button>
        </div>
      ) : next === 'transito' ? (
        <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-[9px] font-bold uppercase text-muted-foreground">Código de rastreio</Label>
            <Input value={trackingCode} onChange={e => setTrackingCode(e.target.value)} placeholder="Ex: BR123456789BR" className="h-10 text-xs bg-white border-gray-200 rounded-lg uppercase" />
          </div>
          <Button onClick={markShipped} disabled={saving || !trackingCode.trim()} className="h-10 bg-primary text-white text-[10px] uppercase font-bold rounded-lg px-4">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Truck className="h-4 w-4 mr-2" /> Marcar enviado</>}
          </Button>
        </div>
      ) : next === 'entregue' ? (
        <Button onClick={markDelivered} disabled={saving} variant="outline" className="h-10 w-full text-[10px] uppercase font-bold rounded-lg border-primary/20">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><PackageCheck className="h-4 w-4 mr-2" /> Marcar entregue</>}
        </Button>
      ) : (
        <p className="flex items-center gap-2 text-[11px] text-emerald-700 font-bold"><CheckCircle2 className="h-4 w-4" /> Peça entregue{item.deliveredAt ? ` em ${formatDateTime(item.deliveredAt)}` : ''}</p>
      )}

      {stage !== 'aguardando' && !blocked && (
        <button onClick={stepBack} disabled={saving} className="flex items-center gap-1 text-[9px] uppercase font-bold text-muted-foreground hover:text-primary">
          <Undo2 className="h-3 w-3" /> Desfazer última etapa
        </button>
      )}
    </div>
  );
}
