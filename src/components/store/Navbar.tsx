
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Search, Menu, X, Heart, ShieldCheck, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LogoMark } from './LogoMark';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenTrack: () => void;
  onOpenOrders: () => void;
  onOpenCart: () => void;
  cartCount: number;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onSearch?: (query: string) => void;
}

export function Navbar({ onOpenLogin, onOpenTrack, onOpenOrders, onOpenCart, cartCount, isAdmin, onOpenAdmin, onSearch }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchValue);
  };

  const navLinks = [
    { label: 'COLEÇÕES', href: '#colecoes' },
    { label: 'PRODUTOS', href: '#produtos' },
    { label: 'MAIS VENDIDOS', href: '#mais-vendidos' },
    { label: 'ECONOMIZE', href: '/economize', highlight: true },
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled ? "bg-white/95 backdrop-blur-md py-3 shadow-sm" : "bg-white py-6"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
        
        {/* Logo - Left Side */}
        <div className="flex-shrink-0">
          <Link href="/">
            <LogoMark className="scale-75 md:scale-90 origin-left" />
          </Link>
        </div>

        {/* Nav Links - Center (Desktop) */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.label} 
              href={link.href}
              className={cn(
                "text-[11px] font-bold tracking-[0.2em] transition-colors",
                link.highlight 
                  ? "text-accent hover:text-accent/80 border-b border-accent/20" 
                  : "text-primary/70 hover:text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search and Actions - Right Side */}
        <div className="flex items-center gap-2 md:gap-6 flex-shrink-0">
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center bg-secondary/30 rounded-full h-11 px-4 w-40 lg:w-64 focus-within:w-56 lg:focus-within:w-80 transition-all duration-500">
            <Search className="h-4 w-4 text-accent/40 mr-2" />
            <input 
              placeholder="Procurar no site..." 
              className="bg-transparent text-[11px] outline-none text-primary w-full"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </form>

          <div className="flex items-center gap-1 md:gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full text-primary hover:bg-secondary h-10 px-3 md:px-4" 
              onClick={onOpenOrders}
            >
              <Package className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline text-[9px] font-bold uppercase tracking-widest">Meus Pedidos</span>
            </Button>
            
            <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-secondary h-10 w-10" onClick={onOpenLogin}>
              <User className="h-5 w-5" />
            </Button>

            <button onClick={onOpenCart} className="relative flex items-center justify-center h-10 w-10 text-primary hover:bg-secondary rounded-full transition-colors">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>

            {isAdmin && (
              <Button variant="ghost" size="icon" className="rounded-full text-accent hover:bg-accent/10 ml-2 h-10 w-10" onClick={onOpenAdmin}>
                <ShieldCheck className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
