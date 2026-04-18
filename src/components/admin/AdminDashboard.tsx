
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
  ArrowLeft,
  Truck,
  Image as ImageIcon,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ProductManagement } from './ProductManagement';
import { OrderManagement } from './OrderManagement';
import { BannerManagement } from './BannerManagement';
import { AdminShopeeImport } from './AdminShopeeImport';
import { AddProductDialog } from './AddProductDialog';

interface AdminDashboardProps {
  productsCount: number;
  categoriesCount: number;
  onOpenAI: () => void;
  onExit?: () => void;
}

type AdminTab = 'overview' | 'orders' | 'products' | 'media' | 'shopee';

export function AdminDashboard({ productsCount, categoriesCount, onOpenAI, onExit }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'orders', label: 'Pedidos', icon: <Truck className="h-4 w-4" /> },
    { id: 'products', label: 'Catálogo', icon: <Package className="h-4 w-4" /> },
    { id: 'media', label: 'Mídia / Banners', icon: <ImageIcon className="h-4 w-4" /> },
    { id: 'shopee', label: 'Importar Shopee', icon: <Download className="h-4 w-4" /> },
  ];

  const stats = [
    { label: "Vendas Totais", value: "R$ 0,00", icon: <ShoppingBag className="h-5 w-5" />, color: "bg-primary/10 text-primary" },
    { label: "Produtos Ativos", value: productsCount, icon: <Package className="h-5 w-5" />, color: "bg-accent/10 text-accent" },
    { label: "Novas Clientes", value: "0", icon: <Users className="h-5 w-5" />, color: "bg-green-50 text-green-600" },
    { label: "Coleções", value: "5", icon: <Layers className="h-5 w-5" />, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="flex h-screen bg-[#FFF9F7] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-primary/5 p-8 flex flex-col gap-10 shadow-sm">
        <div className="px-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-2">Painel de Gestão</p>
          <h3 className="text-2xl font-headline font-bold text-primary">Toda Bela</h3>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={cn(
                "w-full text-left px-5 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-3",
                activeTab === item.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                  : "text-muted-foreground hover:bg-secondary hover:text-primary"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExit}
            className="w-full text-[9px] h-12 rounded-2xl border-primary/10 text-primary hover:bg-secondary uppercase tracking-widest font-bold gap-2"
          >
            <ArrowLeft className="h-3 w-3" />
            Sair do Painel
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 bg-white border-b border-primary/5 px-10 flex items-center justify-between shadow-sm z-10">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-accent">Área Administrativa</h2>
            <h1 className="text-xl font-headline font-bold text-primary">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={onOpenAI} 
              variant="ghost" 
              className="rounded-full text-primary hover:bg-secondary h-12 px-6 font-bold text-[10px] uppercase tracking-widest border border-primary/5"
            >
              <Sparkles className="mr-2 h-4 w-4 text-accent" />
              Copys com IA
            </Button>
            <Button 
              onClick={() => setIsAddProductOpen(true)}
              className="rounded-full bg-primary text-white font-bold text-[10px] px-8 h-12 shadow-xl shadow-primary/20 uppercase tracking-widest hover:scale-105 transition-transform"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-[#FFF9F7]/50">
          {activeTab === 'overview' && (
            <div className="space-y-10 animate-in fade-in duration-700">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                  <Card key={i} className="p-8 rounded-[2.5rem] border-none bg-white shadow-xl hover:shadow-2xl transition-all duration-500 group">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`p-4 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform`}>{stat.icon}</div>
                      <Badge variant="outline" className="text-[10px] border-primary/10 text-primary bg-secondary/20">Tempo Real</Badge>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em]">{stat.label}</p>
                    <p className="text-3xl font-bold text-primary mt-2">{stat.value}</p>
                  </Card>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <Card className="p-10 rounded-[3rem] border-none bg-white shadow-xl h-[450px] flex items-center justify-center text-center">
                  <div className="space-y-6">
                    <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mx-auto">
                      <LayoutDashboard className="h-10 w-10 text-accent/40" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-headline font-bold text-primary">Desempenho de Vendas</h4>
                      <p className="text-sm text-muted-foreground italic max-w-xs mx-auto">Gráficos e métricas avançadas estarão disponíveis após as primeiras vendas.</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-10 rounded-[3rem] border-none bg-white shadow-xl h-[450px] flex items-center justify-center text-center">
                  <div className="space-y-6">
                    <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mx-auto">
                      <ShoppingBag className="h-10 w-10 text-accent/40" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-headline font-bold text-primary">Atividade Recente</h4>
                      <p className="text-sm text-muted-foreground italic max-w-xs mx-auto">O fluxo de pedidos e novos cadastros aparecerá nesta seção em tempo real.</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'media' && <BannerManagement />}
          {activeTab === 'shopee' && <AdminShopeeImport />}
        </div>
      </main>

      <AddProductDialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen} />
    </div>
  );
}
