"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react';
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

  const navLinks = [
    { name: 'Novidades', href: '#novidades' },
    { name: 'Mais Vendidos', href: '#mais-vendidos' },
    { name: 'Moda Festa', href: '#moda-festa' },
    { name: 'Coleções', href: '#colecoes' },
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 md:px-8 py-4",
        scrolled ? "bg-white/80 backdrop-blur-xl shadow-sm py-2" : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex items-center justify-between h-16">
        {/* Mobile Menu Trigger */}
        <button 
          className="lg:hidden p-2 text-primary"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Logo */}
        <Link href="/" className="transition-transform hover:scale-105">
          <LogoMark />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-[11px] font-bold uppercase tracking-[0.3em] text-foreground/70 hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <button 
            onClick={onOpenTrack}
            className="text-[11px] font-bold uppercase tracking-[0.3em] text-foreground/70 hover:text-primary transition-colors"
          >
            Rastrear
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 hidden md:flex">
            <Search className="h-5 w-5 text-primary" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-primary/5"
            onClick={onOpenLogin}
          >
            <User className="h-5 w-5 text-primary" />
          </Button>
          <Button className="rounded-full bg-primary text-primary-foreground font-bold px-6 h-12 shadow-xl shadow-primary/20 hover:scale-105 transition-all hidden md:flex">
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span className="text-xs uppercase tracking-widest">Carrinho</span>
          </Button>
          <Button size="icon" className="rounded-full bg-primary md:hidden h-10 w-10">
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white animate-in fade-in slide-in-from-left duration-300">
          <div className="p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-12">
              <LogoMark />
              <button onClick={() => setMobileMenuOpen(false)} className="p-2"><X className="h-8 w-8 text-primary" /></button>
            </div>
            <nav className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-3xl font-headline font-bold text-primary tracking-tight"
                >
                  {link.name}
                </Link>
              ))}
              <button 
                onClick={() => { onOpenTrack(); setMobileMenuOpen(false); }}
                className="text-3xl font-headline font-bold text-primary tracking-tight text-left"
              >
                Rastrear Pedido
              </button>
            </nav>
            <div className="mt-auto pt-12 border-t border-primary/10">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-4">Siga nossa Maison</p>
              <div className="flex gap-6 text-primary">
                <span className="text-sm font-medium">Instagram</span>
                <span className="text-sm font-medium">TikTok</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}