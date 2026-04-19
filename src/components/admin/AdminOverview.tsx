
"use client";

import React from 'react';
import { 
  ShoppingBag, 
  Users, 
  Truck, 
  BarChart3, 
  ArrowRight, 
  AlertCircle,
  Clock,
  TrendingUp,
  Package,
  Image as ImageIcon,
  Tag,
  Settings
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, where } from 'firebase/firestore';

export function AdminOverview({ onNavigate }: { onNavigate: (tab: any) => void }) {
  const db = useFirestore();

  // Consultas para o Dashboard
  const ordersQuery = useMemoFirebase(() => query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5)), [db]);
  const { data: recentOrders } = useCollection(ordersQuery);

  const pendingQuery = useMemoFirebase(() => query(collection(db, 'orders'), where('status', '==', 'pending')), [db]);
  const { data: pendingOrders } = useCollection(pendingQuery);

  const stats = [
    { label: "Vendas Brutas (Mês)", value: "R$ 0,00", icon: <TrendingUp />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pedidos Pendentes", value: pendingOrders?.length || 0, icon: <Clock />, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Novas Clientes", value: "0", icon: <Users />, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Ticket Médio", value: "R$ 0,00", icon: <BarChart3 />, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-10">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 border-none shadow-sm flex items-center gap-5">
            <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Pedidos Recentes */}
        <Card className="lg:col-span-8 p-0 border-none shadow-sm overflow-hidden bg-white">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h4 className="font-bold text-primary flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-accent" />
              Pedidos Recentes
            </h4>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('orders')} className="text-[10px] font-bold uppercase text-accent">
              Ver todos <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                <tr>
                  <th className="px-6 py-4">Pedido</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders?.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-primary">#{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{order.customer?.name}</span>
                        <span className="text-[10px] text-muted-foreground">{order.customer?.city}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className="bg-secondary text-primary border-none text-[9px] font-bold uppercase">{order.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-bold">R$ {order.total?.toFixed(2)}</td>
                  </tr>
                ))}
                {recentOrders?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-muted-foreground italic text-sm">Nenhum pedido registrado ainda.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Atalhos Rápidos */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-8 border-none shadow-sm bg-primary text-white space-y-6">
            <div className="flex items-center gap-3">
               <AlertCircle className="h-5 w-5 text-accent" />
               <h5 className="font-bold tracking-tight">Operação Dropshipping</h5>
            </div>
            <p className="text-sm text-white/70 font-light leading-relaxed">
              Você tem <span className="text-accent font-bold">{pendingOrders?.length || 0}</span> pedidos aguardando processamento com fornecedores.
            </p>
            <Button onClick={() => onNavigate('orders')} className="w-full bg-accent text-primary font-bold uppercase text-[10px] tracking-widest py-6 shadow-xl">
              Processar Pedidos
            </Button>
          </Card>

          <Card className="p-6 border-none shadow-sm space-y-4">
            <h5 className="text-[11px] font-bold uppercase text-muted-foreground tracking-[0.2em]">Acesso Rápido</h5>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Novo Look", icon: <Package className="h-4 w-4" />, tab: 'products' },
                { label: "Banners", icon: <ImageIcon className="h-4 w-4" />, tab: 'appearance' },
                { label: "Criar Cupom", icon: <Tag className="h-4 w-4" />, tab: 'coupons' },
                { label: "Configurar", icon: <Settings className="h-4 w-4" />, tab: 'settings' },
              ].map((link, i) => (
                <button 
                  key={i}
                  onClick={() => onNavigate(link.tab)}
                  className="p-4 rounded-xl bg-gray-50 hover:bg-secondary text-primary transition-all flex flex-col items-center gap-2 border border-gray-100"
                >
                  <span className="text-accent">{link.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-tight">{link.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
