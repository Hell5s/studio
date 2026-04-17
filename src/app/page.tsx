"use client";

import React, { useState, useMemo } from 'react';
import { ShoppingBag, ArrowRight, Truck, Loader2, Star, Instagram, Facebook, Quote, Sparkles, ShieldCheck, Heart, ArrowUpRight, CheckCircle2 } from 'lucide-react';
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
  const { user } = useUser();
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);

  const autoplayPlugin = useMemo(
    () => Autoplay({ delay: 5000, stopOnInteraction: true }),
    []
  );

  const adminDocRef = useMemo(() => {
    return (user && db) ? doc(db, 'roles_admin', user.uid) : null;
  }, [db, user]);
  
  const { data: adminRole } = useDoc(adminDocRef);
  const isAdmin = !!adminRole;

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(12));
  }, [db]);
  
  const { data: products, isLoading: productsLoading } = useCollection(productsQuery);

  const displayProducts = useMemo(() => {
    if (productsLoading) return [];
    if (products && products.length > 0) return products;
    return dummyProducts;
  }, [products, productsLoading]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30 selection:text-primary">
      <Navbar onOpenLogin={() => setIsLoginOpen(true)} onOpenTrack={() => setIsTrackOpen(true)} />

      <main>
        <Hero />

        {/* 1. Categorias Visuais */}
        <section id="colecoes" className="container mx-auto px-4 py-32 md:px-12">
          <div className="flex flex-col items-center mb-24 text-center space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-0.5 w-10 bg-accent/40" />
              <span className="text-[11px] font-bold uppercase tracking-[0.8em] text-accent">Curadoria Exclusiva</span>
              <div className="h-0.5 w-10 bg-accent/40" />
            </div>
            <h3 className="text-5xl md:text-8xl font-headline font-bold text-primary text-editorial">Explore Universos</h3>
            <p className="text-muted-foreground/70 italic font-light max-w-lg mx-auto">
              Peças selecionadas para elevar sua presença em qualquer ocasião social ou profissional.
            </p>
          </div>

          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Vestidos", img: "https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=800&q=80", count: "18 Peças" },
              { name: "Conjuntos", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80", count: "12 Peças" },
              { name: "Moda Festa", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80", count: "24 Peças" },
              { name: "Alfaiataria", img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80", count: "15 Peças" },
            ].map((cat, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-[4rem] aspect-[3/4.5] cursor-pointer shadow-premium transition-all duration-700">
                <Image src={cat.img} alt={cat.name} fill className="object-cover transition-transform duration-[1.5s] group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
                <div className="absolute bottom-12 left-0 right-0 text-center px-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                  <h4 className="text-2xl font-bold text-white uppercase tracking-[0.2em] mb-2">{cat.name}</h4>
                  <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em]">{cat.count}</span>
                    <ArrowUpRight className="h-3 w-3 text-accent" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Mais Vendidos (Premium Grid) */}
        <section id="mais-vendidos" className="bg-secondary/20 py-32 md:py-40">
          <div className="container mx-auto px-4 md:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px w-12 bg-accent/40" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.8em] text-accent">Os Favoritos</span>
                </div>
                <h3 className="text-5xl md:text-8xl font-headline font-bold text-primary text-editorial">Desejados da Estação</h3>
              </div>
              <Button variant="outline" className="rounded-full border-primary/20 text-primary font-bold uppercase tracking-[0.4em] text-[10px] h-16 px-12 group hover:bg-white hover:border-primary/40 shadow-sm transition-all duration-500">
                Ver Catálogo Completo <ArrowRight className="ml-4 h-4 w-4 group-hover:translate-x-3 transition-transform" />
              </Button>
            </div>

            <div className="relative">
              {productsLoading ? (
                <div className="flex justify-center py-32"><Loader2 className="h-16 w-16 animate-spin text-accent/40" /></div>
              ) : (
                <Carousel opts={{ align: "start" }} plugins={[autoplayPlugin]} className="w-full">
                  <CarouselContent className="-ml-12">
                    {displayProducts.map((product) => (
                      <CarouselItem key={product.id} className="pl-12 basis-full sm:basis-1/2 lg:basis-1/4">
                        <ProductCard {...product} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="flex justify-center gap-6 mt-20">
                    <CarouselPrevious className="relative translate-y-0 left-0 h-16 w-16 border-primary/10 hover:bg-white text-primary rounded-full shadow-premium" />
                    <CarouselNext className="relative translate-y-0 right-0 h-16 w-16 border-primary/10 hover:bg-white text-primary rounded-full shadow-premium" />
                  </div>
                </Carousel>
              )}
            </div>
          </div>
        </section>

        {/* 3. Banner de Campanha Editorial */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-12">
            <div className="relative h-[85vh] rounded-[6rem] overflow-hidden group shadow-premium">
              <Image 
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80" 
                alt="Campanha Maison Toda Bela" 
                fill 
                className="object-cover scale-105 group-hover:scale-100 transition-all duration-[2s] brightness-[0.85]"
              />
              <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                <div className="space-y-8 max-w-5xl animate-in fade-in zoom-in duration-1000">
                  <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.8em] text-white">Preview Fall 2024</span>
                  </div>
                  <h3 className="text-6xl md:text-[10rem] font-headline font-bold text-white text-editorial leading-[0.8] tracking-tighter">A Nobreza do Atemporal</h3>
                  <p className="text-xl md:text-2xl text-white/90 font-light italic max-w-2xl mx-auto leading-relaxed">
                    "Moda é efêmera, a elegância Toda Bela é para sempre." Descubra looks que transcendem gerações.
                  </p>
                  <Button className="mt-12 rounded-full bg-white text-primary hover:bg-accent hover:text-white px-16 py-10 text-[11px] font-bold uppercase tracking-[0.5em] shadow-2xl transition-all duration-700 hover:scale-110 active:scale-95">
                    Descobrir a Coleção
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Storytelling de Moda (L'Essence) */}
        <section className="py-40 bg-white overflow-hidden">
          <div className="container mx-auto px-4 md:px-12">
            <div className="grid lg:grid-cols-2 gap-32 items-center">
              <div className="space-y-16">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-px w-16 bg-accent/40" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.8em] text-accent">L’Essence Maison</span>
                  </div>
                  <h3 className="text-5xl md:text-8xl font-headline font-bold text-primary leading-[0.9] tracking-tighter">Celebrando a sua Melhor Versão</h3>
                  <p className="text-lg md:text-xl text-muted-foreground/80 leading-relaxed font-light italic">
                    Nascemos do desejo de oferecer mais do que vestuário: oferecemos ferramentas de autoconfiança. Cada costura, cada fibra e cada detalhe é pensado para a mulher que decide ser protagonista da própria narrativa.
                  </p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-10">
                  {[
                    { icon: <ShieldCheck className="h-8 w-8 text-accent" />, title: "Qualidade Maison", desc: "Curadoria rigorosa de tecidos e acabamentos artesanais premium." },
                    { icon: <Truck className="h-8 w-8 text-accent" />, title: "Logística VIP", desc: "Entrega expressa e segura para as principais capitais do país." }
                  ].map((item, i) => (
                    <div key={i} className="p-12 rounded-[4rem] bg-secondary/30 border border-primary/5 space-y-6 hover:shadow-xl transition-all duration-500">
                      <div className="bg-white h-16 w-16 rounded-3xl flex items-center justify-center shadow-sm">
                        {item.icon}
                      </div>
                      <h5 className="font-bold text-primary uppercase tracking-[0.2em] text-sm">{item.title}</h5>
                      <p className="text-xs text-muted-foreground/70 leading-relaxed italic">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square rounded-[6rem] overflow-hidden border-[20px] border-secondary shadow-premium group">
                  <Image 
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80" 
                    alt="Lifestyle Maison Toda Bela" 
                    fill 
                    className="object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  />
                </div>
                {/* 4. Prova Social (Testemunho Flutuante) */}
                <div className="absolute -left-12 -bottom-12 glass p-12 rounded-[4rem] shadow-premium max-w-md border-white/60 animate-float">
                  <Quote className="h-12 w-12 text-accent/30 mb-6" />
                  <p className="text-primary italic font-medium leading-relaxed mb-8 text-lg">
                    "O atendimento da Toda Bela é impecável, mas o vestido... me senti em um red carpet. Elegância sem esforço."
                  </p>
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-white">
                      <Image src="https://picsum.photos/seed/face-99/100/100" alt="Avatar" width={48} height={48} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Helena Silveira</p>
                      <div className="flex text-accent mt-1">
                        {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-current" />)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Instagram / Lifestyle Grid */}
        <section className="py-32 bg-background border-y border-primary/5">
          <div className="container mx-auto px-4 md:px-12">
            <div className="flex flex-col items-center mb-20 text-center space-y-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.8em] text-accent">Nosso Universo</span>
              <h3 className="text-5xl md:text-7xl font-headline font-bold text-primary">@MaisonTodaBela</h3>
              <p className="text-muted-foreground/70 italic font-light max-w-lg mx-auto">Siga nossa jornada e inspire-se com looks reais.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="aspect-square relative rounded-3xl overflow-hidden group cursor-pointer">
                  <Image 
                    src={`https://picsum.photos/seed/insta-${i+10}/600/600`} 
                    alt="Instagram Post" 
                    fill 
                    className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-3" 
                  />
                  <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <Instagram className="text-white h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Newsletter />
      </main>

      <footer className="bg-primary text-primary-foreground py-40">
        <div className="container mx-auto px-4 md:px-12">
          <div className="grid md:grid-cols-4 gap-20 mb-32 border-b border-white/5 pb-32">
            <div className="md:col-span-1 space-y-10">
              <LogoMark />
              <p className="text-sm font-light italic opacity-60 leading-relaxed max-w-xs">
                Maison Toda Bela: Redefinindo a elegância contemporânea através de uma curadoria exclusiva para a mulher protagonista.
              </p>
              <div className="flex gap-6">
                <button className="h-14 w-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-500 group"><Instagram className="h-5 w-5 group-hover:scale-110" /></button>
                <button className="h-14 w-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-500 group"><Facebook className="h-5 w-5 group-hover:scale-110" /></button>
              </div>
            </div>
            
            <div>
              <h5 className="text-[11px] font-bold uppercase tracking-[0.5em] text-accent mb-12">Maison</h5>
              <ul className="space-y-6 text-sm font-light opacity-60">
                <li className="hover:opacity-100 hover:text-accent transition-all cursor-pointer flex items-center gap-2 group"><CheckCircle2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" /> Novidades</li>
                <li className="hover:opacity-100 hover:text-accent transition-all cursor-pointer flex items-center gap-2 group"><CheckCircle2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" /> Coleções</li>
                <li className="hover:opacity-100 hover:text-accent transition-all cursor-pointer flex items-center gap-2 group"><CheckCircle2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" /> Editorial</li>
                <li className="hover:opacity-100 hover:text-accent transition-all cursor-pointer flex items-center gap-2 group"><CheckCircle2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" /> Showroom</li>
              </ul>
            </div>

            <div>
              <h5 className="text-[11px] font-bold uppercase tracking-[0.5em] text-accent mb-12">Atendimento</h5>
              <ul className="space-y-6 text-sm font-light opacity-60">
                <li className="hover:opacity-100 hover:text-accent transition-all cursor-pointer flex items-center gap-2 group" onClick={() => setIsTrackOpen(true)}>Rastrear Pedido</li>
                <li className="hover:opacity-100 hover:text-accent transition-all cursor-pointer">Trocas e Devoluções</li>
                <li className="hover:opacity-100 hover:text-accent transition-all cursor-pointer">Privacidade</li>
                <li className="hover:opacity-100 hover:text-accent transition-all cursor-pointer">Termos de Uso</li>
              </ul>
            </div>

            <div>
              <h5 className="text-[11px] font-bold uppercase tracking-[0.5em] text-accent mb-12">Contato</h5>
              <ul className="space-y-6 text-sm font-light opacity-60">
                <li className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent/60">WhatsApp VIP</span>
                  <span>(11) 99999-9999</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent/60">Concierge Digital</span>
                  <span>maison@todabela.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 opacity-30 text-[10px] font-bold uppercase tracking-[0.5em]">
            <p>© 2024 Maison Toda Bela. Todos os direitos reservados.</p>
            <div className="flex gap-12">
              {isAdmin && <button onClick={() => setIsAdminOpen(true)} className="hover:text-accent transition-colors">Portal Administrativo</button>}
            </div>
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