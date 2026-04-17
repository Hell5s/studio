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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'produtos' | 'categorias' | 'banner' | 'shopee' | 'config'>('dashboard');
  const db = useFirestore();

  const recentProductsQuery = useMemoFirebase(() => {
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(5));
  }, [db]);
  const { data: recentProducts } = useCollection(recentProductsQuery);

  const tabs = [
    { id: 'dashboard', label: 'Visão Geral', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'produtos', label: 'Produtos', icon: <Package className="h-4 w-4" /> },
    { id: 'shopee', label: 'Importar Shopee', icon: <Download className="h-4 w-4" /> },
    { id: 'categorias', label: 'Coleções', icon: <Layers className="h-4 w-4" /> },
    { id: 'banner', label: 'Banners', icon: <FileText className="h-4 w-4" /> },
    { id: 'config', label: 'Ajustes', icon: <Settings className="h-4 w-4" /> },
  ];

  const stats = [
    { label: "Ativos", value: productsCount, icon: <ShoppingBag className="h-5 w-5" />, color: "bg-blue-500/10 text-blue-600", trend: "+2" },
    { label: "Categorias", value: categoriesCount, icon: <Search className="h-5 w-5" />, color: "bg-purple-500/10 text-purple-600", trend: "0" },
    { label: "Leads", value: "12", icon: <Users className="h-5 w-5" />, color: "bg-green-500/10 text-green-600", trend: "+4" },
    { label: "Conversão", value: "3.2%", icon: <TrendingUp className="h-5 w-5" />, color: "bg-orange-500/10 text-orange-600", trend: "+0.5%" },
  ];

  return (
    <div className="flex h-full bg-[#FDF6F8] overflow-hidden">
      {/* Sidebar Fixo estilo Shopify */}
      <aside className="w-72 bg-white border-r border-primary/5 p-6 flex flex-col gap-8">
        <div className="px-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/60 leading-none">Console</p>
          <h3 className="mt-2 text-2xl font-headline font-bold text-primary">Toda Bela Admin</h3>
        </div>

        <nav className="flex-1 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                  : "text-muted-foreground hover:bg-secondary hover:text-primary"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 rounded-2xl bg-secondary/50 border border-primary/5 mt-auto">
          <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-primary/60 mb-3">Status</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm font-bold text-foreground">Loja Online</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-4 text-[10px] h-8 rounded-lg bg-white/80 hover:bg-white text-primary font-bold uppercase tracking-wider">
            <Eye className="mr-2 h-3 w-3" /> Ver Loja
          </Button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-primary/5 px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-headline font-bold text-foreground">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          <div className="flex gap-3">
            <Button onClick={onOpenAI} variant="outline" className="rounded-full border-primary/10 text-primary hover:bg-secondary transition-all">
              <Sparkles className="mr-2 h-4 w-4" />
              Toda Bela AI
            </Button>
            <Button className="rounded-full shadow-lg shadow-primary/10 font-bold px-6">
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Novo
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {activeTab === 'dashboard' && (
            <>
              {/* Cards de Estatísticas */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                  <Card key={i} className="p-6 rounded-[2rem] border-none bg-white shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${stat.color} transition-transform group-hover:scale-110`}>
                        {stat.icon}
                      </div>
                      <Badge variant="outline" className="text-[10px] border-green-500/20 text-green-600 bg-green-50">
                        {stat.trend}
                      </Badge>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </Card>
                ))}
              </div>

              {/* Seção Principal do Dashboard */}
              <div className="grid gap-8 lg:grid-cols-3">
                <Card className="lg:col-span-2 p-8 rounded-[2.5rem] border-none bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="font-headline font-bold text-xl">Atividade Recente</h4>
                      <p className="text-sm text-muted-foreground">Últimas movimentações na sua vitrine</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary text-xs font-bold">Ver Tudo <ArrowUpRight className="ml-1 h-3 w-3" /></Button>
                  </div>
                  
                  <div className="space-y-4">
                    {recentProducts?.map((product) => (
                      <div key={product.id} className="flex items-center gap-4 p-4 rounded-2xl border border-secondary/50 hover:bg-secondary/20 transition-all group">
                        <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-muted">
                          <img src={product.image} className="object-cover h-full w-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate text-foreground">{product.name}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Adicionado recentemente
                          </p>
                        </div>
                        <p className="text-xs font-bold text-primary">R$ {product.price}</p>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Card de IA Insight */}
                <Card className="p-8 rounded-[2.5rem] border-none bg-primary text-primary-foreground shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110 group-hover:rotate-12 duration-700">
                    <Sparkles className="h-32 w-32" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center mb-6 text-white border border-white/20">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h4 className="font-headline font-bold text-xl mb-4">Toda Bela AI Insight</h4>
                    <p className="text-primary-foreground/90 leading-relaxed italic text-sm mb-8">
                      "A coleção de verão está performando acima do esperado. Considere criar um novo banner para 'Acessórios' para cross-selling."
                    </p>
                    <Button className="mt-auto bg-white text-primary hover:bg-secondary rounded-full font-bold text-xs h-10">
                      Otimizar Agora
                    </Button>
                  </div>
                </Card>
              </div>
            </>
          )}

          {activeTab === 'produtos' && (
            <Card className="p-8 rounded-[2.5rem] border-none bg-white shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="font-headline font-bold text-xl">Catálogo de Produtos</h4>
                  <p className="text-sm text-muted-foreground">Gerencie as peças em exibição para suas clientes</p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar produto..." className="pl-10 rounded-full h-10 w-64 bg-secondary/30 border-none" />
                  </div>
                </div>
              </div>
              
              <div className="grid gap-6">
                {recentProducts?.map((product) => (
                  <div key={product.id} className="flex items-center gap-6 p-5 rounded-[2rem] border border-secondary hover:border-primary/20 transition-all bg-white group shadow-sm hover:shadow-md">
                    <div className="relative h-24 w-24 overflow-hidden rounded-2xl shadow-inner bg-muted">
                      <img src={product.image} className="object-cover h-full w-full group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-[10px] px-2 py-0 bg-primary/5 text-primary border-none">
                          {product.badge || 'Padrão'}
                        </Badge>
                      </div>
                      <h5 className="font-bold text-lg text-foreground">{product.name}</h5>
                      <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                    </div>
                    <div className="text-right px-6">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Preço</p>
                      <p className="text-xl font-bold text-primary">R$ {product.price}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors">
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl hover:bg-destructive/5 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'shopee' && (
            <AdminShopeeImport />
          )}

          {(activeTab === 'categorias' || activeTab === 'banner' || activeTab === 'config') && (
            <Card className="min-h-[400px] rounded-[3rem] border-dashed border-2 border-primary/10 flex flex-col items-center justify-center text-center bg-white/40 p-12">
              <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                <Settings className="h-8 w-8 text-primary/30 animate-spin-slow" />
              </div>
              <h5 className="text-xl font-headline font-bold text-primary/60">Módulo em Preparação</h5>
              <p className="text-sm font-medium text-muted-foreground mt-2 max-w-xs">
                Estamos finalizando esta seção para oferecer o melhor controle administrativo da sua boutique.
              </p>
              <Button variant="outline" className="mt-8 rounded-full border-primary/20 text-primary px-8" onClick={() => setActiveTab('dashboard')}>
                Voltar ao Dashboard
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
