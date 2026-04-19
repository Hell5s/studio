
"use client";

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, limit } from 'firebase/firestore';
import { Navbar } from '@/components/store/Navbar';
import { Newsletter } from '@/components/store/Newsletter';
import { Footer } from '@/components/store/Footer';
import { ProductGallery } from '@/components/store/product-detail/ProductGallery';
import { ProductInfo } from '@/components/store/product-detail/ProductInfo';
import { ProductTabs } from '@/components/store/product-detail/ProductTabs';
import { RelatedProducts } from '@/components/store/product-detail/RelatedProducts';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { OrderTrackingDialog } from '@/components/store/OrderTrackingDialog';
import { MyOrdersDialog } from '@/components/store/MyOrdersDialog';
import { CheckoutDialog } from '@/components/store/CheckoutDialog';
import { FavoritesDialog } from '@/components/store/FavoritesDialog';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const [cart, setCart] = useState<any[]>([]);

  const productRef = useMemo(() => {
    if (!db || !id) return null;
    return doc(db, 'products', id as string);
  }, [db, id]);

  const { data: product, isLoading } = useDoc(productRef);

  const relatedQuery = useMemoFirebase(() => {
    if (!db || !product) return null;
    return query(
      collection(db, 'products'),
      where('category', '==', product.category || ''),
      limit(4)
    );
  }, [db, product]);

  const { data: relatedProducts } = useCollection(relatedQuery);

  const addToCart = (prod: any, openCart: boolean = false) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === prod.id);
      if (existing) {
        return prev.map(item => item.id === prod.id ? { ...item, quantity: (item.quantity || 0) + 1 } : item);
      }
      return [...prev, { ...prod, quantity: 1 }];
    });
    
    if (openCart) {
      setIsCheckoutOpen(true);
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9F7]">
        <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#FFF9F7] p-6 text-center">
        <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary">Peça não encontrada</h1>
        <Button onClick={() => router.push('/')} variant="outline" className="rounded-full px-12 h-14">
          Voltar para a Boutique
        </Button>
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
      />
      
      <main className="pt-24 md:pt-32 pb-12 md:pb-20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-8 md:mb-12">
            <Link href="/" className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
              Voltar para Coleções
            </Link>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 md:gap-16 xl:gap-24 items-start">
            <div className="lg:col-span-7 xl:col-span-8">
              <ProductGallery 
                images={product.images || [product.image]} 
                name={product.name} 
              />
            </div>

            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-32">
              <ProductInfo product={product} onAddToCart={addToCart} />
            </div>
          </div>

          <div className="mt-16 md:mt-32 grid lg:grid-cols-12 gap-10 md:gap-16 xl:gap-24 border-t border-primary/5 pt-16 md:pt-32">
            <div className="lg:col-span-7 xl:col-span-8 space-y-16 md:space-y-24">
              <section>
                <div className="flex items-center gap-4 mb-8 md:mb-12">
                  <div className="h-px w-10 md:w-12 bg-accent/40" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.6em] md:tracking-[0.8em] text-accent">Essência da Peça</span>
                </div>
                <div className="prose prose-primary max-w-none">
                  <h3 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-6 md:mb-8">Elegância em cada detalhe</h3>
                  <div className="text-base md:text-lg text-muted-foreground/80 leading-relaxed font-light italic whitespace-pre-line">
                    {product.longDescription || product.description}
                  </div>
                </div>
              </section>

              <section className="bg-secondary/20 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-20">
                <div className="grid md:grid-cols-2 gap-12 md:gap-16">
                  <div className="space-y-4">
                    <h4 className="text-lg md:text-xl font-headline font-bold text-primary uppercase tracking-widest">Como Usar</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                      Ideal para eventos que exigem uma presença marcante e sofisticada. Combine com acessórios dourados Toda Bela para um look completo.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg md:text-xl font-headline font-bold text-primary uppercase tracking-widest">Diferenciais</h4>
                    <ul className="space-y-3 text-sm text-muted-foreground font-light italic">
                      <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-accent" /> Modelagem que esculpe a silhueta</li>
                      <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-accent" /> Tecido com toque de seda premium</li>
                      <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-accent" /> Acabamento artesanal invisível</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-5 xl:col-span-4">
              <ProductTabs product={product} />
            </div>
          </div>

          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-24 md:mt-40">
              <RelatedProducts products={relatedProducts} />
            </div>
          )}
        </div>
      </main>

      <Newsletter />
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
