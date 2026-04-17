"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Search, Menu, X, Package, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LogoMark } from './LogoMark';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenTrack: () => void;
  onOpenCart: () => void;
  cartCount: number;
}

export function Navbar({ onOpenLogin, onOpenTrack, onOpenCart, cartCount }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const leftLinks = [
    { name: 'Novidades', href: '#catalogo' },
    { name: 'Mais Vendidos', href: '#catalogo' },
    { name: 'Moda Festa', href: '#catalogo' },
    { name: 'Coleções', href: '#catalogo' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Faixa Superior Editorial */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-[9px] font-bold uppercase tracking-[0.4em] border-b border-white/5 selection:bg-accent selection:text-primary">
        Frete VIP em pedidos acima de R$350 • Parcelamento em até 10x sem juros
      </div>

      <header 
        className={cn(
          "transition-all duration-1000 px-8 md:px-16 isolate",
          scrolled 
            ? "bg-white/90 backdrop-blur-2xl shadow-editorial py-5" 
            : "bg-transparent py-10"
        )}
      >
        <div className="container mx-auto max-w-[1800px]">
          {/* Desktop Navigation - Layout Simétrico Perfeito */}
          <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center gap-12">
            
            {/* Esquerda: Links Principais com Tracking Editorial */}
            <nav className="flex items-center gap-12">
              {leftLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="group relative text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/60 hover:text-primary transition-all duration-500"
                >
                  {link.name}
                  <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-accent transition-all duration-700 ease-out group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Centro: Logo Centralizada com Respiro */}
            <Link href="/" className="px-8 scale-110 hover:scale-[1.12] transition-transform duration-700">
              <LogoMark />
            </Link>

            {/* Direita: Ações de Luxo */}
            <div className="flex items-center justify-end gap-10">
              <button 
                onClick={onOpenTrack}
                className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/60 hover:text-primary transition-all duration-500 group"
              >
                <Package className="h-3 w-3 text-accent group-hover:rotate-12 transition-transform duration-500" />
                Rastrear
              </button>
              
              <div className="flex items-center gap-1 h-12 px-2 rounded-full bg-secondary/20 backdrop-blur-md border border-primary/5">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-white text-primary transition-all duration-500">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-white text-primary transition-all duration-500">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-white text-primary transition-all duration-500" onClick={onOpenLogin}>
                  <User className="h-4 w-4" />
                </Button>
                
                <div className="w-[1px] h-4 bg-primary/10 mx-2" />

                <button 
                  onClick={onOpenCart}
                  className="flex items-center gap-4 pl-3 pr-6 h-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-500 shadow-xl shadow-primary/20 group relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2.5 -right-2.5 bg-accent text-white text-[7px] h-4 w-4 rounded-full flex items-center justify-center font-bold border-2 border-primary">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em] relative z-10">
                    Carrinho
                  </span>
                  <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Header - Minimalista */}
          <div className="lg:hidden flex items-center justify-between">
            <button className="p-2 transition-transform active:scale-90" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-6 w-6 text-primary" />
            </button>

            <Link href="/" className="transition-opacity active:opacity-70">
              <h1 className="text-xl font-headline font-bold text-primary tracking-tight">Toda Bela</h1>
            </Link>

            <div className="flex items-center gap-2">
              <button onClick={onOpenLogin} className="p-2 text-primary">
                <User className="h-5 w-5" />
              </button>
              <button onClick={onOpenCart} className="relative p-2.5 bg-primary text-white rounded-full shadow-lg shadow-primary/20">
                <ShoppingBag className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-[7px] h-4 w-4 rounded-full flex items-center justify-center font-bold border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menu Mobile - Experiência de Imersão */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] bg-background animate-in fade-in slide-in-from-left duration-700">
            <div className="p-12 flex flex-col h-full">
              <div className="flex justify-between items-center mb-20">
                <LogoMark />
                <button onClick={() => setMobileMenuOpen(false)} className="p-4 bg-secondary/50 rounded-full text-primary transition-transform active:scale-90">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex flex-col gap-10">
                {leftLinks.map((link, i) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "text-4xl font-headline font-bold text-primary hover:text-accent transition-colors animate-in slide-in-from-left duration-700",
                      `delay-[${i * 100}ms]`
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="h-px w-16 bg-accent/40 my-6" />
                <button 
                  onClick={() => { onOpenTrack(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-5 text-xl font-bold text-primary/60 hover:text-primary transition-colors"
                >
                  <Package className="h-6 w-6 text-accent" />
                  Rastrear Pedido
                </button>
              </nav>

              <div className="mt-auto pt-10 border-t border-primary/5">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-6">Conecte-se à Maison</p>
                <div className="flex gap-6">
                  {/* Espaço para Redes Sociais */}
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary"><Heart className="h-4 w-4" /></div>
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary"><User className="h-4 w-4" /></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
