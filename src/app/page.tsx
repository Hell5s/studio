"use client";

import React, { useState, useMemo } from 'react';
import { ShoppingBag, User, ArrowRight, Truck, Loader2, Settings, Star, Instagram, Facebook, Quote, Sparkles, ShieldCheck, Heart } from 'lucide-react';
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

export default function TodaBelaHome() {
  const db = useFirestore();
  const auth = getAuth();
  const { user } = useUser();
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
    return query(collection(db, 'products'), where('published', '==', true), orderBy('createdAt', 'desc'), limit(12));
  }, [db]);
  const { data: products, isLoading: productsLoading } = useCollection(productsQuery);

  const displayProducts = useMemo(() => {
    if (productsLoading) return [];
    if (products && products.length > 0) return products;
    return dummyProducts;
  }, [products, productsLoading]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onOpenLogin={() => setIsLoginOpen(true)} onOpenTrack={() => setIsTrackOpen(true)} />

      <main>
        <Hero />

        {/* Seção: Categorias Visuais */}
        <section id="colecoes" className="container mx-auto px-4 py-32 md:px-8">
          <div className="flex flex-col items-center mb-20 text-center space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-accent">Curadoria Exclusiva</span>
            <h3 className="text-5xl md:text-7xl font-headline font-black text-primary text-editorial">Explore por Categorias</h3>
            <p className="text-muted-foreground italic font-light max-w-lg">
              Peças selecionadas para elevar sua presença em qualquer ocasião.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Vestidos", img: "https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=800&q=80", count: "12 Itens" },
              { name: "Conjuntos", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80", count: "08 Itens" },
              { name: "Looks Festa", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80", count: "15 Itens" },
              { name: "Casual Chic", img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80", count: "10 Itens" },
            ].map((cat, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-[3rem] aspect-[3/4] cursor-pointer shadow-2xl">
                <Image src={cat.img} alt={cat.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                <div className="absolute bottom-10 left-0 right-0 text-center px-6">
                  <h4 className="text-2xl font-bold text-white uppercase tracking-widest">{cat.name}</h4>
                  <p className="text-[10px] font-bold text-accent uppercase tracking-[0.3em] mt-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">{cat.count}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Seção: Mais Vendidos (Premium Grid) */}
        <section id="mais-vendidos" className="bg-secondary/20 py-32 overflow-hidden">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-accent">Os Favoritos</span>
                <h3 className="text-5xl md:text-7xl font-headline font-black text-primary text-editorial">Desejados da Estação</h3>
              </div>
              <Button variant="ghost" className="text-accent font-bold uppercase tracking-[0.3em] text-[10px] group border border-accent/20 rounded-full px-8 h-14">
                Ver Catálogo Completo <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-3 transition-transform" />
              </Button>
            </div>

            <div className="relative">
              {productsLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
              ) : (
                <Carousel opts={{ align: "start" }} plugins={[plugin.current]} className="w-full">
                  <CarouselContent className="-ml-10">
                    {displayProducts.map((product) => (
                      <CarouselItem key={product.id} className="pl-10 basis-full sm:basis-1/2 lg:basis-1/4">
                        <ProductCard {...product} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="flex justify-center gap-4 mt-16">
                    <CarouselPrevious className="relative translate-y-0 left-0 h-14 w-14 border-primary/10 hover:bg-white text-primary rounded-full shadow-lg" />
                    <CarouselNext className="relative translate-y-0 right-0 h-14 w-14 border-primary/10 hover:bg-white text-primary rounded-full shadow-lg" />
                  </div>
                </Carousel>
              )}
            </div>
          </div>
        </section>

        {/* Seção: Banner de Campanha Editorial */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-8">
            <div className="relative h-[80vh] rounded-[4rem] overflow-hidden group">
              <Image 
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80" 
                alt="Campanha Toda Bela" 
                fill 
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-primary/30" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <div className="space-y-6 max-w-4xl animate-in fade-in zoom-in duration-1000">
                  <span className="text-[11px] font-bold uppercase tracking-[0.8em] text-accent">Preview de Inverno</span>
                  <h3 className="text-6xl md:text-9xl font-headline font-black text-white text-editorial leading-none">A Nobreza do Atemporal</h3>
                  <p className="text-xl text-white/80 font-light italic max-w-xl mx-auto">
                    "Moda passa, estilo permanece." Descubra looks que transcendem estações.
                  </p>
                  <Button className="mt-8 rounded-full bg-white text-primary hover:bg-accent hover:text-white px-12 py-10 text-[11px] font-bold uppercase tracking-[0.4em] shadow-2xl transition-all">
                    Descobrir Looks
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção: Storytelling & Prova Social */}
        <section className="py-32 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-12">
                <div className="space-y-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-accent">L’Essence Toda Bela</span>
                  <h3 className="text-5xl md:text-7xl font-headline font-black text-primary leading-tight">Celebrando a sua Melhor Versão</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed font-light italic">
                    Nascemos do desejo de oferecer mais do que roupas: oferecemos confiança. Cada costura, cada tecido e cada detalhe é pensado para a mulher que não tem medo de ser protagonista da própria história.
                  </p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="p-10 rounded-[3rem] bg-secondary/30 border border-primary/5 space-y-4">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                    <h5 className="font-bold text-primary uppercase tracking-widest text-sm">Qualidade Maison</h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">Curadoria rigorosa de tecidos e acabamentos premium.</p>
                  </div>
                  <div className="p-10 rounded-[3rem] bg-secondary/30 border border-primary/5 space-y-4">
                    <Truck className="h-8 w-8 text-primary" />
                    <h5 className="font-bold text-primary uppercase tracking-widest text-sm">Entrega VIP</h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">Logística ágil e segura para todo o território nacional.</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square rounded-[5rem] overflow-hidden border-[15px] border-secondary shadow-2xl">
                  <Image 
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80" 
                    alt="Lifestyle Toda Bela" 
                    fill 
                    className="object-cover"
                  />
                </div>
                {/* Testemunho Flutuante */}
                <div className="absolute -left-10 -bottom-10 glass p-10 rounded-[3rem] shadow-2xl max-w-sm border-white/40">
                  <Quote className="h-10 w-10 text-accent mb-4" />
                  <p className="text-primary italic font-medium leading-relaxed mb-6">
                    "O vestido da Toda Bela foi o destaque da minha noite. Nunca me senti tão elegante e confortável ao mesmo tempo."
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-accent" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-primary">Helena Silveira</p>
                      <div className="flex text-accent">
                        {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-current" />)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Newsletter />
      </main>

      <footer className="bg-primary text-primary-foreground py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-4 gap-16 mb-20 border-b border-white/5 pb-20">
            <div className="md:col-span-1 space-y-8">
              <LogoMark />
              <p className="text-sm font-light italic opacity-70 leading-relaxed">
                Nossa missão é celebrar a beleza e a confiança de cada mulher através de uma curadoria de moda sofisticada e atual.
              </p>
              <div className="flex gap-4">
                <button className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-primary transition-all"><Instagram className="h-5 w-5" /></button>
                <button className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-primary transition-all"><Facebook className="h-5 w-5" /></button>
              </div>
            </div>
            
            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent mb-10">Explorar</h5>
              <ul className="space-y-4 text-sm font-light opacity-70">
                <li className="hover:opacity-100 transition-opacity"><a href="#novidades">Novidades</a></li>
                <li className="hover:opacity-100 transition-opacity"><a href="#colecoes">Coleções</a></li>
                <li className="hover:opacity-100 transition-opacity"><a href="#moda-festa">Moda Festa</a></li>
                <li className="hover:opacity-100 transition-opacity"><a href="#lifestyle">Lifestyle</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent mb-10">Suporte</h5>
              <ul className="space-y-4 text-sm font-light opacity-70">
                <li className="hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setIsTrackOpen(true)}>Rastrear Pedido</li>
                <li className="hover:opacity-100 transition-opacity">Trocas e Devoluções</li>
                <li className="hover:opacity-100 transition-opacity">Guia de Tamanhos</li>
                <li className="hover:opacity-100 transition-opacity">Privacidade</li>
              </ul>
            </div>

            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent mb-10">Maison</h5>
              <ul className="space-y-4 text-sm font-light opacity-70">
                <li>Showroom: São Paulo, Jardins</li>
                <li>WhatsApp: (11) 99999-9999</li>
                <li>E-mail: boutique@todabela.com</li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 text-[9px] font-bold uppercase tracking-[0.4em]">
            <p>© 2024 Toda Bela Maison. Todos os direitos reservados.</p>
            <div className="flex gap-10">
              {isAdmin && <button onClick={() => setIsAdminOpen(true)} className="hover:text-accent transition-colors">Acesso Administrativo</button>}
            </div>
          </div>
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