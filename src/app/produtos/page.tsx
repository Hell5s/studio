"use client";

import React, { useMemo, useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, limit, orderBy } from 'firebase/firestore';
import { Navbar } from '@/components/store/Navbar';
import { Footer } from '@/components/store/Footer';
import { ProductCard } from '@/components/store/ProductCard';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { CheckoutDialog } from '@/components/store/CheckoutDialog';
import { FavoritesDialog } from '@/components/store/FavoritesDialog';
import { Loader2, Tag, ArrowLeft, Filter, X, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from '@/lib/utils';

export default function AllProductsPage() {
  const db = useFirestore();
  const { cart, addToCart, updateQuantity, removeFromCart, cartCount, cartTotal } = useCart();
  
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  // Estados de Filtro e Ordenação
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<string>('recent');

  const categoriesQuery = useMemoFirebase(() => query(collection(db, 'categories'), orderBy('name')), [db]);
  const { data: categories } = useCollection(categoriesQuery);

  const allProductsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'), 
      limit(80)
    );
  }, [db]);

  const { data: products, isLoading } = useCollection(allProductsQuery);

  // Lógica de Filtro e Ordenação (Client-side)
  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];
    
    let result = [...products];

    // Filtro por Tamanho
    if (selectedSizes.length > 0) {
      result = result.filter(p => 
        p.sizes && Array.isArray(p.sizes) && p.sizes.some((s: string) => selectedSizes.includes(s))
      );
    }

    // Ordenação
    if (sortOrder === 'price-asc') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOrder === 'price-desc') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return result;
  }, [products, selectedSizes, sortOrder]);

  // Extrair tamanhos únicos disponíveis
  const availableSizes = useMemo(() => {
    if (!products) return [];
    const sizes = new Set<string>();
    products.forEach(p => {
      if (p.sizes && Array.isArray(p.sizes)) {
        p.sizes.forEach((s: string) => sizes.add(s));
      }
    });
    return Array.from(sizes).sort();
  }, [products]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setSortOrder('recent');
  };

  const SidebarContent = () => (
    <div className="space-y-10">
      {/* Categorias */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 border-b border-primary/5 pb-2">Coleções</h3>
        <nav className="flex flex-col gap-3">
          {categories?.map((cat) => {
            const catSlug = cat.name.toLowerCase().trim().replace(/\s+/g, '-');
            return (
              <Link 
                key={cat.id} 
                href={`/categoria/${catSlug}`}
                className="text-xs font-medium text-primary/60 hover:text-primary transition-colors uppercase tracking-widest"
              >
                {cat.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tamanhos */}
      {availableSizes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 border-b border-primary/5 pb-2">Tamanho</h3>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={cn(
                  "h-9 min-w-[40px] px-2 flex items-center justify-center text-[10px] font-bold border transition-all rounded-sm uppercase tracking-tighter",
                  selectedSizes.includes(size)
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-primary/40 border-primary/10 hover:border-primary/40"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {(selectedSizes.length > 0 || sortOrder !== 'recent') && (
        <button 
          onClick={clearFilters}
          className="text-[9px] font-bold uppercase tracking-widest text-accent flex items-center gap-2 hover:underline underline-offset-4"
        >
          <X className="h-3 w-3" /> Limpar Filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background selection:bg-accent/30 selection:text-primary overflow-x-hidden">
      <Navbar 
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenCart={() => setIsCheckoutOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        cartCount={cartCount}
      />

      <main className="pt-32 pb-24 md:pt-40 md:pb-40">
        <section className="container mx-auto px-6 mb-8 md:mb-12">
          <div className="max-w-4xl space-y-4 md:space-y-6">
            <Link href="/" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-accent transition-colors group">
              <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Voltar para Início
            </Link>
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-accent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-accent">Coleção Completa</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-headline font-bold text-primary leading-[0.95] tracking-tighter">
              Todos os Produtos
            </h1>
          </div>
        </section>

        {/* Toolbar */}
        <section className="container mx-auto px-6 mb-10">
           <div className="flex flex-col md:flex-row justify-between items-center py-4 border-y border-primary/5 gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/60">
                 <Link href="/" className="hover:text-accent transition-colors">Início</Link>
                 <span className="opacity-30">/</span>
                 <span className="text-primary">Produtos</span>
              </div>
              
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-bold text-primary/30 uppercase tracking-widest hidden sm:block">
                  Exibindo {filteredAndSortedProducts.length} produtos
                </span>
                
                <div className="flex items-center gap-3">
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="h-9 w-44 rounded-full bg-secondary/20 border-none text-[10px] font-bold uppercase tracking-widest focus:ring-0">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent" className="text-[10px] font-bold uppercase">Mais recentes</SelectItem>
                      <SelectItem value="price-asc" className="text-[10px] font-bold uppercase">Menor preço</SelectItem>
                      <SelectItem value="price-desc" className="text-[10px] font-bold uppercase">Maior preço</SelectItem>
                    </SelectContent>
                  </Select>

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="md:hidden h-9 w-9 rounded-full border-primary/10">
                        <SlidersHorizontal className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[280px] bg-[#FFF9F7] border-r-primary/5">
                      <SheetHeader className="text-left border-b border-primary/5 pb-6 mb-8">
                        <SheetTitle className="text-xs font-bold uppercase tracking-[0.3em]">Filtros</SheetTitle>
                      </SheetHeader>
                      <SidebarContent />
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
           </div>
        </section>

        <section className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12 items-start">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block sticky top-32">
              <SidebarContent />
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-accent/30" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Sincronizando Loja...</p>
                </div>
              ) : filteredAndSortedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-10">
                  {filteredAndSortedProducts.map((product) => (
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
                  <h3 className="text-xl font-headline font-bold text-primary mb-2">
                    Nenhum resultado encontrado
                  </h3>
                  <p className="text-sm text-muted-foreground italic font-light">
                    Tente ajustar seus filtros para encontrar o que procura.
                  </p>
                  {(selectedSizes.length > 0 || sortOrder !== 'recent') && (
                    <Button 
                      onClick={clearFilters}
                      className="mt-8 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-widest h-12 px-8"
                    >
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
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