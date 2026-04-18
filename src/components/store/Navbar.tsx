
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
    { name: 'NOVIDADES', href: '#catalogo' },
    { name: 'MAIS VENDIDOS', href: '#catalogo' },
    { name: 'MODA FESTA', href: '#catalogo' },
    { name: 'COLEÇÕES', href: '#catalogo' },
    { name: 'RASTREAR', href: '#', onClick: onOpenTrack },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full">
      <header 
        className={cn(
          "transition-all duration-700 px-6 md:px-12 w-full border-b border-transparent",
          scrolled 
            ? "bg-white/80 backdrop-blur-xl border-black/5 py-4" 
            : "bg-transparent py-6"
        )}
      >
        <div className="container mx-auto max-w-[1600px] flex items-center justify-between">
          
          {/* Logo à Esquerda */}
          <Link href="/" className="transition-transform duration-500 hover:scale-105 shrink-0">
            <LogoMark itemsStart />
          </Link>

          {/* Navegação Central */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <button 
                key={link.name} 
                onClick={link.onClick}
                className="group relative"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#2A1F22]/70 group-hover:text-[#6E3C47] transition-colors">
                  {link.name}
                </span>
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#C7A17A] transition-all duration-500 group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* Ações à Direita */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full text-[#2A1F22]/70 hover:text-[#6E3C47]">
                <Search className="h-4.5 w-4.5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-[#2A1F22]/70 hover:text-[#6E3C47]" onClick={onOpenLogin}>
                <User className="h-4.5 w-4.5" />
              </Button>
            </div>
            
            <button 
              onClick={onOpenCart}
              className="flex items-center gap-3 pl-5 pr-6 h-12 rounded-full bg-[#6E3C47] text-white hover:bg-[#2A1F22] transition-all shadow-xl group"
            >
              <div className="relative">
                <ShoppingBag className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#C7A17A] text-white text-[7px] h-3.5 w-3.5 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Carrinho</span>
            </button>

            {/* Mobile Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full bg-white border border-black/5"
            >
              <Menu className="h-5 w-5 text-[#6E3C47]" />
            </button>
          </div>
        </div>

        {/* Menu Mobile Lateral */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] bg-white/98 animate-in fade-in slide-in-from-left duration-500">
            <div className="p-10 flex flex-col h-full">
              <div className="flex justify-between items-center mb-16">
                <LogoMark />
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="h-12 w-12 flex items-center justify-center rounded-full bg-[#F7E8EA]"
                >
                  <X className="h-6 w-6 text-[#6E3C47]" />
                </button>
              </div>
              
              <nav className="flex flex-col gap-8">
                {navLinks.map((link) => (
                  <button 
                    key={link.name} 
                    onClick={() => { link.onClick?.(); setMobileMenuOpen(false); }}
                    className="text-left group"
                  >
                    <p className="text-3xl font-serif font-bold text-[#6E3C47]">{link.name}</p>
                    <div className="h-px w-full bg-[#F7E8EA] mt-4 opacity-30" />
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
