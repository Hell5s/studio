
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Search, Menu, X, Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogoMark } from './LogoMark';
import { cn } from '@/lib/utils';

export function Navbar({ onOpenLogin, onOpenTrack }: { onOpenLogin: () => void, onOpenTrack: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const leftLinks = [
    { name: 'Novidades', href: '#novidades' },
    { name: 'Mais Vendidos', href: '#mais-vendidos' },
    { name: 'Moda Festa', href: '#moda-festa' },
    { name: 'Coleções', href: '#colecoes' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Top Notice Bar Premium */}
      <div className="bg-primary text-primary-foreground py-2.5 px-4 text-center border-b border-white/5">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
          ✨ Frete VIP em pedidos acima de R$350 • Parcelamento em até 10x sem juros ✨
        </p>
      </div>

      <header 
        className={cn(
          "transition-all duration-1000 px-6 md:px-12",
          scrolled 
            ? "bg-white/80 backdrop-blur-xl shadow-premium py-4" 
            : "bg-transparent py-8"
        )}
      >
        <div className="container mx-auto">
          {/* Desktop Layout - 3 Columns Grid for Perfect Centering */}
          <div className="hidden lg:grid grid-cols-3 items-center">
            
            {/* Left Column: Navigation */}
            <nav className="flex items-center gap-10">
              {leftLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/60 hover:text-primary transition-all duration-300 relative group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-500 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Center Column: Logo */}
            <div className="flex justify-center">
              <Link href="/" className="transition-transform hover:scale-105 duration-700">
                <LogoMark />
              </Link>
            </div>

            {/* Right Column: Actions */}
            <div className="flex items-center justify-end gap-6">
              <button 
                onClick={onOpenTrack}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/60 hover:text-primary transition-all duration-300 group"
              >
                <MapPin className="h-3 w-3 text-accent/60 group-hover:text-accent" />
                Rastrear
              </button>
              
              <div className="h-4 w-[1px] bg-primary/10" />

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 text-primary/70 hover:text-primary transition-colors">
                  <Search className="h-4.5 w-4.5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 text-primary/70 hover:text-primary transition-colors">
                  <Heart className="h-4.5 w-4.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full hover:bg-primary/5 text-primary/70 hover:text-primary transition-colors"
                  onClick={onOpenLogin}
                >
                  <User className="h-4.5 w-4.5" />
                </Button>
                
                <div className="relative group ml-2">
                  <Button className="rounded-full bg-primary text-primary-foreground font-bold px-8 h-12 shadow-xl shadow-primary/10 hover:scale-105 transition-all duration-500 overflow-hidden group isolate">
                    <ShoppingBag className="mr-3 h-4 w-4 relative z-10" />
                    <span className="text-[10px] uppercase tracking-[0.2em] relative z-10">Carrinho</span>
                    {/* Correção da barra dourada bugada: usando opacity + translate mais profundo */}
                    <div className="absolute inset-0 bg-accent translate-y-[105%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden relative flex items-center justify-between h-12">
            <button 
              className="p-2 text-primary"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link href="/" className="absolute left-1/2 -translate-x-1/2 transition-transform active:scale-95">
              <div className="scale-75 origin-center">
                <LogoMark />
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full text-primary" onClick={onOpenLogin}>
                <User className="h-5 w-5" />
              </Button>
              <Button size="icon" className="rounded-full bg-primary h-10 w-10 shadow-lg">
                <ShoppingBag className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[60] bg-white animate-in fade-in slide-in-from-left duration-500">
            <div className="p-10 flex flex-col h-full">
              <div className="flex justify-between items-center mb-16">
                <div className="scale-90 origin-left">
                  <LogoMark />
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
              <div className="mt-auto pt-16 border-t border-primary/10">
                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent mb-6">Maison Toda Bela</p>
                <div className="flex gap-8 text-primary/60 text-xs font-bold uppercase tracking-widest">
                  <span className="hover:text-primary transition-colors cursor-pointer">Instagram</span>
                  <span className="hover:text-primary transition-colors cursor-pointer">Pinterest</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
