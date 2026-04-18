
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Loader2, 
  ShoppingBagIcon,
  Trash2,
  Plus,
  Minus,
  X,
  Info,
  ChevronRight,
  SearchX
} from 'lucide-react';
import { Navbar } from '@/components/store/Navbar';
import { Hero } from '@/components/store/Hero';
import { ProductCard } from '@/components/store/ProductCard';
import { Newsletter } from '@/components/store/Newsletter';
import { useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, doc, onSnapshot } from 'firebase/firestore';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { OrderTrackingDialog } from '@/components/store/OrderTrackingDialog';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AIProductGenerator } from '@/components/admin/AIProductGenerator';
import { CheckoutDialog } from '@/components/store/CheckoutDialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// Fallback estático para garantir que o site nunca fique vazio
const staticLaunchProducts = [
  { id: '1', name: "Top Alongado com Decote Alto", price: 99.9, image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80", badge: 'Novo' },
  { id: '2', name: "Macaquinho Contrastante", price: 159.9, image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80", badge: 'Novo' },
  { id: '3', name: "Calça Legging com Cós em V", price: 169.9, image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80", badge: 'Destaque' },
  { id: '4', name: "Short com Recorte Premium", price: 109.9, image: "https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=900&q=80", badge: 'Novo' }
];

const staticBasicProducts = [
  { id: '5', name: "Top Básico Alças Reguláveis", price: 69.9, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80", collection: 'Linha Básica' },
  { id: '6', name: "Calça Legging Básica", price: 99.9, image: "https://images.unsplash.com/photo-1506629905607-d9c297d7d122?auto=format&fit=crop&w=900&q=80", collection: 'Linha Básica' },
  { id: '7', name: "Conjunto Básico Lilás", price: 69.9, image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80", collection: 'Linha Básica' }
];

export default function Home() {
  const db = useFirestore();
  const { user } = useUser();
  
  // Estados de UI
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Novidades");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Sincronização Real dos Produtos
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setProductsLoading(false);
      return;
    }

    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setStoreProducts(products);
      setProductsLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  // Verificação de Admin
  const adminDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'roles_admin', user.uid);
  }, [db, user]);
  const { data: adminRole } = useDoc(adminDocRef);
  const isAdmin = !!adminRole;

  // Lógica de Fallback (PASSO 4)
  const storefrontProducts = useMemo(() => {
    if (storeProducts.length) return storeProducts;
    return [...staticLaunchProducts, ...staticBasicProducts];
  }, [storeProducts]);

  // Lógica de filtragem
  const filteredProducts = useMemo(() => {
    let items = storefrontProducts;
    
    if (selectedCategory !== "Novidades") {
      items = items.filter(p => p.category === selectedCategory || p.collection === selectedCategory);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(p => 
        p.name?.toLowerCase().includes(q) || 
        p.id?.toLowerCase().includes(q) ||
        p.collection?.toLowerCase().includes(q)
      );
    }
    
    return items;
  }, [storefrontProducts, selectedCategory, searchQuery]);

  const basicProducts = useMemo(() => {
    if (searchQuery) return []; 
    const basics = storefrontProducts.filter(p => p.collection === 'Linha Básica' || p.category === 'Básicos');
    return (basics.length ? basics : storefrontProducts.slice(4)).slice(0, 5);
  }, [storefrontProducts, searchQuery]);

  const cartCount = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);
  const cartSubtotal = useMemo(() => cartItems.reduce((acc, item) => acc + (item.quantity * item.price), 0), [cartItems]);

  const addToCart = (product: any, buyNow = false) => {
    setCartItems((current) => {
      const existing = current.find((item) => (item.id || item.productId) === (product.id || product.productId));
      if (existing) {
        return current.map((item) =>
          (item.id || item.productId) === (product.id || product.productId) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, id: product.id || product.productId, quantity: 1 }];
    });
    if (!buyNow) setCartOpen(true);
    if (buyNow) {
      setTimeout(() => setIsCheckoutOpen(true), 200);
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
    setCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const onOrderSuccess = () => {
    setCartItems([]);
    setIsCheckoutOpen(false);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  // Usar produtos reais no Admin (PASSO 3)
  if (showAdmin && isAdmin) {
    return (
      <div className="h-screen w-full">
        <AdminDashboard 
          productsCount={storeProducts.length} 
          categoriesCount={0}
          onOpenAI={() => setIsAIGeneratorOpen(true)}
          onExit={() => setShowAdmin(false)}
        />
        <AIProductGenerator open={isAIGeneratorOpen} onOpenChange={setIsAIGeneratorOpen} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white overflow-x-hidden">
      <Navbar 
        onOpenLogin={() => setIsLoginOpen(true)} 
        onOpenTrack={() => setIsTrackOpen(true)} 
        onOpenCart={() => setCartOpen(true)}
        cartCount={cartCount}
        isAdmin={isAdmin}
        onOpenAdmin={() => setShowAdmin(true)}
        onSearch={setSearchQuery}
      />

      <main className="pt-[140px] md:pt-[180px]">
        {!searchQuery && <Hero onShopNow={() => scrollTo('vitrine')} />}

        <section id="vitrine" className="py-20 md:py-32 container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary tracking-tight">
              {productsLoading ? "Carregando Boutique..." : (searchQuery ? `Resultados para "${searchQuery}"` : selectedCategory === "Novidades" ? "Lançamentos" : selectedCategory)}
            </h2>
            {searchQuery && (
               <button 
                onClick={() => setSearchQuery("")}
                className="text-sm font-bold uppercase tracking-widest text-accent hover:text-primary"
              >
                Limpar Busca
              </button>
            )}
          </div>

          {productsLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-accent" /></div>
          ) : (
            <>
              {filteredProducts.length > 0 ? (
                <div className="grid gap-x-4 gap-y-12 grid-cols-2 lg:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} {...product} onAddToCart={() => addToCart(product)} onBuyNow={() => addToCart(product, true)} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
                  <SearchX className="h-16 w-16 text-primary/20" />
                  <p className="text-lg text-primary/40 italic font-light">Nenhum objeto de desejo encontrado.</p>
                  <Button variant="outline" onClick={() => setSearchQuery("")} className="rounded-full px-8">Ver todo o catálogo</Button>
                </div>
              )}
            </>
          )}
        </section>

        {!searchQuery && (
          <>
            <section id="colecoes" className="py-20 md:py-32 bg-[#F4ECEE]">
              <div className="container mx-auto px-6 text-center">
                <div className="space-y-4 mb-16">
                  <h2 className="text-4xl md:text-6xl font-serif font-bold text-primary">Nossas Coleções</h2>
                  <p className="text-accent text-[11px] font-bold uppercase tracking-[0.3em]">Peças que acompanham seu ritmo</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                  {[
                    { name: 'Tops', img: 'https://images.unsplash.com/photo-1506629905607-d9c297d7d122?auto=format&fit=crop&w=600&q=80' },
                    { name: 'Leggings', img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80' },
                    { name: 'Shorts', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80' },
                    { name: 'Macacões', img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80' },
                  ].map((cat) => (
                    <div 
                      key={cat.name} 
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        scrollTo('vitrine');
                      }}
                      className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-700"
                    >
                      <Image src={cat.img} alt={cat.name} fill className="object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />
                      <div className="absolute bottom-6 left-0 right-0 px-4">
                        <h3 className="text-xl md:text-2xl font-serif font-bold text-white uppercase tracking-tight text-center">{cat.name}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="mais-vendidos" className="py-20 md:py-32 container mx-auto px-6 text-center">
              <div className="space-y-4 mb-16">
                <span className="text-[13px] font-bold uppercase tracking-[0.3em] text-primary/60">Essencial Toda Bela</span>
                <h2 className="text-4xl md:text-6xl font-serif font-bold text-primary">Linha Básica</h2>
              </div>

              <div className="grid gap-x-4 gap-y-12 grid-cols-2 lg:grid-cols-5">
                {basicProducts.map((product) => (
                  <ProductCard key={product.id} {...product} onAddToCart={() => addToCart(product)} onBuyNow={() => addToCart(product, true)} />
                ))}
              </div>
            </section>
          </>
        )}

        <Newsletter />
      </main>

      <footer className="bg-black text-white pt-24 pb-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24 space-y-8">
            <h2 className="text-6xl md:text-8xl font-serif font-bold tracking-tighter">Toda Bela</h2>
            <p className="max-w-4xl mx-auto text-lg md:text-xl text-white/70 font-light leading-relaxed italic">
              Toda Bela é mais que uma marca — é um movimento de evolução. Inspiramos presença, propósito e estilo em cada detalhe.
            </p>
          </div>
          <div className="pt-12 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/30">
              © 2026 Toda Bela • Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Carrinho Lateral */}
      {cartOpen && (
        <div className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm">
          <div className="ml-auto h-full w-full max-w-full sm:max-w-md bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between p-8 border-b border-accent/10">
              <h3 className="text-3xl font-serif font-bold text-primary">Carrinho</h3>
              <Button variant="ghost" size="icon" className="rounded-full h-12 w-12" onClick={() => setCartOpen(false)}>
                <X className="h-6 w-6 text-primary" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              {!cartItems.length ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <ShoppingBagIcon className="h-16 w-16 text-accent/20" />
                  <p className="text-sm text-primary/40 italic font-light">Seu carrinho aguarda por peças incríveis.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-6 p-6 rounded-[2rem] bg-white shadow-sm border border-accent/5 hover:shadow-lg transition-all">
                    <div className="h-28 w-20 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                      <img src={item.image} className="h-full w-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif font-bold text-primary text-sm leading-tight line-clamp-2">{item.name}</h4>
                        <button onClick={() => removeItem(item.id)} className="text-accent/40 hover:text-red-500 transition-colors shrink-0 ml-2"><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-bold text-primary text-sm">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}</p>
                        <div className="flex items-center gap-3 bg-secondary/40 rounded-full px-4 py-1.5 shadow-inner">
                          <button onClick={() => updateQuantity(item.id, -1)} className="hover:scale-125 transition-transform"><Minus className="h-2.5 w-2.5 text-primary" /></button>
                          <span className="text-[11px] font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="hover:scale-125 transition-transform"><Plus className="h-2.5 w-2.5 text-primary" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 bg-white border-t border-accent/10 space-y-8">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-accent uppercase tracking-widest">Subtotal</span>
                <span className="text-3xl font-serif font-bold text-primary">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartSubtotal)}
                </span>
              </div>
              <Button onClick={handleCheckout} disabled={!cartItems.length} className="w-full h-16 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-[0.3em] shadow-xl hover:bg-accent transition-all duration-500">
                Finalizar Compra
              </Button>
            </div>
          </div>
        </div>
      )}

      <LoginDialog 
        open={isLoginOpen} 
        onOpenChange={setIsLoginOpen} 
        onAdminLogin={() => setShowAdmin(true)}
      />
      <OrderTrackingDialog open={isTrackOpen} onOpenChange={setIsTrackOpen} />
      <CheckoutDialog 
        open={isCheckoutOpen} 
        onOpenChange={setIsCheckoutOpen}
        cartItems={cartItems}
        total={cartSubtotal}
        onSuccess={onOrderSuccess}
      />
    </div>
  );
}
