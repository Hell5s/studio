
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

  const leftLinks = [
    { name: 'Novidades', href: '#catalogo' },
    { name: 'Mais Vendidos', href: '#catalogo' },
  ];

  const rightLinks = [
    { name: 'Moda Festa', href: '#catalogo' },
    { name: 'Coleções', href: '#catalogo' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full">
      {/* Top Bar Premium */}
      <div className="bg-[#6E3C47] py-2.5 px-6 text-center border-b border-white/10">
        <p className="text-[9px] md:text-[10px] font-bold text-white uppercase tracking-[0.3em]">
          Frete VIP em pedidos acima de R$350 • Parcelamento em até 10x sem juros
        </p>
      </div>

      <header 
        className={cn(
          "transition-all duration-700 px-6 md:px-12 w-full",
          scrolled 
            ? "bg-white/90 backdrop-blur-xl border-b border-black/5 py-4 shadow-sm" 
            : "bg-white py-6"
        )}
      >
        <div className="container mx-auto max-w-[1600px] flex items-center justify-between">
          
          {/* Menu Esquerda */}
          <nav className="hidden lg:flex items-center gap-10 flex-1">
            {leftLinks.map((link) => (
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

          {/* Logo Centralizada */}
          <Link href="/" className="transition-transform duration-500 hover:scale-105 shrink-0 px-8">
            <LogoMark />
          </Link>

          {/* Menu Direita + Ações */}
          <div className="flex items-center justify-end gap-10 flex-1">
            <nav className="hidden lg:flex items-center gap-10">
              {rightLinks.map((link) => (
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

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="hidden md:flex rounded-full text-[#2A1F22]/70 hover:text-[#6E3C47]">
                <Search className="h-4.5 w-4.5" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden md:flex rounded-full text-[#2A1F22]/70 hover:text-[#6E3C47]" onClick={onOpenLogin}>
                <User className="h-4.5 w-4.5" />
              </Button>
              
              <button 
                onClick={onOpenCart}
                className="flex items-center gap-3 pl-5 pr-6 h-12 rounded-full bg-[#6E3C47] text-white hover:bg-[#2A1F22] transition-all shadow-xl group relative"
              >
                <ShoppingBag className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-[8px] h-4 w-4 rounded-full flex items-center justify-center font-bold border-2 border-[#6E3C47]">
                    {cartCount}
                  </span>
                )}
                <span className="hidden md:block text-[10px] font-bold uppercase tracking-[0.2em]">Sacola</span>
              </button>

              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full bg-secondary/50"
              >
                <Menu className="h-5 w-5 text-[#6E3C47]" />
              </button>
            </div>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] bg-white/98 animate-in fade-in slide-in-from-right duration-500">
            <div className="p-10 flex flex-col h-full">
              <div className="flex justify-between items-center mb-16">
                <LogoMark />
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="h-12 w-12 flex items-center justify-center rounded-full bg-secondary"
                >
                  <X className="h-6 w-6 text-[#6E3C47]" />
                </button>
              </div>
              
              <nav className="flex flex-col gap-10">
                {[...leftLinks, ...rightLinks, { name: 'Rastrear Pedido', onClick: onOpenTrack }].map((link) => (
                  <button 
                    key={link.name} 
                    onClick={() => { link.onClick?.(); setMobileMenuOpen(false); }}
                    className="text-left group"
                  >
                    <p className="text-3xl font-serif font-bold text-[#6E3C47]">{link.name}</p>
                    <div className="h-px w-full bg-accent/20 mt-4" />
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
