
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
import { ProductReviews } from '@/components/store/product-detail/ProductReviews';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { CheckoutDialog } from '@/components/store/CheckoutDialog';
import { FavoritesDialog } from '@/components/store/FavoritesDialog';
import { Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-white p-6 text-center">
        <h1 className="text-3xl font-headline font-bold text-primary uppercase">Peça não encontrada</h1>
        <Button onClick={() => router.push('/')} className="rounded-full px-16 h-16 bg-primary text-white font-bold uppercase tracking-widest text-xs">
          Voltar para a Loja
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white selection:bg-black/5 selection:text-black overflow-x-hidden">
      <Navbar 
        onOpenLogin={() => setIsLoginOpen(true)} 
        onOpenCart={() => setIsCheckoutOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        cartCount={cartCount}
      />
      
      <main className="pt-24 md:pt-40 pb-20">
        <div className="container mx-auto px-4 lg:px-6 max-w-[1300px]">
          {/* Breadcrumb - Kaisan Pattern */}
          <nav className="mb-10 md:mb-16 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <Link href="/" className="hover:text-black transition-colors">Início</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/categoria/${product.category?.toLowerCase().trim().replace(/\s+/g, '-')}`} className="hover:text-black transition-colors">{product.category}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-black truncate">{product.name}</span>
            <span className="ml-2 text-gray-200">| REF: {product.sku || product.id.slice(-6).toUpperCase()}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            {/* Left: Editorial Gallery */}
            <div className="lg:col-span-8">
              <ProductGallery 
                images={product.images || [product.image]} 
                name={product.name} 
                productId={product.id}
              />
            </div>

            {/* Right: Technical Purchase Column */}
            <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-12">
              <ProductInfo 
                product={product} 
                onAddToCart={addToCart} 
                relatedProducts={relatedProducts} 
              />
            </div>
          </div>

          {/* Full Width Professional Reviews Section */}
          <div className="mt-24 md:mt-40">
             <ProductReviews productId={product.id} />
          </div>

          <div className="mt-24 md:mt-40">
            <Newsletter />
          </div>
        </div>
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
