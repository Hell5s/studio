
"use client";

import React, { useState, useMemo } from 'react';
import { ArrowRight, Loader2, Star, Instagram, Facebook, Quote, Sparkles, ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';
import { LogoMark } from '@/components/store/LogoMark';
import { Hero } from '@/components/store/Hero';
import { ProductCard } from '@/components/store/ProductCard';
import { Newsletter } from '@/components/store/Newsletter';
import { Navbar } from '@/components/store/Navbar';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AIProductGenerator } from '@/components/admin/AIProductGenerator';
import { OrderTrackingDialog } from '@/components/store/OrderTrackingDialog';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
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

export default function TodaBelaHome() {
  const db = useFirestore();
  const { user } = useUser();
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Novidades");

  const autoplayPlugin = useMemo(
    () => Autoplay({ delay: 5000, stopOnInteraction: true }),
    []
  );

  const adminDocRef = useMemo(() => {
    return (user && db) ? doc(db, 'roles_admin', user.uid) : null;
  }, [db, user]);
  
  const { data: adminRole } = useDoc(adminDocRef);
  const isAdmin = !!adminRole;

  // Categories query
  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('order', 'asc'));
  }, [db]);
  const { data: categories } = useCollection(categoriesQuery);

  // Products query
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(12));
  }, [db]);
  const { data: products, isLoading: productsLoading } = useCollection(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (selectedCategory === "Novidades") return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30 selection:text-primary">
      <Navbar onOpenLogin={() => setIsLoginOpen(true)} onOpenTrack={() => setIsTrackOpen(true)} />

      <main>
        <Hero />

        {/* Categories / Styles Explorer */}
        <section id="colecao" className="container mx-auto px-4 py-24 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.5em] text-accent">Coleções</span>
              <h3 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tighter">Explore por Estilo</h3>
              <p className="max-w-xl text-muted-foreground/70 font-light italic text-lg">
                Nossa curadoria é organizada para facilitar sua busca pela peça que define seu momento.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-16">
            {["Novidades", ...(categories?.map(c => c.name) || [])].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 border ${
                  selectedCategory === category
                    ? "bg-primary text-white border-primary shadow-xl"
                    : "border-primary/10 bg-white text-primary hover:bg-secondary"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {productsLoading ? (
              <div className="col-span-full flex justify-center py-20"><Loader2 className="h-12 w-12 animate-spin text-accent/20" /></div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4 rounded-[4rem] border-2 border-dashed border-primary/5">
                <p className="text-muted-foreground italic font-light">Nenhum item nesta categoria no momento.</p>
              </div>
            )}
          </div>
        </section>

        {/* Featured Carousel */}
        <section id="mais-vendidos" className="bg-secondary/20 py-32">
          <div className="container mx-auto px-4 md:px-12">
            <div className="flex flex-col items-center mb-20 text-center space-y-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.8em] text-accent">Destaques da Semana</span>
              <h3 className="text-5xl md:text-7xl font-headline font-bold text-primary tracking-tighter">Os Mais Desejados</h3>
            </div>

            <div className="relative">
              {productsLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="h-12 w-12 animate-spin text-accent/20" /></div>
              ) : products && products.length > 0 ? (
                <Carousel opts={{ align: "start" }} plugins={[autoplayPlugin]} className="w-full">
                  <CarouselContent className="-ml-10">
                    {products.slice(0, 8).map((product) => (
                      <CarouselItem key={product.id} className="pl-10 basis-full sm:basis-1/2 lg:basis-1/4">
                        <ProductCard {...product} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="flex justify-center gap-6 mt-16">
                    <CarouselPrevious className="relative translate-y-0 left-0 h-14 w-14 border-primary/10 bg-white text-primary rounded-full shadow-premium" />
                    <CarouselNext className="relative translate-y-0 right-0 h-14 w-14 border-primary/10 bg-white text-primary rounded-full shadow-premium" />
                  </div>
                </Carousel>
              ) : null}
            </div>
          </div>
        </section>

        {/* Benefits Grid from template */}
        <section className="bg-background py-24 border-y border-primary/5">
          <div className="container mx-auto px-4 md:px-12 grid gap-10 md:grid-cols-3">
            {[
              {
                title: "Curadoria Premium",
                text: "Layout refinado com estética editorial, experiência de marca forte e alto valor percebido em cada peça.",
                icon: <Sparkles className="h-8 w-8 text-accent" />
              },
              {
                title: "Atendimento Sublime",
                text: "Uma jornada de compra fluida e personalizada para garantir que sua experiência Maison seja perfeita.",
                icon: <Quote className="h-8 w-8 text-accent rotate-180" />
              },
              {
                title: "Logística VIP",
                text: "Entrega segura e rápida para todo o país, com o carinho que a sua nova conquista merece.",
                icon: <Truck className="h-8 w-8 text-accent" />
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[3rem] border border-primary/5 bg-white p-10 shadow-sm transition-all hover:shadow-xl group">
                <div className="mb-6 h-16 w-16 rounded-3xl bg-secondary/50 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6">
                  {item.icon}
                </div>
                <h4 className="text-2xl font-headline font-bold text-primary mb-4">{item.title}</h4>
                <p className="text-muted-foreground/80 leading-relaxed font-light italic">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <Newsletter />
      </main>

      <footer className="bg-white border-t border-primary/5 py-32">
        <div className="container mx-auto px-4 md:px-12">
          <div className="grid md:grid-cols-4 gap-16 mb-24">
            <div className="md:col-span-2 space-y-8">
              <LogoMark />
              <p className="text-lg font-light italic text-muted-foreground/70 leading-relaxed max-w-md">
                Moda feminina moderna com leveza, elegância e atitude. Nascemos para vestir mulheres que decidem ser protagonistas.
              </p>
            </div>
            
            <div>
              <h5 className="text-[11px] font-bold uppercase tracking-[0.5em] text-accent mb-8">Nossa Maison</h5>
              <ul className="space-y-4 text-sm font-light italic text-muted-foreground/60">
                <li className="hover:text-primary transition-colors cursor-pointer">Novidades</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Vestidos</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Conjuntos</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Promoções</li>
              </ul>
            </div>

            <div>
              <h5 className="text-[11px] font-bold uppercase tracking-[0.5em] text-accent mb-8">Atendimento</h5>
              <ul className="space-y-4 text-sm font-light italic text-muted-foreground/60">
                <li className="hover:text-primary transition-colors cursor-pointer" onClick={() => setIsTrackOpen(true)}>Rastrear Pedido</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Prazos e Entrega</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Trocas e Devoluções</li>
                <li className="hover:text-primary transition-colors cursor-pointer">WhatsApp VIP</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-16 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground/40">
            <p>© 2024 Maison Toda Bela. Todos os direitos reservados.</p>
            {isAdmin && <button onClick={() => setIsAdminOpen(true)} className="hover:text-accent transition-colors">Portal Administrativo</button>}
          </div>
        </div>
      </footer>

      {isAdmin && (
        <>
          <Dialog open={isAdminOpen} onOpenChange={setIsAdminOpen}>
            <DialogContent className="max-w-[95vw] w-full h-[90vh] overflow-hidden p-0 rounded-[4rem] border-none shadow-2xl">
              <DialogHeader className="sr-only">
                <DialogTitle>Maison Admin Toda Bela</DialogTitle>
                <DialogDescription>Gestão de catálogo e curadoria.</DialogDescription>
              </DialogHeader>
              <AdminDashboard 
                productsCount={products?.length || 0} 
                categoriesCount={categories?.length || 0} 
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
