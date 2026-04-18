"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react';
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
    { name: 'Novidades', href: '#vitrine' },
    { name: 'Mais vendidos', href: '#vitrine' },
    { name: 'Moda Festa', href: '#vitrine' },
    { name: 'Coleções', href: '#categorias' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full">
      <header 
        className={cn(
          "transition-all duration-700 px-6 md:px-12 w-full",
          scrolled 
            ? "bg-white/90 backdrop-blur-xl border-b border-black/5 py-3 shadow-sm" 
            : "bg-white py-6"
        )}
      >
        <div className="container mx-auto flex items-center justify-between">
          
          {/* Navegação Esquerda (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8 flex-1">
            {links.slice(0, 2).map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#2A1F22]/70 hover:text-[#6E3C47] transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-500 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Logo Central */}
          <Link href="/" className="transition-transform duration-500 hover:scale-105 shrink-0 px-8">
            <LogoMark />
          </Link>

          {/* Navegação Direita + Ações (Desktop) */}
          <div className="flex items-center justify-end gap-8 flex-1">
            <nav className="hidden lg:flex items-center gap-8 mr-4">
              {links.slice(2).map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#2A1F22]/70 hover:text-[#6E3C47] transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-500 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="hidden md:flex rounded-full text-[#2A1F22]/70 hover:text-[#6E3C47]">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden md:flex rounded-full text-[#2A1F22]/70 hover:text-[#6E3C47]" onClick={onOpenLogin}>
                <User className="h-4 w-4" />
              </Button>
              
              <button 
                onClick={onOpenCart}
                className="flex items-center gap-2 px-4 h-10 rounded-full bg-primary text-white hover:bg-black transition-all shadow-lg group relative"
              >
                <ShoppingBag className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-[8px] h-4 w-4 rounded-full flex items-center justify-center font-bold border-2 border-white">
                    {cartCount}
                  </span>
                )}
                <span className="hidden md:block text-[9px] font-bold uppercase tracking-[0.2em]">Sacola</span>
              </button>

              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full bg-secondary/50"
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
              <div className="flex justify-between items-center mb-12">
                <LogoMark />
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary"
                >
                  <X className="h-5 w-5 text-primary" />
                </button>
              </div>
              
              <nav className="flex flex-col gap-8">
                {links.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-2xl font-serif font-bold text-primary border-b border-accent/10 pb-4"
                  >
                    {link.name}
                  </Link>
                ))}
                <button onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }} className="text-left text-xl font-bold uppercase tracking-widest text-accent">Minha Conta</button>
                <button onClick={() => { onOpenTrack(); setMobileMenuOpen(false); }} className="text-left text-xl font-bold uppercase tracking-widest text-accent">Rastrear Pedido</button>
              </nav>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
