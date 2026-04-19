
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
import { ProductReviews } from '@/components/store/product-detail/ProductReviews';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { OrderTrackingDialog } from '@/components/store/OrderTrackingDialog';
import { MyOrdersDialog } from '@/components/store/MyOrdersDialog';
import { CheckoutDialog } from '@/components/store/CheckoutDialog';
import { FavoritesDialog } from '@/components/store/FavoritesDialog';
import { Loader2, ArrowLeft, ShieldCheck, RefreshCw, Truck } from 'lucide-react';
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
    <div className="min-h-screen bg-white selection:bg-accent/30 selection:text-primary overflow-x-hidden">
      <Navbar 
        onOpenLogin={() => setIsLoginOpen(true)} 
        onOpenCart={() => setIsCheckoutOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        cartCount={cartCount}
      />
      
      <main className="pt-24 md:pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-8 xl:px-12">
          {/* Breadcrumb / Back */}
          <div className="mb-10 flex items-center justify-between">
            <Link href="/" className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
              Voltar para Coleções
            </Link>
            <div className="hidden md:flex items-center gap-6 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
              <span>Peça: {product.sku || product.id.slice(-6).toUpperCase()}</span>
              <span>•</span>
              <span className="text-accent">{product.category}</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 xl:gap-24 items-start">
            {/* Left: Editorial Gallery */}
            <div className="lg:col-span-7 xl:col-span-8">
              <ProductGallery 
                images={product.images || [product.image]} 
                name={product.name} 
              />
            </div>

            {/* Right: Fixed Purchase Column */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-32 space-y-12">
              <ProductInfo product={product} onAddToCart={addToCart} />
              
              {/* Secondary Details for Purchase Context */}
              <div className="pt-8 border-t border-primary/5 space-y-6">
                <div className="flex items-center gap-4 text-primary/60">
                   <ShieldCheck className="h-5 w-5 text-accent" />
                   <p className="text-[11px] font-bold uppercase tracking-widest">Compra 100% Protegida</p>
                </div>
                <div className="flex items-center gap-4 text-primary/60">
                   <RefreshCw className="h-5 w-5 text-accent" />
                   <p className="text-[11px] font-bold uppercase tracking-widest">Troca Fácil: 7 dias</p>
                </div>
                <div className="flex items-center gap-4 text-primary/60">
                   <Truck className="h-5 w-5 text-accent" />
                   <p className="text-[11px] font-bold uppercase tracking-widest">Envio Seguro e Rastreável</p>
                </div>
              </div>
            </div>
          </div>

          {/* Extended Details Section */}
          <div className="mt-24 md:mt-40 grid lg:grid-cols-12 gap-16 xl:gap-32 border-t border-primary/5 pt-24 md:pt-32">
            <div className="lg:col-span-7 xl:col-span-8 space-y-24">
              {/* Product Essence */}
              <section className="space-y-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-px w-12 bg-accent/40" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.8em] text-accent">Design & Conforto</span>
                  </div>
                  <h3 className="text-4xl md:text-6xl font-headline font-bold text-primary leading-none">O toque <span className="italic font-light">Toda Bela</span></h3>
                </div>
                <div className="prose prose-lg max-w-none">
                  <div className="text-xl md:text-2xl text-muted-foreground/80 leading-relaxed font-light italic whitespace-pre-line border-l-4 border-accent/20 pl-8">
                    {product.longDescription || product.description}
                  </div>
                </div>
              </section>

              {/* Reviews Section */}
              <ProductReviews productId={product.id} />
            </div>

            {/* Side Tabs / Accordions */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="bg-secondary/10 p-10 rounded-[3rem] space-y-10">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-accent text-center">Especificações</h4>
                <ProductTabs product={product} />
              </div>
            </div>
          </div>

          {/* Related Products / Complete the Look */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-32 md:mt-48 pt-32 border-t border-primary/5">
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
