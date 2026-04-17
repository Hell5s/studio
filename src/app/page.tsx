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
    name: 'Vestido Nuvem Encantada',
    price: 89.90,
    oldPrice: 129.90,
    badge: 'Mais Vendido',
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dummy-2',
    name: 'Conjunto Ursinho Soft',
    price: 64.90,
    badge: 'Novo',
    image: 'https://images.unsplash.com/photo-1522771917563-ee55471f1b66?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dummy-3',
    name: 'Sapatinho Brilho Mágico',
    price: 45.90,
    oldPrice: 59.90,
    badge: 'Destaque',
    image: 'https://images.unsplash.com/photo-1519705380846-aa397b9737b7?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dummy-4',
    name: 'Laço Estelar Glitter',
    price: 19.90,
    badge: 'Fofo',
    image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=900&q=80'
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
    Autoplay({ delay: 4000, stopOnInteraction: true })
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
      
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground py-2 text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest">
          Frete Grátis acima de R$ 150 • Mundo Encantado para seus Pequenos
        </p>
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-primary/10 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
          
          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            <a href="#novidades" className="hover:text-primary transition-colors">Novidades</a>
            <a href="#brinquedos" className="hover:text-primary transition-colors">Brinquedos</a>
            <a href="#festa" className="hover:text-primary transition-colors">Festa</a>
            <button onClick={() => setIsTrackOpen(true)} className="hover:text-primary transition-colors">Rastrear</button>
          </nav>

          <LogoMark />

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Button variant="ghost" size="icon" onClick={() => setIsAdminOpen(true)} className="rounded-full">
                    <Settings className="h-5 w-5" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs">Sair</Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setIsLoginOpen(true)} className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            )}

            <Button className="rounded-full bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Bolsinha
            </Button>
          </div>
        </div>
      </header>

      <main>
        <Hero />

        {/* Section: Categories */}
        <section className="container mx-auto px-4 py-20 md:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Universo Infantil</span>
            <h3 className="text-4xl font-headline font-bold mt-2">Nossas Coleções</h3>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Roupas", img: "https://images.unsplash.com/photo-1522771917563-ee55471f1b66?auto=format&fit=crop&w=800&q=80" },
              { name: "Sapatos", img: "https://images.unsplash.com/photo-1519705380846-aa397b9737b7?auto=format&fit=crop&w=800&q=80" },
              { name: "Brinquedos", img: "https://images.unsplash.com/photo-1500995015937-2d1254986a44?auto=format&fit=crop&w=800&q=80" },
              { name: "Acessórios", img: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80" },
            ].map((cat, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-[2.5rem] aspect-square cursor-pointer shadow-lg">
                <Image src={cat.img} alt={cat.name} fill className="object-cover transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-6 left-0 right-0 text-center">
                  <h4 className="text-xl font-bold text-white uppercase tracking-widest bg-primary/80 backdrop-blur-sm inline-block px-6 py-2 rounded-full">{cat.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Showcase */}
        <section id="novidades" className="bg-secondary/20 py-20">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-headline font-bold">Destaques Mágicos</h3>
              <p className="text-muted-foreground mt-2 italic">Peças que fazem cada momento especial.</p>
            </div>

            <div className="relative">
              {productsLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <Carousel opts={{ align: "start" }} plugins={[plugin.current]} className="w-full">
                  <CarouselContent className="-ml-6">
                    {displayProducts.map((product) => (
                      <CarouselItem key={product.id} className="pl-6 basis-full sm:basis-1/2 lg:basis-1/4">
                        <ProductCard {...product} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden md:flex" />
                  <CarouselNext className="hidden md:flex" />
                </Carousel>
              )}
            </div>
          </div>
        </section>

        <Newsletter />
      </main>

      <footer className="bg-white border-t border-primary/10 py-20">
        <div className="container mx-auto px-4 md:px-8 text-center space-y-8">
          <LogoMark />
          <p className="max-w-md mx-auto text-muted-foreground italic font-light">
            Levando cor e magia para a infância de milhares de crianças em todo o Brasil.
          </p>
          <div className="flex justify-center gap-6">
             <button className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary"><Instagram className="h-5 w-5" /></button>
             <button className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary"><Facebook className="h-5 w-5" /></button>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
            © 2024 Encanto Kids. Todos os direitos reservados.
          </p>
          {isAdmin && (
            <button onClick={() => setIsAdminOpen(true)} className="text-primary/40 hover:text-primary">
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </footer>

      {isAdmin && (
        <>
          <Dialog open={isAdminOpen} onOpenChange={setIsAdminOpen}>
            <DialogContent className="max-w-[95vw] w-full h-[90vh] overflow-hidden p-0 rounded-[2rem] border-none shadow-2xl">
              <DialogHeader className="sr-only">
                <DialogTitle>Admin Dashboard</DialogTitle>
                <DialogDescription>Gerencie sua loja dropshipping.</DialogDescription>
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