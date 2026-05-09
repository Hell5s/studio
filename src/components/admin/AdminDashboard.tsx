
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
  Tag,
  BarChart3,
  LogOut,
  Palette,
  Loader2,
  Layout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ProductManagement } from './ProductManagement';
import { OrderManagement } from './OrderManagement';
import { BannerManagement } from './BannerManagement';
import { AdminOverview } from './AdminOverview';
import { AdminCustomers } from './AdminCustomers';
import { AdminCoupons } from './AdminCoupons';
import { AdminReports } from './AdminReports';
import { AdminSettings } from './AdminSettings';
import { AdminCategories } from './AdminCategories';
import { AddProductDialog } from './AddProductDialog';
import { AdminHeaderSettings } from './AdminHeaderSettings';

interface AdminDashboardProps {
  productsCount: number;
  categoriesCount: number;
  onOpenAI: () => void;
  onExit?: () => void;
}

type AdminTab = 'overview' | 'orders' | 'products' | 'categories' | 'coupons' | 'customers' | 'appearance' | 'reports' | 'settings' | 'header';

export function AdminDashboard({ productsCount, categoriesCount, onOpenAI, onExit }: AdminDashboardProps) {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const adminDocRef = useMemoFirebase(() => {
    return user ? doc(db, 'roles_admin', user.uid) : null;
  }, [db, user]);
  const { data: adminRole, isLoading: isAdminLoading } = useDoc(adminDocRef);
  const isAdmin = !!adminRole;

  if (isUserLoading || isAdminLoading) {
    return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-accent" /></div>;
  }

  if (!isAdmin) {
    return null;
  }

  const menuItems = [
    { id: 'overview', label: 'Início', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'orders', label: 'Pedidos', icon: <Truck className="h-4 w-4" /> },
    { id: 'products', label: 'Produtos', icon: <Package className="h-4 w-4" /> },
    { id: 'categories', label: 'Categorias', icon: <Layers className="h-4 w-4" /> },
    { id: 'header', label: 'Cabeçalho', icon: <Layout className="h-4 w-4" /> },
    { id: 'coupons', label: 'Cupons', icon: <Tag className="h-4 w-4" /> },
    { id: 'customers', label: 'Clientes', icon: <Users className="h-4 w-4" /> },
    { id: 'appearance', label: 'Aparência', icon: <Palette className="h-4 w-4" /> },
    { id: 'reports', label: 'Relatórios', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'settings', label: 'Configurações', icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <div className="flex h-screen bg-[#F4F6F8] overflow-hidden font-sans">
      {/* Sidebar - Estilo Nuvemshop Profissional */}
      <aside className="w-64 bg-[#2A1F22] text-white flex flex-col shadow-2xl relative z-20">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-primary font-bold">TB</div>
             <h3 className="text-lg font-headline font-bold text-white tracking-tight">Toda Bela Admin</h3>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 no-scrollbar">
          <button 
            onClick={() => setIsAddProductOpen(true)}
            className="w-full mb-6 bg-accent text-primary font-bold text-[11px] px-4 py-3.5 rounded-xl shadow-lg uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Criar Produto
          </button>

          {menuItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl text-[12px] font-medium transition-all flex items-center gap-3",
                activeTab === item.id 
                  ? "bg-white/10 text-accent" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2">
          <button 
            onClick={onExit}
            className="w-full text-white/40 hover:text-white text-[11px] font-bold uppercase tracking-wider py-2 flex items-center gap-2 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair da Loja
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white border-b border-gray-200 px-10 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
             <h1 className="text-xl font-bold text-primary">
               {menuItems.find(i => i.id === activeTab)?.label}
             </h1>
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={onOpenAI} 
              variant="outline" 
              className="rounded-full border-accent/20 text-accent hover:bg-accent/5 h-10 px-5 font-bold text-[10px] uppercase tracking-widest"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Redator IA
            </Button>
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center border border-primary/5 cursor-pointer hover:bg-accent/10 transition-colors">
               <Users className="h-4 w-4 text-primary" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {activeTab === 'overview' && <AdminOverview onNavigate={setActiveTab} />}
            {activeTab === 'products' && <ProductManagement />}
            {activeTab === 'orders' && <OrderManagement />}
            {activeTab === 'categories' && <AdminCategories />}
            {activeTab === 'header' && <AdminHeaderSettings />}
            {activeTab === 'coupons' && <AdminCoupons />}
            {activeTab === 'customers' && <AdminCustomers />}
            {activeTab === 'appearance' && <BannerManagement />}
            {activeTab === 'reports' && <AdminReports />}
            {activeTab === 'settings' && <AdminSettings />}
          </div>
        </div>
      </main>

      <AddProductDialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen} />
    </div>
  );
}
