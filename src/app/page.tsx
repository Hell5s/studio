"use client";

import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  Loader2, 
  Star, 
  Instagram, 
  Quote, 
  Truck, 
  ShoppingBag, 
  X, 
  Plus, 
  Minus, 
  Trash2,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Heart,
  Search,
  User,
  Package
} from 'lucide-react';
import { Navbar } from '@/components/store/Navbar';
import { Hero } from '@/components/store/Hero';
import { ProductCard } from '@/components/store/ProductCard';
import { Newsletter } from '@/components/store/Newsletter';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { OrderTrackingDialog } from '@/components/store/OrderTrackingDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';

const WHATSAPP_NUMBER = "5511999999999";

export default function TodaBelaHome() {
  const db = useFirestore();
  const { user } = useUser();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Novidades");
  
  // Cart State
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Auth Context
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
      const existing = current.find((item) => item.id === (product.id || product.productId));
      if (existing) {
        return current.map((item) =>
          item.id === (product.id || product.productId) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, id: product.id || product.productId, quantity: 1 }];
    });
    if (!buyNow) setCartOpen(true);
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
      `Olá Maison Toda Bela! Gostaria de finalizar minha curadoria:%0A%0A${lines.join("%0A")}%0A%0ASubtotal: ${formatCurrency(cartSubtotal)}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20">
      <Navbar 
        onOpenLogin={() => setIsLoginOpen(true)} 
        onOpenTrack={() => setIsTrackOpen(true)} 
        onOpenCart={() => setCartOpen(true)}
        cartCount={cartCount}
      />

      <main>
        {/* Hero Section Refined */}
        <Hero onShopNow={() => {
          const el = document.getElementById('catalogo');
          el?.scrollIntoView({ behavior: 'smooth' });
        }} />

        {/* Categories Section - Visual Cards */}
        <section className="py-32 container mx-auto px-6 md:px-12">
          <div className="text-center mb-20 space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent">L'Art de Vivre</span>
            <h2 className="text-5xl md:text-7xl font-headline font-bold text-primary tracking-tighter">Universo de Estilo</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Vestidos', img: 'https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=600&q=80', badge: 'Essenciais' },
              { name: 'Moda Festa', img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80', badge: 'Noite' },
              { name: 'Conjuntos', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80', badge: 'Duo' },
              { name: 'Casual Chic', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80', badge: 'Dia' },
            ].map((cat, i) => (
              <div key={cat.name} className="group relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-editorial cursor-pointer">
                <Image 
                  src={cat.img} 
                  alt={cat.name} 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  data-ai-hint="fashion style category"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                <div className="absolute bottom-10 left-10 text-white space-y-2">
                  <Badge variant="outline" className="text-white border-white/40 text-[9px] uppercase tracking-widest px-4">{cat.badge}</Badge>
                  <h3 className="text-3xl font-headline font-bold">{cat.name}</h3>
                  <button className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    Descobrir <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Products Catalog - Editorial Layout */}
        <section id="catalogo" className="py-32 bg-secondary/10">
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent">La Sélection Premium</span>
                <h2 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tighter">Peças de Desejo</h2>
              </div>
              <div className="flex flex-wrap gap-4 no-scrollbar">
                {["Novidades", ...(categories?.map(c => c.name) || [])].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 border ${
                      selectedCategory === category
                        ? "bg-primary text-white border-primary shadow-lg"
                        : "border-primary/10 bg-white text-primary hover:bg-secondary"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {productsLoading ? (
              <div className="flex justify-center py-40"><Loader2 className="h-12 w-12 animate-spin text-accent/30" /></div>
            ) : (
              <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} onAddToCart={() => addToCart(product)} />
                ))}
                {filteredProducts.length === 0 && (
                  <div className="col-span-full py-40 text-center border-2 border-dashed border-primary/10 rounded-[4rem]">
                    <p className="text-muted-foreground italic font-light">Em breve, novas curadorias disponíveis nesta coleção.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Storytelling Section */}
        <section className="py-40 relative overflow-hidden">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="relative aspect-[3/4] rounded-[5rem] overflow-hidden shadow-2xl z-10">
                <Image 
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80" 
                  alt="Toda Bela Manifesto" 
                  fill 
                  className="object-cover"
                  data-ai-hint="luxury fashion model"
                />
              </div>
              <div className="space-y-12">
                <div className="space-y-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.8em] text-accent">Notre Manifeste</span>
                  <h2 className="text-5xl md:text-7xl font-headline font-bold text-primary leading-tight tracking-tighter">
                    Toda Bela veste mulheres que <span className="text-accent italic font-light">decidem ser</span> protagonistas.
                  </h2>
                  <p className="text-xl text-muted-foreground/80 leading-relaxed font-light italic">
                    Não somos apenas uma boutique. Somos uma curadoria de presença. Cada peça Maison Toda Bela é selecionada para traduzir a força e a delicadeza de quem sabe exatamente onde quer chegar.
                  </p>
                </div>
                <div className="flex gap-10">
                  <div className="space-y-2">
                    <p className="text-4xl font-headline font-bold text-primary">01.</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Curadoria Global</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-4xl font-headline font-bold text-primary">02.</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Estilo Autoral</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-4xl font-headline font-bold text-primary">03.</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Alma Feminina</p>
                  </div>
                </div>
                <Button variant="outline" className="rounded-full px-12 py-8 text-[11px] font-bold uppercase tracking-[0.4em] border-primary/20 hover:bg-primary hover:text-white transition-all">
                  Conheça Nossa História
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary/20 -skew-x-12 translate-x-1/2 -z-0" />
        </section>

        {/* Benefits Bar */}
        <section className="bg-primary py-24 text-primary-foreground">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid md:grid-cols-4 gap-16">
              {[
                { icon: <Truck className="h-6 w-6" />, title: 'Envio VIP', desc: 'Curadoria entregue em todo o Brasil' },
                { icon: <Sparkles className="h-6 w-6" />, title: 'Exclusividade', desc: 'Peças selecionadas a dedo' },
                { icon: <ShieldCheck className="h-6 w-6" />, title: 'Pagamento Seguro', desc: 'Até 10x sem juros' },
                { icon: <ShoppingBag className="h-6 w-6" />, title: 'Maison Ativa', desc: 'Suporte VIP via WhatsApp' },
              ].map((benefit, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-full bg-white/10">{benefit.icon}</div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest">{benefit.title}</p>
                    <p className="text-[10px] opacity-60 font-light italic">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-32 bg-secondary/10">
          <div className="container mx-auto px-6 md:px-12">
            <div className="text-center mb-20">
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent">L'Écho des Clients</span>
              <h2 className="text-4xl md:text-6xl font-headline font-bold text-primary mt-4 tracking-tighter">O Relato da Experiência</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: 'Juliana P.', quote: 'O caimento do vestido é algo surreal. Senti-me poderosa e extremamente elegante. A Maison Toda Bela superou minhas expectativas.', rating: 5 },
                { name: 'Fernanda M.', quote: 'A curadoria é impecável. Cada detalhe, desde o atendimento até a entrega rápida, respira profissionalismo e bom gosto.', rating: 5 },
                { name: 'Carla S.', quote: 'Peças únicas que não encontro em lugar nenhum. Minha nova loja favorita para eventos especiais.', rating: 5 },
              ].map((t, i) => (
                <div key={i} className="p-10 rounded-[3rem] bg-white shadow-editorial space-y-6">
                  <Quote className="h-8 w-8 text-accent/40" />
                  <p className="text-lg italic font-light text-muted-foreground leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center justify-between border-t border-primary/5 pt-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">{t.name}</p>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, j) => <Star key={j} className="h-3 w-3 fill-accent text-accent" />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section - Refined */}
        <Newsletter />
      </main>

      {/* Cart Drawer Overlay */}
      {cartOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            className="ml-auto h-full w-full max-w-xl bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-10 border-b border-primary/5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">L'Art de Shopper</p>
                <h3 className="text-2xl font-headline font-bold text-primary">Sacola de Curadoria</h3>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCartOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
              {!cartItems.length ? (
                <div className="h-80 rounded-[4rem] border-2 border-dashed border-primary/5 flex flex-col items-center justify-center text-center space-y-6">
                  <ShoppingBag className="h-12 w-12 text-primary/10" />
                  <p className="text-muted-foreground italic font-light">Sua sacola aguarda por sua primeira escolha, Chérie.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-8 p-6 rounded-[2.5rem] bg-white shadow-editorial border border-primary/5">
                    <div className="h-32 w-24 rounded-2xl overflow-hidden shrink-0">
                      <img src={item.image} className="h-full w-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-primary text-lg">{item.name}</h4>
                        <button onClick={() => removeItem(item.id)} className="text-muted-foreground/30 hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-[10px] font-bold uppercase text-accent tracking-widest mt-1">{item.category}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <p className="font-bold text-primary">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                        </p>
                        <div className="flex items-center gap-4">
                          <button onClick={() => updateQuantity(item.id, -1)} className="h-8 w-8 rounded-full border border-primary/10 flex items-center justify-center hover:bg-secondary transition-colors">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-bold text-primary">{item.quantity}</span>
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

            <div className="p-10 bg-secondary/30 border-t border-primary/5 space-y-8">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary/40 uppercase tracking-[0.3em]">Total da Curadoria</span>
                <span className="text-3xl font-bold text-primary">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartSubtotal)}
                </span>
              </div>
              <Button 
                onClick={handleCheckout}
                disabled={!cartItems.length}
                className="w-full h-16 rounded-full bg-primary text-white font-bold uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:scale-[1.02] transition-all"
              >
                Finalizar no WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Refined */}
      <footer className="bg-white border-t border-primary/5 pt-32 pb-16">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-2">
                <h3 className="text-4xl font-headline font-bold text-primary leading-none">Toda Bela</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent">Maison de Mode</p>
              </div>
              <p className="text-lg font-light italic text-muted-foreground/70 leading-relaxed max-w-md">
                Moda feminina moderna com leveza, elegância e atitude. Nascemos para vestir mulheres que decidem ser protagonistas.
              </p>
              <div className="flex gap-6">
                <Button variant="ghost" size="icon" className="rounded-full bg-secondary/20 hover:bg-primary hover:text-white transition-all">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-secondary/20 hover:bg-primary hover:text-white transition-all">
                  <Star className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-10">
              <h5 className="text-[11px] font-bold uppercase tracking-[0.5em] text-accent">Navegação</h5>
              <ul className="space-y-4 text-sm font-light italic text-muted-foreground/60">
                {['Novidades', 'Vestidos', 'Conjuntos', 'Moda Festa', 'Mais Vendidos'].map(link => (
                  <li key={link} className="hover:text-primary transition-colors cursor-pointer">{link}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-10">
              <h5 className="text-[11px] font-bold uppercase tracking-[0.5em] text-accent">Suporte</h5>
              <ul className="space-y-4 text-sm font-light italic text-muted-foreground/60">
                <li className="hover:text-primary transition-colors cursor-pointer" onClick={() => setIsTrackOpen(true)}>Rastrear Pedido</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Trocas e Devoluções</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Prazos e Entrega</li>
                <li className="hover:text-primary transition-colors cursor-pointer">WhatsApp VIP</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-16 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-bold uppercase tracking-[0.5em] text-muted-foreground/40">
            <p>© 2024 Maison Toda Bela. Todos os direitos reservados.</p>
            <div className="flex gap-10">
              <span className="hover:text-primary transition-colors cursor-pointer">Políticas</span>
              <span className="hover:text-primary transition-colors cursor-pointer">Termos</span>
              {isAdmin && <span className="hover:text-primary transition-colors cursor-pointer">Admin</span>}
            </div>
          </div>
        </div>
      </footer>

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      <OrderTrackingDialog open={isTrackOpen} onOpenChange={setIsTrackOpen} />
    </div>
  );
}