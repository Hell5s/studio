"use client";

import React, { useState, useMemo } from 'react';
import { ShoppingBag, User, ArrowRight, Truck, Loader2, Settings, LogOut, Star, Instagram, Facebook, Quote, Sparkles } from 'lucide-react';
import { LogoMark } from '@/components/store/LogoMark';
import { Hero } from '@/components/store/Hero';
import { ProductCard } from '@/components/store/ProductCard';
import { Newsletter } from '@/components/store/Newsletter';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AIProductGenerator } from '@/components/admin/AIProductGenerator';
import { OrderTrackingDialog } from '@/components/store/OrderTrackingDialog';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, where, doc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LoginDialog } from '@/components/auth/LoginDialog';
import Autoplay from "embla-carousel-autoplay";

const dummyProducts = [
  {
    id: 'dummy-1',
    name: 'Vestido Midi Satin Rouge',
    price: 249.90,
    oldPrice: 329.90,
    badge: 'Mais Vendido',
    image: 'https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dummy-2',
    name: 'Conjunto Tweed Classique',
    price: 389.90,
    badge: 'Novo',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dummy-3',
    name: 'Blusa Seda Essence',
    price: 159.90,
    oldPrice: 199.90,
    badge: 'Destaque',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dummy-4',
    name: 'Calça Alfaiataria Chic',
    price: 219.90,
    badge: 'Trend',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80'
  }
];

