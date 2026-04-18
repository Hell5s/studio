
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Search, Menu, X, Heart } from 'lucide-react';
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

  const links = [
    { name: 'Coleções', href: '#colecoes' },
    { name: 'Novidades', href: '#vitrine' },
    { name: 'Mais vendidos', href: '#vitrine' },
    { name: 'Rastrear Pedido', onClick: onOpenTrack },
    { name: 'Outlet', href: '#vitrine' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full">
      {/* Barra de Aviso Superior */}
      <div className="bg-primary px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80">
        Moda que inspira sua melhor versão
      </div>

      <header 
        className={cn(
          "transition-all duration-700 px-4 md:px-12 w-full",
          scrolled 
            ? "bg-white/95 backdrop-blur-xl border-b border-black/5 py-4 shadow-sm" 
            : "bg-white py-6 md:py-8"
        )}
      >
        <div className="container mx-auto flex items-center gap-8">
          
          {/* Logo */}
          <Link href="/" className="transition-transform duration-500 hover:scale-105 shrink-0">
            <LogoMark />
          </Link>

          {/* Navegação Central (Desktop) */}
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-10">
            {links.map((link) => (
              link.href ? (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="text-[13px] font-bold uppercase tracking-[0.1em] text-primary/70 hover:text-primary transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-500 group-hover:w-full" />
                </Link>
              ) : (
                <button 
                  key={link.name} 
                  onClick={link.onClick}
                  className="text-[13px] font-bold uppercase tracking-[0.1em] text-primary/70 hover:text-primary transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-500 group-hover:w-full" />
                </button>
              )
            ))}
          </nav>

          {/* Ações Lado Direito */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Busca Desktop */}
            <div className="hidden lg:flex items-center overflow-hidden rounded-full border border-primary/10 bg-secondary/20 h-12 w-[280px]">
              <input
                placeholder="Procurar no site..."
                className="flex-1 bg-transparent px-6 text-xs outline-none text-primary"
              />
              <button className="flex h-12 w-12 items-center justify-center border-l border-primary/10 text-primary hover:bg-white transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hidden md:flex rounded-full text-primary/70 hover:text-primary" onClick={onOpenLogin}>
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden md:flex rounded-full text-primary/70 hover:text-primary">
                <Heart className="h-5 w-5" />
              </Button>
              
              <button 
                onClick={onOpenCart}
                className="relative flex items-center gap-3 px-6 h-12 rounded-full bg-primary text-white hover:bg-black transition-all shadow-xl group"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden md:block text-[10px] font-bold uppercase tracking-[0.2em]">Carrinho</span>
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white shadow-lg">
                    {cartCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden h-12 w-12 flex items-center justify-center rounded-full bg-secondary/50"
              >
                <Menu className="h-5 w-5 text-primary" />
              </button>
            </div>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] bg-white/98 animate-in fade-in slide-in-from-right duration-500">
            <div className="p-8 flex flex-col h-full">
              <div className="flex justify-between items-center mb-16">
                <LogoMark />
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="h-12 w-12 flex items-center justify-center rounded-full bg-secondary"
                >
                  <X className="h-6 w-6 text-primary" />
                </button>
              </div>
              
              <nav className="flex flex-col gap-10">
                {links.map((link) => (
                  <button 
                    key={link.name} 
                    onClick={() => {
                      if (link.href) {
                        const el = document.querySelector(link.href);
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }
                      if (link.onClick) link.onClick();
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-4xl font-serif font-bold text-primary border-b border-accent/10 pb-6"
                  >
                    {link.name}
                  </button>
                ))}
              </nav>

              <div className="mt-auto pb-10 space-y-4">
                 <button onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }} className="w-full py-5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-widest">Minha Conta</button>
                 <button onClick={() => { onOpenTrack(); setMobileMenuOpen(false); }} className="w-full py-5 rounded-full border border-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">Rastrear Pedido</button>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
