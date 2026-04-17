"use client";

import React, { useState, useMemo } from 'react';
import { ArrowRight, Loader2, Star, Instagram, Facebook, Quote, Sparkles, Truck, ShoppingBag, X, Plus, Minus, Trash2 } from 'lucide-react';
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
import { LoginDialog } from '@/components/auth/LoginDialog';
import Autoplay from "embla-carousel-autoplay";
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const WHATSAPP_NUMBER = "5511999999999";

export default function TodaBelaHome() {
  const db = useFirestore();
  const { user } = useUser();
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Novidades");
  
  // Cart State
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const autoplayPlugin = useMemo(
    () => Autoplay({ delay: 5000, stopOnInteraction: true }),
    []
  );

  const adminDocRef = useMemo(() => {
    return (user && db) ? doc(db, 'roles_admin', user.uid) : null;
  }, [db, user]);
  
  const { data: adminRole } = useDoc(adminDocRef);
  const isAdmin = !!adminRole;

  // Queries
  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('order', 'asc'));
  }, [db]);
  const { data: categories } = useCollection(categoriesQuery);

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

  // Cart Functions
  const cartCount = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);
  const cartSubtotal = useMemo(() => cartItems.reduce((acc, item) => acc + (item.quantity * item.price), 0), [cartItems]);

  const addToCart = (product: any, buyNow = false) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
    if (buyNow) {
      setTimeout(() => handleCheckout(), 200);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems((current) =>
      current
        .map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId: string) => {
    setCartItems((current) => current.filter((item) => item.id !== productId));
  };

  const handleCheckout = () => {
    if (!cartItems.length) return;
    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    const lines = cartItems.map(item => `- ${item.name} | Qtd: ${item.quantity} | ${formatCurrency(item.price)}`);
    const message = encodeURIComponent(
      `Olá Maison Toda Bela! Quero finalizar meu pedido:%0A%0A${lines.join("%0A")}%0A%0ASubtotal: ${formatCurrency(cartSubtotal)}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30 selection:text-primary">
      <Navbar 
        onOpenLogin={() => setIsLoginOpen(true)} 
        onOpenTrack={() => setIsTrackOpen(true)} 
        onOpenCart={() => setCartOpen(true)}
        cartCount={cartCount}
      />

      <main>
        <Hero onShopNow={() => {
          const el = document.getElementById('colecao');
          el?.scrollIntoView({ behavior: 'smooth' });
        }} />

        <section id="colecao" className="container mx-auto px-4 py-24 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.5em] text-accent">L'Alchimie de la Saison</span>
              <h3 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tighter">Explore por Estilo</h3>
              <p className="max-w-xl text-muted-foreground/70 font-light italic text-lg">
                Curadoria inspirada na sofisticação atemporal e no frescor da moda contemporânea.
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
                <ProductCard key={product.id} {...product} onAddToCart={() => addToCart(product)} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4 rounded-[4rem] border-2 border-dashed border-primary/5">
                <p className="text-muted-foreground italic font-light">Sua nova conquista está sendo preparada.</p>
              </div>
            )}
          </div>
        </section>

        <section id="mais-vendidos" className="bg-secondary/20 py-32">
          <div className="container mx-auto px-4 md:px-12">
            <div className="flex flex-col items-center mb-20 text-center space-y-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.8em] text-accent">Territórios de Estilo</span>
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
                        <ProductCard {...product} onAddToCart={() => addToCart(product)} />
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

        <Newsletter />
      </main>

      {/* Cart Drawer Overlay */}
      {cartOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            className="ml-auto h-full w-full max-w-xl bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-8 border-b border-primary/5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Sua Curadoria</p>
                <h3 className="text-2xl font-headline font-bold text-primary">Sacola de Compras</h3>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCartOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {!cartItems.length ? (
                <div className="h-64 rounded-[3rem] border-2 border-dashed border-primary/5 flex flex-col items-center justify-center text-center space-y-4">
                  <ShoppingBag className="h-12 w-12 text-primary/10" />
                  <p className="text-muted-foreground italic font-light">Sua sacola ainda está vazia, Chérie.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-6 p-6 rounded-[2rem] border border-primary/5 bg-white shadow-sm">
                    <div className="h-28 w-20 rounded-2xl overflow-hidden shrink-0">
                      <img src={item.image} className="h-full w-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between">
                        <h4 className="font-bold text-primary">{item.name}</h4>
                        <button onClick={() => removeItem(item.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-[10px] font-bold uppercase text-accent tracking-widest mt-1">{item.category}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <p className="font-bold text-primary">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                        </p>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQuantity(item.id, -1)} className="h-8 w-8 rounded-full border border-primary/10 flex items-center justify-center hover:bg-secondary transition-colors">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-bold text-primary w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="h-8 w-8 rounded-full border border-primary/10 flex items-center justify-center hover:bg-secondary transition-colors">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 bg-secondary/30 border-t border-primary/5 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary/60 uppercase tracking-widest">Subtotal</span>
                <span className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartSubtotal)}
                </span>
              </div>
              <Button 
                onClick={handleCheckout}
                disabled={!cartItems.length}
                className="w-full h-16 rounded-full bg-primary text-white font-bold uppercase tracking-[0.4em] text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                Finalizar no WhatsApp
              </Button>
              <p className="text-[9px] text-center text-muted-foreground/50 font-bold uppercase tracking-[0.2em]">
                O checkout seguro será concluído em nossa Maison via WhatsApp
              </p>
            </div>
          </div>
        </div>
      )}

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