export default function TodaBelaStorefront() {
  const db = useFirestore();
  const auth = getAuth();
  const { user } = useUser();
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const adminDocRef = useMemo(() => {
    return user ? doc(db, 'roles_admin', user.uid) : null;
  }, [db, user]);
  const { data: adminRole } = useDoc(adminDocRef);
  const isAdmin = !!adminRole;

  const productsQuery = useMemoFirebase(() => {
    // Only show published products to customers
    let q = query(collection(db, 'products'), where('published', '==', true), orderBy('createdAt', 'desc'), limit(12));
    if (activeCategoryId !== "all") {
      q = query(collection(db, 'products'), where('published', '==', true), where('categoryId', '==', activeCategoryId), orderBy('createdAt', 'desc'), limit(12));
    }
    return q;
  }, [db, activeCategoryId]);
  const { data: products, isLoading: productsLoading } = useCollection(productsQuery);

  const displayProducts = useMemo(() => {
    if (productsLoading) return [];
    if (products && products.length > 0) return products;
    return activeCategoryId === "all" ? dummyProducts : [];
  }, [products, productsLoading, activeCategoryId]);

  const handleLogout = () => {
    signOut(auth);
    setIsAdminOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Premium Top Bar */}
      <div className="bg-primary text-primary-foreground py-2 text-center overflow-hidden">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">
          Frete Grátis em Compras acima de R$ 299 • Use o cupom TODABELA10
        </p>
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-primary/5 bg-white/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
          
          <nav className="hidden lg:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <a href="#novidades" className="hover:text-primary transition-all">Novidades</a>
            <a href="#colecoes" className="hover:text-primary transition-all">Coleções</a>
            <button onClick={() => setIsTrackOpen(true)} className="hover:text-primary transition-all">Rastrear</button>
          </nav>

          <LogoMark />

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Button variant="ghost" size="icon" onClick={() => setIsAdminOpen(true)} className="rounded-full hover:bg-primary/5">
                    <Settings className="h-5 w-5 text-primary" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-[10px] font-bold uppercase tracking-widest opacity-50 hover:opacity-100">Sair</Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setIsLoginOpen(true)} className="rounded-full hover:bg-primary/5">
                <User className="h-5 w-5 text-primary" />
              </Button>
            )}

            <Button className="rounded-full bg-primary text-primary-foreground font-bold px-6 shadow-xl shadow-primary/20 hover:scale-105 transition-all">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Carrinho
            </Button>
          </div>
        </div>
      </header>

      <main>
        <Hero />

        {/* Section: Collections Editorial */}
        <section id="colecoes" className="container mx-auto px-4 py-24 md:px-8">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent">Curadoria Especial</span>
            <h3 className="text-4xl md:text-5xl font-headline font-bold text-primary">Explore por Categorias</h3>
            <div className="h-1 w-20 bg-accent mx-auto rounded-full" />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Vestidos", img: "https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=800&q=80", count: "12 Peças" },
              { name: "Conjuntos", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80", count: "08 Peças" },
              { name: "Blusas", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80", count: "15 Peças" },
              { name: "Calças", img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80", count: "10 Peças" },
            ].map((cat, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-[2.5rem] aspect-[4/5] cursor-pointer shadow-2xl">
                <Image src={cat.img} alt={cat.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-10 left-0 right-0 text-center px-6">
                  <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h4 className="text-xl font-bold text-primary uppercase tracking-widest">{cat.name}</h4>
                    <p className="text-[10px] font-bold text-accent uppercase tracking-[0.3em] mt-2">{cat.count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Showcase Carrossel */}
        <section id="novidades" className="bg-secondary/30 py-24">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent">Tendências</span>
                <h3 className="text-4xl md:text-5xl font-headline font-bold text-primary">Peças que Encantam</h3>
              </div>
              <Button variant="ghost" className="text-accent font-bold uppercase tracking-[0.2em] text-[10px] group">
                Ver Tudo <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>

            <div className="relative">
              {productsLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <Carousel opts={{ align: "start" }} plugins={[plugin.current]} className="w-full">
                  <CarouselContent className="-ml-8">
                    {displayProducts.map((product) => (
                      <CarouselItem key={product.id} className="pl-8 basis-full sm:basis-1/2 lg:basis-1/4">
                        <ProductCard {...product} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden md:flex -left-16" />
                  <CarouselNext className="hidden md:flex -right-16" />
                </Carousel>
              )}
            </div>
          </div>
        </section>

        <Newsletter />
      </main>

      <footer className="bg-white border-t border-primary/5 py-24">
        <div className="container mx-auto px-4 md:px-8 text-center space-y-12">
          <LogoMark />
          <p className="max-w-md mx-auto text-muted-foreground italic font-light leading-relaxed">
            Nossa missão é celebrar a beleza e a confiança de cada mulher através de uma curadoria de moda sofisticada e atual.
          </p>
          <div className="flex justify-center gap-6">
             <button className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-primary hover:scale-110 transition-transform"><Instagram className="h-5 w-5" /></button>
             <button className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-primary hover:scale-110 transition-transform"><Facebook className="h-5 w-5" /></button>
          </div>
          <p className="text-[9px] uppercase font-bold tracking-[0.4em] text-muted-foreground/50">
            © 2024 Toda Bela Maison. Todos os direitos reservados.
          </p>
          {isAdmin && (
            <button onClick={() => setIsAdminOpen(true)} className="text-primary/20 hover:text-primary transition-colors">
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </footer>

      {isAdmin && (
        <>
          <Dialog open={isAdminOpen} onOpenChange={setIsAdminOpen}>
            <DialogContent className="max-w-[95vw] w-full h-[90vh] overflow-hidden p-0 rounded-[3rem] border-none shadow-2xl">
              <DialogHeader className="sr-only">
                <DialogTitle>Painel Administrativo Toda Bela</DialogTitle>
                <DialogDescription>Gerencie o catálogo, banners e importações da sua boutique.</DialogDescription>
              </DialogHeader>
              <AdminDashboard 
                productsCount={products?.length || 0} 
                categoriesCount={4} 
                onOpenAI={() => setIsAIGeneratorOpen(true)} 
              />
            </DialogContent>
          </Dialog>

          <AIProductGenerator open={isAIGeneratorOpen} onOpenChange={setIsAIGeneratorOpen} />
        </>
      )}

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} onAdminLogin={() => setIsAdminOpen(true)} />
      <OrderTrackingDialog open={isTrackOpen} onOpenChange={setIsTrackOpen} />
    </div>
  );
}