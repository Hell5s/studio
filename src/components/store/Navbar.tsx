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
      {/* Faixa Superior Premium */}
      <div className="bg-[#6E3C47] text-white py-2.5 px-4 text-center text-[10px] font-bold uppercase tracking-[0.25em] border-b border-white/5">
        Frete VIP em pedidos acima de R$350 • Parcelamento em até 10x sem juros
      </div>

      <header 
        className={cn(
          "transition-all duration-700 px-6 md:px-12 isolate",
          scrolled 
            ? "bg-white/95 backdrop-blur-xl shadow-xl py-4" 
            : "bg-[#FFF9F7] py-8"
        )}
      >
        <div className="container mx-auto max-w-7xl">
          {/* Desktop Navigation - Layout Simétrico 1fr auto 1fr */}
          <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center gap-8">
            
            {/* Esquerda: Links Principais */}
            <nav className="flex items-center gap-10">
              {leftLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="group relative text-[11px] font-bold uppercase tracking-[0.2em] text-[#2A1F22]/70 hover:text-[#6E3C47] transition-colors"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#C7A17A] transition-all duration-500 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Centro: Logo Centralizada */}
            <Link href="/" className="px-4">
              <LogoMark />
            </Link>

            {/* Direita: Rastrear e Ações */}
            <div className="flex items-center justify-end gap-8">
              <button 
                onClick={onOpenTrack}
                className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#2A1F22]/70 hover:text-[#6E3C47] transition-colors group"
              >
                <Package className="h-3.5 w-3.5 text-[#C7A17A] group-hover:scale-110 transition-transform" />
                Rastrear
              </button>
              
              <div className="flex items-center gap-2 h-10 px-2 rounded-full bg-[#F7E8EA]/30 border border-[#F7E8EA]">
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-white text-[#6E3C47]">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-white text-[#6E3C47]">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-white text-[#6E3C47]" onClick={onOpenLogin}>
                  <User className="h-4 w-4" />
                </Button>
                
                <div className="w-[1px] h-4 bg-[#6E3C47]/10 mx-1" />

                <button 
                  onClick={onOpenCart}
                  className="flex items-center gap-3 pl-2 pr-4 h-8 rounded-full bg-[#6E3C47] text-white hover:bg-[#6E3C47]/90 transition-all shadow-lg shadow-[#6E3C47]/20 group"
                >
                  <div className="relative">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#C7A17A] text-white text-[8px] h-3.5 w-3.5 rounded-full flex items-center justify-center font-bold">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Carrinho
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Header - Logo Centralizada */}
          <div className="lg:hidden grid grid-cols-3 items-center">
            <button className="p-2 w-fit" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-6 w-6 text-[#6E3C47]" />
            </button>

            <Link href="/" className="flex justify-center">
              <h1 className="text-2xl font-bold text-[#6E3C47] tracking-tight font-serif">Toda Bela</h1>
            </Link>

            <div className="flex justify-end items-center gap-3">
              <button onClick={onOpenLogin} className="p-2 text-[#6E3C47]">
                <User className="h-5 w-5" />
              </button>
              <button onClick={onOpenCart} className="relative p-2 bg-[#6E3C47] text-white rounded-full">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C7A17A] text-white text-[8px] h-4 w-4 rounded-full flex items-center justify-center font-bold border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[60] bg-white animate-in slide-in-from-left duration-500">
            <div className="p-10 flex flex-col h-full bg-[#FFF9F7]">
              <div className="flex justify-between items-center mb-16">
                <LogoMark />
                <button onClick={() => setMobileMenuOpen(false)} className="p-3 bg-[#F7E8EA] rounded-full text-[#6E3C47]">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex flex-col gap-8">
                {leftLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-3xl font-bold text-[#2A1F22] hover:text-[#6E3C47] transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="h-px w-12 bg-[#C7A17A]/40 my-4" />
                <button 
                  onClick={() => { onOpenTrack(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-4 text-xl font-bold text-[#2A1F22] text-left"
                >
                  <Package className="h-6 w-6 text-[#C7A17A]" />
                  Rastrear Pedido
                </button>
              </nav>

              <div className="mt-auto pt-10 border-t border-[#F7E8EA]">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C7A17A] mb-4">Siga a Maison</p>
                <div className="flex gap-4">
                  {/* Ícones de redes sociais poderiam ir aqui */}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
