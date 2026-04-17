
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
  ChevronRight,
  ExternalLink,
  Edit,
  Trash2
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

  // Fetch some recent products for the list
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
    <section id="admin" className="container mx-auto px-4 py-24 md:px-8 border-t border-primary/5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="max-w-xl">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/60">Management Console</span>
          <h3 className="mt-4 text-4xl font-headline font-semibold text-foreground">Painel Administrativo</h3>
          <p className="mt-4 text-muted-foreground">
            Gerencie o catálogo e acompanhe o desempenho da sua boutique em um só lugar.
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={onOpenAI} className="rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 group">
            <Sparkles className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
            Copywriting IA
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-2">
          <div className="p-6 rounded-[2rem] bg-foreground text-background mb-6 shadow-xl">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60">Status da Loja</p>
            <p className="mt-2 text-xl font-headline font-bold">Online</p>
            <p className="mt-1 text-xs opacity-70">Pronto para receber pedidos</p>
          </div>
          
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 ${
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

          <div className="mt-8 p-6 rounded-[2rem] bg-secondary/50 border border-primary/5">
            <p className="text-xs font-bold text-primary mb-4 uppercase tracking-wider">Atalhos Rápidos</p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2 hover:text-primary cursor-pointer transition-colors">
                <Plus className="h-3 w-3" /> Novo Produto
              </li>
              <li className="flex items-center gap-2 hover:text-primary cursor-pointer transition-colors">
                <ImageIcon className="h-3 w-3" /> Trocar Banners
              </li>
              <li className="flex items-center gap-2 hover:text-primary cursor-pointer transition-colors">
                <ExternalLink className="h-3 w-3" /> Ver Loja ao Vivo
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="space-y-6">
          {/* Stats Header (visible on most tabs) */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <Card key={i} className="p-5 rounded-[1.75rem] border-primary/5 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <Badge variant="outline" className="text-[10px] text-green-600 bg-green-50 border-green-100">+4%</Badge>
                </div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              </Card>
            ))}
          </div>

          {/* Tab Views */}
          {activeTab === 'dashboard' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-8 rounded-[2.5rem] border-primary/5 bg-white shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 text-primary/5">
                  <TrendingUp className="h-32 w-32" />
                </div>
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
                <Button className="w-full mt-8 rounded-full py-6 font-semibold" variant="outline">
                  Ver Relatório Completo
                </Button>
              </Card>

              <Card className="p-8 rounded-[2.5rem] border-primary/5 bg-primary text-primary-foreground shadow-sm flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-headline font-semibold text-xl mb-4">Sugestão Toda Bela AI</h4>
                  <p className="text-primary-foreground/80 leading-relaxed italic text-sm">
                    "A categoria 'Vestidos' teve um aumento de 25% em cliques hoje. Considere destacar o modelo 'Midi Elegance' no banner principal para maximizar as vendas."
                  </p>
                </div>
                <Button variant="secondary" className="w-full mt-6 rounded-full py-6 font-semibold bg-white text-primary hover:bg-white/90">
                  Aplicar Estratégia
                </Button>
              </Card>
            </div>
          )}

          {activeTab === 'produtos' && (
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="p-8 rounded-[2.5rem] border-primary/5 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="font-headline font-semibold text-xl">Cadastrar Novo Produto</h4>
                  <Button size="sm" className="rounded-full">Salvar Alterações</Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Nome do Produto</label>
                    <Input className="rounded-xl" placeholder="Ex: Vestido Midi Satin" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Preço (R$)</label>
                    <Input className="rounded-xl" placeholder="199.90" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground ml-1">URL da Imagem</label>
                    <Input className="rounded-xl" placeholder="https://images.unsplash.com/..." />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Descrição Curta</label>
                    <Textarea className="rounded-2xl min-h-[100px]" placeholder="Descreva os detalhes da peça..." />
                  </div>
                </div>
              </Card>

              <Card className="p-8 rounded-[2.5rem] border-primary/5 bg-white shadow-sm">
                <h4 className="font-headline font-semibold text-xl mb-6">Recém Adicionados</h4>
                <div className="space-y-4">
                  {recentProducts?.map((product) => (
                    <div key={product.id} className="flex items-center gap-4 p-3 rounded-2xl border border-secondary hover:bg-secondary/30 transition-colors">
                      <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-muted">
                        <img src={product.image} className="object-cover h-full w-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{product.name}</p>
                        <p className="text-xs text-primary font-semibold">R$ {product.price}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'categorias' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-8 rounded-[2.5rem] border-primary/5 bg-white shadow-sm">
                <h4 className="font-headline font-semibold text-xl mb-6">Nova Coleção</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Nome da Categoria</label>
                    <Input className="rounded-xl" placeholder="Ex: Vestidos de Festa" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Ordem de Exibição</label>
                    <Input className="rounded-xl" type="number" placeholder="1" />
                  </div>
                  <Button className="w-full rounded-full py-6 font-semibold">Criar Coleção</Button>
                </div>
              </Card>
              <Card className="p-8 rounded-[2.5rem] bg-secondary/20 border-dashed border-2 border-primary/10 flex items-center justify-center text-center">
                <div className="max-w-xs">
                  <Layers className="h-12 w-12 text-primary/20 mx-auto mb-4" />
                  <p className="text-sm font-semibold text-primary/40">Selecione uma coleção à esquerda para gerenciar os produtos vinculados ou editar detalhes.</p>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'banner' && (
            <div className="grid gap-6">
              <Card className="p-8 rounded-[2.5rem] border-primary/5 bg-white shadow-sm">
                <h4 className="font-headline font-semibold text-xl mb-8">Gerenciar Banners do Hero</h4>
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Título do Banner</label>
                      <Input className="rounded-xl" placeholder="Ex: Brisa de Verão" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Subtítulo</label>
                      <Textarea className="rounded-2xl" placeholder="Frase de impacto..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Texto Campanha</label>
                        <Input className="rounded-xl" placeholder="Lançamento" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Status</label>
                        <select className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none">
                          <option>Ativo</option>
                          <option>Inativo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="relative aspect-video rounded-3xl overflow-hidden bg-muted group">
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" className="rounded-full">Trocar Imagem</Button>
                    </div>
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <ImageIcon className="h-12 w-12 opacity-20" />
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-secondary flex justify-end">
                  <Button className="rounded-full px-10 py-6 font-semibold">Salvar Banner</Button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'config' && (
            <Card className="p-8 rounded-[2.5rem] border-primary/5 bg-white shadow-sm">
              <h4 className="font-headline font-semibold text-xl mb-8">Configurações da Plataforma</h4>
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  { title: "Segurança", text: "Regras de acesso ao Firestore e permissões administrativas.", icon: <Settings className="h-5 w-5" /> },
                  { title: "Armazenamento", text: "Gerenciamento de imagens e arquivos no Firebase Storage.", icon: <ImageIcon className="h-5 w-5" /> },
                  { title: "Personalização", text: "Ajustes de cores, fontes e identidade visual da boutique.", icon: <Edit className="h-5 w-5" /> },
                ].map((item, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-secondary/30 border border-white">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-primary mb-4 shadow-sm">
                      {item.icon}
                    </div>
                    <h5 className="font-bold text-base mb-2">{item.title}</h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
