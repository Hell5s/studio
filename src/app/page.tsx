
"use client";

import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  Loader2, 
  Star, 
  Instagram, 
  Truck, 
  ShoppingBag, 
  X, 
  Plus, 
  Minus, 
  Trash2,
  ShieldCheck,
  CheckCircle2,
  HeadphonesIcon,
  ShoppingBagIcon
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

export default function Home() {
  const db = useFirestore();
  const { user } = useUser();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Novidades");
  
  // Estado do Carrinho
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Queries de Dados
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

  // Funções do Carrinho
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
      `Olá! Quero finalizar meu pedido na Toda Bela:%0A%0A${lines.join("%0A")}%0A%0ASubtotal: ${formatCurrency(cartSubtotal)}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#FFF9F7] text-[#2A1F22]">
      <Navbar 
        onOpenLogin={() => setIsLoginOpen(true)} 
        onOpenTrack={() => setIsTrackOpen(true)} 
        onOpenCart={() => setCartOpen(true)}
        cartCount={cartCount}
      />

      <main>
        {/* Hero Simples e Direta */}
        <Hero onShopNow={() => {
          const el = document.getElementById('catalogo');
          el?.scrollIntoView({ behavior: 'smooth' });
        }} />

        {/* Categorias por imagem */}
        <section className="py-20 container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#6E3C47] tracking-tight">Compre por categoria</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Vestidos', img: 'https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=600&q=80' },
              { name: 'Conjuntos', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80' },
              { name: 'Moda Festa', img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80' },
              { name: 'Casual', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80' },
            ].map((cat) => (
              <div key={cat.name} className="group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer shadow-md">
                <Image 
                  src={cat.img} 
                  alt={cat.name} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-xl font-bold">{cat.name}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Ver coleção</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mais Vendidos */}
        <section id="catalogo" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <h2 className="text-3xl font-bold text-[#6E3C47] tracking-tight">Mais vendidos</h2>
                <p className="text-sm text-[#2A1F22]/60 mt-2">Confira as peças que estão fazendo sucesso por aqui.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Novidades", ...(categories?.map(c => c.name) || [])].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                      selectedCategory === category
                        ? "bg-[#6E3C47] text-white shadow-md"
                        : "bg-[#F7E8EA] text-[#6E3C47] hover:bg-[#E9C9CF]"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {productsLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-[#6E3C47]/30" /></div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    {...product} 
                    onAddToCart={() => addToCart(product)} 
                    onBuyNow={() => addToCart(product, true)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Destaque Simples */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80" 
                alt="Novidades da Semana" 
                fill 
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                <div className="px-12 space-y-6 max-w-lg">
                  <h2 className="text-5xl font-bold text-white tracking-tight">Novidades da semana</h2>
                  <p className="text-lg text-white/80">Looks incríveis para você renovar seu guarda-roupa com o melhor da moda feminina.</p>
                  <Button className="rounded-full bg-[#C7A17A] text-white px-10 py-7 font-bold uppercase tracking-widest text-xs hover:bg-[#C7A17A]/90">
                    Ver coleção
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section className="bg-[#6E3C47] py-16 text-white">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12">
              {[
                { icon: <Truck className="h-6 w-6" />, title: 'Brasil Inteiro', desc: 'Entregamos em todos os estados' },
                { icon: <ShieldCheck className="h-6 w-6" />, title: 'Compra Segura', desc: 'Dados protegidos e checkout verificado' },
                { icon: <CheckCircle2 className="h-6 w-6" />, title: 'Seleção Premium', desc: 'Peças escolhidas com carinho' },
                { icon: <HeadphonesIcon className="h-6 w-6" />, title: 'Suporte VIP', desc: 'Atendimento humanizado via WhatsApp' },
              ].map((benefit, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-white/10">{benefit.icon}</div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider">{benefit.title}</p>
                    <p className="text-[11px] opacity-70 mt-1">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <Newsletter />
      </main>

      {/* Carrinho Simples */}
      {cartOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm">
          <div className="ml-auto h-full w-full max-w-md bg-[#FFF9F7] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-8 border-b border-[#F7E8EA]">
              <div>
                <h3 className="text-2xl font-bold text-[#6E3C47]">Carrinho</h3>
                <p className="text-[10px] font-bold uppercase text-[#C7A17A] tracking-widest mt-1">Sua sacola de compras</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCartOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {!cartItems.length ? (
                <div className="h-60 rounded-3xl border-2 border-dashed border-[#F7E8EA] flex flex-col items-center justify-center text-center space-y-4">
                  <ShoppingBagIcon className="h-10 w-10 text-[#6E3C47]/20" />
                  <p className="text-sm text-[#2A1F22]/50">Seu carrinho está vazio no momento.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-6 p-4 rounded-2xl bg-white shadow-sm border border-[#F7E8EA]">
                    <div className="h-24 w-18 rounded-xl overflow-hidden shrink-0">
                      <img src={item.image} className="h-full w-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-[#2A1F22] text-sm">{item.name}</h4>
                        <button onClick={() => removeItem(item.id)} className="text-[#2A1F22]/30 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-[#6E3C47] text-sm">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                        </p>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQuantity(item.id, -1)} className="h-7 w-7 rounded-full border border-[#F7E8EA] flex items-center justify-center hover:bg-[#F7E8EA]">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="h-7 w-7 rounded-full border border-[#F7E8EA] flex items-center justify-center hover:bg-[#F7E8EA]">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 bg-white border-t border-[#F7E8EA] space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2A1F22]/40 uppercase tracking-widest">Total do pedido</span>
                <span className="text-2xl font-bold text-[#6E3C47]">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartSubtotal)}
                </span>
              </div>
              <Button 
                onClick={handleCheckout}
                disabled={!cartItems.length}
                className="w-full h-14 rounded-full bg-[#6E3C47] text-white font-bold uppercase tracking-widest text-[11px] shadow-lg hover:bg-[#6E3C47]/90"
              >
                Finalizar Compra no WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Simples */}
      <footer className="bg-white border-t border-[#F7E8EA] py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-[#6E3C47]">Toda Bela</h3>
              <p className="text-sm text-[#2A1F22]/70 leading-relaxed">
                Moda feminina moderna para mulheres reais. Qualidade e estilo ao seu alcance.
              </p>
            </div>
            
            <div className="space-y-6">
              <h5 className="text-xs font-bold uppercase tracking-widest text-[#C7A17A]">Navegação</h5>
              <ul className="space-y-3 text-sm text-[#2A1F22]/70">
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer">Novidades</li>
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer">Vestidos</li>
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer">Mais Vendidos</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h5 className="text-xs font-bold uppercase tracking-widest text-[#C7A17A]">Atendimento</h5>
              <ul className="space-y-3 text-sm text-[#2A1F22]/70">
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer" onClick={() => setIsTrackOpen(true)}>Rastrear Pedido</li>
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer">Trocas e Devoluções</li>
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer">Fale Conosco</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h5 className="text-xs font-bold uppercase tracking-widest text-[#C7A17A]">Siga-nos</h5>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon" className="rounded-full bg-[#F7E8EA] text-[#6E3C47]">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-[#F7E8EA] text-[#6E3C47]">
                  <Star className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-[#F7E8EA] text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#2A1F22]/40">
              © 2024 Toda Bela. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      <OrderTrackingDialog open={isTrackOpen} onOpenChange={setIsTrackOpen} />
    </div>
  );
}
