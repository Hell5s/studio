
"use client";

import React, { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Navbar } from '@/components/store/Navbar';
import { Footer } from '@/components/store/Footer';
import { ProductCard } from '@/components/store/ProductCard';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { CheckoutDialog } from '@/components/store/CheckoutDialog';
import { FavoritesDialog } from '@/components/store/FavoritesDialog';
import { Loader2, Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CategoryPage() {
  const { slug } = useParams();
  const db = useFirestore();
  
  // Estados de Interface
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [cart, setCart] = useState<any[]>([]);

  // 1. Descobrir o nome real da categoria a partir do slug
  const categoriesQuery = useMemoFirebase(() => query(collection(db, 'categories')), [db]);
  const { data: categories } = useCollection(categoriesQuery);

  const category = useMemo(() => {
    if (!categories || !slug) return null;
    return categories.find(c => c.name.toLowerCase().trim().replace(/\s+/g, '-') === slug);
  }, [categories, slug]);

  const categoryName = category?.name || '';

  // 2. Busca produtos filtrados pela categoria encontrada com limite de performance
  const productsQuery = useMemoFirebase(() => {
    if (!db || !categoryName) return null;
    return query(
      collection(db, 'products'), 
      where('category', '==', categoryName),
      limit(20)
    );
  }, [db, categoryName]);

  const { data: products, isLoading } = useCollection(productsQuery);

  // Lógica de Carrinho
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

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + (item.quantity || 0), 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 0)), 0), [cart]);

  return (
    <div className="min-h-screen bg-background selection:bg-accent/30 selection:text-primary overflow-x-hidden">
      <Navbar 
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenCart={() => setIsCheckoutOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        cartCount={cartCount}
      />

      <main className="pt-32 pb-24 md:pt-48 md:pb-40">
        <section className="container mx-auto px-6 mb-12 md:mb-24">
          <div className="max-w-4xl space-y-6 md:space-y-10">
            <Link href="/" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-accent transition-colors group">
              <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Voltar para Início
            </Link>
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-accent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-accent">Explorando Estilo</span>
            </div>
            <h1 className="text-4xl md:text-8xl font-headline font-bold text-primary leading-[0.95] tracking-tighter">
              {categoryName || (slug as string).replace(/-/g, ' ')}
            </h1>
            <p className="text-base md:text-2xl text-muted-foreground font-light italic max-w-2xl leading-relaxed">
              Seleção exclusiva Toda Bela para elevar sua confiança com sofisticação.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-accent/30" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Sincronizando Loja...</p>
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-12">
              {products.map((product) => (
                <ProductCard 
                  key={product.id}
                  {...product}
                  onAddToCart={() => addToCart(product)}
                />
              ))}
            </div>
          ) : (
            <div className="py-40 text-center border-2 border-dashed border-primary/5 rounded-[3rem] bg-secondary/5">
               <Tag className="h-12 w-12 text-accent/20 mx-auto mb-6" />
               <h3 className="text-xl font-headline font-bold text-primary mb-2">Novidades em breve</h3>
               <p className="text-sm text-muted-foreground italic font-light">Estamos preparando novas seleções para esta categoria.</p>
               <Link href="/">
                 <button className="mt-8 text-[10px] font-bold uppercase tracking-widest text-accent underline underline-offset-8">Explorar outras peças</button>
               </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
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
