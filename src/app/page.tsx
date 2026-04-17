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
  ArrowRight,
  Sparkles,
  Heart
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

        {/* Seção Institucional */}
        <section className="py-32 container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="flex justify-center">
              <Sparkles className="h-8 w-8 text-[#C7A17A] opacity-40" />
            </div>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-[#6E3C47] leading-tight">
              A Toda Bela nasce para vestir mulheres que valorizam presença, estilo e autenticidade.
            </h2>
            <div className="h-[1px] w-24 bg-[#C7A17A] mx-auto opacity-30" />
          </div>
        </section>

        {/* Categorias - Encontre seu estilo */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-20 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#C7A17A]">Territórios de Estilo</span>
              <h2 className="text-5xl font-serif font-bold text-[#6E3C47]">Encontre seu estilo</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
              {[
                { name: 'Vestidos', img: 'https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=600&q=80' },
                { name: 'Conjuntos', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80' },
                { name: 'Moda Festa', img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80' },
                { name: 'Casual', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80' },
                { name: 'Plus Size', img: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=600&q=80' },
              ].map((cat) => (
                <div key={cat.name} className="group relative aspect-[4/5] rounded-[3rem] overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-700">
                  <Image 
                    src={cat.img} 
                    alt={cat.name} 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#6E3C47]/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute bottom-10 left-10 text-white space-y-3">
                    <h3 className="text-3xl font-serif font-bold">{cat.name}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500">Explorar Coleção</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mais Vendidos */}
        <section id="catalogo" className="py-32">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-10">
              <div className="space-y-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#C7A17A]">Seleção Maison</span>
                <h2 className="text-5xl font-serif font-bold text-[#6E3C47]">Mais vendidos</h2>
                <p className="text-base text-[#2A1F22]/60 font-light italic max-w-md">As escolhas favoritas de quem valoriza cada detalhe da nossa curadoria.</p>
              </div>
              <div className="flex flex-wrap gap-4">
                {["Novidades", ...(categories?.map(c => c.name) || [])].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-10 py-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 border ${
                      selectedCategory === category
                        ? "bg-[#6E3C47] text-white border-[#6E3C47] shadow-xl shadow-[#6E3C47]/20"
                        : "bg-white text-[#6E3C47] border-[#F7E8EA] hover:border-[#6E3C47]/30"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {productsLoading ? (
              <div className="flex justify-center py-32"><Loader2 className="h-12 w-12 animate-spin text-[#C7A17A]/20" /></div>
            ) : (
              <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Destaque Editorial */}
        <section className="py-24 container mx-auto px-6">
          <div className="relative h-[650px] rounded-[4rem] overflow-hidden shadow-2xl group isolate">
            <Image 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80" 
              alt="Destaques da Semana" 
              fill 
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#2A1F22]/80 via-[#2A1F22]/30 to-transparent flex items-center">
              <div className="px-12 md:px-24 space-y-10 max-w-3xl">
                <div className="inline-flex items-center gap-4">
                  <div className="h-[1px] w-12 bg-[#C7A17A]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#C7A17A]">Edição Limitada</span>
                </div>
                <h2 className="text-6xl md:text-7xl font-serif font-bold text-white leading-[1.1]">Destaques da semana</h2>
                <p className="text-xl text-white/70 font-light leading-relaxed max-w-xl">Uma seleção especial pensada para mulheres que buscam o equilíbrio perfeito entre sofisticação e leveza em seus movimentos.</p>
                <Button className="rounded-full bg-[#C7A17A] text-white px-12 py-9 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-white hover:text-[#6E3C47] shadow-2xl transition-all duration-700">
                  Ver Coleção Completa
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Benefícios Premium */}
        <section className="bg-white py-32">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
              {[
                { icon: <Truck className="h-7 w-7" />, title: 'Brasil Inteiro', desc: 'Entrega VIP com rastreio em tempo real' },
                { icon: <ShieldCheck className="h-7 w-7" />, title: 'Compra Segura', desc: 'Sua privacidade protegida em cada clique' },
                { icon: <CheckCircle2 className="h-7 w-7" />, title: 'Peças Selecionadas', desc: 'Cada detalhe revisado por especialistas' },
                { icon: <HeadphonesIcon className="h-7 w-7" />, title: 'Atendimento Rápido', desc: 'Suporte personalizado via WhatsApp' },
              ].map((benefit, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-6 group">
                  <div className="p-6 rounded-[2rem] bg-[#F7E8EA]/50 text-[#6E3C47] group-hover:bg-[#6E3C47] group-hover:text-white transition-all duration-700 shadow-sm">{benefit.icon}</div>
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#6E3C47]">{benefit.title}</p>
                    <p className="text-sm text-[#2A1F22]/50 font-light italic leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Prova Social */}
        <section className="py-32 bg-[#FFF9F7]">
          <div className="container mx-auto px-6">
             <div className="flex flex-col items-center text-center mb-20 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#C7A17A]">Vozes Toda Bela</span>
              <h2 className="text-5xl font-serif font-bold text-[#6E3C47]">O que elas dizem</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { name: "Juliana Silva", text: "A qualidade das peças é surreal. O acabamento do vestido que comprei superou todas as minhas expectativas.", stars: 5 },
                { name: "Camila Rocha", text: "Minha loja favorita! O atendimento via WhatsApp é super rápido e as peças chegam muito bem embaladas.", stars: 5 },
                { name: "Mariana Costa", text: "Vesti e me senti poderosa. A Toda Bela realmente entende a mulher que busca sofisticação e conforto.", stars: 5 }
              ].map((review, i) => (
                <div key={i} className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-[#F7E8EA] space-y-8 relative overflow-hidden group">
                  <div className="flex gap-1">
                    {[...Array(review.stars)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-[#C7A17A] text-[#C7A17A]" />
                    ))}
                  </div>
                  <p className="text-lg text-[#2A1F22]/70 font-light italic leading-relaxed">"{review.text}"</p>
                  <div className="pt-6 border-t border-[#F7E8EA]">
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#6E3C47]">{review.name}</p>
                    <p className="text-[9px] text-[#C7A17A] uppercase font-bold mt-1 tracking-widest">Cliente Verificada</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Newsletter />
      </main>

      {/* Carrinho Lateral */}
      {cartOpen && (
        <div className="fixed inset-0 z-[100] bg-[#2A1F22]/40 backdrop-blur-md">
          <div className="ml-auto h-full w-full max-w-md bg-[#FFF9F7] shadow-2xl flex flex-col animate-in slide-in-from-right duration-700">
            <div className="flex items-center justify-between p-12 border-b border-[#F7E8EA]">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-[#C7A17A] tracking-[0.4em]">Sua Seleção</p>
                <h3 className="text-3xl font-serif font-bold text-[#6E3C47]">Carrinho</h3>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-[#F7E8EA] h-12 w-12" onClick={() => setCartOpen(false)}>
                <X className="h-6 w-6 text-[#6E3C47]" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-10 no-scrollbar">
              {!cartItems.length ? (
                <div className="h-72 rounded-[3rem] border-2 border-dashed border-[#F7E8EA] flex flex-col items-center justify-center text-center space-y-6">
                  <ShoppingBagIcon className="h-12 w-12 text-[#6E3C47]/10" />
                  <p className="text-base text-[#2A1F22]/40 italic px-8 font-light">Sua sacola aguarda por novas descobertas.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-8 p-6 rounded-[2.5rem] bg-white shadow-sm border border-[#F7E8EA] group transition-all hover:shadow-md">
                    <div className="h-32 w-24 rounded-3xl overflow-hidden shrink-0 border border-[#F7E8EA]">
                      <img src={item.image} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold uppercase text-[#C7A17A] tracking-widest">{item.category}</p>
                          <h4 className="font-serif font-bold text-[#2A1F22] text-base leading-tight">{item.name}</h4>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-[#2A1F22]/20 hover:text-red-400 transition-colors p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-6">
                        <p className="font-bold text-[#6E3C47] text-base">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                        </p>
                        <div className="flex items-center gap-4 bg-[#F7E8EA]/50 rounded-full p-1.5 border border-[#F7E8EA]">
                          <button onClick={() => updateQuantity(item.id, -1)} className="h-8 w-8 rounded-full bg-white flex items-center justify-center hover:shadow-sm transition-all border border-[#F7E8EA]">
                            <Minus className="h-3 w-3 text-[#6E3C47]" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="h-8 w-8 rounded-full bg-white flex items-center justify-center hover:shadow-sm transition-all border border-[#F7E8EA]">
                            <Plus className="h-3 w-3 text-[#6E3C47]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-12 bg-white border-t border-[#F7E8EA] space-y-8">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#2A1F22]/40 uppercase tracking-[0.4em]">Total</span>
                <span className="text-4xl font-serif font-bold text-[#6E3C47]">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartSubtotal)}
                </span>
              </div>
              <Button 
                onClick={handleCheckout}
                disabled={!cartItems.length}
                className="w-full h-16 rounded-full bg-[#6E3C47] text-white text-[11px] font-bold uppercase tracking-[0.4em] shadow-2xl shadow-[#6E3C47]/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Finalizar Compra
              </Button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-[#F7E8EA] pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
            <div className="space-y-10">
              <LogoMark className="items-start" />
              <p className="text-base text-[#2A1F22]/50 font-light leading-relaxed italic">
                Vestindo mulheres reais com a sofisticação e a elegância que cada momento da vida exige.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" size="icon" className="rounded-full h-11 w-11 border-[#F7E8EA] text-[#6E3C47] hover:bg-[#6E3C47] hover:text-white transition-all duration-500">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-11 w-11 border-[#F7E8EA] text-[#6E3C47] hover:bg-[#6E3C47] hover:text-white transition-all duration-500">
                  <Star className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-8">
              <h5 className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#C7A17A]">Navegação</h5>
              <ul className="space-y-5 text-sm text-[#2A1F22]/60 font-medium">
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer tracking-wider">Novidades</li>
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer tracking-wider">Vestidos</li>
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer tracking-wider">Mais Vendidos</li>
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer tracking-wider">Coleções</li>
              </ul>
            </div>

            <div className="space-y-8">
              <h5 className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#C7A17A]">Atendimento</h5>
              <ul className="space-y-5 text-sm text-[#2A1F22]/60 font-medium">
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer tracking-wider" onClick={() => setIsTrackOpen(true)}>Rastrear Pedido</li>
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer tracking-wider">Trocas e Devoluções</li>
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer tracking-wider">Política de Privacidade</li>
                <li className="hover:text-[#6E3C47] transition-colors cursor-pointer tracking-wider">Fale Conosco</li>
              </ul>
            </div>

            <div className="space-y-8 p-10 rounded-[3rem] bg-[#F7E8EA]/30 border border-[#F7E8EA]">
              <h5 className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#6E3C47]">Visite Nossa Loja</h5>
              <p className="text-sm text-[#2A1F22]/60 font-light italic leading-relaxed">
                Rua da Moda, 1000 - Jardins<br />
                São Paulo, SP - Brasil<br /><br />
                Segunda a Sábado: 10h às 19h
              </p>
            </div>
          </div>
          <div className="mt-32 pt-12 border-t border-[#F7E8EA] flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#2A1F22]/30">
              © 2024 Toda Bela • Todos os direitos reservados.
            </p>
            <div className="flex gap-10 opacity-30">
              <span className="text-[10px] font-bold uppercase tracking-widest">Visa</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Mastercard</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Pix</span>
            </div>
          </div>
        </div>
      </footer>

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      <OrderTrackingDialog open={isTrackOpen} onOpenChange={setIsTrackOpen} />
    </div>
  );
}