
"use client";

import React, { useState, useMemo } from 'react';
import { Search, ShoppingBag, User, ArrowRight, Instagram, Facebook, Heart, Truck, Loader2, Sparkles, Settings, LogOut } from 'lucide-react';
import { LogoMark } from '@/components/store/LogoMark';
import { Hero } from '@/components/store/Hero';
import { ProductCard } from '@/components/store/ProductCard';
import { Newsletter } from '@/components/store/Newsletter';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AIProductGenerator } from '@/components/admin/AIProductGenerator';
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LoginDialog } from '@/components/auth/LoginDialog';
import Autoplay from "embla-carousel-autoplay";

const dummyProducts = [
  {
    id: 'dummy-1',
    name: 'Vestido Midi Elegance',
    price: 149.90,
    oldPrice: 199.90,
    badge: 'Mais vendido',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dummy-2',
    name: 'Conjunto Soft Chic',
    price: 189.90,
    badge: 'Novo',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dummy-3',
    name: 'Blusa Minimal Glow',
    price: 89.90,
    oldPrice: 119.90,
    badge: 'Oferta',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dummy-4',
    name: 'Calça Wide Urban',
    price: 129.90,
    badge: 'Trend',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80'
  }
];

export default function TodaBelaStorefront() {
  const db = useFirestore();
  const auth = getAuth();
  const { user, isUserLoading } = useUser();
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  // Verificação de Admin
  const adminDocRef = useMemo(() => {
    return user ? doc(db, 'roles_admin', user.uid) : null;
  }, [db, user]);
  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminDocRef);
  const isAdmin = !!adminRole;

  // Fetch Categories
  const categoriesQuery = useMemoFirebase(() => {
    return query(collection(db, 'categories'), orderBy('order', 'asc'));
  }, [db]);
  const { data: categories, isLoading: categoriesLoading } = useCollection(categoriesQuery);

  // Fetch Products
  const productsQuery = useMemoFirebase(() => {
    let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(12));
    if (activeCategoryId !== "all") {
      q = query(collection(db, 'products'), where('categoryId', '==', activeCategoryId), orderBy('createdAt', 'desc'), limit(12));
    }
    return q;
  }, [db, activeCategoryId]);
  const { data: products, isLoading: productsLoading } = useCollection(productsQuery);

  const displayProducts = useMemo(() => {
    if (productsLoading) return [];
    if (products && products.length > 0) return products;
    // Só mostra dummy se estiver na categoria "Todas" e o banco estiver vazio
    return activeCategoryId === "all" ? dummyProducts : [];
  }, [products, productsLoading, activeCategoryId]);

  const handleLogout = () => {
    signOut(auth);
    setIsAdminOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
          <LogoMark />
          
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <a href="#colecao" className="text-foreground/70 transition-colors hover:text-primary">Coleção</a>
            <a href="#novidades" className="text-foreground/70 transition-colors hover:text-primary">Novidades</a>
            <a href="#categorias-grid" className="text-foreground/70 transition-colors hover:text-primary">Categorias</a>
            <a href="#newsletter" className="text-foreground/70 transition-colors hover:text-primary">Clube Toda Bela</a>
            <a href="#rastreio" className="flex items-center gap-2 text-primary font-semibold transition-colors hover:opacity-80">
              <Truck className="h-4 w-4" />
              Rastrear Pedido
            </a>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsAdminOpen(true)} 
                    className="rounded-full text-primary hover:bg-primary/5"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-primary gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setIsLoginOpen(true)} className="rounded-full text-foreground/70">
                <User className="h-5 w-5" />
              </Button>
            )}

            <Button className="rounded-full bg-primary px-5 py-6 text-sm font-semibold shadow-lg shadow-primary/10 group">
              <ShoppingBag className="mr-2 h-4 w-4 transition-transform group-hover:-rotate-12" />
              Carrinho
            </Button>
          </div>
        </div>
      </header>

      <main>
        <Hero />

        <section id="colecao" className="container mx-auto px-4 py-24 md:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
            <div className="max-w-xl text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/60">Novidades</span>
              <h3 className="mt-4 text-4xl md:text-5xl font-headline font-semibold text-foreground leading-tight">Looks que encantam</h3>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Nossa vitrine apresenta as peças mais desejadas da estação. Clique para explorar os detalhes de cada peça.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setActiveCategoryId("all")}
                variant={activeCategoryId === "all" ? "default" : "outline"}
                className={`rounded-full px-6 py-5 text-sm font-semibold transition-all duration-300 ${
                  activeCategoryId === "all" 
                    ? "shadow-md shadow-primary/20 scale-105" 
                    : "bg-white/50 border-primary/20 text-primary hover:bg-secondary"
                }`}
              >
                Todas
              </Button>
              {!categoriesLoading && categories?.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setActiveCategoryId(category.id)}
                  variant={activeCategoryId === category.id ? "default" : "outline"}
                  className={`rounded-full px-6 py-5 text-sm font-semibold transition-all duration-300 ${
                    activeCategoryId === category.id 
                      ? "shadow-md shadow-primary/20 scale-105" 
                      : "bg-white/50 border-primary/20 text-primary hover:bg-secondary"
                  }`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          <div id="novidades" className="relative px-4">
            {productsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : displayProducts.length > 0 ? (
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                plugins={[plugin.current]}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {displayProducts.map((product) => (
                    <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                      <div className="p-1">
                        <ProductCard {...product} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden md:flex justify-end gap-2 mt-8">
                  <CarouselPrevious className="relative left-0 translate-y-0 h-12 w-12 border-primary/10 hover:bg-secondary" />
                  <CarouselNext className="relative right-0 translate-y-0 h-12 w-12 border-primary/10 hover:bg-secondary" />
                </div>
              </Carousel>
            ) : (
              <div className="text-center py-20 text-muted-foreground border border-dashed rounded-[2rem] border-primary/20 bg-secondary/10">
                Nenhum produto disponível nesta categoria no momento.
              </div>
            )}
          </div>
        </section>

        <section id="categorias-grid" className="bg-secondary/30 py-24">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-16">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/60">Explore</span>
              <h3 className="mt-4 text-4xl md:text-5xl font-headline font-semibold text-foreground">Nossas Coleções</h3>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: "Vestidos", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80", hint: "dress elegant" },
                { name: "Conjuntos", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80", hint: "fashion outfit" },
                { name: "Blusas", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80", hint: "blouse style" },
                { name: "Calças", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80", hint: "trousers fashion" },
              ].map((cat, idx) => (
                <div key={idx} className="group relative overflow-hidden rounded-[2.5rem] aspect-[4/5] cursor-pointer shadow-lg hover:shadow-2xl transition-all">
                  <Image 
                    src={cat.image} 
                    alt={cat.name} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    data-ai-hint={cat.hint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-8 left-0 right-0 text-center">
                    <h4 className="text-2xl font-headline font-bold text-white tracking-wide">{cat.name}</h4>
                    <Button variant="link" className="text-white/80 hover:text-white mt-2 p-0 h-auto">
                      Ver Coleção <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Newsletter />
      </main>

      <footer className="border-t border-primary/10 bg-white/50 py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid gap-12 lg:grid-cols-4">
            <div className="lg:col-span-2 text-left">
              <LogoMark />
              <p className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground">
                Toda Bela é uma marca feminina moderna com presença delicada, sofisticada e acolhedora. 
                Nossa missão é realçar a beleza que já existe em você.
              </p>
            </div>
            
            <div className="text-left">
              <h4 className="font-headline font-bold text-foreground text-lg mb-8">Navegação</h4>
              <ul className="space-y-4 text-muted-foreground">
                <li className="transition-colors hover:text-primary cursor-pointer">Novidades</li>
                <li className="transition-colors hover:text-primary cursor-pointer">Vestidos</li>
                <li className="transition-colors hover:text-primary cursor-pointer">Promoções</li>
              </ul>
            </div>
            
            <div className="text-left">
              <h4 className="font-headline font-bold text-foreground text-lg mb-8">Ajuda</h4>
              <ul className="space-y-4 text-muted-foreground">
                <li className="transition-colors hover:text-primary cursor-pointer font-semibold text-primary">Rastrear Pedido</li>
                <li className="transition-colors hover:text-primary cursor-pointer">Trocas e Devoluções</li>
                <li className="transition-colors hover:text-primary cursor-pointer">Fale Conosco</li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-2 text-sm text-muted-foreground">
              <p>© 2024 Toda Bela Storefront. Todos os direitos reservados.</p>
              <div className="flex gap-4">
                <span className="hover:text-primary cursor-pointer transition-colors">Termos de Uso</span>
                <span className="hover:text-primary cursor-pointer transition-colors">Privacidade</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsAdminOpen(true)}
                  className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all"
                  title="Acessar Painel Administrativo"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Admin Button - Only visible for Admins */}
      {isAdmin && (
        <>
          <Button 
            onClick={() => setIsAdminOpen(true)}
            size="icon" 
            className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl bg-foreground text-background hover:bg-primary hover:text-white z-50 transition-all duration-300 scale-100 hover:scale-110"
          >
            <Settings className="h-6 w-6" />
          </Button>

          <Dialog open={isAdminOpen} onOpenChange={setIsAdminOpen}>
            <DialogContent className="max-w-[98vw] w-full h-[95vh] overflow-hidden p-0 rounded-[2.5rem] border-none shadow-2xl">
              <AdminDashboard 
                productsCount={products?.length || 0} 
                categoriesCount={categories?.length || 0} 
                onOpenAI={() => setIsAIGeneratorOpen(true)} 
              />
            </DialogContent>
          </Dialog>

          <AIProductGenerator 
            open={isAIGeneratorOpen} 
            onOpenChange={setIsAIGeneratorOpen} 
          />
        </>
      )}

      {/* Login Dialog */}
      <LoginDialog 
        open={isLoginOpen} 
        onOpenChange={setIsLoginOpen} 
        onAdminLogin={() => setIsAdminOpen(true)}
      />
    </div>
  );
}

