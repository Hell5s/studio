
"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/store/Navbar';
import { Hero } from '@/components/store/Hero';
import { ProductCard } from '@/components/store/ProductCard';
import { Newsletter } from '@/components/store/Newsletter';
import { Footer } from '@/components/store/Footer';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { OrderTrackingDialog } from '@/components/store/OrderTrackingDialog';
import { MyOrdersDialog } from '@/components/store/MyOrdersDialog';
import { CheckoutDialog } from '@/components/store/CheckoutDialog';
import { FavoritesDialog } from '@/components/store/FavoritesDialog';
import { AIProductGenerator } from '@/components/admin/AIProductGenerator';
import { Loader2, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

function StorefrontContent() {
  const db = useFirestore();
  const { user } = useUser();
  const searchParams = useSearchParams();
  
  // Estados de Interface
  const [isAdminView, setIsAdminView] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Verificação de Admin (Segurança Real)
  const adminDocRef = useMemoFirebase(() => {
    return user ? doc(db, 'roles_admin', user.uid) : null;
  }, [db, user]);
  const { data: adminRole } = useDoc(adminDocRef);
  const isAdmin = !!adminRole;

  // Ativa visão de admin via parâmetro de URL
  useEffect(() => {
    if (searchParams.get('admin') === 'true' && isAdmin) {
      setIsAdminView(true);
    }
  }, [searchParams, isAdmin]);

  // Carrinho
  const [cart, setCart] = useState<any[]>([]);
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + (item.quantity || 0), 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 0)), 0), [cart]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: (item.quantity || 0) + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Consulta de Produtos e Categorias
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  }, [db]);
  const { data: storeProducts, isLoading } = useCollection(productsQuery);

  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('order', 'asc'));
  }, [db]);
  const { data: categories } = useCollection(categoriesQuery);

  // Filtragem de Busca e Categoria
  const filteredProducts = useMemo(() => {
    if (!storeProducts) return [];
    let result = [...storeProducts];
    
    const search = searchQuery.toLowerCase().trim();
    if (search) {
      result = result.filter(p => 
        p.name?.toLowerCase().includes(search) || 
        p.id?.toLowerCase().includes(search) ||
        p.category?.toLowerCase().includes(search)
      );
    }

    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    return result;
  }, [storeProducts, searchQuery, selectedCategory]);

  const featuredProducts = useMemo(() => {
    if (selectedCategory) return filteredProducts;
    return filteredProducts.filter(p => p.featured || p.badge === 'Destaque' || p.badge === 'Lançamento').slice(0, 8);
  }, [filteredProducts, selectedCategory]);

  const latestProducts = useMemo(() => 
    filteredProducts.filter(p => p.published !== false).slice(0, 10), 
  [filteredProducts]);

  const handleSearch = (val: string) => {
    setSearchValue(val);
    if (val) {
      const el = document.getElementById('vitrine');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (catName: string) => {
    if (selectedCategory === catName) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(catName);
      const el = document.getElementById('vitrine');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Se estiver no modo Admin, exibe o Dashboard completo
  if (isAdminView && isAdmin) {
    return (
      <div className="h-screen bg-background">
        <AdminDashboard 
          productsCount={storeProducts?.length || 0}
          categoriesCount={categories?.length || 0}
          onOpenAI={() => setIsAIOpen(true)}
          onExit={() => setIsAdminView(false)}
        />
        <AIProductGenerator open={isAIOpen} onOpenChange={setIsAIOpen} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-accent/30 selection:text-primary overflow-x-hidden">
      <Navbar 
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenCart={() => setIsCheckoutOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        cartCount={cartCount}
        isAdmin={isAdmin} 
        onOpenAdmin={() => setIsAdminView(true)}
        onSearch={handleSearch}
      />

      <main>
        <Hero onShopNow={() => document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth' })} />

        {/* Seção de Vitrine (Novidades ou Categoria Filtrada) */}
        <section id="vitrine" className="container mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-4 md:pb-8 overflow-hidden scroll-mt-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 gap-4">
            <div className="space-y-2 md:space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-6 md:w-8 bg-accent" />
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-accent">
                  {selectedCategory ? 'Explorando' : 'Novidades'}
                </span>
              </div>
              <h2 className="text-3xl md:text-7xl font-headline font-bold text-primary text-editorial">
                {selectedCategory || 'Lançamentos'}
              </h2>
            </div>
            
            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent border border-accent/20 px-6 py-3 rounded-full hover:bg-accent hover:text-white transition-all shadow-sm"
              >
                <X className="h-3.5 w-3.5" /> Ver Tudo
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-accent/30" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Sincronizando Boutique...</p>
            </div>
          ) : (
            <div className="flex gap-4 md:grid md:grid-cols-4 md:gap-8 overflow-x-auto md:overflow-visible pb-8 no-scrollbar snap-x snap-mandatory">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <div key={product.id} className="min-w-[70%] md:min-w-0 flex-shrink-0 snap-start">
                    <ProductCard 
                      {...product} 
                      onAddToCart={() => addToCart(product)}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full w-full py-20 text-center border-2 border-dashed border-primary/5 rounded-[2rem] md:rounded-[3rem]">
                  <p className="text-muted-foreground italic font-light text-sm">Nenhuma peça encontrada para esta seleção.</p>
                  <button onClick={() => setSelectedCategory(null)} className="mt-4 text-xs font-bold uppercase text-accent underline underline-offset-4">Limpar Filtros</button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Grade de Coleções / Categorias */}
        <section id="colecoes" className="bg-secondary/10 pt-4 md:pt-8 pb-8 md:pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-8 md:mb-20 space-y-2 md:space-y-4">
              <div className="flex items-center justify-center gap-3">
                 <div className="h-px w-6 bg-accent/40" />
                 <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.5em] text-accent">Categorias</span>
                 <div className="h-px w-6 bg-accent/40" />
              </div>
              <h2 className="text-3xl md:text-6xl font-headline font-bold text-primary">Navegue por Estilo</h2>
              <p className="text-sm md:text-lg text-muted-foreground italic font-light max-w-xl mx-auto">
                Selecione um estilo para visualizar as peças exclusivas da nossa curadoria.
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6">
              {categories && categories.length > 0 ? (
                categories.map((col) => (
                  <div 
                    key={col.id} 
                    onClick={() => handleSelectCategory(col.name)}
                    className={cn(
                      "group relative aspect-[4/5] rounded-[1.2rem] md:rounded-[2.5rem] overflow-hidden cursor-pointer shadow-editorial border-2 transition-all duration-500",
                      selectedCategory === col.name ? "border-accent ring-4 ring-accent/10 scale-[1.02]" : "border-transparent"
                    )}
                  >
                    <img 
                      src={col.image || 'https://picsum.photos/seed/placeholder/400/500'} 
                      className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" 
                      alt={col.name} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 md:bottom-10 md:left-10 md:right-10">
                      <h3 className="text-lg md:text-2xl font-headline font-bold text-white uppercase tracking-tight leading-none mb-1 md:mb-2">{col.name}</h3>
                      <div className={cn(
                        "h-0.5 bg-accent transition-all duration-500",
                        selectedCategory === col.name ? "w-full" : "w-0 group-hover:w-full"
                      )} />
                    </div>
                  </div>
                ))
              ) : (
                [1,2,3,4,5].map(i => (
                   <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-secondary animate-pulse" />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Banner de Campanha Split */}
        <section className="py-8 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-20 items-center">
              <div className="relative aspect-[4/5] rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-premium group">
                <img 
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80" 
                  className="object-cover w-full h-full transition-transform duration-[2s] group-hover:scale-110" 
                  alt="Essência Toda Bela" 
                />
                <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors" />
              </div>
              <div className="space-y-4 md:space-y-10">
                <div className="space-y-3 md:space-y-6">
                  <span className="text-accent text-[9px] md:text-[11px] font-bold uppercase tracking-[0.5em]">Essência Toda Bela</span>
                  <h3 className="text-3xl md:text-8xl font-headline font-bold text-primary leading-tight">
                    Moda com <br /> <span className="italic font-light">Propósito</span>
                  </h3>
                  <p className="text-sm md:text-2xl text-muted-foreground/80 font-light italic leading-relaxed max-w-xl">
                    Cada peça em nossa boutique é selecionada para elevar sua confiança e refletir sua autenticidade.
                  </p>
                </div>
                <button 
                  onClick={() => document.getElementById('colecoes')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto rounded-full border-2 border-primary px-6 py-4 md:px-12 md:py-6 text-[10px] md:text-sm font-bold uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all shadow-xl"
                >
                  Conheça a Coleção
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Grid Geral de Produtos */}
        <section id="mais-vendidos" className="container mx-auto px-4 md:px-6 py-8 md:py-16 bg-secondary/5 rounded-[2rem] md:rounded-[4rem]">
          <div className="text-center space-y-3 md:space-y-6 mb-8 md:mb-20">
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Seleção Premium</span>
            <h3 className="text-2xl md:text-6xl font-headline font-bold text-primary">Favoritos da Temporada</h3>
            <div className="h-0.5 w-12 md:w-20 bg-accent mx-auto" />
          </div>
          <div className="flex gap-4 md:grid md:grid-cols-4 lg:grid-cols-5 md:gap-8 overflow-x-auto md:overflow-visible pb-8 no-scrollbar snap-x snap-mandatory">
            {latestProducts.map((product) => (
              <div key={product.id} className="min-w-[45%] md:min-w-0 flex-shrink-0 snap-start">
                <ProductCard 
                  {...product} 
                  onAddToCart={() => addToCart(product)}
                />
              </div>
            ))}
          </div>
        </section>

        <Newsletter />
      </main>

      <Footer />

      {/* Diálogos e Modais */}
      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      <OrderTrackingDialog open={isTrackOpen} onOpenChange={setIsTrackOpen} />
      <MyOrdersDialog open={isMyOrdersOpen} onOpenChange={setIsMyOrdersOpen} />
      <FavoritesDialog open={isFavoritesOpen} onOpenChange={setIsFavoritesOpen} />
      <CheckoutDialog 
        open={isCheckoutOpen} 
        onOpenChange={setIsCheckoutOpen} 
        cartItems={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        total={cartTotal}
        onSuccess={() => setCart([])}
      />
    </div>
  );
}

export default function TodaBelaStorefront() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <StorefrontContent />
    </Suspense>
  );
}
