
"use client";

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Users, 
  PlusCircle, 
  Settings, 
  Sparkles,
  LayoutDashboard,
  Package,
  Layers,
  Download,
  ExternalLink,
  LogOut,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { AdminShopeeImport } from './AdminShopeeImport';
import { ProductManagement } from './ProductManagement';
import { AddProductDialog } from './AddProductDialog';
import { OrderManagement } from './OrderManagement';

interface AdminDashboardProps {
  productsCount: number;
  categoriesCount: number;
  onOpenAI: () => void;
  onExit?: () => void;
}

export function AdminDashboard({ productsCount, categoriesCount, onOpenAI, onExit }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pedidos' | 'produtos' | 'categorias' | 'shopee' | 'config'>('dashboard');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const db = useFirestore();
  const { user } = useUser();

  const recentProductsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(5));
  }, [db, user]);
  const { data: recentProducts } = useCollection(recentProductsQuery);

  const ordersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100));
  }, [db]);
  const { data: orders } = useCollection(ordersQuery);

  const tabs = [
    { id: 'dashboard', label: 'Visão Geral', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'pedidos', label: 'Pedidos', icon: <ShoppingBag className="h-4 w-4" /> },
    { id: 'shopee', label: 'Importar Produto', icon: <Download className="h-4 w-4" /> },
    { id: 'produtos', label: 'Catálogo', icon: <Package className="h-4 w-4" /> },
    { id: 'categorias', label: 'Coleções', icon: <Layers className="h-4 w-4" /> },
    { id: 'config', label: 'Configurações', icon: <Settings className="h-4 w-4" /> },
  ];

  const totalSales = orders?.reduce((acc, order) => acc + (order.total || 0), 0) || 0;

  const stats = [
    { label: "Vendas Totais", value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSales), icon: <ShoppingBag className="h-5 w-5" />, color: "bg-primary/10 text-primary", trend: `${orders?.length || 0} pedidos` },
    { label: "Produtos Ativos", value: productsCount, icon: <Package className="h-5 w-5" />, color: "bg-accent/10 text-accent", trend: "Boutique" },
    { label: "Novos Pedidos", value: orders?.filter(o => o.status === 'Pendente').length || 0, icon: <Clock className="h-5 w-5" />, color: "bg-amber-50 text-amber-600", trend: "Tempo Real" },
    { label: "Novas Clientes", value: "0", icon: <Users className="h-5 w-5" />, color: "bg-green-50 text-green-600", trend: "0%" },
  ];

  return (
    <div className="flex h-full bg-background overflow-hidden">
      <aside className="w-72 bg-white border-r border-primary/5 p-8 flex flex-col gap-10">
        <div className="px-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-2">Administrativo</p>
          <h3 className="text-2xl font-headline font-bold text-primary">Toda Bela</h3>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-primary"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          <div className="p-6 rounded-[2rem] bg-accent/5 border border-accent/10">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" />
              <p className="text-[9px] font-bold uppercase tracking-widest text-accent">Loja Online</p>
            </div>
            <Button variant="outline" size="sm" className="w-full text-[9px] h-10 rounded-xl border-accent/20 hover:bg-white uppercase tracking-widest font-bold" onClick={() => window.open('/', '_blank')}>
              Ver Site ao Vivo
            </Button>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onExit}
            className="w-full flex items-center justify-center gap-2 text-[9px] h-12 rounded-xl text-primary hover:bg-primary/5 uppercase tracking-widest font-bold"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair do Painel
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-secondary/5">
        <header className="h-24 bg-white border-b border-primary/5 px-10 flex items-center justify-between">
          <h2 className="text-xl font-headline font-bold text-primary uppercase tracking-[0.2em]">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          <div className="flex gap-4">
            <Button onClick={onOpenAI} variant="ghost" className="rounded-full text-primary hover:bg-primary/5 h-12 px-6 font-bold text-[10px] uppercase tracking-widest">
              <Sparkles className="mr-2 h-4 w-4" />
              Copys com IA
            </Button>
            <Button onClick={() => setIsAddOpen(true)} className="rounded-full bg-primary text-primary-foreground font-bold text-[10px] px-8 h-12 shadow-xl shadow-primary/20 uppercase tracking-widest">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          {activeTab === 'dashboard' && (
            <>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                  <Card key={i} className="p-8 rounded-[2.5rem] border-none bg-white shadow-xl hover:shadow-2xl transition-all duration-500">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`p-4 rounded-2xl ${stat.color}`}>{stat.icon}</div>
                      <Badge variant="outline" className="text-[10px] border-primary/10 text-primary bg-secondary/20 font-bold">
                        {stat.trend}
                      </Badge>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em]">{stat.label}</p>
                    <p className="text-3xl font-bold text-primary mt-2">{stat.value}</p>
                  </Card>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <Card className="p-10 rounded-[3.5rem] border-none bg-white shadow-xl">
                  <div className="flex items-center justify-between mb-10">
                    <h4 className="font-headline font-bold text-2xl text-primary">Pedidos Recentes</h4>
                    <Button variant="ghost" size="sm" className="text-accent text-[10px] font-bold uppercase tracking-widest" onClick={() => setActiveTab('pedidos')}>Ver Todos</Button>
                  </div>
                  <div className="space-y-6">
                    {orders?.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center gap-6 p-5 rounded-3xl border border-primary/5 hover:bg-secondary/20 transition-all">
                        <div className="flex-1">
                          <p className="font-bold text-primary">#{order.id.slice(-6).toUpperCase()}</p>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-bold">{order.items?.length || 0} Itens</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}</p>
                          <Badge variant="outline" className="text-[8px] uppercase tracking-widest mt-1">
                            {order.status || 'Pendente'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-10 rounded-[3.5rem] border-none bg-white shadow-xl">
                  <div className="flex items-center justify-between mb-10">
                    <h4 className="font-headline font-bold text-2xl text-primary">Últimas do Catálogo</h4>
                    <Button variant="ghost" size="sm" className="text-accent text-[10px] font-bold uppercase tracking-widest" onClick={() => setActiveTab('produtos')}>Ver Tudo</Button>
                  </div>
                  <div className="space-y-6">
                    {recentProducts?.map((product) => (
                      <div key={product.id} className="flex items-center gap-6 p-5 rounded-3xl border border-primary/5 hover:bg-secondary/20 transition-all">
                        <div className="h-16 w-16 rounded-2xl overflow-hidden bg-muted shadow-sm">
                          <img src={product.image || product.images?.[0]} className="object-cover h-full w-full" alt={product.name} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-primary text-sm truncate">{product.name}</p>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-bold">{product.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}

          {activeTab === 'pedidos' && <OrderManagement />}
          {activeTab === 'shopee' && <AdminShopeeImport />}
          {activeTab === 'produtos' && <ProductManagement />}
          {(activeTab === 'categorias' || activeTab === 'config') && (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
              <div className="h-24 w-24 rounded-full bg-accent/5 flex items-center justify-center">
                <Settings className="h-10 w-10 text-accent/40 animate-spin-slow" />
              </div>
              <h5 className="font-headline font-bold text-primary uppercase tracking-[0.3em]">Módulo em Ajuste</h5>
              <p className="text-xs text-muted-foreground max-w-xs font-light italic">Refinando as ferramentas de curadoria para sua boutique exclusiva.</p>
            </div>
          )}
        </div>
      </main>

      <AddProductDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  );
}

    