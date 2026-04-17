
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
    { id: 'shopee', label: 'IMPORTAR PRODUTO', icon: <Download className="h-4 w-4" /> },
    { id: 'produtos', label: 'Produtos', icon: <Package className="h-4 w-4" /> },
    { id: 'categorias', label: 'Coleções', icon: <Layers className="h-4 w-4" /> },
    { id: 'banner', label: 'Conteúdo', icon: <FileText className="h-4 w-4" /> },
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
      <aside className="w-80 bg-white border-r border-brand-wine/5 p-8 flex flex-col gap-10">
        <div className="px-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-wine/40 leading-none">Console</p>
          <h3 className="mt-2 text-2xl font-headline font-bold text-brand-wine">Toda Bela</h3>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? "bg-brand-wine text-white shadow-2xl shadow-brand-wine/20 translate-x-2" 
                  : "text-brand-wine/60 hover:bg-brand-blush/50 hover:text-brand-wine"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-6 rounded-[2.5rem] bg-brand-wine text-white">
          <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-white/50 mb-3">Status da Loja</p>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-widest">Loja Ativa</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-6 text-[9px] h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-widest border border-white/10">
            <Eye className="mr-2 h-4 w-4" /> Ver Vitrine
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 bg-white border-b border-brand-wine/5 px-10 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-headline font-bold text-brand-wine uppercase tracking-[0.2em]">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          <div className="flex gap-4">
            <Button onClick={onOpenAI} variant="outline" className="rounded-full border-brand-wine/10 text-brand-wine hover:bg-brand-blush/30 transition-all font-bold text-[10px] uppercase tracking-widest h-12 px-6">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Assistant
            </Button>
            <Button className="rounded-full bg-brand-wine text-white shadow-xl shadow-brand-wine/10 font-bold px-8 uppercase tracking-widest text-[10px] h-12">
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Peça
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          {activeTab === 'dashboard' && (
            <>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                  <Card key={i} className="p-8 rounded-[3rem] border-none bg-white shadow-sm hover:shadow-xl transition-all group cursor-default">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`p-4 rounded-[1.5rem] ${stat.color} transition-transform group-hover:scale-110`}>
                        {stat.icon}
                      </div>
                      <Badge variant="outline" className="text-[10px] border-green-500/20 text-green-600 bg-green-50 font-bold">
                        {stat.trend}
                      </Badge>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-brand-wine/40 tracking-[0.2em]">{stat.label}</p>
                    <p className="text-4xl font-bold text-brand-wine mt-2">{stat.value}</p>
                  </Card>
                ))}
              </div>

              <div className="grid gap-10 lg:grid-cols-3">
                <Card className="lg:col-span-2 p-10 rounded-[4rem] border-none bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h4 className="font-headline font-bold text-2xl text-brand-wine">Últimas Atualizações</h4>
                      <p className="text-sm text-brand-wine/40 italic">Monitoramento em tempo real do catálogo</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-brand-wine text-[10px] font-bold uppercase tracking-widest">Ver Catálogo <ArrowUpRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                  
                  <div className="space-y-5">
                    {recentProducts?.map((product) => (
                      <div key={product.id} className="flex items-center gap-6 p-5 rounded-[2.5rem] border border-brand-wine/5 hover:bg-brand-blush/30 transition-all group">
                        <div className="relative h-16 w-16 overflow-hidden rounded-[1.5rem] bg-muted shadow-lg">
                          <img src={product.image} className="object-cover h-full w-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-lg truncate text-brand-wine">{product.name || product.title}</p>
                          <p className="text-[10px] text-brand-wine/40 flex items-center gap-2 uppercase tracking-widest font-bold">
                            <Clock className="h-3 w-3" /> Atualizado recentemente
                          </p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="text-xl font-bold text-brand-wine">R$ {product.price}</p>
                          {product.source === 'shopee' && <Badge className="bg-brand-gold/10 text-brand-gold border-none text-[8px] uppercase tracking-tighter">Dropshipping</Badge>}
                        </div>
                        <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl hover:bg-brand-wine hover:text-white transition-colors">
                          <Edit className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-10 rounded-[4rem] border-none bg-brand-wine text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-10 transition-transform group-hover:scale-110 group-hover:rotate-12 duration-1000">
                    <Sparkles className="h-48 w-48" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="h-14 w-14 rounded-[1.5rem] bg-white/10 flex items-center justify-center mb-10 text-brand-gold border border-white/10">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <h4 className="font-headline font-bold text-2xl mb-6">Dropshipping Pro</h4>
                    <p className="text-white/70 leading-relaxed italic text-base mb-10 font-light">
                      "Utilize o importador automático para manter seu catálogo sempre atualizado com as últimas tendências e margens de lucro otimizadas."
                    </p>
                    <Button className="mt-auto bg-brand-gold text-brand-wine hover:bg-white rounded-full font-bold text-[11px] uppercase tracking-[0.2em] h-14 shadow-2xl">
                      Ver Importador
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
            <Card className="p-10 rounded-[4rem] border-none bg-white shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h4 className="font-headline font-bold text-2xl text-brand-wine">Gestão de Catálogo</h4>
                  <p className="text-sm text-brand-wine/40 italic">Configure preços, categorias e destaques</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-wine/30" />
                  <Input placeholder="Buscar peça..." className="pl-12 rounded-full h-12 w-80 bg-brand-blush/30 border-none text-brand-wine placeholder:text-brand-wine/30" />
                </div>
              </div>
              
              <div className="grid gap-6">
                {recentProducts?.map((product) => (
                  <div key={product.id} className="flex items-center gap-8 p-6 rounded-[3rem] border border-brand-wine/5 hover:border-brand-gold/30 transition-all bg-white group shadow-sm hover:shadow-xl">
                    <div className="relative h-28 w-28 overflow-hidden rounded-[2rem] shadow-xl bg-muted">
                      <img src={product.image} className="object-cover h-full w-full group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-brand-gold/10 text-brand-gold border-none font-bold uppercase tracking-widest text-[9px] px-3 py-1">
                          {product.source || 'Manual'}
                        </Badge>
                        <Badge variant="outline" className="border-brand-wine/10 text-brand-wine/60 text-[9px] uppercase tracking-widest px-3 py-1">
                          {product.category}
                        </Badge>
                      </div>
                      <h5 className="font-bold text-xl text-brand-wine mb-2">{product.name || product.title}</h5>
                      <p className="text-sm text-brand-wine/60 line-clamp-1 font-light italic">{product.description}</p>
                    </div>
                    <div className="text-right px-8 border-r border-brand-wine/5">
                      <p className="text-[10px] uppercase font-bold text-brand-wine/30 mb-2 tracking-[0.2em]">Preço Final</p>
                      <p className="text-2xl font-bold text-brand-wine">R$ {product.price}</p>
                    </div>
                    <div className="flex gap-3 pl-4">
                      <Button size="icon" variant="ghost" className="h-14 w-14 rounded-3xl hover:bg-brand-blush/50 text-brand-wine/40 hover:text-brand-wine transition-all">
                        <Edit className="h-6 w-6" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-14 w-14 rounded-3xl hover:bg-destructive/5 text-brand-wine/40 hover:text-destructive transition-all">
                        <Trash2 className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {(activeTab === 'categorias' || activeTab === 'banner' || activeTab === 'config') && (
            <Card className="min-h-[500px] rounded-[5rem] border-dashed border-2 border-brand-wine/10 flex flex-col items-center justify-center text-center bg-white/40 p-20">
              <div className="h-28 w-28 rounded-full bg-white flex items-center justify-center mb-10 shadow-2xl">
                <Settings className="h-10 w-10 text-brand-wine/20 animate-spin-slow" />
              </div>
              <h5 className="text-2xl font-headline font-bold text-brand-wine/40 uppercase tracking-[0.3em]">Refinando Experiência</h5>
              <p className="text-base font-light text-brand-wine/60 mt-4 max-w-sm italic">
                Este módulo está sendo ajustado para oferecer o máximo em sofisticação para a Maison Toda Bela.
              </p>
              <Button variant="outline" className="mt-12 rounded-full border-brand-wine/20 text-brand-wine px-12 h-14 font-bold uppercase tracking-widest text-[11px]" onClick={() => setActiveTab('dashboard')}>
                Retornar ao Painel
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
