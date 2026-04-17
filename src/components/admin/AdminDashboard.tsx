
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
  X
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
    { id: 'produtos', label: 'Produtos', icon: <Package className="h-4 w-4" /> },
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
      <div className="flex items-center justify-between p-8 border-b border-primary/5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/60 leading-none">Management Console</span>
          <h3 className="mt-2 text-3xl font-headline font-semibold text-foreground">Painel Administrativo</h3>
        </div>
        <div className="flex gap-4">
          <Button onClick={onOpenAI} variant="outline" className="rounded-full bg-secondary/30 border-primary/10">
            <Sparkles className="mr-2 h-4 w-4" />
            Copywriting IA
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-4">
            <div className="p-6 rounded-[2rem] bg-foreground text-background shadow-lg">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60">Status</p>
              <p className="mt-1 text-lg font-headline font-bold">Online</p>
            </div>
            
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === tab.id 
                      ? "bg-primary text-white shadow-md shadow-primary/20" 
                      : "text-muted-foreground hover:bg-secondary hover:text-primary"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          <main className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <Card key={i} className="p-5 rounded-[1.75rem] border-primary/5 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-xl ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </Card>
              ))}
            </div>

            {activeTab === 'dashboard' && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-8 rounded-[2rem] border-primary/5 bg-white">
                  <h4 className="font-headline font-semibold text-xl mb-6">Resumo da Operação</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-5 rounded-2xl bg-secondary/40">
                      <p className="text-xs font-bold text-muted-foreground uppercase">Vendas Hoje</p>
                      <p className="text-2xl font-bold text-primary mt-1">R$ 1.284,90</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-secondary/40">
                      <p className="text-xs font-bold text-muted-foreground uppercase">Ticket Médio</p>
                      <p className="text-2xl font-bold text-primary mt-1">R$ 164,00</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 rounded-[2rem] border-primary/5 bg-primary text-primary-foreground">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center mb-6 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h4 className="font-headline font-semibold text-xl mb-4">Sugestão Toda Bela AI</h4>
                  <p className="text-primary-foreground/80 leading-relaxed italic text-sm">
                    "A categoria 'Vestidos' teve um aumento de 25% em cliques hoje. Considere destacar o modelo 'Midi Elegance' no banner principal para maximizar as vendas."
                  </p>
                </Card>
              </div>
            )}

            {activeTab === 'produtos' && (
              <Card className="p-8 rounded-[2rem] border-primary/5 bg-white">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="font-headline font-semibold text-xl">Gestão de Catálogo</h4>
                  <Button size="sm" className="rounded-full">Adicionar Peça</Button>
                </div>
                <div className="space-y-4">
                  {recentProducts?.map((product) => (
                    <div key={product.id} className="flex items-center gap-4 p-4 rounded-2xl border border-secondary hover:bg-secondary/20 transition-colors">
                      <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-muted">
                        <img src={product.image} className="object-cover h-full w-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{product.name}</p>
                        <p className="text-xs text-primary font-semibold">R$ {product.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Outras abas simplificadas para o MVP */}
            {(activeTab === 'categorias' || activeTab === 'banner' || activeTab === 'config') && (
              <Card className="p-20 rounded-[2rem] border-dashed border-2 border-primary/10 flex items-center justify-center text-center">
                <div className="max-w-xs">
                  <Settings className="h-12 w-12 text-primary/20 mx-auto mb-4" />
                  <p className="text-sm font-semibold text-primary/40">Esta funcionalidade está em desenvolvimento para o seu console administrativo.</p>
                </div>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
