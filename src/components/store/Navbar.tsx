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

  const links = [
    { name: 'Novidades', href: '#catalogo' },
    { name: 'Mais Vendidos', href: '#catalogo' },
    { name: 'Moda Festa', href: '#catalogo' },
    { name: 'Coleções', href: '#catalogo' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-[#6E3C47] text-white py-2 px-4 text-center text-[9px] font-bold uppercase tracking-[0.4em] border-b border-white/5">
        Frete grátis em pedidos acima de R$300 • Parcelamento em até 10x sem juros
      </div>

      <header 
        className={cn(
          "transition-all duration-700 px-6 md:px-12 isolate",
          scrolled 
            ? "bg-white/95 backdrop-blur-md shadow-sm py-4" 
            : "bg-transparent py-8"
        )}
      >
        <div className="container mx-auto max-w-[1400px]">
          <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center">
            
            <nav className="flex items-center gap-10">
              {links.slice(0, 2).map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#2A1F22]/60 hover:text-[#6E3C47] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <Link href="/" className="px-12">
              <LogoMark />
            </Link>

            <div className="flex items-center justify-end gap-8">
              <nav className="flex items-center gap-10 mr-4">
                {links.slice(2).map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#2A1F22]/60 hover:text-[#6E3C47] transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-[#6E3C47]" onClick={onOpenLogin}>
                  <User className="h-4 w-4" />
                </Button>
                
                <button 
                  onClick={onOpenCart}
                  className="flex items-center gap-3 pl-4 pr-5 h-10 rounded-full bg-[#6E3C47] text-white hover:opacity-90 transition-all shadow-lg shadow-[#6E3C47]/20 group relative"
                >
                  <div className="relative">
                    <ShoppingBag className="h-4 w-4" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#C7A17A] text-white text-[7px] h-4 w-4 rounded-full flex items-center justify-center font-bold border border-[#6E3C47]">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em]">
                    Carrinho
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:hidden flex items-center justify-between">
            <button onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-6 w-6 text-[#6E3C47]" />
            </button>

            <LogoMark className="scale-90" />

            <button onClick={onOpenCart} className="relative p-2 bg-[#6E3C47] text-white rounded-full">
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C7A17A] text-white text-[7px] h-4 w-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] bg-white animate-in fade-in slide-in-from-left duration-500">
            <div className="p-8 flex flex-col h-full">
              <div className="flex justify-between items-center mb-16">
                <LogoMark />
                <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                  <X className="h-6 w-6 text-[#6E3C47]" />
                </button>
              </div>
              <nav className="flex flex-col gap-8">
                {links.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-2xl font-serif font-bold text-[#6E3C47]"
                  >
                    {link.name}
                  </Link>
                ))}
                <button 
                  onClick={() => { onOpenTrack(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-4 text-lg font-bold text-[#2A1F22]/60"
                >
                  <Package className="h-5 w-5 text-[#C7A17A]" />
                  Rastrear Pedido
                </button>
              </nav>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
