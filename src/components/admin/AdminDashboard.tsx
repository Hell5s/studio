"use client";

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Users, 
  Search, 
  TrendingUp, 
  Plus, 
  Image as ImageIcon, 
  Settings, 
  Sparkles,
  LayoutDashboard,
  Package,
  Layers,
  FileText,
  ExternalLink,
  Edit,
  Trash2,
  X,
  PlusCircle,
  Eye,
  ArrowUpRight,
  Clock,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { AdminShopeeImport } from './AdminShopeeImport';

interface AdminDashboardProps {
  productsCount: number;
  categoriesCount: number;
  onOpenAI: () => void;
}

export function AdminDashboard({ productsCount, categoriesCount, onOpenAI }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'produtos' | 'categorias' | 'shopee' | 'config'>('dashboard');
  const db = useFirestore();

  const recentProductsQuery = useMemoFirebase(() => {
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(5));
  }, [db]);
  const { data: recentProducts } = useCollection(recentProductsQuery);

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'shopee', label: 'Auto Import', icon: <Download className="h-4 w-4" /> },
    { id: 'produtos', label: 'Produtos', icon: <Package className="h-4 w-4" /> },
    { id: 'categorias', label: 'Coleções', icon: <Layers className="h-4 w-4" /> },
    { id: 'config', label: 'Ajustes', icon: <Settings className="h-4 w-4" /> },
  ];

  const stats = [
    { label: "Vendas Mês", value: "142", icon: <ShoppingBag className="h-5 w-5" />, color: "bg-primary/20 text-primary", trend: "+12%" },
    { label: "Produtos", value: productsCount, icon: <Package className="h-5 w-5" />, color: "bg-secondary text-foreground", trend: "+5" },
    { label: "Visitas", value: "2.4k", icon: <Users className="h-5 w-5" />, color: "bg-accent/20 text-accent-foreground", trend: "+8%" },
    { label: "Lucro Est.", value: "R$ 4.2k", icon: <TrendingUp className="h-5 w-5" />, color: "bg-green-50 text-green-600", trend: "+15%" },
  ];

  return (
    <div className="flex h-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-primary/10 p-6 flex flex-col gap-8">
        <div className="px-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Console Mágico</p>
          <h3 className="text-2xl font-headline font-bold text-foreground">Encanto Kids</h3>
        </div>

        <nav className="flex-1 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-5 rounded-3xl bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[10px] font-bold uppercase">Store Online</p>
          </div>
          <Button variant="outline" size="sm" className="w-full text-[9px] h-9 rounded-xl border-primary/20 hover:bg-white">
            Live Preview
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-secondary/10">
        <header className="h-20 bg-white border-b border-primary/10 px-8 flex items-center justify-between">
          <h2 className="text-lg font-headline font-bold text-foreground uppercase tracking-widest">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          <div className="flex gap-3">
            <Button onClick={onOpenAI} variant="ghost" className="rounded-full text-primary hover:bg-primary/10">
              <Sparkles className="h-5 w-5" />
            </Button>
            <Button className="rounded-full bg-primary text-primary-foreground font-bold text-[10px] px-6 h-10 shadow-lg shadow-primary/10">
              <PlusCircle className="mr-2 h-4 w-4" />
              Manual Add
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {activeTab === 'dashboard' && (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                  <Card key={i} className="p-6 rounded-[2rem] border-none bg-white shadow-sm hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${stat.color}`}>{stat.icon}</div>
                      <Badge variant="outline" className="text-[10px] border-green-500/20 text-green-600 bg-green-50">
                        {stat.trend}
                      </Badge>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </Card>
                ))}
              </div>

              <Card className="p-8 rounded-[3rem] border-none bg-white shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="font-headline font-bold text-xl">Recent Imports</h4>
                  <Button variant="ghost" size="sm" className="text-primary text-xs">View All</Button>
                </div>
                <div className="space-y-4">
                  {recentProducts?.map((product) => (
                    <div key={product.id} className="flex items-center gap-4 p-4 rounded-2xl border border-primary/5 hover:bg-secondary/20 transition-all">
                      <div className="h-12 w-12 rounded-xl overflow-hidden bg-muted">
                        <img src={product.images[0]} className="object-cover h-full w-full" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm truncate">{product.title}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{product.source || 'Manual'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">R$ {product.price}</p>
                        <Badge variant="outline" className={`text-[8px] ${product.published ? 'text-green-600 border-green-200' : 'text-orange-600 border-orange-200'}`}>
                          {product.published ? 'Publicado' : 'Draft'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {activeTab === 'shopee' && <AdminShopeeImport />}

          {(activeTab === 'produtos' || activeTab === 'categorias' || activeTab === 'config') && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="h-8 w-8 text-primary/40 animate-spin-slow" />
              </div>
              <h5 className="font-headline font-bold text-foreground/40 uppercase tracking-widest">Em Construção</h5>
              <p className="text-xs text-muted-foreground max-w-xs">Ajustando as últimas configurações para o Mundo Mágico.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}