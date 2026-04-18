
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
  Info,
  ChevronRight
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

      <main className="pt-[140px] md:pt-[180px]">
        <Hero onShopNow={() => scrollTo('vitrine')} />

        {/* Vitrine - Lançamentos */}
        <section id="vitrine" className="py-20 md:py-32 container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary tracking-tight">Lançamentos</h2>
            <button 
              onClick={() => scrollTo('colecoes')}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
            >
              Ver Tudo <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {productsLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-accent" /></div>
          ) : (
            <div className="grid gap-x-4 gap-y-12 grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} {...product} onAddToCart={() => addToCart(product)} onBuyNow={() => addToCart(product, true)} />
              ))}
            </div>
          )}
        </section>

        {/* Nossas Coleções */}
        <section id="colecoes" className="py-20 md:py-32 bg-[#F4ECEE]">
          <div className="container mx-auto px-6 text-center">
            <div className="space-y-4 mb-16">
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-primary">Nossas Coleções</h2>
              <p className="text-accent text-[11px] font-bold uppercase tracking-[0.3em]">Escolha o estilo que combina com você</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {[
                { name: 'Vestidos', img: 'https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=600&q=80' },
                { name: 'Conjuntos', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80' },
                { name: 'Moda Festa', img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80' },
                { name: 'Casual Chic', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80' },
                { name: 'Moda Praia', img: 'https://images.unsplash.com/photo-1502301197179-65228ab57f78?auto=format&fit=crop&w=600&q=80' },
                { name: 'Plus Size', img: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=600&q=80' },
                { name: 'Moda Fitness', img: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=600&q=80' },
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

        {/* Linha Básica */}
        <section id="mais-vendidos" className="py-20 md:py-32 container mx-auto px-6 text-center">
          <div className="space-y-4 mb-16">
            <span className="text-[13px] font-bold uppercase tracking-[0.3em] text-primary/60">Essencial Toda Bela</span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-primary">Linha Básica</h2>
          </div>

          <div className="grid gap-x-4 gap-y-12 grid-cols-2 lg:grid-cols-5">
            {filteredProducts.slice(0, 5).map((product) => (
              <ProductCard key={product.id} {...product} onAddToCart={() => addToCart(product)} onBuyNow={() => addToCart(product, true)} />
            ))}
          </div>
        </section>

        <Newsletter />
      </main>

      <footer className="bg-black text-white pt-24 pb-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24 space-y-8">
            <h2 className="text-6xl md:text-8xl font-serif font-bold tracking-tighter">Toda Bela</h2>
            <p className="max-w-4xl mx-auto text-lg md:text-xl text-white/70 font-light leading-relaxed italic">
              Toda Bela é mais que uma marca — é um movemento de evolução. Inspiramos presença, propósito e estilo em cada detalhe. Para quem vive com intenção e constrói sua própria jornada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-20 border-b border-white/10">
            <div className="space-y-6">
              <h3 className="text-xl font-bold uppercase tracking-widest text-accent">Atendimento</h3>
              <div className="space-y-3 text-sm text-white/60 font-medium">
                <p>Seg a Qui 07h-17h e Sex 07h-16h</p>
                <p>Whatsapp: (11) 99999-9999</p>
                <p>contato@todobela.com.br</p>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-bold uppercase tracking-widest text-accent">Pedidos</h3>
              <ul className="space-y-3 text-sm text-white/60 font-medium cursor-pointer">
                <li onClick={() => setIsTrackOpen(true)} className="hover:text-white">Acompanhar pedido</li>
                <li onClick={() => openInfo("Trocas e Devoluções", "Você tem até 7 dias para solicitar a troca ou devolução.")} className="hover:text-white">Trocas e devoluções</li>
                <li className="hover:text-white">Prazos e entrega</li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-bold uppercase tracking-widest text-accent">Ajuda</h3>
              <ul className="space-y-3 text-sm text-white/60 font-medium cursor-pointer">
                <li className="hover:text-white">Trabalhe conosco</li>
                <li className="hover:text-white">Política de privacidade</li>
                <li className="hover:text-white">Termos de uso</li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-bold uppercase tracking-widest text-accent">Revenda</h3>
              <p className="text-sm text-white/60 leading-relaxed">Seja uma parceira Toda Bela e tenha acesso a condições especiais.</p>
              <Button className="rounded-full bg-white text-black font-bold uppercase text-[10px] tracking-widest px-8">Quero Revender</Button>
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-bold uppercase tracking-widest text-accent">Segurança</h3>
              <div className="grid grid-cols-2 gap-2">
                {['Visa', 'Master', 'Pix', 'Seguro'].map(p => (
                  <div key={p} className="bg-white/5 rounded-lg py-3 px-4 text-center text-[10px] font-bold uppercase">{p}</div>
                ))}
              </div>
            </div>
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
