
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Search, Menu, X, Heart, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LogoMark } from './LogoMark';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenTrack: () => void;
  onOpenCart: () => void;
  cartCount: number;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onSearch?: (query: string) => void;
}

export function Navbar({ onOpenLogin, onOpenTrack, onOpenCart, cartCount, isAdmin, onOpenAdmin, onSearch }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchValue);
  };

  const links = [
    { name: 'Novidades', href: '#vitrine' },
    { name: 'Mais vendidos', href: '#mais-vendidos' },
    { name: 'Coleções', href: '#colecoes' },
    { name: 'Rastrear Pedido', onClick: onOpenTrack },
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
        <div className="container mx-auto flex items-center justify-between">
          
          {/* Navegação Esquerda (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8 w-1/3">
            {links.map((link) => (
              link.href ? (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="text-[12px] font-bold uppercase tracking-[0.1em] text-primary/70 hover:text-primary transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-500 group-hover:w-full" />
                </Link>
              ) : (
                <button 
                  key={link.name} 
                  onClick={link.onClick}
                  className="text-[12px] font-bold uppercase tracking-[0.1em] text-primary/70 hover:text-primary transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-500 group-hover:w-full" />
                </button>
              )
            ))}
          </nav>

          {/* Logo Centralizada */}
          <div className="flex justify-center w-full lg:w-1/3">
            <Link href="/" className="transition-transform duration-500 hover:scale-105 shrink-0">
              <LogoMark />
            </Link>
          </div>

          {/* Ações Lado Direito (Desktop) */}
          <div className="hidden lg:flex items-center justify-end gap-6 w-1/3">
            <form onSubmit={handleSearchSubmit} className="flex items-center overflow-hidden rounded-full border border-primary/10 bg-secondary/20 h-11 w-48">
              <input
                placeholder="Busca por nome ou ID..."
                className="flex-1 bg-transparent px-5 text-[11px] outline-none text-primary"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  onSearch?.(e.target.value);
                }}
              />
              <button type="submit" className="flex h-11 w-11 items-center justify-center border-l border-primary/10 text-primary hover:bg-white transition-colors">
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("rounded-full h-10 w-10 text-primary/70 hover:text-primary", isAdmin && "bg-accent/10 text-accent")} 
                onClick={isAdmin ? onOpenAdmin : onOpenLogin}
              >
                {isAdmin ? <ShieldCheck className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-primary/70 hover:text-primary">
                <Heart className="h-4.5 w-4.5" />
              </Button>
              
              <button 
                onClick={onOpenCart}
                className="relative flex items-center gap-2 px-5 h-11 rounded-full bg-primary text-white hover:bg-black transition-all shadow-lg group"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Carrinho</span>
                {cartCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white shadow-lg">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile UI (Menu e Carrinho) */}
          <div className="flex lg:hidden items-center gap-3 absolute right-6">
            <button 
              onClick={onOpenCart}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[8px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="h-11 w-11 flex items-center justify-center rounded-full bg-secondary"
            >
              <Menu className="h-5 w-5 text-primary" />
            </button>
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
                 <button onClick={() => { isAdmin ? onOpenAdmin?.() : onOpenLogin(); setMobileMenuOpen(false); }} className="w-full py-5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-widest">
                   {isAdmin ? "Painel Admin" : "Minha Conta"}
                 </button>
                 <button onClick={() => { onOpenTrack(); setMobileMenuOpen(false); }} className="w-full py-5 rounded-full border border-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">Rastrear Pedido</button>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
