
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
import { Loader2, ArrowLeft, ChevronRight } from 'lucide-react';
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
        <div className="container mx-auto px-4 lg:px-8 xl:px-12">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            <Link href="/" className="hover:text-primary transition-colors">Início</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/#${product.category?.toLowerCase()}`} className="hover:text-primary transition-colors">{product.category}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary truncate">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-12 gap-8 xl:gap-16 items-start">
            {/* Left: Large Editorial Gallery */}
            <div className="lg:col-span-8 xl:col-span-8">
              <ProductGallery 
                images={product.images || [product.image]} 
                name={product.name} 
                productId={product.id}
              />
            </div>

            {/* Right: Technical Purchase Column */}
            <div className="lg:col-span-4 xl:col-span-4 lg:sticky lg:top-28">
              <ProductInfo product={product} onAddToCart={addToCart} relatedProducts={relatedProducts} />
              
              <div className="mt-8">
                <ProductTabs product={product} />
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-32 border-t border-primary/5 pt-20">
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
