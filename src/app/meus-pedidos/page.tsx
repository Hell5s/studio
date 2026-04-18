
"use client";

import React from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Navbar } from '@/components/store/Navbar';
import { Footer } from '@/components/store/Footer';
import { Newsletter } from '@/components/store/Newsletter';
import { ShoppingBag, Loader2, Package, Truck, CheckCircle2, Clock, MapPin, Tag, XCircle, Info, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  'Pedido recebido': { label: 'Pedido Recebido', color: 'bg-[#F7E8EA] text-[#6E3C47] border-[#E9C9CF]', icon: <Clock className="h-3 w-3" /> },
  'Pago': { label: 'Pagamento Confirmado', color: 'bg-green-50 text-green-700 border-green-100', icon: <CheckCircle2 className="h-3 w-3" /> },
  'Comprado na Shopee': { label: 'Em Processamento', color: 'bg-orange-50 text-orange-700 border-orange-100', icon: <Tag className="h-3 w-3" /> },
  'Enviado': { label: 'Enviado', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: <Truck className="h-3 w-3" /> },
  'Entregue': { label: 'Entregue', color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  'Cancelado': { label: 'Cancelado', color: 'bg-red-50 text-red-700 border-red-100', icon: <XCircle className="h-3 w-3" /> },
};

export default function MeusPedidosPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'orders'), 
      where('userId', '==', user.uid), 
      orderBy('createdAt', 'desc'),
      limit(50)
    );
  }, [db, user?.uid]);

  const { data: orders, isLoading: isOrdersLoading } = useCollection(ordersQuery);

  const formatPrice = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const formatDate = (date: any) => {
    if (!date) return 'Recentemente';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#FFF9F7] selection:bg-accent/30 selection:text-primary overflow-x-hidden">
      <Navbar 
        onOpenLogin={() => {}} 
        onOpenTrack={() => {}}
        onOpenOrders={() => {}}
        onOpenCart={() => {}}
        cartCount={0}
      />

      <main className="pt-32 pb-24">
        <header className="container mx-auto px-6 mb-16">
           <div className="max-w-4xl space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-accent" />
                <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-accent">Exclusividade</span>
              </div>
              <h1 className="text-4xl md:text-8xl font-headline font-bold text-primary leading-[0.95] tracking-tighter">
                Minha Jornada <br />
                <span className="italic font-light text-accent">Toda Bela</span>
              </h1>
              <p className="text-base md:text-2xl text-muted-foreground font-light italic max-w-2xl leading-relaxed">
                Acompanhe o status e os detalhes de cada uma de suas escolhas em nossa boutique.
              </p>
           </div>
        </header>

        <section className="container mx-auto px-6">
          {isUserLoading || isOrdersLoading ? (
            <div className="py-40 flex flex-col items-center justify-center space-y-6">
              <Loader2 className="h-12 w-12 animate-spin text-accent/30" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Sincronizando seus dados...</p>
            </div>
          ) : !user ? (
            <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-primary/5 shadow-editorial">
              <Info className="h-12 w-12 text-accent/20 mx-auto mb-6" />
              <h3 className="text-2xl font-headline font-bold text-primary mb-4">Acesso Necessário</h3>
              <p className="text-muted-foreground italic font-light max-w-xs mx-auto mb-8">Por favor, realize o login para visualizar seu histórico de pedidos.</p>
              <Button className="rounded-full px-12 h-14 bg-primary text-white font-bold uppercase tracking-widest text-[10px]">Acessar minha conta</Button>
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="grid gap-12">
              {orders.map((order: any) => {
                const status = statusConfig[order.status] || statusConfig['Pedido recebido'];
                return (
                  <article key={order.id} className="bg-white rounded-[3rem] border border-primary/5 shadow-editorial overflow-hidden group hover:shadow-premium transition-all duration-700">
                    <div className="p-8 md:p-12 border-b border-primary/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                       <div className="space-y-4">
                          <div className="flex items-center gap-3">
                             <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Pedido #{order.orderNumber || order.id.slice(-6).toUpperCase()}</span>
                             <div className="h-1 w-1 rounded-full bg-accent/30" />
                             <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{formatDate(order.createdAt)}</span>
                          </div>
                          <div className={cn("px-5 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 w-fit", status.color)}>
                              {status.icon}
                              {status.label}
                          </div>
                       </div>
                       <div className="text-left md:text-right space-y-1">
                          <p className="text-[10px] font-bold uppercase text-primary/30 tracking-widest">Total do Investimento</p>
                          <p className="text-4xl font-headline font-bold text-primary">{formatPrice(order.total)}</p>
                       </div>
                    </div>

                    <div className="grid lg:grid-cols-12">
                       <div className="lg:col-span-7 p-8 md:p-12 space-y-10">
                          <div className="space-y-6">
                             <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent flex items-center gap-3">
                                <Package className="h-4 w-4" /> Itens Selecionados ({order.items?.length})
                             </p>
                             <div className="space-y-6">
                                {order.items?.map((item: any, i: number) => (
                                  <div key={i} className="flex gap-6 items-center p-6 rounded-[2rem] bg-secondary/10 border border-transparent hover:border-accent/10 transition-colors">
                                     <div className="h-28 w-24 rounded-2xl overflow-hidden shadow-sm shrink-0">
                                        <img src={item.image} className="h-full w-full object-cover" alt={item.name} />
                                     </div>
                                     <div className="flex-1 min-w-0">
                                        <h5 className="text-lg font-bold text-primary leading-tight line-clamp-1">{item.name}</h5>
                                        <p className="text-xs text-muted-foreground italic mt-1">Qtd: {item.quantity} • {formatPrice(item.price)}/un</p>
                                     </div>
                                     <p className="text-lg font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                                  </div>
                                ))}
                             </div>
                          </div>
                          
                          {order.trackingCode && order.trackingCode !== "Aguardando envio" && (
                            <div className="p-8 rounded-[2.5rem] bg-primary text-primary-foreground space-y-4">
                               <div className="flex items-center gap-3">
                                  <Truck className="h-6 w-6 text-accent" />
                                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Rastreamento da Peça</p>
                               </div>
                               <div className="flex justify-between items-center">
                                  <p className="text-2xl font-mono font-medium tracking-tighter">{order.trackingCode}</p>
                                  <button className="text-[10px] font-bold uppercase tracking-widest underline underline-offset-4 decoration-accent">Copiar Código</button>
                               </div>
                            </div>
                          )}
                       </div>

                       <div className="lg:col-span-5 bg-secondary/20 p-8 md:p-12 space-y-12">
                          <div className="space-y-6">
                             <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent flex items-center gap-3">
                                <MapPin className="h-4 w-4" /> Destino Editorial
                             </p>
                             <div className="space-y-4 bg-white/50 p-8 rounded-[2rem] border border-primary/5 shadow-sm">
                                <div className="space-y-1">
                                   <p className="text-lg font-bold text-primary">{order.customer?.name}</p>
                                   <p className="text-sm text-muted-foreground italic">{order.customer?.email}</p>
                                   <p className="text-sm text-muted-foreground italic">{order.customer?.phone}</p>
                                </div>
                                <Separator className="bg-primary/5" />
                                <div className="text-sm text-muted-foreground leading-relaxed italic space-y-1">
                                   <p>{order.customer?.address}</p>
                                   <p>{order.customer?.city}, {order.customer?.state}</p>
                                   <p>CEP: {order.customer?.zip}</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="py-40 text-center space-y-10 bg-white/50 rounded-[4rem] border-2 border-dashed border-primary/5 shadow-editorial">
              <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center mx-auto text-accent/30">
                <ShoppingBag className="h-10 w-10" />
              </div>
              <div className="space-y-4">
                 <h3 className="text-3xl font-headline font-bold text-primary">Nenhuma peça ainda</h3>
                 <p className="text-muted-foreground italic font-light max-w-sm mx-auto leading-relaxed">Sua jornada com a Toda Bela começa no momento da sua primeira escolha. Que tal conhecer nossos lançamentos?</p>
              </div>
              <Link href="/">
                <Button className="rounded-full px-12 h-16 bg-primary text-white font-bold uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-105 transition-all">Explorar Coleção</Button>
              </Link>
            </div>
          )}
        </section>

        <Newsletter />
      </main>

      <Footer />
    </div>
  );
}
