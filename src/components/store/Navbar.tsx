
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

  const navLinks = [
    { name: 'Novidades', href: '#catalogo' },
    { name: 'Mais Vendidos', href: '#catalogo' },
    { name: 'Moda Festa', href: '#catalogo' },
    { name: 'Coleções', href: '#catalogo' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Barra de Aviso Simples */}
      <div className="bg-[#6E3C47] text-white py-2 px-4 text-center text-[11px] font-bold uppercase tracking-wider">
        Frete grátis acima de R$300 • Parcele em até 10x sem juros
      </div>

      <header 
        className={cn(
          "transition-all duration-500 px-6 md:px-12",
          scrolled 
            ? "bg-white/95 backdrop-blur-md shadow-md py-3" 
            : "bg-[#FFF9F7] py-5"
        )}
      >
        <div className="container mx-auto">
          <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center">
            
            {/* Links Esquerda */}
            <nav className="flex items-center gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="text-xs font-bold uppercase tracking-widest text-[#2A1F22]/70 hover:text-[#6E3C47] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Logo Centralizada */}
            <Link href="/">
              <LogoMark />
            </Link>

            {/* Ações Direita */}
            <div className="flex items-center justify-end gap-6">
              <button 
                onClick={onOpenTrack}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#2A1F22]/70 hover:text-[#6E3C47] transition-colors"
              >
                <Package className="h-4 w-4" />
                Rastrear Pedido
              </button>
              
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-[#F7E8EA]">
                  <Search className="h-5 w-5 text-[#6E3C47]" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-[#F7E8EA]" onClick={onOpenLogin}>
                  <User className="h-5 w-5 text-[#6E3C47]" />
                </Button>
                
                <Button 
                  onClick={onOpenCart}
                  className="rounded-full bg-[#6E3C47] text-white font-bold px-6 h-11 shadow-lg hover:bg-[#6E3C47]/90 transition-all flex items-center gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span className="text-[11px] uppercase tracking-wider">
                    Carrinho {cartCount > 0 && `(${cartCount})`}
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between">
            <button className="p-2" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-6 w-6 text-[#6E3C47]" />
            </button>

            <Link href="/">
              <h1 className="text-2xl font-bold text-[#6E3C47] tracking-tight">Toda Bela</h1>
            </Link>

            <button onClick={onOpenCart} className="relative p-2">
              <ShoppingBag className="h-6 w-6 text-[#6E3C47]" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#C7A17A] text-white text-[9px] h-4 w-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Menu Mobile Simples */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[60] bg-white animate-in slide-in-from-left duration-300">
            <div className="p-8 flex flex-col h-full">
              <div className="flex justify-between items-center mb-12">
                <h1 className="text-2xl font-bold text-[#6E3C47]">Toda Bela</h1>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-[#F7E8EA] rounded-full">
                  <X className="h-6 w-6 text-[#6E3C47]" />
                </button>
              </div>
              <nav className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-2xl font-bold text-[#2A1F22]"
                  >
                    {link.name}
                  </Link>
                ))}
                <button 
                  onClick={() => { onOpenTrack(); setMobileMenuOpen(false); }}
                  className="text-2xl font-bold text-[#2A1F22] text-left"
                >
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
