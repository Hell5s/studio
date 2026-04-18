
"use client";

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { Navbar } from '@/components/store/Navbar';
import { Hero } from '@/components/store/Hero';
import { ProductCard } from '@/components/store/ProductCard';
import { Newsletter } from '@/components/store/Newsletter';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { OrderTrackingDialog } from '@/components/store/OrderTrackingDialog';
import { CheckoutDialog } from '@/components/store/CheckoutDialog';
import { AIProductGenerator } from '@/components/admin/AIProductGenerator';
import { Loader2, Sparkles, ChevronRight } from 'lucide-react';

export default function TodaBelaStorefront() {
  const db = useFirestore();
  
  // Estados de Interface
  const [isAdminView, setIsAdminView] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchValue] = useState("");
  
  // Carrinho
  const [cart, setCart] = useState<any[]>([]);
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  // Consulta de Produtos (Sincronização em Tempo Real)
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  }, [db]);
  
  const { data: storeProducts, isLoading } = useCollection(productsQuery);

  // Filtragem de Busca e Categorização
  const filteredProducts = useMemo(() => {
    if (!storeProducts) return [];
    const search = searchQuery.toLowerCase().trim();
    if (!search) return storeProducts;
    return storeProducts.filter(p => 
      p.name?.toLowerCase().includes(search) || 
      p.id?.toLowerCase().includes(search) ||
      p.category?.toLowerCase().includes(search)
    );
  }, [storeProducts, searchQuery]);

  const featuredProducts = useMemo(() => 
    filteredProducts.filter(p => p.featured || p.badge === 'Destaque').slice(0, 4), 
  [filteredProducts]);

  const latestProducts = useMemo(() => 
    filteredProducts.filter(p => p.published !== false).slice(0, 8), 
  [filteredProducts]);

  // Ações
  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCheckoutOpen(true);
  };

  const handleSearch = (val: string) => {
    setSearchValue(val);
    if (val) {
      const el = document.getElementById('vitrine');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Se estiver no modo Admin, exibe o Dashboard completo
  if (isAdminView) {
    return (
      <div className="h-screen bg-background">
        <AdminDashboard 
          productsCount={storeProducts?.length || 0}
          categoriesCount={0}
          onOpenAI={() => setIsAIOpen(true)}
          onExit={() => setIsAdminView(false)}
        />
        <AIProductGenerator open={isAIOpen} onOpenChange={setIsAIOpen} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-accent/30 selection:text-primary">
      <Navbar 
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenTrack={() => setIsTrackOpen(true)}
        onOpenCart={() => setIsCheckoutOpen(true)}
        cartCount={cartCount}
        isAdmin={true} // Em produção, validar via hook useUser
        onOpenAdmin={() => setIsAdminView(true)}
        onSearch={handleSearch}
      />

      <main>
        <Hero onShopNow={() => document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth' })} />

        {/* Seção de Lançamentos */}
        <section id="vitrine" className="container mx-auto px-6 py-24 md:py-40">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-accent" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">New Arrivals</span>
              </div>
              <h2 className="text-4xl md:text-7xl font-headline font-bold text-primary text-editorial">
                Lançamentos <span className="italic font-light">da Estação</span>
              </h2>
            </div>
            <button className="group flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
              Ver Coleção Completa <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-accent/30" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Curadoria em carregamento...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    {...product} 
                    onAddToCart={() => addToCart(product)}
                  />
                ))
              ) : (
                latestProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    {...product} 
                    onAddToCart={() => addToCart(product)}
                  />
                ))
              )}
            </div>
          )}
        </section>

        {/* Banner de Coleção */}
        <section id="colecoes" className="bg-secondary/20 py-24 md:py-40">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-premium group">
                <img 
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80" 
                  className="object-cover w-full h-full transition-transform duration-[2s] group-hover:scale-110" 
                  alt="Coleção" 
                />
                <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors" />
              </div>
              <div className="space-y-10">
                <div className="space-y-6">
                  <span className="text-accent text-[11px] font-bold uppercase tracking-[0.5em]">Essência Toda Bela</span>
                  <h3 className="text-5xl md:text-8xl font-headline font-bold text-primary leading-tight">
                    Moda com <br /> <span className="italic font-light">Propósito</span>
                  </h3>
                  <p className="text-lg md:text-2xl text-muted-foreground/80 font-light italic leading-relaxed max-w-xl">
                    Cada peça em nossa boutique é selecionada para elevar sua confiança e refletir sua autenticidade.
                  </p>
                </div>
                <button className="rounded-full border-2 border-primary px-12 py-6 text-sm font-bold uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all shadow-xl">
                  Conheça a Curadoria
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Grid Geral de Produtos */}
        <section id="mais-vendidos" className="container mx-auto px-6 py-24 md:py-40">
          <div className="text-center space-y-6 mb-20">
            <h3 className="text-4xl md:text-6xl font-headline font-bold text-primary">Peças Indispensáveis</h3>
            <div className="h-0.5 w-20 bg-accent mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {latestProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                {...product} 
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </div>
        </section>

        <Newsletter />
      </main>

      {/* Rodapé Editorial */}
      <footer className="bg-primary text-white py-24 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16">
            <div className="space-y-8">
              <h4 className="text-3xl font-headline font-bold">Toda Bela</h4>
              <p className="text-white/60 font-light italic text-sm leading-relaxed">
                Inspirando presença, propósito e estilo em cada detalhe. O movimento de evolução da mulher moderna.
              </p>
            </div>
            <div className="space-y-6">
              <h5 className="text-accent text-[10px] font-bold uppercase tracking-[0.3em]">Atendimento</h5>
              <ul className="space-y-4 text-sm text-white/80 font-light">
                <li>WhatsApp: (11) 99999-9999</li>
                <li>Seg a Sex | 08h às 18h</li>
                <li>contato@todobela.com.br</li>
              </ul>
            </div>
            <div className="space-y-6">
              <h5 className="text-accent text-[10px] font-bold uppercase tracking-[0.3em]">Links Úteis</h5>
              <ul className="space-y-4 text-sm text-white/80 font-light">
                <li className="cursor-pointer hover:text-accent transition-colors" onClick={() => setIsTrackOpen(true)}>Acompanhar Pedido</li>
                <li className="cursor-pointer hover:text-accent transition-colors">Trocas e Devoluções</li>
                <li className="cursor-pointer hover:text-accent transition-colors">Trabalhe Conosco</li>
              </ul>
            </div>
            <div className="space-y-6">
              <h5 className="text-accent text-[10px] font-bold uppercase tracking-[0.3em]">Segurança</h5>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 p-3 rounded-xl text-[9px] font-bold text-center border border-white/10 uppercase tracking-widest">SSL Protegido</div>
                <div className="bg-white/5 p-3 rounded-xl text-[9px] font-bold text-center border border-white/10 uppercase tracking-widest">Pagamento Seguro</div>
              </div>
            </div>
          </div>
          <div className="mt-24 pt-8 border-t border-white/10 text-center">
            <p className="text-[9px] uppercase tracking-[0.4em] text-white/30">© 2024 Toda Bela • Curadoria de Luxo Acessível</p>
          </div>
        </div>
      </footer>

      {/* Diálogos e Modais */}
      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      <OrderTrackingDialog open={isTrackOpen} onOpenChange={setIsTrackOpen} />
      <CheckoutDialog 
        open={isCheckoutOpen} 
        onOpenChange={setIsCheckoutOpen} 
        cartItems={cart}
        total={cartTotal}
        onSuccess={() => setCart([])}
      />
    </div>
  );
}
