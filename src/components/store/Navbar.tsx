"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Search, Menu, X, Package } from 'lucide-react';
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
    <div className="fixed top-0 left-0 right-0 z-50 w-full">
      {/* Barra de Aviso Superior */}
      <div className="bg-[#6E3C47] text-white py-2 px-4 text-center text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] border-b border-white/5">
        Frete VIP acima de R$350 • Até 10x sem juros
      </div>

      <header 
        className={cn(
          "transition-all duration-500 px-4 md:px-12 w-full",
          scrolled 
            ? "bg-white/95 backdrop-blur-xl shadow-xl py-2 md:py-3" 
            : "bg-[#FFF9F7] py-4 md:py-6"
        )}
      >
        <div className="container mx-auto max-w-[1600px]">
          {/* Layout Desktop */}
          <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            
            {/* Esquerda: Links */}
            <nav className="flex items-center gap-6">
              {leftLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="group relative py-2"
                >
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#2A1F22]/70 group-hover:text-[#6E3C47] transition-colors">
                    {link.name}
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-[#C7A17A] transition-all duration-500 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Centro: Logo */}
            <Link href="/" className="px-8 transition-transform duration-500 hover:scale-105">
              <LogoMark />
            </Link>

            {/* Direita: Ações */}
            <div className="flex items-center justify-end gap-5">
              <button 
                onClick={onOpenTrack}
                className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#2A1F22]/50 hover:text-[#6E3C47]"
              >
                <Package className="h-3.5 w-3.5" />
                <span>Rastrear</span>
              </button>

              <div className="flex items-center gap-1 border-r border-[#F7E8EA] pr-4">
                <Button variant="ghost" size="icon" className="rounded-full text-[#6E3C47] h-9 w-9">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full text-[#6E3C47] h-9 w-9" onClick={onOpenLogin}>
                  <User className="h-4 w-4" />
                </Button>
              </div>
              
              <button 
                onClick={onOpenCart}
                className="flex items-center gap-3 pl-4 pr-5 h-11 rounded-full bg-[#6E3C47] text-white hover:bg-[#2A1F22] transition-all shadow-lg group"
              >
                <div className="relative">
                  <ShoppingBag className="h-4 w-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#C7A17A] text-white text-[7px] h-3.5 w-3.5 rounded-full flex items-center justify-center font-bold border border-[#6E3C47]">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Carrinho</span>
              </button>
            </div>
          </div>

          {/* Layout Mobile */}
          <div className="lg:hidden flex items-center justify-between">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-[#F7E8EA]"
            >
              <Menu className="h-5 w-5 text-[#6E3C47]" />
            </button>

            <Link href="/" className="scale-90 transform-gpu">
              <LogoMark />
            </Link>

            <button 
              onClick={onOpenCart} 
              className="relative h-10 w-10 flex items-center justify-center bg-[#6E3C47] text-white rounded-full"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C7A17A] text-white text-[8px] h-4 w-4 rounded-full flex items-center justify-center font-bold border border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Menu Mobile Lateral */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] bg-white/98 animate-in fade-in slide-in-from-left duration-500">
            <div className="p-8 flex flex-col h-full">
              <div className="flex justify-between items-center mb-12">
                <LogoMark className="scale-90" />
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-[#F7E8EA]"
                >
                  <X className="h-5 w-5 text-[#6E3C47]" />
                </button>
              </div>
              
              <nav className="flex flex-col gap-6">
                {leftLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="group"
                  >
                    <p className="text-2xl font-serif font-bold text-[#6E3C47]">{link.name}</p>
                    <div className="h-px w-full bg-[#F7E8EA] mt-4 opacity-30" />
                  </Link>
                ))}
              </nav>

              <div className="mt-auto space-y-4 pt-10">
                <Button 
                  onClick={() => { onOpenTrack(); setMobileMenuOpen(false); }}
                  variant="outline" 
                  className="w-full h-14 rounded-full border-[#F7E8EA] text-[#6E3C47] font-bold uppercase tracking-widest text-[10px]"
                >
                  Rastrear Pedido
                </Button>
                <Button 
                  onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }}
                  className="w-full h-14 rounded-full bg-[#6E3C47] text-white font-bold uppercase tracking-widest text-[10px]"
                >
                  Minha Conta
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
