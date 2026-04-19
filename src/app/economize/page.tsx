
"use client";

import React, { useMemo, useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Navbar } from '@/components/store/Navbar';
import { Footer } from '@/components/store/Footer';
import { ProductCard } from '@/components/store/ProductCard';
import { Newsletter } from '@/components/store/Newsletter';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { OrderTrackingDialog } from '@/components/store/OrderTrackingDialog';
import { MyOrdersDialog } from '@/components/store/MyOrdersDialog';
import { CheckoutDialog } from '@/components/store/CheckoutDialog';
import { FavoritesDialog } from '@/components/store/FavoritesDialog';
import { Loader2, Tag } from 'lucide-react';

export default function EconomizePage() {
  const db = useFirestore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [cart, setCart] = useState<any[]>([]);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: allProducts, isLoading } = useCollection(productsQuery);

  const saleProducts = useMemo(() => {
    if (!allProducts) return [];
    // Filtra produtos que têm um preço antigo maior que o preço atual (desconto)
    return allProducts.filter(p => p.oldPrice && p.oldPrice > p.price);
  }, [allProducts]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: (item.quantity || 0) + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCheckoutOpen(true);
  };

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + (item.quantity || 0), 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 0)), 0), [cart]);

  return (
    <div className="min-h-screen bg-background selection:bg-accent/30 selection:text-primary overflow-x-hidden">
      <Navbar 
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenTrack={() => setIsTrackOpen(true)}
        onOpenOrders={() => setIsMyOrdersOpen(true)}
        onOpenCart={() => setIsCheckoutOpen(true)}
        cartCount={cartCount}
      />

      <main className="pt-24 md:pt-40">
        <section className="container mx-auto px-6 mb-16 md:mb-32">
          <div className="max-w-4xl space-y-6 md:space-y-10">
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-accent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-accent">Oportunidades</span>
            </div>
            <h1 className="text-4xl md:text-8xl font-headline font-bold text-primary leading-[0.95] tracking-tighter">
              Economize com <br />
              <span className="italic font-light text-accent">Sofisticação</span>
            </h1>
            <p className="text-base md:text-2xl text-muted-foreground font-light italic max-w-2xl leading-relaxed">
              Uma seleção exclusiva de peças Toda Bela com valores reduzidos. Estilo e elegância agora com benefícios irresistíveis.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-6 pb-24 md:pb-40">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-accent/30" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Buscando ofertas...</p>
            </div>
          ) : saleProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-12">
              {saleProducts.map((product) => (
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
               <h3 className="text-xl font-headline font-bold text-primary mb-2">Sem ofertas ativas</h3>
               <p className="text-sm text-muted-foreground italic font-light">Nossas promoções são rotativas. Volte em breve para novas descobertas.</p>
            </div>
          )}
        </section>

        <Newsletter />
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
        total={cartTotal}
        onSuccess={() => setCart([])}
      />
    </div>
  );
}
