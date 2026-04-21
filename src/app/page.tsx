
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
    return filteredProducts.filter(p => p.featured || p.badge === 'Destaque' || p.badge === 'Lançamento').slice(0, 12);
  }, [filteredProducts, selectedCategory]);

  const latestProducts = useMemo(() => 
    filteredProducts.filter(p => p.published !== false).slice(0, 12), 
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
          "container mx-auto px-4 md:px-6 pb-4 md:pb-8 overflow-hidden scroll-mt-24 transition-all duration-700",
          selectedCategory ? "pt-24 md:pt-32" : "pt-8 md:pt-12"
        )}>
          <div className="flex flex-row justify-between items-end mb-6 md:mb-10 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-px w-6 md:w-12 bg-accent" />
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-accent">
                  {selectedCategory ? 'Explorando Seleção' : 'Lançamento'}
                </span>
              </div>
              <h2 className="text-xl md:text-5xl font-headline font-bold text-primary uppercase tracking-tighter">
                {selectedCategory || 'Lançamentos'}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
               {!selectedCategory ? (
                 <Link href="/economize" className="text-[10px] font-bold uppercase tracking-widest text-primary/60 underline underline-offset-4 hover:text-accent transition-colors">
                    Ver tudo
                 </Link>
               ) : (
                 <button 
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-primary hover:text-accent transition-all group"
                >
                  <div className="h-8 w-8 rounded-full border border-primary/10 flex items-center justify-center group-hover:border-accent group-hover:bg-accent group-hover:text-white transition-all">
                    <ArrowLeft className="h-3 w-3" />
                  </div>
                  <span className="hidden sm:inline">Voltar</span>
                </button>
               )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 md:py-40 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-accent/30" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Sincronizando Boutique...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-12 items-stretch">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <div key={product.id} className="h-full">
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

        <section id="colecoes" className="bg-secondary/5 pt-4 md:pt-6 pb-10 md:pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-8 md:mb-12 space-y-2 md:space-y-4">
              <div className="flex items-center justify-center gap-2">
                 <div className="h-px w-4 md:w-6 bg-accent/40" />
                 <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-[0.5em] text-accent">Compre por Estilo</span>
                 <div className="h-px w-4 md:w-6 bg-accent/40" />
              </div>
              <h2 className="text-2xl md:text-5xl font-headline font-bold text-primary uppercase">Categorias</h2>
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
                        "group relative aspect-[4/5] rounded-[1rem] md:rounded-[3rem] overflow-hidden cursor-pointer shadow-editorial border-2 transition-all duration-700",
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
                        <h3 className="text-sm md:text-3xl font-headline font-bold text-white uppercase tracking-tight leading-none mb-1 md:mb-4">{col.name}</h3>
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
                   <div key={i} className="aspect-[4/5] rounded-[1rem] md:rounded-[3rem] bg-secondary animate-pulse" />
                ))
              )}
            </div>
          </div>
        </section>

        {!selectedCategory && (
          <section className="py-12 md:py-20">
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
                <div className="space-y-6 md:space-y-10 px-2">
                  <div className="space-y-3 md:space-y-6">
                    <span className="text-accent text-[9px] md:text-[12px] font-bold uppercase tracking-[0.6em]">Essência Toda Bela</span>
                    <h3 className="text-3xl md:text-[6rem] font-headline font-bold text-primary leading-[0.9] tracking-tighter">
                      Moda com <br className="hidden md:block" /> <span className="italic font-light">Propósito</span>
                    </h3>
                    <p className="text-sm md:text-xl text-muted-foreground/80 font-light italic leading-relaxed max-w-xl">
                      Cada peça em nossa boutique é selecionada para elevar sua confiança e refletir sua autenticidade em cada movimento.
                    </p>
                  </div>
                  <button 
                    onClick={() => document.getElementById('colecoes')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full sm:w-auto rounded-full border-2 border-primary px-8 md:px-12 py-4 md:py-6 text-[9px] md:text-sm font-bold uppercase tracking-[0.4em] hover:bg-primary hover:text-white transition-all shadow-xl"
                  >
                    Conheça a Coleção
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section id="mais-vendidos" className="container mx-auto px-4 md:px-6 py-12 md:py-16 bg-secondary/5 rounded-[2rem] md:rounded-[4rem] mb-12">
          <div className="flex flex-row justify-between items-end mb-8 md:mb-12 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] md:text-[12px] font-bold uppercase tracking-[0.5em] text-accent">Favoritos</span>
              <h3 className="text-xl md:text-5xl font-headline font-bold text-primary uppercase">Mais Vendidos</h3>
            </div>
            <Link href="/economize" className="text-[10px] font-bold uppercase tracking-widest text-primary/60 underline underline-offset-4 hover:text-accent transition-colors">
              Ver tudo
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-10 items-stretch">
            {latestProducts.map((product) => (
              <div key={product.id} className="h-full">
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
