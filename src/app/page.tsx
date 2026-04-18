
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { Navbar } from '@/components/store/Navbar';
import { Hero } from '@/components/store/Hero';
import { ProductCard } from '@/components/store/ProductCard';
import { Newsletter } from '@/components/store/Newsletter';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { OrderTrackingDialog } from '@/components/store/OrderTrackingDialog';
import { MyOrdersDialog } from '@/components/store/MyOrdersDialog';
import { CheckoutDialog } from '@/components/store/CheckoutDialog';
import { AIProductGenerator } from '@/components/admin/AIProductGenerator';
import { Loader2, ChevronRight, ShieldCheck, Instagram, Facebook, Youtube, Twitter, CreditCard } from 'lucide-react';
import { LogoMark } from '@/components/store/LogoMark';
import { cn } from '@/lib/utils';

export default function TodaBelaStorefront() {
  const db = useFirestore();
  const { user } = useUser();
  
  // Estados de Interface
  const [isAdminView, setIsAdminView] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchValue] = useState("");
  
  // Verificação de Admin (Segurança Real)
  const adminDocRef = useMemoFirebase(() => {
    return user ? doc(db, 'roles_admin', user.uid) : null;
  }, [db, user]);
  const { data: adminRole, isLoading: isAdminChecking } = useDoc(adminDocRef);
  const isAdmin = !!adminRole;

  // Carrinho
  const [cart, setCart] = useState<any[]>([]);
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  // Consulta de Produtos (Sincronização em Tempo Real)
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStoreProducts(products);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  // Filtragem de Busca e Categorização
  const filteredProducts = useMemo(() => {
    const search = searchQuery.toLowerCase().trim();
    if (!search) return storeProducts;
    return storeProducts.filter(p => 
      p.name?.toLowerCase().includes(search) || 
      p.id?.toLowerCase().includes(search) ||
      p.category?.toLowerCase().includes(search)
    );
  }, [storeProducts, searchQuery]);

  const featuredProducts = useMemo(() => 
    filteredProducts.filter(p => p.featured || p.badge === 'Destaque' || p.badge === 'Lançamento').slice(0, 8), 
  [filteredProducts]);

  const latestProducts = useMemo(() => 
    filteredProducts.filter(p => p.published !== false).slice(0, 10), 
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
  if (isAdminView && isAdmin) {
    return (
      <div className="h-screen bg-background">
        <AdminDashboard 
          productsCount={storeProducts.length}
          categoriesCount={0}
          onOpenAI={() => setIsAIOpen(true)}
          onExit={() => setIsAdminView(false)}
        />
        <AIProductGenerator open={isAIOpen} onOpenChange={setIsAIOpen} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-accent/30 selection:text-primary overflow-x-hidden">
      <Navbar 
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenTrack={() => setIsTrackOpen(true)}
        onOpenOrders={() => setIsMyOrdersOpen(true)}
        onOpenCart={() => setIsCheckoutOpen(true)}
        cartCount={cartCount}
        isAdmin={isAdmin} 
        onOpenAdmin={() => setIsAdminView(true)}
        onSearch={handleSearch}
      />

      <main>
        <Hero onShopNow={() => document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth' })} />

        {/* Seção de Lançamentos */}
        <section id="vitrine" className="container mx-auto px-4 md:px-6 py-12 md:py-32 overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 gap-4">
            <div className="space-y-2 md:space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-6 md:w-8 bg-accent" />
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Novidades</span>
              </div>
              <h2 className="text-3xl md:text-7xl font-headline font-bold text-primary text-editorial">
                Lançamentos
              </h2>
            </div>
            <button className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
              Ver Tudo <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-accent/30" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Sincronizando Boutique...</p>
            </div>
          ) : (
            <div className="flex md:grid md:grid-cols-4 gap-4 md:gap-8 overflow-x-auto md:overflow-visible pb-8 no-scrollbar snap-x snap-mandatory">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <div key={product.id} className="min-w-[45%] md:min-w-0 flex-shrink-0">
                    <ProductCard 
                      {...product} 
                      onAddToCart={() => addToCart(product)}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full w-full py-20 text-center border-2 border-dashed border-primary/5 rounded-[2rem] md:rounded-[3rem]">
                  <p className="text-muted-foreground italic font-light text-sm">Seu catálogo aparecerá aqui em instantes.</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Grade de Coleções */}
        <section id="colecoes" className="bg-secondary/10 py-12 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-8 md:mb-20 space-y-2 md:space-y-4">
              <div className="flex items-center justify-center gap-3">
                 <div className="h-px w-6 bg-accent/40" />
                 <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.5em] text-accent">Coleções</span>
                 <div className="h-px w-6 bg-accent/40" />
              </div>
              <h2 className="text-3xl md:text-6xl font-headline font-bold text-primary">Universo Toda Bela</h2>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6">
              {[
                { title: "Moda Praia", img: "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=900&q=80" },
                { title: "Moda Fitness", img: "https://images.unsplash.com/photo-1506629905607-d9c297d7d122?auto=format&fit=crop&w=900&q=80" },
                { title: "Moda Casual", img: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=900&q=80" },
                { title: "Vestidos", img: "https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=900&q=80" },
                { title: "Conjuntos", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80" }
              ].map((col) => (
                <div key={col.title} className="group relative aspect-[4/5] rounded-[1.2rem] md:rounded-[2.5rem] overflow-hidden cursor-pointer shadow-editorial">
                  <img 
                    src={col.img} 
                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" 
                    alt={col.title} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 md:bottom-10 md:left-10 md:right-10">
                    <h3 className="text-[10px] md:text-3xl font-headline font-bold text-white uppercase tracking-tight leading-none mb-1 md:mb-4">{col.title}</h3>
                    <div className="h-0.5 w-0 bg-accent transition-all duration-500 group-hover:w-full" />
                    <p className="hidden md:block text-[9px] font-bold text-accent uppercase tracking-[0.3em] mt-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all">Ver Detalhes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Banner de Campanha Split */}
        <section className="py-12 md:py-40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-20 items-center">
              <div className="relative aspect-[4/5] rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-premium group">
                <img 
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80" 
                  className="object-cover w-full h-full transition-transform duration-[2s] group-hover:scale-110" 
                  alt="Essência Toda Bela" 
                />
                <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors" />
              </div>
              <div className="space-y-4 md:space-y-10">
                <div className="space-y-3 md:space-y-6">
                  <span className="text-accent text-[9px] md:text-[11px] font-bold uppercase tracking-[0.5em]">Essência Toda Bela</span>
                  <h3 className="text-3xl md:text-8xl font-headline font-bold text-primary leading-tight">
                    Moda com <br /> <span className="italic font-light">Propósito</span>
                  </h3>
                  <p className="text-sm md:text-2xl text-muted-foreground/80 font-light italic leading-relaxed max-w-xl">
                    Cada peça em nossa boutique é selecionada para elevar sua confiança e refletir sua autenticidade.
                  </p>
                </div>
                <button className="w-full sm:w-auto rounded-full border-2 border-primary px-6 py-4 md:px-12 md:py-6 text-[10px] md:text-sm font-bold uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all shadow-xl">
                  Conheça a Coleção
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Grid Geral de Produtos */}
        <section id="mais-vendidos" className="container mx-auto px-4 md:px-6 py-12 md:py-32 bg-secondary/5 rounded-[2rem] md:rounded-[4rem]">
          <div className="text-center space-y-3 md:space-y-6 mb-8 md:mb-20">
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Seleção Premium</span>
            <h3 className="text-2xl md:text-6xl font-headline font-bold text-primary">Mais Vendidos</h3>
            <div className="h-0.5 w-12 md:w-20 bg-accent mx-auto" />
          </div>
          <div className="flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-8 overflow-x-auto md:overflow-visible pb-8 no-scrollbar snap-x snap-mandatory">
            {latestProducts.map((product) => (
              <div key={product.id} className="min-w-[45%] md:min-w-0 flex-shrink-0">
                <ProductCard 
                  {...product} 
                  onAddToCart={() => addToCart(product)}
                />
              </div>
            ))}
          </div>
        </section>

        <Newsletter />
      </main>

      {/* Rodapé Premium Editorial */}
      <footer className="bg-[#1A1516] text-white pt-20 pb-12 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 mb-20">
            <div className="space-y-8">
              <LogoMark className="scale-90 origin-left invert brightness-200" />
              <p className="text-white/50 font-light italic text-sm leading-relaxed max-w-xs">
                Inspirando presença, propósito e estilo. O movimento da mulher moderna que valoriza sua essência e autenticidade.
              </p>
              <div className="flex gap-5">
                {[Instagram, Facebook, Youtube].map((Icon, idx) => (
                  <button key={idx} className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-white transition-all duration-500">
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <h5 className="text-accent text-[10px] font-bold uppercase tracking-[0.4em]">Atendimento</h5>
              <ul className="space-y-4 text-xs md:text-[13px] text-white/70 font-light">
                <li className="flex flex-col gap-1">
                  <span className="text-white/30 uppercase text-[9px] font-bold tracking-widest">Fale Conosco</span>
                  (11) 99999-9999
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-white/30 uppercase text-[9px] font-bold tracking-widest">E-mail</span>
                  contato@todobela.com.br
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-white/30 uppercase text-[9px] font-bold tracking-widest">Horário</span>
                  Seg a Sex | 08h às 18h
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h5 className="text-accent text-[10px] font-bold uppercase tracking-[0.4em]">Institucional</h5>
              <ul className="space-y-3 text-xs md:text-[13px] text-white/70 font-light">
                {['Acompanhar Pedido', 'Termos de Uso', 'Privacidade', 'Trocas e Devoluções', 'Sobre a Toda Bela'].map((item) => (
                  <li key={item} className="cursor-pointer hover:text-accent transition-colors flex items-center gap-2 group">
                    <div className="h-px w-0 bg-accent transition-all group-hover:w-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h5 className="text-accent text-[10px] font-bold uppercase tracking-[0.4em]">Pagamento Seguro</h5>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: 'Visa', color: 'bg-white/10' },
                    { name: 'Master', color: 'bg-white/10' },
                    { name: 'Elo', color: 'bg-white/10' },
                    { name: 'Pix', color: 'bg-accent/20' },
                    { name: 'Hiper', color: 'bg-white/10' },
                    { name: 'Boleto', color: 'bg-white/10' },
                  ].map((card) => (
                    <div key={card.name} className={cn("h-8 rounded-md flex items-center justify-center text-[7px] font-bold uppercase tracking-tighter border border-white/5", card.color)}>
                      {card.name}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h5 className="text-accent text-[10px] font-bold uppercase tracking-[0.4em]">Segurança</h5>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold uppercase tracking-widest">SSL Secure</span>
                      <span className="text-[7px] text-white/40">Criptografado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-[9px] uppercase tracking-[0.4em] text-white/30">© 2024 Toda Bela Boutique de Luxo</p>
              <p className="text-[7px] uppercase tracking-[0.2em] text-white/10">CNPJ: 00.000.000/0001-00 • Todos os direitos reservados.</p>
            </div>
            <div className="flex gap-8 opacity-20 hover:opacity-100 transition-opacity duration-700 grayscale hover:grayscale-0">
               <span className="text-[10px] font-bold tracking-tighter italic">Google Safe Browsing</span>
               <span className="text-[10px] font-bold tracking-tighter italic">Norton Secured</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Diálogos e Modais */}
      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      <OrderTrackingDialog open={isTrackOpen} onOpenChange={setIsTrackOpen} />
      <MyOrdersDialog open={isMyOrdersOpen} onOpenChange={setIsMyOrdersOpen} />
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
