"use client";

import React, { useState, useMemo } from 'react';
import { 
  Loader2, 
  Truck, 
  ShieldCheck,
  CheckCircle2,
  HeadphonesIcon,
  ShoppingBagIcon,
  Instagram,
  Star,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { Navbar } from '@/components/store/Navbar';
import { Hero } from '@/components/store/Hero';
import { ProductCard } from '@/components/store/ProductCard';
import { Newsletter } from '@/components/store/Newsletter';
import { LogoMark } from '@/components/store/LogoMark';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { OrderTrackingDialog } from '@/components/store/OrderTrackingDialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const WHATSAPP_NUMBER = "5511999999999";

export default function Home() {
  const db = useFirestore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Novidades");
  
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

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
    <div className="min-h-screen bg-[#FFF9F7] text-[#2A1F22] selection:bg-[#6E3C47] selection:text-white">
      <Navbar 
        onOpenLogin={() => setIsLoginOpen(true)} 
        onOpenTrack={() => setIsTrackOpen(true)} 
        onOpenCart={() => setCartOpen(true)}
        cartCount={cartCount}
      />

      <main>
        <Hero onShopNow={() => {
          const el = document.getElementById('catalogo');
          el?.scrollIntoView({ behavior: 'smooth' });
        }} />

        <section className="py-24 container mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16 space-y-4">
            <h2 className="text-4xl font-serif font-bold text-[#6E3C47]">Encontre seu estilo</h2>
            <div className="h-[2px] w-12 bg-[#C7A17A]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Vestidos', img: 'https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=600&q=80' },
              { name: 'Conjuntos', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80' },
              { name: 'Moda Festa', img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80' },
              { name: 'Casual', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80' },
            ].map((cat) => (
              <div key={cat.name} className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500">
                <Image 
                  src={cat.img} 
                  alt={cat.name} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-8 left-8 text-white space-y-2">
                  <h3 className="text-2xl font-serif font-bold">{cat.name}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">Explorar Coleção</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="catalogo" className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-serif font-bold text-[#6E3C47]">Mais vendidos</h2>
                <p className="text-sm text-[#2A1F22]/60 font-light italic">As escolhas favoritas de quem valoriza cada detalhe.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {["Novidades", ...(categories?.map(c => c.name) || [])].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                      selectedCategory === category
                        ? "bg-[#6E3C47] text-white shadow-xl shadow-[#6E3C47]/20"
                        : "bg-[#F7E8EA] text-[#6E3C47] hover:bg-[#E9C9CF]"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {productsLoading ? (
              <div className="flex justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-[#6E3C47]/20" /></div>
            ) : (
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
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

        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-16 space-y-4">
              <h2 className="text-4xl font-serif font-bold text-[#6E3C47]">Destaques da semana</h2>
              <div className="h-[2px] w-12 bg-[#C7A17A]" />
            </div>
            
            <div className="relative h-[500px] rounded-[3rem] overflow-hidden shadow-2xl group">
              <Image 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80" 
                alt="Novidades da Semana" 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent flex items-center">
                <div className="px-12 md:px-20 space-y-8 max-w-2xl">
                  <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#C7A17A]">Curadoria Especial</span>
                  <h2 className="text-5xl md:text-6xl font-serif font-bold text-white leading-tight">Presença em cada movimento</h2>
                  <p className="text-lg text-white/80 font-light leading-relaxed">Uma seleção pensada para mulheres que buscam o equilíbrio perfeito entre sofisticação e leveza.</p>
                  <Button className="rounded-full bg-[#C7A17A] text-white px-12 py-8 text-[10px] font-bold uppercase tracking-[0.3em] hover:opacity-90 shadow-2xl">
                    Ver Coleção Completa
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#6E3C47] py-20 text-white">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
              {[
                { icon: <Truck className="h-6 w-6" />, title: 'Brasil Inteiro', desc: 'Entrega VIP em todos os estados' },
                { icon: <ShieldCheck className="h-6 w-6" />, title: 'Compra Segura', desc: 'Dados protegidos com segurança total' },
                { icon: <CheckCircle2 className="h-6 w-6" />, title: 'Peças Selecionadas', desc: 'Curadoria com foco em qualidade' },
                { icon: <HeadphonesIcon className="h-6 w-6" />, title: 'Atendimento Rápido', desc: 'Suporte personalizado via WhatsApp' },
              ].map((benefit, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-4 group">
                  <div className="p-4 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors duration-500">{benefit.icon}</div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{benefit.title}</p>
                    <p className="text-[11px] text-white/60 font-light italic">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Newsletter />
      </main>

      {cartOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm">
          <div className="ml-auto h-full w-full max-w-md bg-[#FFF9F7] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between p-10 border-b border-[#F7E8EA]">
              <div className="space-y-1">
                <p className="text-[9px] font-bold uppercase text-[#C7A17A] tracking-[0.3em]">Sua Seleção</p>
                <h3 className="text-2xl font-serif font-bold text-[#6E3C47]">Carrinho</h3>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-[#F7E8EA]" onClick={() => setCartOpen(false)}>
                <X className="h-6 w-6 text-[#6E3C47]" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
              {!cartItems.length ? (
                <div className="h-60 rounded-[2rem] border-2 border-dashed border-[#F7E8EA] flex flex-col items-center justify-center text-center space-y-4">
                  <ShoppingBagIcon className="h-10 w-10 text-[#6E3C47]/10" />
                  <p className="text-sm text-[#2A1F22]/40 italic">Sua sacola está vazia no momento.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-6 p-5 rounded-[2rem] bg-white shadow-sm border border-[#F7E8EA] group">
                    <div className="h-28 w-20 rounded-2xl overflow-hidden shrink-0">
                      <img src={item.image} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-[8px] font-bold uppercase text-[#C7A17A] tracking-widest">{item.category}</p>
                          <h4 className="font-serif font-bold text-[#2A1F22] text-sm">{item.name}</h4>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-[#2A1F22]/20 hover:text-red-400 transition-colors p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <p className="font-bold text-[#6E3C47] text-sm">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                        </p>
                        <div className="flex items-center gap-3 bg-[#F7E8EA] rounded-full p-1">
                          <button onClick={() => updateQuantity(item.id, -1)} className="h-7 w-7 rounded-full bg-white flex items-center justify-center hover:shadow-md transition-all">
                            <Minus className="h-3 w-3 text-[#6E3C47]" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="h-7 w-7 rounded-full bg-white flex items-center justify-center hover:shadow-md transition-all">
                            <Plus className="h-3 w-3 text-[#6E3C47]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-10 bg-white border-t border-[#F7E8EA] space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#2A1F22]/40 uppercase tracking-[0.3em]">Total</span>
                <span className="text-3xl font-serif font-bold text-[#6E3C47]">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartSubtotal)}
                </span>
              </div>
              <Button 
                onClick={handleCheckout}
                disabled={!cartItems.length}
                className="w-full h-16 rounded-full bg-[#6E3C47] text-white text-[10px] font-bold uppercase tracking-[0.3em] shadow-2xl shadow-[#6E3C47]/20 hover:opacity-95 transition-all"
              >
                Finalizar Compra
              </Button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-[#F7E8EA] py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="space-y-8">
              <LogoMark />
              <p className="text-sm text-[#2A1F22]/60 font-light leading-relaxed italic">
                Vestindo mulheres reais com a sofisticação e a elegância que cada momento exige.
              </p>
            </div>
            
            <div className="space-y-6">
              <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C7A17A]">Navegação</h5>
              <ul className="space-y-4 text-xs text-[#2A1F22]/60">
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer">Novidades</li>
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer">Vestidos</li>
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer">Mais Vendidos</li>
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer">Promoções</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C7A17A]">Atendimento</h5>
              <ul className="space-y-4 text-xs text-[#2A1F22]/60">
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer" onClick={() => setIsTrackOpen(true)}>Rastrear Pedido</li>
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer">Trocas e Devoluções</li>
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer">Privacidade</li>
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer">Fale Conosco</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C7A17A]">Siga-nos</h5>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon" className="rounded-full bg-[#F7E8EA] text-[#6E3C47] hover:bg-[#6E3C47] hover:text-white transition-all duration-500">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-[#F7E8EA] text-[#6E3C47] hover:bg-[#6E3C47] hover:text-white transition-all duration-500">
                  <Star className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-20 pt-10 border-t border-[#F7E8EA] text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#2A1F22]/30">
              © 2024 Toda Bela • Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      <OrderTrackingDialog open={isTrackOpen} onOpenChange={setIsTrackOpen} />
    </div>
  );
}
