
"use client";

import React, { useState, useMemo } from 'react';
import { Search, ShoppingBag, User, ArrowRight, Instagram, Facebook, Heart, Truck, Loader2, Sparkles, Settings, LogOut } from 'lucide-react';
import { LogoMark } from '@/components/store/LogoMark';
import { Hero } from '@/components/store/Hero';
import { ProductCard } from '@/components/store/ProductCard';
import { Newsletter } from '@/components/store/Newsletter';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, where, doc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LoginDialog } from '@/components/auth/LoginDialog';
import Autoplay from "embla-carousel-autoplay";

export default function TodaBelaStorefront() {
  const db = useFirestore();
  const auth = getAuth();
  const { user, isUserLoading } = useUser();
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

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

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
          <LogoMark />
          
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <a href="#colecao" className="text-foreground/70 transition-colors hover:text-primary">Coleção</a>
            <a href="#novidades" className="text-foreground/70 transition-colors hover:text-primary">Novidades</a>
            <a href="#beneficios" className="text-foreground/70 transition-colors hover:text-primary">Benefícios</a>
            <a href="#newsletter" className="text-foreground/70 transition-colors hover:text-primary">Clube Toda Bela</a>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <a href="#rastreio" className="hidden sm:flex items-center gap-2 text-primary font-semibold transition-colors hover:opacity-80 text-sm mr-2">
              <Truck className="h-4 w-4" />
              Rastrear
            </a>
            
            {user ? (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-primary gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
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
            ) : products && products.length > 0 ? (
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                plugins={[plugin.current]}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {products.map((product) => (
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

        <section id="beneficios" className="bg-secondary/30 py-24">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: "Visual Premium",
                  text: "Paleta suave, layout elegante e identidade feminina com posicionamento de marca forte.",
                  icon: <Heart className="h-6 w-6" />,
                },
                {
                  title: "Feito para Converter",
                  text: "Botões destacados, seções objetivas e vitrine organizada para uma experiência fluida.",
                  icon: <ShoppingBag className="h-6 w-6" />,
                },
                {
                  title: "Curadoria Feminina",
                  text: "Peças escolhidas com carinho, pensando no conforto e na sofisticação da mulher moderna.",
                  icon: <User className="h-6 w-6" />,
                },
              ].map((item, idx) => (
                <div key={idx} className="group rounded-[2.5rem] border border-white/60 bg-white/50 p-10 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    {item.icon}
                  </div>
                  <h5 className="text-2xl font-headline font-semibold text-primary">{item.title}</h5>
                  <p className="mt-4 leading-relaxed text-muted-foreground">{item.text}</p>
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
        </div>
      </footer>

      {/* Floating Admin Button - Only visible for Admins */}
      {isAdmin && (
        <Dialog open={isAdminOpen} onOpenChange={setIsAdminOpen}>
          <DialogTrigger asChild>
            <Button 
              size="icon" 
              className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl bg-foreground text-background hover:bg-primary hover:text-white z-50 transition-all duration-300 scale-100 hover:scale-110"
            >
              <Settings className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-full h-[90vh] overflow-y-auto p-0 rounded-[2.5rem] border-none">
            <AdminDashboard 
              productsCount={products?.length || 0} 
              categoriesCount={categories?.length || 0} 
              onOpenAI={() => {}} 
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Login Dialog */}
      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </div>
  );
}
