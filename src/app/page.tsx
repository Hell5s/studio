
"use client";

import React, { useState, useMemo } from 'react';
import { ShoppingBag, User, ArrowRight, Truck, Loader2, Settings, LogOut, Star, Instagram, Facebook, Quote } from 'lucide-react';
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LoginDialog } from '@/components/auth/LoginDialog';
import Autoplay from "embla-carousel-autoplay";

const dummyProducts = [
  {
    id: 'dummy-1',
    name: 'Vestido Midi Elegance',
    price: 149.90,
    oldPrice: 199.90,
    badge: 'Maison Exclusive',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dummy-2',
    name: 'Conjunto Soft Chic',
    price: 189.90,
    badge: 'Nova Coleção',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dummy-3',
    name: 'Blusa Minimal Glow',
    price: 89.90,
    oldPrice: 119.90,
    badge: 'Destaque Editorial',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'dummy-4',
    name: 'Calça Wide Urban',
    price: 129.90,
    badge: 'Trend Alert',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80'
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

  const categoriesQuery = useMemoFirebase(() => {
    return query(collection(db, 'categories'), orderBy('order', 'asc'));
  }, [db]);
  const { data: categories, isLoading: categoriesLoading } = useCollection(categoriesQuery);

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
    return activeCategoryId === "all" ? dummyProducts : [];
  }, [products, productsLoading, activeCategoryId]);

  const handleLogout = () => {
    signOut(auth);
    setIsAdminOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FFF9F7] text-[#2A1F22] selection:bg-brand-rose selection:text-brand-wine">
      
      {/* Top Banner */}
      <div className="bg-brand-wine text-white py-2 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">
          Frete grátis em pedidos acima de R$ 300 • Parcele em até 10x
        </p>
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-brand-wine/5 bg-white/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-24 items-center justify-between px-4 md:px-8">
          
          <nav className="hidden lg:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-wine/60">
            <a href="#colecao" className="transition-colors hover:text-brand-wine border-b border-transparent hover:border-brand-wine pb-1">Novidades</a>
            <a href="#colecoes" className="transition-colors hover:text-brand-wine border-b border-transparent hover:border-brand-wine pb-1">Coleções</a>
            <a href="#festa" className="transition-colors hover:text-brand-wine border-b border-transparent hover:border-brand-wine pb-1 font-extrabold text-brand-gold">Moda Festa</a>
            <button onClick={() => setIsTrackOpen(true)} className="transition-colors hover:text-brand-wine border-b border-transparent hover:border-brand-wine pb-1">Rastrear Pedido</button>
            <a href="#sobre" className="transition-colors hover:text-brand-wine border-b border-transparent hover:border-brand-wine pb-1">Maison</a>
          </nav>

          <LogoMark />

          <div className="flex items-center gap-2 md:gap-6">
            <button 
              onClick={() => setIsTrackOpen(true)}
              className="hidden sm:flex items-center gap-2 text-brand-wine/40 mr-4 hover:text-brand-wine transition-colors group"
            >
              <Truck className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Rastrear</span>
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsAdminOpen(true)} 
                    className="rounded-full text-brand-wine hover:bg-brand-blush/50"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-brand-wine/60 hover:text-brand-wine gap-2 font-bold uppercase tracking-widest text-[10px]">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setIsLoginOpen(true)} className="rounded-full text-brand-wine/60 hover:text-brand-wine">
                <User className="h-5 w-5" />
              </Button>
            )}

            <Button className="rounded-full bg-brand-wine px-8 py-7 text-[11px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-brand-wine/20 hover:scale-105 transition-all">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Bag
            </Button>
          </div>
        </div>
      </header>

      <main>
        <Hero />

        {/* Section: Categories Editorial Grid */}
        <section id="colecoes" className="container mx-auto px-4 py-32 md:px-8">
          <div className="text-center mb-20 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-brand-gold">The Edit</span>
            <h3 className="text-5xl md:text-6xl font-headline font-bold text-brand-wine">Nossas Coleções</h3>
            <div className="h-1 w-20 bg-brand-gold mx-auto" />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Vestidos", label: "Pure Elegance", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80" },
              { name: "Conjuntos", label: "Modern Tailoring", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80" },
              { name: "Blusas", label: "Soft Essence", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80" },
              { name: "Calças", label: "Urban Silhouette", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80" },
            ].map((cat, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-[4rem] aspect-[3/4] cursor-pointer shadow-2xl hover:shadow-[0_50px_100px_-20px_rgba(110,60,71,0.2)] transition-all duration-700">
                <Image 
                  src={cat.image} 
                  alt={cat.name} 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-wine/90 via-brand-wine/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
                <div className="absolute inset-0 border-[1px] border-white/20 m-6 rounded-[3.5rem] pointer-events-none transition-all duration-700 group-hover:m-4" />
                
                <div className="absolute bottom-12 left-0 right-0 text-center px-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold mb-2 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                    {cat.label}
                  </p>
                  <h4 className="text-3xl font-headline font-bold text-white tracking-widest uppercase">{cat.name}</h4>
                  <div className="mt-6 overflow-hidden h-0 group-hover:h-12 transition-all duration-500">
                    <Button variant="link" className="text-white border-b border-white rounded-none p-0 h-auto text-[10px] font-bold uppercase tracking-[0.3em]">
                      Ver Peças
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Best Sellers Showcase */}
        <section id="colecao" className="bg-brand-blush/20 py-32">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row items-end justify-between gap-10 mb-20 border-b border-brand-wine/5 pb-10">
              <div className="max-w-xl text-left">
                <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-brand-gold">Curadoria</span>
                <h3 className="mt-4 text-5xl md:text-6xl font-headline font-bold text-brand-wine leading-tight">Must-Have da Estação</h3>
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed font-light italic">
                  Selecionamos as peças que definem a essência Toda Bela para este mês.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => setActiveCategoryId("all")}
                  className={`rounded-full px-8 py-6 text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${
                    activeCategoryId === "all" 
                      ? "bg-brand-wine text-white shadow-xl scale-105" 
                      : "bg-white border-none text-brand-wine/40 hover:text-brand-wine"
                  }`}
                >
                  Todas as Peças
                </Button>
                {!categoriesLoading && categories?.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategoryId(category.id)}
                    className={`rounded-full px-8 py-6 text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${
                      activeCategoryId === category.id 
                        ? "bg-brand-wine text-white shadow-xl scale-105" 
                        : "bg-white border-none text-brand-wine/40 hover:text-brand-wine"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              {productsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-brand-gold" />
                </div>
              ) : displayProducts.length > 0 ? (
                <Carousel
                  opts={{ align: "start", loop: true }}
                  plugins={[plugin.current]}
                  className="w-full"
                >
                  <CarouselContent className="-ml-8">
                    {displayProducts.map((product) => (
                      <CarouselItem key={product.id} className="pl-8 basis-full sm:basis-1/2 lg:basis-1/4">
                        <div className="p-1">
                          <ProductCard {...product} />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="hidden md:flex justify-end gap-4 mt-12">
                    <CarouselPrevious className="relative left-0 translate-y-0 h-14 w-14 rounded-full border-brand-wine/10 hover:bg-brand-wine hover:text-white transition-all shadow-xl" />
                    <CarouselNext className="relative right-0 translate-y-0 h-14 w-14 rounded-full border-brand-wine/10 hover:bg-brand-wine hover:text-white transition-all shadow-xl" />
                  </div>
                </Carousel>
              ) : (
                <div className="text-center py-20 rounded-[4rem] border-2 border-dashed border-brand-wine/10 bg-white/50">
                  <p className="text-brand-wine/40 font-bold uppercase tracking-widest">Nenhuma peça encontrada.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section: Campaign Storytelling */}
        <section className="py-32 overflow-hidden">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid lg:grid-cols-2 items-center gap-20">
              <div className="relative group animate-in fade-in slide-in-from-left-12 duration-1000">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-rose opacity-20 blur-3xl" />
                <div className="relative aspect-square rounded-[5rem] overflow-hidden border-[1px] border-brand-wine/10 shadow-2xl">
                  <Image 
                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80" 
                    alt="Campaign Shot"
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                  />
                </div>
                <div className="absolute -bottom-10 -right-10 w-64 h-80 bg-brand-blush rounded-[3rem] -z-10" />
              </div>

              <div className="space-y-10">
                <div className="space-y-6">
                  <span className="text-[11px] font-bold uppercase tracking-[0.5em] text-brand-gold">L’Essence</span>
                  <h3 className="text-5xl md:text-6xl font-headline font-bold text-brand-wine leading-tight">
                    O Poder do Minimalismo Sofisticado
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed font-light italic border-l-2 border-brand-gold pl-8">
                    "A moda Toda Bela não é apenas sobre roupas, é sobre a confiança que você veste ao entrar em um ambiente."
                  </p>
                </div>
                <div className="grid gap-6">
                  {[
                    { t: "Curadoria Exclusiva", d: "Peças selecionadas a dedo para garantir que você tenha um closet atemporal." },
                    { t: "Qualidade Premium", d: "Tecidos nobres e acabamentos feitos com maestria artesanal." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 items-start">
                      <div className="h-10 w-10 rounded-full bg-brand-blush flex items-center justify-center shrink-0">
                        <Star className="h-4 w-4 text-brand-wine" />
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-brand-wine uppercase tracking-widest text-xs mb-1">{item.t}</h4>
                        <p className="text-sm text-muted-foreground font-light">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="rounded-full bg-brand-wine text-white px-10 py-7 text-[10px] font-bold uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
                  Conhecer a Maison
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Testimonials Editorial */}
        <section className="bg-brand-wine py-32 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-10">
             <Quote className="h-64 w-64" />
          </div>
          <div className="container mx-auto px-4 md:px-8 relative z-10">
             <div className="max-w-4xl mx-auto text-center space-y-12">
                <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-brand-gold">Testemunhos</span>
                <Carousel opts={{ loop: true }} className="w-full">
                  <CarouselContent>
                    {[
                      { text: "As peças da Toda Bela transformaram a forma como eu me vejo. Cada vestido parece ter sido feito sob medida para a minha confiança.", author: "Helena Soares", role: "Arquiteta" },
                      { text: "Sofisticação e conforto em um equilíbrio que eu nunca encontrei em outra marca brasileira. Um luxo necessário.", author: "Isabella Martins", role: "Executiva" },
                      { text: "A curadoria é impecável. O atendimento me faz sentir em uma verdadeira maison parisiense.", author: "Bia Ferreira", role: "Digital Influencer" }
                    ].map((item, i) => (
                      <CarouselItem key={i}>
                        <div className="space-y-8 px-10">
                          <p className="text-3xl md:text-5xl font-headline font-light italic leading-tight text-brand-blush">
                            "{item.text}"
                          </p>
                          <div className="space-y-1">
                            <p className="font-bold text-brand-gold uppercase tracking-[0.3em] text-sm">{item.author}</p>
                            <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">{item.role}</p>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="bg-white/5 border-white/10 hover:bg-white/20" />
                  <CarouselNext className="bg-white/5 border-white/10 hover:bg-white/20" />
                </Carousel>
             </div>
          </div>
        </section>

        {/* Section: Instagram Lifestyle */}
        <section className="py-32 bg-[#FFF9F7]">
           <div className="container mx-auto px-4 md:px-8">
              <div className="text-center mb-16 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-brand-gold">Instagram</span>
                <h3 className="text-4xl font-headline font-bold text-brand-wine">#TodaBelaMaison</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                 {[1,2,3,4,5,6].map(i => (
                   <div key={i} className="relative aspect-square overflow-hidden rounded-[2.5rem] group cursor-pointer shadow-xl transition-all duration-700 hover:-translate-y-2">
                      <Image 
                        src={`https://picsum.photos/seed/${i+100}/800/800`} 
                        alt="Instagram"
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-brand-wine/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                         <Instagram className="text-white h-8 w-8" />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        <Newsletter />
      </main>

      <footer className="border-t border-brand-wine/10 bg-white py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid gap-20 lg:grid-cols-4">
            <div className="lg:col-span-2 space-y-10">
              <LogoMark />
              <p className="max-w-md text-lg leading-relaxed text-muted-foreground font-light italic">
                Toda Bela é uma Maison contemporânea dedicada à mulher que não abre mão da sofisticação e da leveza. 
                Nossa essência reside na curadoria de peças que realçam a elegância natural.
              </p>
              <div className="flex gap-6">
                 <button className="h-12 w-12 rounded-full border border-brand-wine/10 flex items-center justify-center text-brand-wine hover:bg-brand-wine hover:text-white transition-all">
                    <Instagram className="h-5 w-5" />
                 </button>
                 <button className="h-12 w-12 rounded-full border border-brand-wine/10 flex items-center justify-center text-brand-wine hover:bg-brand-wine hover:text-white transition-all">
                    <Facebook className="h-5 w-5" />
                 </button>
              </div>
            </div>
            
            <div className="space-y-8">
              <h4 className="font-headline font-bold text-brand-wine text-xs uppercase tracking-[0.4em] mb-8">Navegação</h4>
              <ul className="space-y-4 text-sm text-muted-foreground font-medium uppercase tracking-widest text-[11px]">
                <li className="transition-colors hover:text-brand-wine cursor-pointer">Novidades</li>
                <li className="transition-colors hover:text-brand-wine cursor-pointer">Coleções</li>
                <li className="transition-colors hover:text-brand-wine cursor-pointer">Best Sellers</li>
                <li className="transition-colors hover:text-brand-wine cursor-pointer">Editorial</li>
              </ul>
            </div>
            
            <div className="space-y-8">
              <h4 className="font-headline font-bold text-brand-wine text-xs uppercase tracking-[0.4em] mb-8">Service Client</h4>
              <ul className="space-y-4 text-sm text-muted-foreground font-medium uppercase tracking-widest text-[11px]">
                <li onClick={() => setIsTrackOpen(true)} className="transition-colors hover:text-brand-gold cursor-pointer font-bold text-brand-gold">Rastrear Pedido</li>
                <li className="transition-colors hover:text-brand-wine cursor-pointer">Trocas e Devoluções</li>
                <li className="transition-colors hover:text-brand-wine cursor-pointer">Privacidade</li>
                <li className="transition-colors hover:text-brand-wine cursor-pointer">Termos de Uso</li>
              </ul>
            </div>
          </div>

          <div className="mt-24 pt-12 border-t border-brand-wine/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              © 2024 Toda Bela Maison. All rights reserved. Crafted for elegance.
            </p>
            <div className="flex items-center gap-6">
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsAdminOpen(true)}
                  className="text-brand-wine/40 hover:text-brand-wine transition-all"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </footer>

      {isAdmin && (
        <>
          <Button 
            onClick={() => setIsAdminOpen(true)}
            size="icon" 
            className="fixed bottom-10 right-10 h-16 w-16 rounded-full shadow-[0_20px_50px_rgba(110,60,71,0.3)] bg-brand-wine text-white hover:bg-brand-wine/90 z-50 transition-all duration-500 hover:scale-110"
          >
            <Settings className="h-7 w-7" />
          </Button>

          <Dialog open={isAdminOpen} onOpenChange={setIsAdminOpen}>
            <DialogContent className="max-w-[98vw] w-full h-[95vh] overflow-hidden p-0 rounded-[4rem] border-none shadow-2xl">
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

      <LoginDialog 
        open={isLoginOpen} 
        onOpenChange={setIsLoginOpen} 
        onAdminLogin={() => setIsAdminOpen(true)}
      />

      <OrderTrackingDialog 
        open={isTrackOpen}
        onOpenChange={setIsTrackOpen}
      />
    </div>
  );
}
