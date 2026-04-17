
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
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'shopee', label: 'Importar Shopee', icon: <Download className="h-4 w-4" /> },
    { id: 'produtos', label: 'Produtos', icon: <Package className="h-4 w-4" /> },
    { id: 'categorias', label: 'Coleções', icon: <Layers className="h-4 w-4" /> },
    { id: 'banner', label: 'Banners', icon: <FileText className="h-4 w-4" /> },
    { id: 'config', label: 'Configurações', icon: <Settings className="h-4 w-4" /> },
  ];

  const stats = [
    { label: "Produtos Ativos", value: productsCount, icon: <ShoppingBag className="h-5 w-5" />, color: "bg-brand-blush text-brand-wine", trend: "+2" },
    { label: "Coleções", value: categoriesCount, icon: <Search className="h-5 w-5" />, color: "bg-brand-rose/30 text-brand-wine", trend: "0" },
    { label: "Novos Leads", value: "12", icon: <Users className="h-5 w-5" />, color: "bg-brand-gold/10 text-brand-gold", trend: "+4" },
    { label: "Taxa de Conversão", value: "3.2%", icon: <TrendingUp className="h-5 w-5" />, color: "bg-green-50 text-green-600", trend: "+0.5%" },
  ];

  return (
    <div className="flex h-full bg-[#FFF9F7] overflow-hidden">
      {/* Sidebar - Maison Style */}
      <aside className="w-72 bg-white border-r border-brand-wine/5 p-6 flex flex-col gap-8">
        <div className="px-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-wine/40 leading-none">Console</p>
          <h3 className="mt-1 text-2xl font-headline font-bold text-brand-wine">Toda Bela</h3>
        </div>

        <nav className="flex-1 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? "bg-brand-wine text-white shadow-lg shadow-brand-wine/20 translate-x-2" 
                  : "text-brand-wine/60 hover:bg-brand-blush/50 hover:text-brand-wine"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 rounded-3xl bg-brand-wine text-white">
          <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-white/50 mb-3">Status da Loja</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-sm font-bold">Online & Sincronizada</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-4 text-[10px] h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-widest border border-white/10">
            <Eye className="mr-2 h-3 w-3" /> Ver Vitrine
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-brand-wine/5 px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-headline font-bold text-brand-wine">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          <div className="flex gap-3">
            <Button onClick={onOpenAI} variant="outline" className="rounded-full border-brand-wine/10 text-brand-wine hover:bg-brand-blush/30 transition-all">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Assistant
            </Button>
            <Button className="rounded-full bg-brand-wine text-white shadow-lg shadow-brand-wine/10 font-bold px-6">
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Peça
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {activeTab === 'dashboard' && (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                  <Card key={i} className="p-6 rounded-[2.5rem] border-none bg-white shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${stat.color} transition-transform group-hover:scale-110`}>
                        {stat.icon}
                      </div>
                      <Badge variant="outline" className="text-[10px] border-green-500/20 text-green-600 bg-green-50">
                        {stat.trend}
                      </Badge>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-brand-wine/40 tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-bold text-brand-wine mt-1">{stat.value}</p>
                  </Card>
                ))}
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                <Card className="lg:col-span-2 p-8 rounded-[3rem] border-none bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="font-headline font-bold text-xl text-brand-wine">Atividade Recente</h4>
                      <p className="text-sm text-brand-wine/40">Últimas atualizações no seu catálogo</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-brand-wine text-xs font-bold">Ver tudo <ArrowUpRight className="ml-1 h-3 w-3" /></Button>
                  </div>
                  
                  <div className="space-y-4">
                    {recentProducts?.map((product) => (
                      <div key={product.id} className="flex items-center gap-4 p-4 rounded-3xl border border-brand-wine/5 hover:bg-brand-blush/30 transition-all group">
                        <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-muted">
                          <img src={product.image} className="object-cover h-full w-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate text-brand-wine">{product.name || product.title}</p>
                          <p className="text-[10px] text-brand-wine/40 flex items-center gap-1 uppercase tracking-widest font-bold">
                            <Clock className="h-3 w-3" /> Just added
                          </p>
                        </div>
                        <p className="text-xs font-bold text-brand-wine">R$ {product.price}</p>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl hover:bg-brand-wine hover:text-white">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-8 rounded-[3rem] border-none bg-brand-wine text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110 group-hover:rotate-12 duration-700">
                    <Sparkles className="h-32 w-32" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center mb-6 text-brand-gold border border-white/10">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h4 className="font-headline font-bold text-xl mb-4">Magic Insights AI</h4>
                    <p className="text-white/70 leading-relaxed italic text-sm mb-8 font-light">
                      "Tendência detectada: Tons pastéis estão com alta busca. Que tal importar novos conjuntos da Shopee hoje?"
                    </p>
                    <Button className="mt-auto bg-brand-gold text-brand-wine hover:bg-white rounded-full font-bold text-[10px] uppercase tracking-widest h-12">
                      Analisar Tendências
                    </Button>
                  </div>
                </Card>
              </div>
            </>
          )}

          {activeTab === 'shopee' && (
            <AdminShopeeImport />
          )}

          {activeTab === 'produtos' && (
            <Card className="p-8 rounded-[3rem] border-none bg-white shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="font-headline font-bold text-xl text-brand-wine">Gestão de Catálogo</h4>
                  <p className="text-sm text-brand-wine/40">Revise e edite suas peças ao vivo</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-wine/30" />
                  <Input placeholder="Buscar peça..." className="pl-10 rounded-full h-10 w-64 bg-brand-blush/30 border-none text-brand-wine" />
                </div>
              </div>
              
              <div className="grid gap-6">
                {recentProducts?.map((product) => (
                  <div key={product.id} className="flex items-center gap-6 p-5 rounded-[2.5rem] border border-brand-wine/5 hover:border-brand-gold/30 transition-all bg-white group shadow-sm hover:shadow-md">
                    <div className="relative h-24 w-24 overflow-hidden rounded-3xl shadow-inner bg-muted">
                      <img src={product.image} className="object-cover h-full w-full group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-[10px] px-2 py-0 bg-brand-gold/10 text-brand-gold border-none font-bold uppercase tracking-widest">
                          {product.source || 'Manual'}
                        </Badge>
                      </div>
                      <h5 className="font-bold text-lg text-brand-wine">{product.name || product.title}</h5>
                      <p className="text-xs text-brand-wine/60 line-clamp-1 font-light italic">{product.description}</p>
                    </div>
                    <div className="text-right px-6">
                      <p className="text-[10px] uppercase font-bold text-brand-wine/30 mb-1 tracking-widest">Preço</p>
                      <p className="text-xl font-bold text-brand-wine">R$ {product.price}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl hover:bg-brand-blush/50 text-brand-wine/40 hover:text-brand-wine transition-colors">
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl hover:bg-destructive/5 text-brand-wine/40 hover:text-destructive transition-colors">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {(activeTab === 'categorias' || activeTab === 'banner' || activeTab === 'config') && (
            <Card className="min-h-[400px] rounded-[4rem] border-dashed border-2 border-brand-wine/10 flex flex-col items-center justify-center text-center bg-white/40 p-12">
              <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                <Settings className="h-8 w-8 text-brand-wine/20 animate-spin-slow" />
              </div>
              <h5 className="text-xl font-headline font-bold text-brand-wine/40 uppercase tracking-widest">Módulo em Refinamento</h5>
              <p className="text-sm font-light text-brand-wine/60 mt-2 max-w-xs italic">
                Estamos ajustando esta seção para a experiência definitiva da Maison Toda Bela.
              </p>
              <Button variant="outline" className="mt-8 rounded-full border-brand-wine/20 text-brand-wine px-8 font-bold uppercase tracking-widest text-[10px]" onClick={() => setActiveTab('dashboard')}>
                Voltar ao Dashboard
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
