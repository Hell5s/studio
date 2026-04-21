"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/store/Navbar';
import { Hero } from '@/components/store/Hero';
import { ProductCard } from '@/components/store/ProductCard';
import { Footer } from '@/components/store/Footer';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { OrderTrackingDialog } from '@/components/store/OrderTrackingDialog';
import { MyOrdersDialog } from '@/components/store/MyOrdersDialog';
import { CheckoutDialog } from '@/components/store/CheckoutDialog';
import { FavoritesDialog } from '@/components/store/FavoritesDialog';
import { AIProductGenerator } from '@/components/admin/AIProductGenerator';
import { Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

function StorefrontContent() {
  const db = useFirestore();
  const { user } = useUser();
  const searchParams = useSearchParams();
  
  const [isAdminView, setIsAdminView] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const adminDocRef = useMemoFirebase(() => {
    return user ? doc(db, 'roles_admin', user.uid) : null;
  }, [db, user]);
  const { data: adminRole } = useDoc(adminDocRef);
  const isAdmin = !!adminRole;

  useEffect(() => {
    if (searchParams.get('admin') === 'true' && isAdmin) {
      setIsAdminView(true);
    }
  }, [searchParams, isAdmin]);

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
        {!selectedCategory && <Hero onShopNow={() => document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth' })} />}

        <section id="vitrine" className={cn(
          "container mx-auto px-4 md:px-6 pb-8 md:pb-12 overflow-hidden scroll-mt-24 transition-all duration-700",
          selectedCategory ? "pt-24 md:pt-32" : "pt-8 md:pt-16"
        )}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 md:w-12 bg-accent" />
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-accent">
                  {selectedCategory ? 'Explorando Coleção' : 'Edição Especial'}
                </span>
              </div>
              <h2 className="text-3xl md:text-8xl font-headline font-bold text-primary text-editorial leading-[0.85]">
                {selectedCategory || 'Lançamentos'}
              </h2>
            </div>
            
            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-accent transition-all group"
              >
                <div className="h-10 w-10 rounded-full border border-primary/10 flex items-center justify-center group-hover:border-accent group-hover:bg-accent group-hover:text-white transition-all">
                  <ArrowLeft className="h-4 w-4" />
                </div>
                <span>Voltar para Início</span>
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 md:py-40 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-accent/30" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Sincronizando Boutique...</p>
            </div>
          ) : (
            <div className={cn(
              "transition-all duration-700",
              selectedCategory 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-12" 
                : "flex gap-4 md:grid md:grid-cols-4 md:gap-8 overflow-x-auto md:overflow-visible pb-8 no-scrollbar snap-x snap-mandatory"
            )}>
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <div key={product.id} className={cn(
                    !selectedCategory && "min-w-[75%] sm:min-w-[45%] md:min-w-0 flex-shrink-0 snap-start"
                  )}>
                    <ProductCard 
                      {...product} 
                      onAddToCart={() => addToCart(product)}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full w-full py-24 md:py-32 text-center border-2 border-dashed border-primary/5 rounded-[2rem] md:rounded-[3rem]">
                  <Sparkles className="h-10 w-10 text-accent/20 mx-auto mb-4" />
                  <p className="text-muted-foreground italic font-light text-base px-6">Nenhuma peça disponível no momento.</p>
                  <button onClick={() => setSelectedCategory(null)} className="mt-6 text-xs font-bold uppercase text-accent underline underline-offset-8">Explorar seleções</button>
                </div>
              )}
            </div>
          )}
        </section>

        <section id="colecoes" className="bg-secondary/10 pt-4 md:pt-8 pb-12 md:pb-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-10 md:mb-20 space-y-3 md:space-y-6">
              <div className="flex items-center justify-center gap-3">
                 <div className="h-px w-6 bg-accent/40" />
                 <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.5em] text-accent">Categorias</span>
                 <div className="h-px w-6 bg-accent/40" />
              </div>
              <h2 className="text-3xl md:text-7xl font-headline font-bold text-primary">Navegue por Estilo</h2>
              <p className="text-sm md:text-xl text-muted-foreground italic font-light max-w-xl mx-auto px-4">
                Escolha uma seção para filtrar as peças que mais combinam com o seu momento.
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-8">
              {categories && categories.length > 0 ? (
                categories.map((col) => {
                  const slug = col.name.toLowerCase().trim().replace(/\s+/g, '-');
                  return (
                    <Link 
                      key={col.id} 
                      href={`/categoria/${slug}`}
                      className={cn(
                        "group relative aspect-[4/5] rounded-[1.25rem] md:rounded-[3.5rem] overflow-hidden cursor-pointer shadow-editorial border-2 transition-all duration-700",
                        selectedCategory === col.name 
                          ? "border-accent ring-4 md:ring-8 ring-accent/5 scale-[1.05] z-10" 
                          : "border-transparent opacity-90 hover:opacity-100 hover:scale-[1.02]"
                      )}
                    >
                      <img 
                        src={col.image || 'https://picsum.photos/seed/placeholder/400/500'} 
                        className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
                        alt={col.name} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 md:bottom-12 md:left-12 md:right-12">
                        <h3 className="text-lg md:text-3xl font-headline font-bold text-white uppercase tracking-tight leading-none mb-1 md:mb-4">{col.name}</h3>
                        <div className={cn(
                          "h-0.5 md:h-1 bg-accent transition-all duration-700",
                          selectedCategory === col.name ? "w-full" : "w-0 group-hover:w-full"
                        )} />
                      </div>
                    </Link>
                  );
                })
              ) : (
                [1,2,3,4,5].map(i => (
                   <div key={i} className="aspect-[4/5] rounded-[1.5rem] md:rounded-[3rem] bg-secondary animate-pulse" />
                ))
              )}
            </div>
          </div>
        </section>

        {!selectedCategory && (
          <section className="py-12 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
              <div className="grid lg:grid-cols-2 gap-10 md:gap-24 items-center">
                <div className="relative aspect-[4/5] rounded-[2rem] md:rounded-[5rem] overflow-hidden shadow-premium group">
                  <img 
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80" 
                    className="object-cover w-full h-full transition-transform duration-[2.5s] group-hover:scale-110" 
                    alt="Essência Toda Bela" 
                  />
                  <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors" />
                </div>
                <div className="space-y-6 md:space-y-12 px-2">
                  <div className="space-y-4 md:space-y-8">
                    <span className="text-accent text-[10px] md:text-[12px] font-bold uppercase tracking-[0.6em]">Essência Toda Bela</span>
                    <h3 className="text-4xl md:text-[7rem] font-headline font-bold text-primary leading-[0.9] tracking-tighter">
                      Moda com <br className="hidden md:block" /> <span className="italic font-light">Propósito</span>
                    </h3>
                    <p className="text-sm md:text-2xl text-muted-foreground/80 font-light italic leading-relaxed max-w-xl">
                      Cada peça em nossa boutique é selecionada para elevar sua confiança e refletir sua autenticidade em cada movimento.
                    </p>
                  </div>
                  <button 
                    onClick={() => document.getElementById('colecoes')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full sm:w-auto rounded-full border-2 border-primary px-8 md:px-16 py-4 md:py-8 text-[10px] md:text-base font-bold uppercase tracking-[0.4em] hover:bg-primary hover:text-white transition-all shadow-xl"
                  >
                    Conheça a Coleção
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section id="mais-vendidos" className="container mx-auto px-4 md:px-6 py-12 md:py-20 bg-secondary/5 rounded-[2rem] md:rounded-[5rem]">
          <div className="text-center space-y-4 md:space-y-8 mb-10 md:mb-24">
            <span className="text-[10px] md:text-[12px] font-bold uppercase tracking-[0.5em] text-accent">Seleção Premium</span>
            <h3 className="text-3xl md:text-7xl font-headline font-bold text-primary">Favoritos da Temporada</h3>
            <div className="h-0.5 w-12 md:w-24 bg-accent mx-auto" />
          </div>
          <div className="flex gap-4 md:grid md:grid-cols-4 lg:grid-cols-5 md:gap-10 overflow-x-auto md:overflow-visible pb-8 no-scrollbar snap-x snap-mandatory">
            {latestProducts.map((product) => (
              <div key={product.id} className="min-w-[70%] sm:min-w-[40%] md:min-w-0 flex-shrink-0 snap-start">
                <ProductCard 
                  {...product} 
                  onAddToCart={() => addToCart(product)}
                />
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />

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
