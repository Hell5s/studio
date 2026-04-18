
"use client";

import React, { useState, useMemo } from 'react';
import { 
  Loader2, 
  Truck, 
  ShieldCheck,
  CheckCircle2,
  HeadphonesIcon,
  ShoppingBagIcon,
  X,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Star,
  Instagram
} from 'lucide-react';
import { Navbar } from '@/components/store/Navbar';
import { Hero } from '@/components/store/Hero';
import { ProductCard } from '@/components/store/ProductCard';
import { Newsletter } from '@/components/store/Newsletter';
import { LogoMark } from '@/components/store/LogoMark';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
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
    <div className="min-h-screen bg-[#FFF9F7] text-[#2A1F22] selection:bg-[#6E3C47] selection:text-white overflow-x-hidden">
      <Navbar 
        onOpenLogin={() => setIsLoginOpen(true)} 
        onOpenTrack={() => setIsTrackOpen(true)} 
        onOpenCart={() => setCartOpen(true)}
        cartCount={cartCount}
      />

      {/* Espaçamento para o Header Fixo */}
      <main className="pt-[110px] md:pt-[130px]">
        <Hero onShopNow={() => {
          const el = document.getElementById('catalogo');
          el?.scrollIntoView({ behavior: 'smooth' });
        }} />

        {/* Marcadores de Confiança */}
        <section className="bg-white py-10 md:py-16 border-y border-accent/10">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {[
                { icon: <Truck className="h-5 w-5" />, title: 'Frete Prioritário', desc: 'Envio VIP em todos os pedidos' },
                { icon: <ShieldCheck className="h-5 w-5" />, title: 'Compra Blindada', desc: 'Dados 100% protegidos' },
                { icon: <CheckCircle2 className="h-5 w-5" />, title: '10x Sem Juros', desc: 'No cartão de crédito' },
                { icon: <HeadphonesIcon className="h-5 w-5" />, title: 'Suporte Premium', desc: 'Atendimento especializado' },
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="p-3 rounded-full bg-secondary/30 text-[#6E3C47] group-hover:bg-[#6E3C47] group-hover:text-white transition-all duration-500">{benefit.icon}</div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#6E3C47]">{benefit.title}</p>
                    <p className="text-[9px] text-[#2A1F22]/40 font-light italic">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Manifesto */}
        <section className="py-20 md:py-32 container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <Sparkles className="h-6 w-6 text-accent mx-auto animate-pulse" />
            <h2 className="text-2xl md:text-5xl lg:text-6xl font-serif font-bold text-[#6E3C47] leading-tight tracking-tight">
              A Toda Bela veste mulheres que valorizam presença, estilo e autenticidade.
            </h2>
            <div className="h-px w-20 bg-accent mx-auto opacity-40" />
          </div>
        </section>

        {/* Categorias */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent">Curadoria Exclusiva</span>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#6E3C47]">Encontre seu estilo</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                { name: 'Vestidos', img: 'https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=600&q=80' },
                { name: 'Conjuntos', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80' },
                { name: 'Moda Festa', img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80' },
                { name: 'Plus Size', img: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=600&q=80' },
                { name: 'Casual Chic', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80' },
              ].map((cat) => (
                <div key={cat.name} className="group relative aspect-[3/4] rounded-[2rem] overflow-hidden cursor-pointer shadow-lg">
                  <Image src={cat.img} alt={cat.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-lg md:text-2xl font-serif font-bold">{cat.name}</h3>
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all duration-500">Ver Peças</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vitrine */}
        <section id="catalogo" className="py-20 md:py-32">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent">Objeto de Desejo</span>
                <h2 className="text-3xl md:text-6xl font-serif font-bold text-[#6E3C47]">Mais vendidos</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Novidades", ...(categories?.map(c => c.name) || [])].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-6 py-3 text-[9px] font-bold uppercase tracking-widest transition-all ${
                      selectedCategory === category
                        ? "bg-[#6E3C47] text-white shadow-xl"
                        : "bg-white text-[#6E3C47] border border-accent/10 hover:border-accent"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {productsLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-accent" /></div>
            ) : (
              <div className="grid gap-8 grid-cols-2 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} onAddToCart={() => addToCart(product)} onBuyNow={() => addToCart(product, true)} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Prova Social */}
        <section className="bg-white py-20 md:py-32">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent">Vozes Toda Bela</span>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#6E3C47]">O que dizem nossas clientes</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Mariana S.", review: "A qualidade das peças é surpreendente. O caimento é perfeito!", stars: 5 },
                { name: "Beatriz L.", review: "Experiência de compra maravilhosa. A embalagem é puro luxo.", stars: 5 },
                { name: "Juliana M.", review: "Atendimento impecável e peças únicas. Minha loja favorita agora.", stars: 5 },
              ].map((item, i) => (
                <div key={i} className="bg-[#FFF9F7] p-8 md:p-12 rounded-[2.5rem] border border-accent/10 space-y-6 hover:shadow-xl transition-all">
                  <div className="flex gap-1 text-accent">
                    {[...Array(item.stars)].map((_, s) => <Star key={s} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="text-sm md:text-base text-[#2A1F22]/70 italic leading-relaxed">"{item.review}"</p>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-[#6E3C47] text-white flex items-center justify-center font-bold text-xs">
                      {item.name[0]}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#6E3C47]">{item.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Newsletter />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-accent/10 pt-20 pb-10">
        <div className="container mx-auto px-6 text-center">
          <LogoMark className="mb-12" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-left mb-16 max-w-5xl mx-auto">
            <div className="space-y-6">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-accent">Atendimento</h5>
              <ul className="space-y-3 text-[11px] text-[#2A1F22]/60">
                <li className="hover:text-[#6E3C47] cursor-pointer" onClick={() => setIsTrackOpen(true)}>Rastrear Pedido</li>
                <li className="hover:text-[#6E3C47] cursor-pointer">Trocas e Devoluções</li>
                <li className="hover:text-[#6E3C47] cursor-pointer">Fale Conosco</li>
              </ul>
            </div>
            <div className="space-y-6">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-accent">Navegação</h5>
              <ul className="space-y-3 text-[11px] text-[#2A1F22]/60">
                <li className="hover:text-[#6E3C47] cursor-pointer">Novidades</li>
                <li className="hover:text-[#6E3C47] cursor-pointer">Vestidos</li>
                <li className="hover:text-[#6E3C47] cursor-pointer">Plus Size</li>
              </ul>
            </div>
            <div className="space-y-6 col-span-2 md:col-span-1">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-accent">Acompanhe</h5>
              <div className="flex gap-4">
                <Button variant="outline" size="icon" className="rounded-full border-accent/20 text-[#6E3C47] hover:bg-[#6E3C47] hover:text-white transition-all">
                  <Instagram className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#2A1F22]/20 border-t border-accent/10 pt-10">
            © 2026 Toda Bela • Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Carrinho Lateral */}
      {cartOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm">
          <div className="ml-auto h-full w-full max-w-md bg-[#FFF9F7] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between p-8 border-b border-accent/10">
              <h3 className="text-2xl font-serif font-bold text-[#6E3C47]">Sacola</h3>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => setCartOpen(false)}>
                <X className="h-5 w-5 text-[#6E3C47]" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              {!cartItems.length ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <ShoppingBagIcon className="h-12 w-12 text-accent/20" />
                  <p className="text-sm text-[#2A1F22]/40 italic">Sua sacola está vazia.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-white shadow-sm border border-accent/10">
                    <div className="h-20 w-16 rounded-lg overflow-hidden shrink-0">
                      <img src={item.image} className="h-full w-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif font-bold text-[#2A1F22] text-sm">{item.name}</h4>
                        <button onClick={() => removeItem(item.id)} className="text-accent/40 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-[#6E3C47] text-sm">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}</p>
                        <div className="flex items-center gap-2 bg-secondary/30 rounded-full px-2 py-1">
                          <button onClick={() => updateQuantity(item.id, -1)}><Minus className="h-3 w-3 text-[#6E3C47]" /></button>
                          <span className="text-[10px] font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)}><Plus className="h-3 w-3 text-[#6E3C47]" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 bg-white border-t border-accent/10 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Subtotal</span>
                <span className="text-2xl font-serif font-bold text-[#6E3C47]">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartSubtotal)}
                </span>
              </div>
              <Button onClick={handleCheckout} disabled={!cartItems.length} className="w-full h-14 rounded-full bg-[#6E3C47] text-white text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-accent transition-all">
                Finalizar Compra
              </Button>
            </div>
          </div>
        </div>
      )}

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      <OrderTrackingDialog open={isTrackOpen} onOpenChange={setIsTrackOpen} />
    </div>
  );
}
