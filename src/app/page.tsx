
"use client";

import React, { useState, useMemo } from 'react';
import { 
  Loader2, 
  Truck, 
  ShieldCheck,
  CheckCircle2,
  ShoppingBagIcon,
  Trash2,
  Plus,
  Minus,
  X,
  Star,
  Instagram,
  Sparkles,
  HeadphonesIcon,
  ArrowRight,
  Info
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Image from 'next/image';

const WHATSAPP_NUMBER = "5511999999999";

export default function Home() {
  const db = useFirestore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Novidades");
  
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Estado para informações institucionais
  const [infoDialog, setInfoDialog] = useState<{ open: boolean; title: string; content: string }>({
    open: false,
    title: '',
    content: ''
  });

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

  const openInfo = (title: string, content: string) => {
    setInfoDialog({ open: true, title, content });
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white overflow-x-hidden">
      <Navbar 
        onOpenLogin={() => setIsLoginOpen(true)} 
        onOpenTrack={() => setIsTrackOpen(true)} 
        onOpenCart={() => setCartOpen(true)}
        cartCount={cartCount}
      />

      <main className="pt-[80px] md:pt-[120px]">
        <Hero onShopNow={() => scrollTo('colecoes')} />

        {/* Coleções - Essência da Marca */}
        <section id="colecoes" className="py-16 md:py-32 md:py-40 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 md:mb-20 space-y-3 md:space-y-4">
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.6em] text-accent">Curadoria Exclusiva</span>
              <h2 className="text-3xl md:text-6xl font-serif font-bold text-primary">Nossas Coleções</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[
                { name: 'Vestidos', img: 'https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=600&q=80', id: 'vestidos' },
                { name: 'Conjuntos', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80', id: 'conjuntos' },
                { name: 'Moda Festa', img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80', id: 'festa' },
                { name: 'Casual Chic', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80', id: 'casual' },
              ].map((cat) => (
                <div 
                  key={cat.name} 
                  onClick={() => {
                    setSelectedCategory(cat.name === 'Casual Chic' ? 'Casual' : cat.name);
                    scrollTo('vitrine');
                  }}
                  className="group relative aspect-[3/4] rounded-[2rem] md:rounded-[3rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-700"
                >
                  <Image 
                    src={cat.img} 
                    alt={cat.name} 
                    fill 
                    className="object-cover transition-transform duration-[2s] group-hover:scale-110" 
                    data-ai-hint="fashion editorial"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-white">
                    <h3 className="text-xl md:text-3xl font-serif font-bold">{cat.name}</h3>
                    <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:opacity-0 group-hover:opacity-100 transition-all duration-700 mt-2">Explorar Peças</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vitrine - Mais Vendidos */}
        <section id="vitrine" className="py-16 md:py-40">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-6 md:gap-8 text-center md:text-left">
              <div className="space-y-3 md:space-y-4">
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.6em] text-accent">Destaques do Momento</span>
                <h2 className="text-3xl md:text-7xl font-serif font-bold text-primary">Mais vendidos</h2>
              </div>
              <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                {["Novidades", "Vestidos", "Conjuntos", "Casual"].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-5 md:px-8 py-2 md:py-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${
                      selectedCategory === category
                        ? "bg-primary text-white shadow-xl scale-105"
                        : "bg-white text-primary border border-accent/10 hover:border-accent"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {productsLoading ? (
              <div className="flex justify-center py-20 md:py-32"><Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin text-accent" /></div>
            ) : (
              <div className="grid gap-6 md:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} onAddToCart={() => addToCart(product)} onBuyNow={() => addToCart(product, true)} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Banner Destaque da Semana */}
        <section className="py-10 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden group">
              <Image 
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80" 
                alt="Destaque da Semana" 
                fill 
                className="object-cover transition-transform duration-[10s] group-hover:scale-105" 
                data-ai-hint="fashion luxury"
              />
              <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors duration-700" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 md:p-8 space-y-4 md:space-y-6">
                <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-[0.8em] text-white/80">Seleção Especial</span>
                <h3 className="text-2xl md:text-7xl font-serif font-bold text-white text-editorial">Destaques da semana</h3>
                <Button 
                  onClick={() => scrollTo('vitrine')}
                  className="rounded-full bg-white text-primary px-8 md:px-12 h-12 md:h-16 text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
                >
                  Ver produtos
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Prova Social - Vozes Toda Bela */}
        <section className="py-16 md:py-40 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 md:mb-20 space-y-3 md:space-y-4">
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.6em] text-accent">Vozes Toda Bela</span>
              <h2 className="text-3xl md:text-6xl font-serif font-bold text-primary">O que dizem nossas clientes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
              {[
                { name: "Mariana S.", review: "A qualidade das peças é surpreendente. O caimento valoriza o corpo de uma forma única!", stars: 5 },
                { name: "Beatriz L.", review: "Experiência de compra maravilhosa. A embalagem é puro luxo e o atendimento é VIP.", stars: 5 },
                { name: "Juliana M.", review: "Peças exclusivas que não encontro em nenhum outro lugar. Minha loja favorita agora.", stars: 5 },
              ].map((item, i) => (
                <div key={i} className="bg-background p-8 md:p-14 rounded-[2.5rem] md:rounded-[3.5rem] border border-accent/10 space-y-6 md:space-y-8 hover:shadow-2xl transition-all duration-700 group">
                  <div className="flex gap-1 text-accent">
                    {[...Array(item.stars)].map((_, s) => <Star key={s} className="h-3 w-3 md:h-4 md:w-4 fill-current" />)}
                  </div>
                  <p className="text-sm md:text-lg text-primary/70 italic leading-relaxed font-light">"{item.review}"</p>
                  <div className="flex items-center gap-4 md:gap-5 pt-2">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs md:text-sm shadow-lg group-hover:scale-110 transition-all">
                      {item.name[0]}
                    </div>
                    <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-primary">{item.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section className="py-16 md:py-32 border-y border-accent/10 bg-white">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center">
              {[
                { icon: <Truck className="h-5 w-5 md:h-6 md:w-6" />, title: 'Entrega Nacional', desc: 'Envio para todo o Brasil' },
                { icon: <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />, title: 'Compra Segura', desc: 'Dados 100% protegidos' },
                { icon: <Sparkles className="h-5 w-5 md:h-6 md:w-6" />, title: 'Peças Selecionadas', desc: 'Curadoria de alto padrão' },
                { icon: <HeadphonesIcon className="h-5 w-5 md:h-6 md:w-6" />, title: 'Atendimento Rápido', desc: 'Suporte especializado VIP' },
              ].map((benefit, i) => (
                <div key={i} className="space-y-3 md:space-y-4 group">
                  <div className="h-12 w-12 md:h-16 md:w-16 mx-auto rounded-full bg-secondary/40 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-700 shadow-sm">
                    {benefit.icon}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-primary">{benefit.title}</p>
                    <p className="text-[8px] md:text-[10px] text-primary/40 italic font-light">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Newsletter />
      </main>

      <footer className="bg-white pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-6 text-center">
          <LogoMark className="mb-12 md:mb-16" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-left mb-16 md:mb-20 max-w-6xl mx-auto border-t border-accent/10 pt-16 md:pt-20">
            <div className="space-y-6 md:space-y-8">
              <h5 className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] text-accent">Navegação</h5>
              <ul className="space-y-3 md:space-y-4 text-[9px] md:text-[11px] text-primary/60 font-medium">
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={() => { setSelectedCategory("Novidades"); scrollTo('vitrine'); }}>Novidades</li>
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={() => scrollTo('vitrine')}>Mais Vendidos</li>
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={() => scrollTo('colecoes')}>Moda Festa</li>
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={() => scrollTo('colecoes')}>Coleções</li>
              </ul>
            </div>
            <div className="space-y-6 md:space-y-8">
              <h5 className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] text-accent">Atendimento</h5>
              <ul className="space-y-3 md:space-y-4 text-[9px] md:text-[11px] text-primary/60 font-medium">
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={() => setIsTrackOpen(true)}>Rastrear Pedido</li>
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={() => openInfo("Trocas e Devoluções", "Sua satisfação é nossa prioridade. Você tem até 7 dias corridos após o recebimento para solicitar a troca ou devolução sem custo na primeira tentativa. As peças devem estar com etiquetas originais e sem sinais de uso.")}>Trocas e Devoluções</li>
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={() => openInfo("Fale Conosco", "Estamos aqui para você. Atendimento VIP via WhatsApp (11) 99999-9999 ou e-mail sac@todabela.com.br. Segunda a Sexta, das 09h às 18h.")}>Fale Conosco</li>
              </ul>
            </div>
            <div className="space-y-6 md:space-y-8">
              <h5 className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] text-accent">Institucional</h5>
              <ul className="space-y-3 md:space-y-4 text-[9px] md:text-[11px] text-primary/60 font-medium">
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={() => openInfo("Sobre a Toda Bela", "A Toda Bela nasceu para vestir mulheres que não temem o protagonismo. Através de uma curadoria fashion atemporal e sofisticada, buscamos elevar a confiança e a presença feminina em cada detalhe.")}>Sobre a Toda Bela</li>
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={() => openInfo("Trabalhe Conosco", "Quer fazer parte do nosso universo? Envie seu currículo e portfólio para talentos@todabela.com.br. Estamos sempre em busca de mentes criativas e apaixonadas por moda.")}>Trabalhe Conosco</li>
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={() => openInfo("Políticas de Privacidade", "Seus dados estão 100% seguros conosco. Utilizamos criptografia de ponta a ponta e seguimos rigorosamente a LGPD para garantir que sua experiência seja segura e privativa.")}>Políticas de Privacidade</li>
              </ul>
            </div>
            <div className="space-y-6 md:space-y-8">
              <h5 className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] text-accent">Redes Sociais</h5>
              <div className="flex gap-4">
                <Button variant="outline" size="icon" className="rounded-full border-accent/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                  <Instagram className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-accent/5">
            <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-primary/20">
              © 2026 Toda Bela • Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Carrinho Lateral */}
      {cartOpen && (
        <div className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm">
          <div className="ml-auto h-full w-full max-w-full sm:max-w-md bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between p-6 md:p-10 border-b border-accent/10">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-primary">Carrinho</h3>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 md:h-12 md:w-12" onClick={() => setCartOpen(false)}>
                <X className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 md:space-y-8 no-scrollbar">
              {!cartItems.length ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 md:space-y-6">
                  <ShoppingBagIcon className="h-12 w-12 md:h-16 md:w-16 text-accent/20" />
                  <p className="text-xs md:text-sm text-primary/40 italic font-light">Seu carrinho aguarda por peças incríveis.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 md:gap-6 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] bg-white shadow-sm border border-accent/5 hover:shadow-lg transition-all">
                    <div className="h-24 w-16 md:h-28 md:w-20 rounded-xl md:rounded-2xl overflow-hidden shrink-0 shadow-sm">
                      <img src={item.image} className="h-full w-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif font-bold text-primary text-sm md:text-base leading-tight line-clamp-2">{item.name}</h4>
                        <button onClick={() => removeItem(item.id)} className="text-accent/40 hover:text-red-500 transition-colors shrink-0 ml-2"><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-bold text-primary text-sm md:text-base">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}</p>
                        <div className="flex items-center gap-2 md:gap-3 bg-secondary/40 rounded-full px-3 md:px-4 py-1 md:py-1.5 shadow-inner">
                          <button onClick={() => updateQuantity(item.id, -1)} className="hover:scale-125 transition-transform"><Minus className="h-2.5 w-2.5 text-primary" /></button>
                          <span className="text-[10px] md:text-[11px] font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="hover:scale-125 transition-transform"><Plus className="h-2.5 w-2.5 text-primary" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 md:p-10 bg-white border-t border-accent/10 space-y-6 md:space-y-8">
              <div className="flex items-center justify-between">
                <span className="text-[9px] md:text-[11px] font-bold text-accent uppercase tracking-widest">Subtotal</span>
                <span className="text-2xl md:text-3xl font-serif font-bold text-primary">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartSubtotal)}
                </span>
              </div>
              <Button onClick={handleCheckout} disabled={!cartItems.length} className="w-full h-14 md:h-16 rounded-full bg-primary text-white text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] shadow-xl hover:bg-accent transition-all duration-500">
                Finalizar Compra
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de Informações Institucionais */}
      <Dialog open={infoDialog.open} onOpenChange={(open) => setInfoDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-[500px] rounded-[3rem] p-0 border-none shadow-2xl bg-background overflow-hidden">
          <div className="bg-primary p-10 text-primary-foreground relative">
            <DialogHeader className="relative z-10 space-y-2">
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <Info className="h-6 w-6 text-accent" />
              </div>
              <DialogTitle className="text-2xl font-serif font-bold">{infoDialog.title}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-10">
            <DialogDescription className="text-primary/70 text-base leading-relaxed italic font-light">
              {infoDialog.content}
            </DialogDescription>
            <Button onClick={() => setInfoDialog(prev => ({ ...prev, open: false }))} className="w-full mt-10 rounded-full h-14 bg-primary text-white font-bold uppercase tracking-widest text-[10px] shadow-xl">
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      <OrderTrackingDialog open={isTrackOpen} onOpenChange={setIsTrackOpen} />
    </div>
  );
}
