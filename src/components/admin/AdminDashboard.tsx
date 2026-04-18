
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
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { AdminShopeeImport } from './AdminShopeeImport';
import { ProductManagement } from './ProductManagement';
import { AddProductDialog } from './AddProductDialog';

interface AdminDashboardProps {
  productsCount: number;
  categoriesCount: number;
  onOpenAI: () => void;
}

export function AdminDashboard({ productsCount, categoriesCount, onOpenAI }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'produtos' | 'categorias' | 'shopee' | 'config'>('dashboard');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const db = useFirestore();

  const recentProductsQuery = useMemoFirebase(() => {
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(5));
  }, [db]);
  const { data: recentProducts } = useCollection(recentProductsQuery);

  const tabs = [
    { id: 'dashboard', label: 'Visão Geral', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'shopee', label: 'Importar Produto', icon: <Download className="h-4 w-4" /> },
    { id: 'produtos', label: 'Catálogo', icon: <Package className="h-4 w-4" /> },
    { id: 'categorias', label: 'Coleções', icon: <Layers className="h-4 w-4" /> },
    { id: 'config', label: 'Configurações', icon: <Settings className="h-4 w-4" /> },
  ];

  const stats = [
    { label: "Vendas (Mês)", value: "R$ 0,00", icon: <ShoppingBag className="h-5 w-5" />, color: "bg-primary/10 text-primary", trend: "0%" },
    { label: "Produtos Ativos", value: productsCount, icon: <Package className="h-5 w-5" />, color: "bg-accent/10 text-accent", trend: "Real" },
    { label: "Coleções", value: categoriesCount, icon: <Layers className="h-5 w-5" />, color: "bg-secondary text-primary", trend: "Real" },
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

        <div className="p-6 rounded-[2rem] bg-accent/5 border border-accent/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-accent">Loja Online</p>
          </div>
          <Button variant="outline" size="sm" className="w-full text-[9px] h-10 rounded-xl border-accent/20 hover:bg-white uppercase tracking-widest font-bold" onClick={() => window.open('/', '_blank')}>
            Ver Site ao Vivo
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
              Gerar com AI
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

              <Card className="p-10 rounded-[3.5rem] border-none bg-white shadow-xl">
                <div className="flex items-center justify-between mb-10">
                  <h4 className="font-headline font-bold text-2xl text-primary">Últimas Atividades</h4>
                  <Button variant="ghost" size="sm" className="text-accent text-[10px] font-bold uppercase tracking-widest" onClick={() => setActiveTab('produtos')}>Ver Catálogo Completo</Button>
                </div>
                <div className="space-y-6">
                  {recentProducts?.map((product) => (
                    <div key={product.id} className="flex items-center gap-6 p-5 rounded-3xl border border-primary/5 hover:bg-secondary/20 transition-all duration-500">
                      <div className="h-16 w-16 rounded-2xl overflow-hidden bg-muted shadow-sm">
                        <img src={product.image || product.images?.[0]} className="object-cover h-full w-full" alt={product.name} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-primary text-base truncate">{product.name}</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] mt-1 font-bold">{product.source || 'Curadoria'}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="font-bold text-primary">R$ {product.price?.toFixed(2)}</p>
                        <div className="flex gap-2">
                          {product.sourceUrl && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 rounded-full text-[8px] uppercase tracking-widest font-bold border-accent/20 text-accent hover:bg-white"
                              onClick={() => window.open(product.sourceUrl, '_blank')}
                            >
                              <ExternalLink className="mr-1 h-3 w-3" />
                              Shopee
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!recentProducts || recentProducts.length === 0) && (
                    <div className="text-center py-20">
                      <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                        <Package className="h-10 w-10 text-primary/20" />
                      </div>
                      <p className="text-muted-foreground italic font-light">Nenhum produto cadastrado no momento.</p>
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}

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
