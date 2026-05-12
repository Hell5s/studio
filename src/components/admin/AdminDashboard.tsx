"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  Layout,
  Bell,
  BellRing,
  ChevronRight,
  Clock,
  Star,
  Megaphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useMemoFirebase, useFirestore, useCollection, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, onSnapshot, collection, query, orderBy, limit, where } from 'firebase/firestore';
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
import { AdminReviews } from './AdminReviews';
import { AdminMarketing } from './AdminMarketing';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminDashboardProps {
  productsCount: number;
  categoriesCount: number;
  onOpenAI: () => void;
  onExit?: () => void;
}

type AdminTab = 'overview' | 'orders' | 'products' | 'categories' | 'reviews' | 'coupons' | 'customers' | 'appearance' | 'reports' | 'settings' | 'header' | 'marketing';

export function AdminDashboard({ productsCount, categoriesCount, onOpenAI, onExit }: AdminDashboardProps) {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  
  // Real-time Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const initialLoadRef = useRef(true);

  const adminDocRef = useMemoFirebase(() => {
    return user ? doc(db, 'roles_admin', user.uid) : null;
  }, [db, user]);
  const { data: adminRole, isLoading: isAdminLoading } = useDoc(adminDocRef);
  const isAdmin = !!adminRole;

  // Pending Reviews Count
  const pendingReviewsQuery = useMemoFirebase(() => query(collection(db, 'reviews'), where('status', '==', 'pending')), [db]);
  const { data: pendingReviews } = useCollection(pendingReviewsQuery);
  const pendingReviewsCount = pendingReviews?.length || 0;

  // Sound Notification Helper
  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('Som de notificação bloqueado pelo navegador');
    }
  };

  // Load read status from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tb_admin_read_orders');
    if (saved) {
      try {
        setReadIds(new Set(JSON.parse(saved)));
      } catch (e) {
        console.warn("Erro ao ler notificações salvas");
      }
    }
  }, []);

  // Sync real-time orders
  // CRITICAL FIX: Removed toast from dependencies to prevent infinite loop of re-subscriptions
  // as useToast returns a new object on every render.
  useEffect(() => {
    if (!db || !isAdmin) return;

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(10));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const orders: any[] = [];
        snapshot.forEach((doc) => {
          orders.push({ id: doc.id, ...doc.data() });
        });

        if (!initialLoadRef.current) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const newOrder = change.doc.data();
              // Accessing toast via ref or ensuring the effect doesn't re-run
              toast({
                title: "🛍️ Novo Pedido!",
                description: `Pedido #${newOrder.orderNumber} - R$ ${newOrder.total?.toFixed(2)}`,
                duration: 5000,
              });
              playNotificationSound();
            }
          });
        }

        setNotifications(orders);
        initialLoadRef.current = false;
      },
      (error) => {
        setTimeout(() => {
          const permissionError = new FirestorePermissionError({
            path: 'orders',
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
        }, 0);
      }
    );

    return () => unsubscribe();
  }, [db, isAdmin]); // toast removed from here

  const markAsRead = (id: string) => {
    const newReadIds = new Set(readIds);
    newReadIds.add(id);
    setReadIds(newReadIds);
    localStorage.setItem('tb_admin_read_orders', JSON.stringify(Array.from(newReadIds)));
  };

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

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
    { id: 'marketing', label: 'Marketing', icon: <Megaphone className="h-4 w-4" /> },
    { id: 'reviews', label: 'Avaliações', icon: <Star className="h-4 w-4" />, badge: pendingReviewsCount },
    { id: 'header', label: 'Cabeçalho', icon: <Layout className="h-4 w-4" /> },
    { id: 'coupons', label: 'Cupons', icon: <Tag className="h-4 w-4" /> },
    { id: 'customers', label: 'Clientes', icon: <Users className="h-4 w-4" /> },
    { id: 'appearance', label: 'Aparência', icon: <Palette className="h-4 w-4" /> },
    { id: 'reports', label: 'Relatórios', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'settings', label: 'Configurações', icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <div className="flex h-screen bg-[#F4F6F8] overflow-hidden font-sans">
      {/* Sidebar */}
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
                "w-full text-left px-4 py-3 rounded-xl text-[12px] font-medium transition-all flex items-center gap-3 relative",
                activeTab === item.id 
                  ? "bg-white/10 text-accent" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              {item.icon}
              {item.label}
              {(item.badge ?? 0) > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 h-4 min-w-4 px-1 rounded-full bg-accent text-primary text-[8px] font-black flex items-center justify-center shadow-lg">
                  {item.badge}
                </span>
              )}
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
          
          <div className="flex gap-4 items-center">
            <Button 
              onClick={onOpenAI} 
              variant="outline" 
              className="rounded-full border-accent/20 text-accent hover:bg-accent/5 h-10 px-5 font-bold text-[10px] uppercase tracking-widest"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Redator IA
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative h-10 w-10 rounded-full bg-secondary flex items-center justify-center border border-primary/5 cursor-pointer hover:bg-accent/10 transition-colors">
                  {unreadCount > 0 ? (
                    <BellRing className="h-5 w-5 text-accent animate-bounce" />
                  ) : (
                    <Bell className="h-5 w-5 text-primary/40" />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow-lg border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[320px] rounded-2xl border-none shadow-premium p-0 overflow-hidden bg-white mt-2">
                <DropdownMenuLabel className="bg-primary p-5 text-white font-headline text-lg">
                  Novidades da Boutique
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="m-0" />
                <div className="max-h-[350px] overflow-y-auto py-2 no-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((order) => (
                      <DropdownMenuItem 
                        key={order.id} 
                        onClick={() => {
                          markAsRead(order.id);
                          setActiveTab('orders');
                        }}
                        className={cn(
                          "px-5 py-4 cursor-pointer flex gap-4 transition-colors",
                          !readIds.has(order.id) ? "bg-accent/5" : "opacity-60"
                        )}
                      >
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold shrink-0">
                          {order.customer?.name?.[0].toUpperCase() || '#'}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex justify-between items-start">
                            <p className="text-[11px] font-bold text-primary truncate">#{order.orderNumber}</p>
                            <p className="text-[10px] font-bold text-accent">R$ {order.total?.toFixed(2)}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">{order.customer?.name}</p>
                          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground uppercase font-black tracking-tighter">
                            <Clock className="h-2.5 w-2.5" /> 
                            {order.createdAt ? new Date(order.createdAt?.toDate ? order.createdAt.toDate() : order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </div>
                        </div>
                        {!readIds.has(order.id) && (
                          <div className="h-2 w-2 rounded-full bg-accent mt-2 shrink-0" />
                        )}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="py-12 text-center space-y-3">
                       <ShoppingBag className="h-10 w-10 text-primary/5 mx-auto" />
                       <p className="text-[10px] font-bold uppercase tracking-widest text-primary/20">Sem pedidos recentes</p>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator className="m-0" />
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="w-full py-4 text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent/5 transition-colors flex items-center justify-center gap-2"
                >
                  Ver todos os pedidos <ChevronRight className="h-3 w-3" />
                </button>
              </DropdownMenuContent>
            </DropdownMenu>

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
            {activeTab === 'marketing' && <AdminMarketing />}
            {activeTab === 'categories' && <AdminCategories />}
            {activeTab === 'reviews' && <AdminReviews />}
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