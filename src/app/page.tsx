
"use client";

import React, { useState } from 'react';
import { Search, ShoppingBag, User, ArrowRight, Instagram, Facebook, Heart, Truck } from 'lucide-react';
import { LogoMark } from '@/components/store/LogoMark';
import { Hero } from '@/components/store/Hero';
import { ProductCard } from '@/components/store/ProductCard';
import { Newsletter } from '@/components/store/Newsletter';
import { AIProductGenerator } from '@/components/admin/AIProductGenerator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TodaBelaStorefront() {
  const [activeCategory, setActiveCategory] = useState("Novidades");

  const categories = [
    "Novidades",
    "Vestidos",
    "Conjuntos",
    "Blusas",
    "Calças",
    "Acessórios",
  ];

  const products = [
    {
      id: 1,
      name: "Vestido Midi Elegance",
      price: "R$ 149,90",
      oldPrice: "R$ 199,90",
      badge: "Mais vendido",
      category: "Vestidos",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 2,
      name: "Conjunto Soft Chic",
      price: "R$ 169,90",
      oldPrice: "R$ 219,90",
      badge: "Novo",
      category: "Conjuntos",
      image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 3,
      name: "Blusa Minimal Glow",
      price: "R$ 89,90",
      oldPrice: "R$ 119,90",
      badge: "Oferta",
      category: "Blusas",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 4,
      name: "Calça Wide Urban",
      price: "R$ 129,90",
      oldPrice: "R$ 169,90",
      badge: "Trend",
      category: "Calças",
      image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
          <LogoMark />
          
          <nav className="hidden lg:flex items-center gap-10 text-sm font-medium">
            <a href="#colecao" className="text-foreground/70 transition-colors hover:text-primary">Coleção</a>
            <a href="#novidades" className="text-foreground/70 transition-colors hover:text-primary">Novidades</a>
            <a href="#beneficios" className="text-foreground/70 transition-colors hover:text-primary">Benefícios</a>
            <a href="#newsletter" className="text-foreground/70 transition-colors hover:text-primary">Clube Toda Bela</a>
            <a href="#rastreio" className="flex items-center gap-1 text-primary font-semibold transition-colors hover:opacity-80">
              <Truck className="h-4 w-4" />
              Rastrear Pedido
            </a>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="rounded-full text-foreground/70">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-foreground/70 hidden sm:flex">
              <User className="h-5 w-5" />
            </Button>
            <Button className="rounded-full bg-primary px-5 py-6 text-sm font-semibold shadow-lg shadow-primary/10 group">
              <ShoppingBag className="mr-2 h-4 w-4 transition-transform group-hover:-rotate-12" />
              Carrinho (2)
            </Button>
          </div>
        </div>
      </header>

      <main>
        <Hero />

        <section id="colecao" className="container mx-auto px-4 py-24 md:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
            <div className="max-w-xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/60">Categorias</span>
              <h3 className="mt-4 text-4xl md:text-5xl font-headline font-semibold text-foreground leading-tight">Explore por estilo</h3>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Nossa curadoria é pensada para a mulher real que não abre mão da elegância no cotidiano.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  variant={activeCategory === category ? "default" : "outline"}
                  className={`rounded-full px-6 py-5 text-sm font-semibold transition-all duration-300 ${
                    activeCategory === category 
                      ? "shadow-md shadow-primary/20 scale-105" 
                      : "bg-white/50 border-primary/20 text-primary hover:bg-brand-blush"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div id="novidades" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          <div className="mt-20 flex justify-center">
            <Button variant="ghost" className="rounded-full py-8 px-10 text-base font-semibold text-primary hover:bg-brand-blush group">
              Ver todos os produtos
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
            </Button>
          </div>
        </section>

        <section id="beneficios" className="bg-brand-blush/30 py-24">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: "Visual Premium",
                  text: "Paleta suave, layout elegante e identidade feminina com posicionamento de marca forte.",
                  icon: <Heart className="h-6 w-6" />,
                },
                {
                  title: "Feito para Converter",
                  text: "Botões destacados, seções objetivas e vitrine organizada para uma experiência fluida.",
                  icon: <ShoppingBag className="h-6 w-6" />,
                },
                {
                  title: "Curadoria Feminina",
                  text: "Peças escolhidas com carinho, pensando no conforto e na sofisticação da mulher moderna.",
                  icon: <User className="h-6 w-6" />,
                },
              ].map((item, idx) => (
                <div key={idx} className="group rounded-[2.5rem] border border-white/60 bg-white/50 p-10 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    {item.icon}
                  </div>
                  <h5 className="text-2xl font-headline font-semibold text-primary">{item.title}</h5>
                  <p className="mt-4 leading-relaxed text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-24 md:px-8">
          <div className="relative overflow-hidden rounded-[3.5rem] bg-foreground text-background px-8 py-16 md:px-20 md:py-24">
            <div className="absolute top-0 right-0 h-64 w-64 bg-brand-plum/20 blur-[100px]" />
            <div className="relative grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <Badge className="bg-brand-plum text-white mb-6 uppercase tracking-widest text-[10px] font-bold py-1.5 px-4 rounded-full border-none">
                  Campanha Essência
                </Badge>
                <h3 className="text-4xl md:text-6xl font-headline font-semibold leading-[1.1]">Toda Bela para todos os momentos.</h3>
                <p className="mt-8 text-xl text-background/70 leading-relaxed max-w-lg">
                  Looks para o trabalho, passeio, jantar e final de semana. Uma loja feminina que une tendência, praticidade e presença visual.
                </p>
                <Button className="mt-10 rounded-full px-10 py-8 bg-brand-rose text-foreground hover:bg-white transition-colors font-bold text-lg">
                  Conheça a Campanha
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "+120", label: "produtos exclusivos" },
                  { value: "24h", label: "para novidades" },
                  { value: "100%", label: "segurança total" },
                  { value: "Sempre", label: "perto de você" },
                ].map((stat, idx) => (
                  <div key={idx} className="rounded-[2.5rem] bg-white/5 p-8 border border-white/10 hover:bg-white/10 transition-colors text-center lg:text-left">
                    <p className="text-4xl md:text-5xl font-headline font-bold text-brand-rose">{stat.value}</p>
                    <p className="mt-2 text-sm text-background/60 font-medium uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Newsletter />
      </main>

      <footer className="border-t border-primary/10 bg-white/50 py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid gap-12 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <LogoMark />
              <p className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground">
                Toda Bela é uma marca feminina moderna com presença delicada, sofisticada e acolhedora. 
                Nossa missão é realçar a beleza que já existe em você.
              </p>
              <div className="mt-8 flex gap-4">
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-primary/10 text-primary hover:bg-brand-blush">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-primary/10 text-primary hover:bg-brand-blush">
                  <Facebook className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-headline font-bold text-foreground text-lg mb-8">Navegação</h4>
              <ul className="space-y-4 text-muted-foreground">
                <li className="transition-colors hover:text-primary cursor-pointer">Novidades</li>
                <li className="transition-colors hover:text-primary cursor-pointer">Best Sellers</li>
                <li className="transition-colors hover:text-primary cursor-pointer">Vestidos</li>
                <li className="transition-colors hover:text-primary cursor-pointer">Promoções</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-headline font-bold text-foreground text-lg mb-8">Ajuda</h4>
              <ul className="space-y-4 text-muted-foreground">
                <li className="transition-colors hover:text-primary cursor-pointer font-semibold text-primary">Rastrear Pedido</li>
                <li className="transition-colors hover:text-primary cursor-pointer">Trocas e Devoluções</li>
                <li className="transition-colors hover:text-primary cursor-pointer">Prazos de Entrega</li>
                <li className="transition-colors hover:text-primary cursor-pointer">Minha Conta</li>
                <li className="transition-colors hover:text-primary cursor-pointer">Fale Conosco</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-20 pt-8 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-muted-foreground">© 2024 Toda Bela Storefront. Todos os direitos reservados.</p>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <span className="hover:text-primary cursor-pointer">Termos de Uso</span>
              <span className="hover:text-primary cursor-pointer">Privacidade</span>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Assistant Tool for Admins */}
      <AIProductGenerator />
    </div>
  );
}
