"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Search, Menu, X, Heart, Package, Globe } from 'lucide-react';
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
      {/* Barra de Aviso Premium */}
      <div className="bg-[#6E3C47] text-white py-2.5 px-4 text-center text-[10px] font-bold uppercase tracking-[0.4em] border-b border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        <span className="relative z-10">Frete VIP em pedidos acima de R$350 • Parcelamento em até 10x sem juros</span>
      </div>

      <header 
        className={cn(
          "transition-all duration-700 px-6 md:px-12 isolate",
          scrolled 
            ? "bg-white/95 backdrop-blur-xl shadow-xl py-4" 
            : "bg-[#FFF9F7] py-8"
        )}
      >
        <div className="container mx-auto max-w-[1500px]">
          {/* Desktop: Layout Simétrico Premium */}
          <div className="hidden lg:grid grid-cols-[1.2fr_auto_1.2fr] items-center">
            
            {/* Esquerda: Menu Editorial */}
            <nav className="flex items-center gap-10">
              {leftLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="group relative py-2"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#2A1F22]/70 group-hover:text-[#6E3C47] transition-colors">
                    {link.name}
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#C7A17A] transition-all duration-500 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Centro: A Estrela da Marca */}
            <Link href="/" className="px-16 transition-transform duration-500 hover:scale-105 active:scale-95">
              <LogoMark />
            </Link>

            {/* Direita: Ações de Conveniência */}
            <div className="flex items-center justify-end gap-6">
              <button 
                onClick={onOpenTrack}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#2A1F22]/50 hover:text-[#6E3C47] transition-all"
              >
                <Package className="h-3.5 w-3.5" />
                <span>Rastrear</span>
              </button>

              <div className="flex items-center gap-2 pr-4 border-r border-[#F7E8EA]">
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-[#6E3C47] hover:bg-[#F7E8EA]">
                  <Search className="h-4.5 w-4.5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-[#6E3C47] hover:bg-[#F7E8EA]">
                  <Heart className="h-4.5 w-4.5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-[#6E3C47] hover:bg-[#F7E8EA]" onClick={onOpenLogin}>
                  <User className="h-4.5 w-4.5" />
                </Button>
              </div>
              
              <button 
                onClick={onOpenCart}
                className="flex items-center gap-4 pl-5 pr-6 h-14 rounded-full bg-[#6E3C47] text-white hover:bg-[#2A1F22] transition-all shadow-xl shadow-[#6E3C47]/20 group relative isolate overflow-hidden"
              >
                <div className="absolute inset-0 bg-[#C7A17A] translate-y-full group-hover:translate-y-0 transition-transform duration-500 -z-10" />
                <div className="relative flex items-center gap-3">
                  <div className="relative">
                    <ShoppingBag className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#C7A17A] text-white text-[7px] h-4 w-4 rounded-full flex items-center justify-center font-bold border border-[#6E3C47]">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
                    Carrinho
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile: Logo Centralizada e Funcionalidade */}
          <div className="lg:hidden flex items-center justify-between">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="h-12 w-12 flex items-center justify-center rounded-full bg-white border border-[#F7E8EA]"
            >
              <Menu className="h-6 w-6 text-[#6E3C47]" />
            </button>

            <Link href="/" className="scale-75 origin-center">
              <LogoMark />
            </Link>

            <button 
              onClick={onOpenCart} 
              className="relative h-12 w-12 flex items-center justify-center bg-[#6E3C47] text-white rounded-full shadow-lg"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C7A17A] text-white text-[8px] h-5 w-5 rounded-full flex items-center justify-center font-bold border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Menu Mobile Editorial */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl animate-in fade-in slide-in-from-left duration-500">
            <div className="p-10 flex flex-col h-full">
              <div className="flex justify-between items-center mb-20">
                <LogoMark className="scale-90" />
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="h-12 w-12 flex items-center justify-center rounded-full bg-[#F7E8EA]"
                >
                  <X className="h-6 w-6 text-[#6E3C47]" />
                </button>
              </div>
              
              <nav className="flex flex-col gap-10">
                {leftLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="group"
                  >
                    <p className="text-4xl font-serif font-bold text-[#6E3C47] group-hover:translate-x-4 transition-transform duration-500">
                      {link.name}
                    </p>
                    <div className="h-[1px] w-full bg-[#F7E8EA] mt-4" />
                  </Link>
                ))}
              </nav>

              <div className="mt-auto space-y-6">
                <Button 
                  onClick={() => { onOpenTrack(); setMobileMenuOpen(false); }}
                  variant="outline" 
                  className="w-full h-16 rounded-full border-[#F7E8EA] text-[#6E3C47] font-bold uppercase tracking-widest text-xs"
                >
                  <Package className="mr-3 h-5 w-5 text-[#C7A17A]" />
                  Rastrear Pedido
                </Button>
                <div className="flex justify-center gap-8 py-6">
                  <User className="h-6 w-6 text-[#6E3C47]/40" />
                  <Heart className="h-6 w-6 text-[#6E3C47]/40" />
                  <Globe className="h-6 w-6 text-[#6E3C47]/40" />
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
