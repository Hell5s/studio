"use client";

import React from 'react';
import { 
  ShoppingBag, 
  Users, 
  Search, 
  TrendingUp, 
  Plus, 
  Image as ImageIcon, 
  Settings, 
  Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AdminDashboardProps {
  productsCount: number;
  categoriesCount: number;
  onOpenAI: () => void;
}

export function AdminDashboard({ productsCount, categoriesCount, onOpenAI }: AdminDashboardProps) {
  const stats = [
    { 
      label: "Produtos Ativos", 
      value: productsCount, 
      icon: <ShoppingBag className="h-5 w-5" />,
      color: "bg-blue-500/10 text-blue-600"
    },
    { 
      label: "Categorias", 
      value: categoriesCount, 
      icon: <Search className="h-5 w-5" />,
      color: "bg-purple-500/10 text-purple-600"
    },
    { 
      label: "Novos Leads", 
      value: "12", 
      icon: <Users className="h-5 w-5" />,
      color: "bg-green-500/10 text-green-600"
    },
    { 
      label: "Conversão", 
      value: "3.2%", 
      icon: <TrendingUp className="h-5 w-5" />,
      color: "bg-orange-500/10 text-orange-600"
    },
  ];

  return (
    <section id="admin" className="container mx-auto px-4 py-24 md:px-8 border-t border-primary/5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="max-w-xl">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/60">Management Console</span>
          <h3 className="mt-4 text-4xl font-headline font-semibold text-foreground">Painel Administrativo</h3>
          <p className="mt-4 text-muted-foreground">
            Acompanhe o desempenho da sua loja e gerencie o catálogo com facilidade.
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={onOpenAI} className="rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 group">
            <Sparkles className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
            Gerar com IA
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 rounded-[2rem] border-primary/5 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+4%</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-8 rounded-[2.5rem] border-primary/5 bg-white shadow-sm">
          <h4 className="font-headline font-semibold text-xl mb-8">Ações Rápidas de Catálogo</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" className="h-24 rounded-3xl border-primary/10 hover:bg-secondary/50 justify-start px-8 group">
              <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center mr-5 transition-colors group-hover:bg-primary/10">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-base text-foreground">Adicionar Produto</p>
                <p className="text-xs text-muted-foreground">Cadastrar nova peça</p>
              </div>
            </Button>
            <Button variant="outline" className="h-24 rounded-3xl border-primary/10 hover:bg-secondary/50 justify-start px-8 group">
              <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center mr-5 transition-colors group-hover:bg-primary/10">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-base text-foreground">Gerenciar Banners</p>
                <p className="text-xs text-muted-foreground">Trocar campanhas hero</p>
              </div>
            </Button>
            <Button variant="outline" className="h-24 rounded-3xl border-primary/10 hover:bg-secondary/50 justify-start px-8 group">
              <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center mr-5 transition-colors group-hover:bg-primary/10">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-base text-foreground">Configurações</p>
                <p className="text-xs text-muted-foreground">Ajustes gerais da loja</p>
              </div>
            </Button>
            <Button onClick={onOpenAI} variant="outline" className="h-24 rounded-3xl border-primary/10 hover:bg-primary/5 justify-start px-8 group">
              <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center mr-5 transition-colors group-hover:bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-base text-foreground">Copywriting IA</p>
                <p className="text-xs text-muted-foreground">Gerar textos com IA</p>
              </div>
            </Button>
          </div>
        </Card>

        <Card className="p-8 rounded-[2.5rem] border-primary/5 bg-primary text-primary-foreground shadow-sm flex flex-col justify-between">
          <div>
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-headline font-semibold text-xl mb-4">Sugestão Toda Bela AI</h4>
            <p className="text-primary-foreground/80 leading-relaxed italic">
              "A categoria 'Vestidos' teve um aumento de 25% em cliques nesta tarde. Considere destacar o modelo 'Midi Elegance' no banner principal para maximizar as vendas hoje."
            </p>
          </div>
          <Button variant="secondary" className="w-full mt-8 rounded-full py-6 font-semibold bg-white text-primary hover:bg-white/90">
            Aplicar Sugestão
          </Button>
        </Card>
      </div>
    </section>
  );
}
