"use client";

import React, { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, documentId, doc } from 'firebase/firestore';
import { Navbar } from '@/components/store/Navbar';
import { Footer } from '@/components/store/Footer';
import { ProductCard } from '@/components/store/ProductCard';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { CheckoutDialog } from '@/components/store/CheckoutDialog';
import { FavoritesDialog } from '@/components/store/FavoritesDialog';
import { Loader2, Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

export default function VitrinePage() {
  const { id } = useParams();
  const db = useFirestore();
  const { cart, addToCart, updateQuantity, removeFromCart, cartCount, cartTotal } = useCart();
  
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  // Busca a definição da vitrine
  const sectionRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'homeShowcaseSections', id as string);
  }, [db, id]);

  const { data: section, isLoading: isLoadingSection } = useDoc(sectionRef);

  // Busca os produtos contidos na vitrine
  const validProductIds = useMemo(() => {
    if (!section?.productIds || !Array.isArray(section.productIds)) return [];
    return section.productIds.slice(0, 30); // Limite do Firestore 'in'
  }, [section?.productIds]);

  const productsQuery = useMemoFirebase(() => {
    if (!db || validProductIds.length === 0) return null;
    return query(collection(db, 'products'), where(documentId(), 'in', validProductIds));
  }, [db, validProductIds]);

  const { data: rawProducts, isLoading: isLoadingProducts } = useCollection(productsQuery);

  // Reordena os produtos para manter a sequência definida no admin
  const products = useMemo(() => {
    if (!rawProducts || !section?.productIds) return [];
    return section.productIds
      .map(pId => rawProducts.find(p => p.id === pId))
      .filter(Boolean);
  }, [rawProducts, section?.productIds]);

  const isLoading = isLoadingSection || isLoadingProducts;

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
            
            {section && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-px w-12 bg-accent" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-accent">
                    {section.eyebrow}
                  </span>
                </div>
                <h1 className="text-4xl md:text-8xl font-headline font-bold text-primary leading-[0.95] tracking-tighter uppercase">
                  {section.title}
                </h1>
                <p className="text-base md:text-2xl text-muted-foreground font-light italic max-w-2xl leading-relaxed">
                  Uma curadoria exclusiva Toda Bela selecionada para você.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="container mx-auto px-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-accent/30" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Sincronizando Seleção...</p>
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-12">
              {products.map((product) => (
                <ProductCard 
                  key={product.id}
                  {...product}
                  onAddToCart={(selectedP) => {
                    addToCart(selectedP || product);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="py-40 text-center border-2 border-dashed border-primary/5 rounded-[3rem] bg-secondary/5">
               <Tag className="h-12 w-12 text-accent/20 mx-auto mb-6" />
               <h3 className="text-xl font-headline font-bold text-primary mb-2">Vitrine em atualização</h3>
               <p className="text-sm text-muted-foreground italic font-light">Esta seleção ainda não possui itens disponíveis.</p>
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
        onSuccess={() => {}}
      />
    </div>
  );
}
