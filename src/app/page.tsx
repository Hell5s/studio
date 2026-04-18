
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

      {/* Padding superior para compensar o Header Fixo */}
      <main className="pt-[130px] md:pt-[170px]">
        <Hero onShopNow={() => {
          const el = document.getElementById('catalogo');
          el?.scrollIntoView({ behavior: 'smooth' });
        }} />

        {/* Benefícios da Marca */}
        <section className="bg-white py-12 md:py-20 border-y border-[#F7E8EA]">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {[
                { icon: <Truck className="h-6 w-6" />, title: 'Entrega VIP', desc: 'Envio prioritário em todos os pedidos' },
                { icon: <ShieldCheck className="h-6 w-6" />, title: 'Compra Blindada', desc: 'Dados 100% protegidos' },
                { icon: <CheckCircle2 className="h-6 w-6" />, title: '10x Sem Juros', desc: 'No cartão de crédito' },
                { icon: <HeadphonesIcon className="h-6 w-6" />, title: 'Suporte Premium', desc: 'Atendimento humanizado' },
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-6 group">
                  <div className="p-4 rounded-2xl bg-[#F7E8EA] text-[#6E3C47] group-hover:bg-[#6E3C47] group-hover:text-white transition-all duration-700">{benefit.icon}</div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#6E3C47]">{benefit.title}</p>
                    <p className="text-xs text-[#2A1F22]/50 font-light italic">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Manifesto */}
        <section className="py-24 md:py-40 container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center space-y-10 md:space-y-14">
            <div className="flex justify-center">
              <Sparkles className="h-8 w-8 text-[#C7A17A] opacity-40 animate-pulse" />
            </div>
            <h2 className="text-4xl md:text-7xl font-serif font-bold text-[#6E3C47] leading-[1.05] tracking-tight">
              A Toda Bela veste mulheres que valorizam presença, estilo e autenticidade.
            </h2>
            <div className="h-[1px] w-24 md:w-40 bg-[#C7A17A] mx-auto opacity-30" />
          </div>
        </section>

        {/* Estilo Visual - Categorias */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-16 md:mb-24 space-y-5">
              <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-[#C7A17A]">Curadoria Exclusiva</span>
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-[#6E3C47]">Encontre seu estilo</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-10">
              {[
                { name: 'Vestidos', img: 'https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=600&q=80' },
                { name: 'Conjuntos', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80' },
                { name: 'Moda Festa', img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80' },
                { name: 'Casual Chic', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80' },
                { name: 'Plus Size', img: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=600&q=80' },
              ].map((cat) => (
                <div key={cat.name} className="group relative aspect-[3/4] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden cursor-pointer shadow-2xl transition-all duration-1000">
                  <Image 
                    src={cat.img} 
                    alt={cat.name} 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#6E3C47]/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute bottom-10 left-10 text-white space-y-3">
                    <h3 className="text-2xl md:text-4xl font-serif font-bold">{cat.name}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-700">Ver Coleção</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Catálogo de Produtos */}
        <section id="catalogo" className="py-24 md:py-40">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 md:mb-32 gap-10">
              <div className="space-y-5">
                <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-[#C7A17A]">Objeto de Desejo</span>
                <h2 className="text-5xl md:text-8xl font-serif font-bold text-[#6E3C47] leading-none">Mais vendidos</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {["Novidades", ...(categories?.map(c => c.name) || [])].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-8 py-4 text-[10px] font-bold uppercase tracking-[0.4em] transition-all duration-700 border ${
                      selectedCategory === category
                        ? "bg-[#6E3C47] text-white border-[#6E3C47] shadow-2xl"
                        : "bg-white text-[#6E3C47] border-[#F7E8EA] hover:border-[#6E3C47]/40"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {productsLoading ? (
              <div className="flex justify-center py-40"><Loader2 className="h-16 w-16 animate-spin text-[#C7A17A]/30" /></div>
            ) : (
              <div className="grid gap-10 md:gap-16 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Prova Social */}
        <section className="bg-white py-24 md:py-40">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-20 md:mb-32 space-y-5">
              <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-[#C7A17A]">Experiências Reais</span>
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-[#6E3C47]">Vozes Toda Bela</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
              {[
                { name: "Mariana S.", review: "A qualidade das peças é surpreendente. O vestido midi que comprei tem um caimento perfeito e me sinto poderosa nele!", stars: 5 },
                { name: "Beatriz L.", review: "Chegou antes do prazo e a embalagem é um luxo. Me senti abrindo um presente de uma boutique francesa nos Jardins.", stars: 5 },
                { name: "Juliana M.", review: "O atendimento pelo WhatsApp foi impecável. Tiraram todas as minhas dúvidas sobre o tecido e o tamanho.", stars: 5 },
              ].map((item, i) => (
                <div key={i} className="bg-[#FFF9F7] p-12 rounded-[3.5rem] border border-[#F7E8EA] space-y-8 hover:shadow-2xl transition-all duration-700">
                  <div className="flex gap-1.5 text-[#C7A17A]">
                    {[...Array(item.stars)].map((_, s) => <Star key={s} className="h-5 w-5 fill-current" />)}
                  </div>
                  <p className="text-base md:text-lg text-[#2A1F22]/70 italic leading-relaxed font-light">"{item.review}"</p>
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-full bg-[#6E3C47] text-white flex items-center justify-center font-bold text-sm shadow-lg">
                      {item.name[0]}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#6E3C47]">{item.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Newsletter />
      </main>

      {/* Footer com Logo centralizada para manter simetria */}
      <footer className="bg-white border-t border-[#F7E8EA] pt-24 md:pt-40 pb-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center mb-20">
            <LogoMark className="scale-110 mb-20" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-16 md:gap-32 w-full max-w-6xl text-center md:text-left">
              <div className="space-y-8">
                <h5 className="text-[11px] font-bold uppercase tracking-[0.5em] text-[#C7A17A]">Atendimento</h5>
                <ul className="space-y-5 text-xs text-[#2A1F22]/60 font-medium">
                  <li className="hover:text-[#6E3C47] cursor-pointer" onClick={() => setIsTrackOpen(true)}>Rastrear Pedido</li>
                  <li className="hover:text-[#6E3C47] cursor-pointer">Trocas e Devoluções</li>
                  <li className="hover:text-[#6E3C47] cursor-pointer">Privacidade</li>
                  <li className="hover:text-[#6E3C47] cursor-pointer">Fale Conosco</li>
                </ul>
              </div>
              
              <div className="space-y-8">
                <h5 className="text-[11px] font-bold uppercase tracking-[0.5em] text-[#C7A17A]">Navegação</h5>
                <ul className="space-y-5 text-xs text-[#2A1F22]/60 font-medium">
                  <li className="hover:text-[#6E3C47] cursor-pointer">Novidades</li>
                  <li className="hover:text-[#6E3C47] cursor-pointer">Vestidos</li>
                  <li className="hover:text-[#6E3C47] cursor-pointer">Mais Vendidos</li>
                  <li className="hover:text-[#6E3C47] cursor-pointer">Plus Size</li>
                </ul>
              </div>

              <div className="space-y-8">
                <h5 className="text-[11px] font-bold uppercase tracking-[0.5em] text-[#C7A17A]">Acompanhe</h5>
                <div className="flex justify-center md:justify-start gap-4">
                  <Button variant="outline" size="icon" className="rounded-full border-[#F7E8EA] text-[#6E3C47] hover:bg-[#6E3C47] hover:text-white transition-all">
                    <Instagram className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-xs text-[#2A1F22]/40 font-light italic leading-relaxed">
                  Rua da Moda, 1000 - Jardins<br />
                  São Paulo, SP - Brasil
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-12 border-t border-[#F7E8EA] flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#2A1F22]/20">
              © 2026 Toda Bela • Todos os direitos reservados.
            </p>
            <div className="flex gap-10 opacity-20 filter grayscale">
              <span className="text-[10px] font-bold uppercase tracking-widest">Visa</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Mastercard</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Pix</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Carrinho Lateral */}
      {cartOpen && (
        <div className="fixed inset-0 z-[100] bg-[#2A1F22]/50 backdrop-blur-xl">
          <div className="ml-auto h-full w-full max-w-xl bg-[#FFF9F7] shadow-2xl flex flex-col animate-in slide-in-from-right duration-1000">
            <div className="flex items-center justify-between p-10 md:p-14 border-b border-[#F7E8EA]">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase text-[#C7A17A] tracking-[0.5em]">Sua Curadoria</p>
                <h3 className="text-3xl md:text-5xl font-serif font-bold text-[#6E3C47]">Sacola</h3>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-[#F7E8EA] h-14 w-14" onClick={() => setCartOpen(false)}>
                <X className="h-6 w-6 text-[#6E3C47]" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-14 space-y-8 no-scrollbar">
              {!cartItems.length ? (
                <div className="h-96 rounded-[3rem] border-2 border-dashed border-[#F7E8EA] flex flex-col items-center justify-center text-center space-y-6">
                  <ShoppingBagIcon className="h-16 w-16 text-[#6E3C47]/10" />
                  <p className="text-lg text-[#2A1F22]/30 italic px-14 font-light leading-relaxed">Sua sacola aguarda por novas descobertas exclusivas.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-8 p-6 rounded-[2.5rem] bg-white shadow-lg border border-[#F7E8EA] group">
                    <div className="h-32 w-24 rounded-2xl overflow-hidden shrink-0 border border-[#F7E8EA]">
                      <img src={item.image} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold uppercase text-[#C7A17A] tracking-[0.4em]">{item.category}</p>
                          <h4 className="font-serif font-bold text-[#2A1F22] text-xl leading-tight">{item.name}</h4>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-[#2A1F22]/20 hover:text-red-500 transition-colors p-2">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-[#6E3C47] text-lg">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                        </p>
                        <div className="flex items-center gap-3 bg-[#F7E8EA]/40 rounded-full p-1 border border-[#F7E8EA]">
                          <button onClick={() => updateQuantity(item.id, -1)} className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-[#F7E8EA] shadow-sm hover:scale-110 transition-transform">
                            <Minus className="h-3 w-3 text-[#6E3C47]" />
                          </button>
                          <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-[#F7E8EA] shadow-sm hover:scale-110 transition-transform">
                            <Plus className="h-3 w-3 text-[#6E3C47]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-10 md:p-14 bg-white border-t border-[#F7E8EA] space-y-8">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#2A1F22]/30 uppercase tracking-[0.5em]">Total Estimado</span>
                <span className="text-3xl md:text-5xl font-serif font-bold text-[#6E3C47]">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartSubtotal)}
                </span>
              </div>
              <Button 
                onClick={handleCheckout}
                disabled={!cartItems.length}
                className="w-full h-20 rounded-full bg-[#6E3C47] text-white text-[11px] font-bold uppercase tracking-[0.5em] shadow-2xl hover:bg-[#C7A17A] transition-all duration-700"
              >
                Finalizar Curadoria
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
