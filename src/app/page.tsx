
"use client";

import React, { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, doc, limit, where, orderBy } from 'firebase/firestore';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/store/Navbar';
import { Hero } from '@/components/store/Hero';
import { ShowcaseSection } from '@/components/store/ShowcaseSection';
import { Footer } from '@/components/store/Footer';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

// Lazy loading de componentes pesados e dialogs para performance
const AdminDashboard = React.lazy(() => import('@/components/admin/AdminDashboard').then(mod => ({ default: mod.AdminDashboard })));
const AIProductGenerator = React.lazy(() => import('@/components/admin/AIProductGenerator').then(mod => ({ default: mod.AIProductGenerator })));
const CheckoutDialog = React.lazy(() => import('@/components/store/CheckoutDialog').then(mod => ({ default: mod.CheckoutDialog })));
const FavoritesDialog = React.lazy(() => import('@/components/store/FavoritesDialog').then(mod => ({ default: mod.FavoritesDialog })));

function StorefrontContent() {
  const db = useFirestore();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [isAdminView, setIsAdminView] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const adminDocRef = useMemoFirebase(() => {
    return user ? doc(db, 'roles_admin', user.uid) : null;
  }, [db, user]);
  const { data: adminRole, isLoading: isAdminLoading } = useDoc(adminDocRef);
  const isAdmin = !!adminRole || user?.uid === 'LXaJZDm6tNUQLh3ooghcg6EQgJ43';

  const movementRef = useMemoFirebase(() => doc(db, 'settings', 'movementSection'), [db]);
  const { data: movement } = useDoc(movementRef);

  // Consulta de Vitrines Dinâmicas (Incluindo as migradas)
  const showcasesQuery = useMemoFirebase(() => query(
    collection(db, 'homeShowcaseSections'), 
    where('active', '==', true), 
    orderBy('order', 'asc')
  ), [db]);
  const { data: showcases, isLoading: isShowcasesLoading } = useCollection(showcasesQuery);

  useEffect(() => {
    if (isAdminLoading) return;

    if (searchParams.get('admin') === 'true') {
      if (isAdmin) {
        setIsAdminView(true);
      } else {
        router.replace('/');
      }
    } else {
      setIsAdminView(false);
    }
  }, [searchParams, isAdmin, isAdminLoading, router]);

  const [cart, setCart] = useState<any[]>([]);
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + (item.quantity || 0), 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 0)), 0), [cart]);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), limit(20));
  }, [db]);
  const { data: storeProducts } = useCollection(productsQuery);

  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), limit(8));
  }, [db]);
  const { data: categories } = useCollection(categoriesQuery);

  const handleSearch = useCallback((val: string) => {
    setSearchValue(val);
    if (val) {
      const el = document.getElementById('vitrine');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleOpenAdmin = useCallback(() => {
    router.push('/?admin=true');
  }, [router]);

  if (isAdminView && isAdmin) {
    return (
      <div className="h-screen bg-background">
        <Suspense fallback={<div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-accent" /></div>}>
          <AdminDashboard 
            productsCount={storeProducts?.length || 0}
            categoriesCount={categories?.length || 0}
            onOpenAI={() => setIsAIOpen(true)}
            onExit={() => router.push('/')}
          />
          <AIProductGenerator open={isAIOpen} onOpenChange={setIsAIOpen} />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-accent/30 selection:text-primary overflow-x-hidden">
      <Navbar 
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenCart={() => setIsCheckoutOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        cartCount={cartCount}
        isAdmin={isAdmin} 
        onOpenAdmin={handleOpenAdmin}
        onSearch={handleSearch}
      />

      <main>
        {!selectedCategory && (
          <section className="pt-0">
            <Hero onShopNow={() => document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth' })} />
          </section>
        )}

        <div id="vitrine" className="scroll-mt-24" />

        {/* Vitrines Dinâmicas (Controladas via Admin) */}
        {!selectedCategory && (
          isShowcasesLoading ? (
            <div className="flex flex-col items-center justify-center py-24 md:py-40 space-y-6">
              <Loader2 className="h-12 w-12 animate-spin text-accent/30" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Sincronizando Boutique...</p>
            </div>
          ) : (
            showcases?.map((showcase) => (
              <ShowcaseSection 
                key={showcase.id}
                eyebrow={showcase.eyebrow}
                title={showcase.title}
                linkText={showcase.linkText}
                linkUrl={showcase.linkUrl}
                productIds={showcase.productIds}
              />
            ))
          )
        )}

        {/* Categories Section */}
        <section id="colecoes" className="bg-secondary/5 py-16 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12 md:mb-24 space-y-4">
              <div className="flex items-center justify-center gap-4">
                 <div className="h-px w-8 md:w-12 bg-accent/40" />
                 <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.6em] text-accent">Navegue por Estilo</span>
                 <div className="h-px w-8 md:w-12 bg-accent/40" />
              </div>
              <h2 className="text-3xl md:text-7xl font-headline font-bold text-primary uppercase">Categorias</h2>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
              {categories && categories.length > 0 ? (
                categories.map((col) => {
                  const slug = col.name.toLowerCase().trim().replace(/\s+/g, '-');
                  return (
                    <Link 
                      key={col.id} 
                      href={`/categoria/${slug}`}
                      className={cn(
                        "group relative aspect-[4/5] rounded-[1.5rem] md:rounded-[4rem] overflow-hidden cursor-pointer shadow-editorial border-2 transition-all duration-700",
                        "border-transparent opacity-90 hover:opacity-100 hover:scale-[1.03]"
                      )}
                    >
                      <img 
                        src={col.image || 'https://picsum.photos/seed/placeholder/400/500'} 
                        className="w-full h-full object-cover transition-transform duration-2000 group-hover:scale-110" 
                        alt={col.name} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/20 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6 md:bottom-12 md:left-12 md:right-12">
                        <h3 className="text-lg md:text-3xl font-headline font-bold text-white uppercase tracking-tight leading-none mb-2 md:mb-4">{col.name}</h3>
                        <div className="h-0.5 md:h-1 bg-accent transition-all duration-700 w-0 group-hover:w-full" />
                      </div>
                    </Link>
                  );
                })
              ) : (
                [1,2,3,4].map(i => (
                   <div key={i} className="aspect-[4/5] rounded-[1.5rem] md:rounded-[4rem] bg-secondary animate-pulse" />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Movement Section */}
        {!selectedCategory && (
          <section className="py-16 md:py-40">
            <div className="container mx-auto px-4 md:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-32 items-center">
                <div className="relative aspect-[4/5] rounded-[2rem] md:rounded-[6rem] overflow-hidden shadow-premium group">
                  {movement?.mediaType === 'video' ? (
                    <video 
                      src={movement?.mediaUrl} 
                      autoPlay 
                      muted 
                      loop 
                      playsInline 
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <img 
                      src={movement?.mediaUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"} 
                      className="object-cover w-full h-full transition-transform duration-2500 group-hover:scale-110" 
                      alt={movement?.title || "Essência Toda Bela"} 
                    />
                  )}
                  <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors" />
                </div>
                <div className="space-y-8 md:space-y-12">
                  <div className="space-y-4 md:space-y-8">
                    <span className="text-accent text-[10px] md:text-sm font-bold uppercase tracking-[0.8em]">
                      {movement?.eyebrow || 'MOVIMENTO TODA BELA'}
                    </span>
                    <h3 className="text-4xl md:text-8xl font-headline font-bold text-primary leading-[0.9] tracking-tighter">
                      {movement?.title || 'Moda com Propósito'}
                    </h3>
                    <p className="text-base md:text-2xl text-muted-foreground/80 font-light italic leading-relaxed max-w-xl">
                      {movement?.description || 'Cada peça em nossa loja é selecionada pela nossa equipe para elevar sua confiança e refletir sua autenticidade em cada movimento.'}
                    </p>
                  </div>
                  <Link href={movement?.buttonLink || "/#colecoes"}>
                    <button className="w-full sm:w-auto rounded-full border-2 border-primary px-10 md:px-16 py-5 md:py-8 text-[10px] md:text-sm font-bold uppercase tracking-[0.5em] hover:bg-primary hover:text-white transition-all shadow-xl">
                      {movement?.buttonText || 'CONHEÇA A COLEÇÃO'}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      
      <Suspense fallback={null}>
        {isFavoritesOpen && <FavoritesDialog open={isFavoritesOpen} onOpenChange={setIsFavoritesOpen} />}
        {isCheckoutOpen && (
          <CheckoutDialog 
            open={isCheckoutOpen} 
            onOpenChange={setIsCheckoutOpen} 
            cartItems={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            total={cartTotal}
            onSuccess={() => setCart([])}
          />
        )}
      </Suspense>
    </div>
  );
}

export default function TodaBelaStorefront() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>}>
      <StorefrontContent />
    </Suspense>
  );
}
