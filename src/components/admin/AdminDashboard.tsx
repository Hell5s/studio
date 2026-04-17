
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
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

interface AdminDashboardProps {
  productsCount: number;
  categoriesCount: number;
  onOpenAI: () => void;
}

export function AdminDashboard({ productsCount, categoriesCount, onOpenAI }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'produtos' | 'categorias' | 'banner' | 'config'>('dashboard');
  const db = useFirestore();

  const recentProductsQuery = useMemoFirebase(() => {
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(5));
  }, [db]);
  const { data: recentProducts } = useCollection(recentProductsQuery);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'produtos', label: 'Catálogo', icon: <Package className="h-4 w-4" /> },
    { id: 'categorias', label: 'Coleções', icon: <Layers className="h-4 w-4" /> },
    { id: 'banner', label: 'Conteúdo', icon: <FileText className="h-4 w-4" /> },
    { id: 'config', label: 'Ajustes', icon: <Settings className="h-4 w-4" /> },
  ];

  const stats = [
    { label: "Produtos Ativos", value: productsCount, icon: <ShoppingBag className="h-5 w-5" />, color: "bg-blue-500/10 text-blue-600" },
    { label: "Categorias", value: categoriesCount, icon: <Search className="h-5 w-5" />, color: "bg-purple-500/10 text-purple-600" },
    { label: "Novos Leads", value: "12", icon: <Users className="h-5 w-5" />, color: "bg-green-500/10 text-green-600" },
    { label: "Conversão", value: "3.2%", icon: <TrendingUp className="h-5 w-5" />, color: "bg-orange-500/10 text-orange-600" },
  ];

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex items-center justify-between p-8 border-b border-primary/5 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/60 leading-none">Management Console</span>
          <h3 className="mt-2 text-3xl font-headline font-semibold text-foreground">Painel Toda Bela</h3>
        </div>
        <div className="flex gap-4">
          <Button onClick={onOpenAI} variant="outline" className="rounded-full bg-primary/5 border-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
            <Sparkles className="mr-2 h-4 w-4" />
            Copywriting IA
          </Button>
          <Button className="rounded-full shadow-lg shadow-primary/10">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-4">
            <div className="p-6 rounded-[2rem] bg-foreground text-background shadow-lg group">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60">Status Boutique</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-lg font-headline font-bold">Online</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === tab.id 
                      ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]" 
                      : "text-muted-foreground hover:bg-secondary hover:text-primary"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-8 p-6 rounded-[2rem] bg-secondary/30 border border-primary/5">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary/60 mb-4">Acesso Rápido</p>
              <ul className="space-y-3 text-sm font-medium text-muted-foreground">
                <li className="flex items-center gap-2 hover:text-primary cursor-pointer transition-colors">
                  <Eye className="h-4 w-4" /> Ver Loja ao Vivo
                </li>
                <li className="flex items-center gap-2 hover:text-primary cursor-pointer transition-colors">
                  <ImageIcon className="h-4 w-4" /> Editar Banners
                </li>
              </ul>
            </div>
          </aside>

          <main className="space-y-8 pb-12">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <Card key={i} className="p-6 rounded-[2rem] border-primary/5 bg-white hover:shadow-xl transition-all duration-500 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${stat.color} transition-transform group-hover:scale-110`}>
                      {stat.icon}
                    </div>
                    <Badge variant="outline" className="text-[10px] border-green-500/20 text-green-600 bg-green-50">
                      +4.2%
                    </Badge>
                  </div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                </Card>
              ))}
            </div>

            {activeTab === 'dashboard' && (
              <div className="grid gap-8 lg:grid-cols-2">
                <Card className="p-8 rounded-[2.5rem] border-primary/5 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="font-headline font-semibold text-xl">Desempenho de Vendas</h4>
                    <Button variant="ghost" size="sm" className="text-primary text-xs font-bold">Ver Relatório</Button>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="p-6 rounded-[2rem] bg-secondary/40 border border-white">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Vendas Hoje</p>
                      <p className="text-3xl font-bold text-primary mt-2">R$ 1.284,90</p>
                      <p className="text-[10px] text-green-600 mt-2 font-bold">12 pedidos realizados</p>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-secondary/40 border border-white">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Ticket Médio</p>
                      <p className="text-3xl font-bold text-primary mt-2">R$ 164,00</p>
                      <p className="text-[10px] text-primary/60 mt-2 font-bold">Acima da média set/23</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 rounded-[2.5rem] border-primary/5 bg-primary text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110 group-hover:rotate-12 duration-700">
                    <Sparkles className="h-32 w-32" />
                  </div>
                  <div className="relative z-10">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-8 text-white border border-white/20">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h4 className="font-headline font-semibold text-2xl mb-4">Insights Toda Bela AI</h4>
                    <p className="text-primary-foreground/90 leading-relaxed italic text-base mb-8">
                      "A categoria 'Vestidos' teve um aumento de 25% em cliques hoje. Considere destacar o modelo 'Midi Elegance' no banner principal para maximizar as vendas."
                    </p>
                    <Button className="bg-white text-primary hover:bg-secondary rounded-full font-bold px-8">
                      Aplicar Estratégia
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'produtos' && (
              <Card className="p-8 rounded-[2.5rem] border-primary/5 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h4 className="font-headline font-semibold text-xl">Gestão de Catálogo</h4>
                    <p className="text-sm text-muted-foreground mt-1">Gerencie as peças em exibição na sua vitrine</p>
                  </div>
                  <Button size="sm" className="rounded-full px-6">Nova Peça</Button>
                </div>
                <div className="space-y-4">
                  {recentProducts?.map((product) => (
                    <div key={product.id} className="flex items-center gap-4 p-4 rounded-3xl border border-secondary hover:bg-secondary/20 transition-all group cursor-pointer">
                      <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-muted shadow-sm">
                        <img src={product.image} className="object-cover h-full w-full transition-transform group-hover:scale-110 duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-base truncate text-foreground">{product.name}</p>
                        <p className="text-xs text-primary font-bold uppercase tracking-widest mt-0.5">R$ {product.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full text-muted-foreground hover:text-primary hover:bg-white shadow-sm transition-all">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {(activeTab === 'categorias' || activeTab === 'banner' || activeTab === 'config') && (
              <Card className="p-24 rounded-[3rem] border-dashed border-2 border-primary/10 flex items-center justify-center text-center bg-secondary/5">
                <div className="max-w-xs">
                  <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Settings className="h-8 w-8 text-primary/30 animate-spin-slow" />
                  </div>
                  <p className="text-lg font-headline font-bold text-primary/60">Quase lá!</p>
                  <p className="text-sm font-medium text-primary/40 mt-2">Esta funcionalidade está sendo preparada para o seu console administrativo.</p>
                </div>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
