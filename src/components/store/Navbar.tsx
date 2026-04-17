"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Search, Menu, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground py-2.5 px-4 text-center border-b border-white/5">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">
          ✨ Frete VIP acima de R$350 • Até 10x sem juros ✨
        </p>
      </div>

      <header 
        className={cn(
          "transition-all duration-1000 px-6 md:px-12",
          scrolled 
            ? "bg-white/80 backdrop-blur-xl shadow-editorial py-4" 
            : "bg-transparent py-8"
        )}
      >
        <div className="container mx-auto">
          <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center">
            
            {/* Left Nav */}
            <nav className="flex items-center gap-10">
              {leftLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/60 hover:text-primary transition-all duration-300 relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent transition-all duration-500 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Logo Centralized */}
            <Link href="/" className="flex flex-col items-center group">
              <h1 className="text-3xl font-headline font-bold text-primary tracking-tighter leading-none group-hover:scale-105 transition-transform duration-700">Toda Bela</h1>
              <p className="text-[8px] font-bold uppercase tracking-[0.6em] text-accent mt-1 opacity-80">Maison de Mode</p>
            </Link>

            {/* Right Nav */}
            <div className="flex items-center justify-end gap-8">
              <button 
                onClick={onOpenTrack}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/60 hover:text-primary transition-all duration-300 group"
              >
                <MapPin className="h-3 w-3 text-accent group-hover:scale-110 transition-transform" />
                Rastrear
              </button>
              
              <div className="h-4 w-[1px] bg-primary/10" />

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 text-primary/70">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 text-primary/70" onClick={onOpenLogin}>
                  <User className="h-4 w-4" />
                </Button>
                
                <Button 
                  onClick={onOpenCart}
                  className="rounded-full bg-primary text-white font-bold px-8 h-12 shadow-editorial hover:bg-accent transition-all duration-500 group relative isolate"
                >
                  <ShoppingBag className="mr-3 h-4 w-4 relative z-10" />
                  <span className="text-[10px] uppercase tracking-[0.2em] relative z-10">
                    Sacola {cartCount > 0 && `(${cartCount})`}
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between">
            <button className="p-2 text-primary" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>

            <Link href="/" className="flex flex-col items-center">
              <h1 className="text-2xl font-headline font-bold text-primary tracking-tighter leading-none">Toda Bela</h1>
              <p className="text-[7px] font-bold uppercase tracking-[0.5em] text-accent">Maison</p>
            </Link>

            <button onClick={onOpenCart} className="relative p-2 text-primary">
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[8px] h-4 w-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[60] bg-white animate-in fade-in slide-in-from-left duration-500">
            <div className="p-10 flex flex-col h-full">
              <div className="flex justify-between items-center mb-16">
                <div className="flex flex-col">
                  <h1 className="text-3xl font-headline font-bold text-primary">Toda Bela</h1>
                  <p className="text-[8px] font-bold uppercase tracking-[0.5em] text-accent">Maison de Mode</p>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-3 bg-secondary rounded-full">
                  <X className="h-6 w-6 text-primary" />
                </button>
              </div>
              <nav className="flex flex-col gap-10">
                {leftLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-4xl font-headline font-bold text-primary tracking-tight"
                  >
                    {link.name}
                  </Link>
                ))}
                <button 
                  onClick={() => { onOpenTrack(); setMobileMenuOpen(false); }}
                  className="text-4xl font-headline font-bold text-primary tracking-tight text-left"
                >
                  Rastrear Pedido
                </button>
              </nav>
              <div className="mt-auto pt-10 border-t border-primary/10">
                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent mb-6">Maison Toda Bela © 2024</p>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}