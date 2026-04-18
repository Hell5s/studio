
"use client";

import React, { useState } from 'react';
import { ShoppingBag, Users, PlusCircle, Settings, Sparkles, LayoutDashboard, Package, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdminDashboardProps {
  productsCount: number;
  categoriesCount: number;
  onOpenAI: () => void;
  onExit?: () => void;
}

export function AdminDashboard({ productsCount, categoriesCount, onOpenAI, onExit }: AdminDashboardProps) {
  const stats = [
    { label: "Vendas Totais", value: "R$ 0,00", icon: <ShoppingBag className="h-5 w-5" />, color: "bg-primary/10 text-primary" },
    { label: "Produtos Ativos", value: productsCount, icon: <Package className="h-5 w-5" />, color: "bg-accent/10 text-accent" },
    { label: "Novas Clientes", value: "0", icon: <Users className="h-5 w-5" />, color: "bg-green-50 text-green-600" },
    { label: "Coleções", value: "5", icon: <Layers className="h-5 w-5" />, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="flex h-full bg-background overflow-hidden">
      <aside className="w-64 bg-white border-r border-primary/5 p-8 flex flex-col gap-10">
        <div className="px-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-2">Painel de Gestão</p>
          <h3 className="text-xl font-headline font-bold text-primary">Boutique Toda Bela</h3>
        </div>

        <nav className="flex-1 space-y-2">
          {['Visão Geral', 'Pedidos', 'Catálogo', 'Clientes', 'Mídia'].map((item) => (
            <button key={item} className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary hover:text-primary transition-all">
              {item}
            </button>
          ))}
        </nav>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={onExit}
          className="w-full text-[9px] h-12 rounded-xl border-primary/10 text-primary hover:bg-secondary uppercase tracking-widest font-bold"
        >
          Sair do Painel
        </Button>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-primary/5 px-10 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-primary">Dashboard Editorial</h2>
          <div className="flex gap-4">
            <Button onClick={onOpenAI} variant="ghost" className="rounded-full text-primary hover:bg-secondary h-11 px-6 font-bold text-[10px] uppercase tracking-widest">
              <Sparkles className="mr-2 h-4 w-4" />
              Copys com IA
            </Button>
            <Button className="rounded-full bg-primary text-white font-bold text-[10px] px-8 h-11 shadow-xl shadow-primary/20 uppercase tracking-widest">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <Card key={i} className="p-8 rounded-[2rem] border-none bg-white shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-4 rounded-2xl ${stat.color}`}>{stat.icon}</div>
                  <Badge variant="outline" className="text-[10px] border-primary/10 text-primary bg-secondary/20">Tempo Real</Badge>
                </div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em]">{stat.label}</p>
                <p className="text-3xl font-bold text-primary mt-2">{stat.value}</p>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="p-10 rounded-[3rem] border-none bg-white shadow-xl h-[400px] flex items-center justify-center text-center">
              <div className="space-y-4">
                <LayoutDashboard className="h-12 w-12 text-accent/20 mx-auto" />
                <p className="text-sm text-muted-foreground italic">Gráficos de vendas em sincronização...</p>
              </div>
            </Card>
            <Card className="p-10 rounded-[3rem] border-none bg-white shadow-xl h-[400px] flex items-center justify-center text-center">
              <div className="space-y-4">
                <ShoppingBag className="h-12 w-12 text-accent/20 mx-auto" />
                <p className="text-sm text-muted-foreground italic">Pedidos recentes aparecerão aqui.</p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
