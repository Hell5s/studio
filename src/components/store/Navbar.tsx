"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, User, Search, Heart, Package, Menu, X, LayoutDashboard } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import { LogoMark } from './LogoMark';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenCart: () => void;
  onOpenFavorites: () => void;
  cartCount: number;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onSearch?: (query: string) => void;
}

export function Navbar({ onOpenLogin, onOpenCart, onOpenFavorites, cartCount, onSearch, onOpenAdmin }: NavbarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc(settingsRef);

  const adminDocRef = useMemoFirebase(() => {
    return user ? doc(db, 'roles_admin', user.uid) : null;
  }, [db, user]);
  const { data: adminRole } = useDoc(adminDocRef);
  const isAdmin = !!adminRole;

  const favoritesQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'favorites'));
  }, [db, user?.uid]);

  const { data: favorites } = useCollection(favoritesQuery);
  const favoritesCount = favorites?.length || 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchValue);
    setIsMenuOpen(false);
  };

  const handleAdminClick = () => {
    if (onOpenAdmin) {
      onOpenAdmin();
    } else {
      router.push('/?admin=true');
    }
  };

  const navLinks = settings?.navLinks || [
    { label: 'COLEÇÕES', href: '/#colecoes' },
    { label: 'PRODUTOS', href: '/#vitrine' },
    { label: 'MAIS VENDIDOS', href: '/#mais-vendidos' },
    { label: 'ECONOMIZE', href: '/economize', highlight: true },
  ];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      scrolled
        ? "bg-white/98 backdrop-blur-sm shadow-sm border-b border-primary/5"
        : "bg-white border-b border-primary/5"
    )}>
      {/* Barra de frete - some ao rolar */}
      <div className={cn(
        "hidden md:flex items-center justify-center text-[9px] font-bold uppercase tracking-[0.4em] text-white bg-primary transition-all duration-500 overflow-hidden",
        scrolled ? "h-0 opacity-0" : "h-7 opacity-100"
      )}>
        Frete Grátis acima de R$ 249 • Sul e Sudeste
      </div>

      <nav className="w-full px-6 md:px-8 h-16 md:h-20 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <LogoMark />
        </Link>

        {/* Links centro - desktop */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link: any) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "text-[9px] font-bold tracking-[0.35em] transition-all duration-300 hover:text-primary relative group",
                link.highlight ? "text-accent" : "text-primary/60"
              )}
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-500" />
            </Link>
          ))}
        </div>

        {/* Busca - desktop */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex relative flex-1 max-w-xs group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary/30 group-focus-within:text-accent transition-colors" />
          <input
            placeholder="Procurar..."
            className="w-full h-10 bg-secondary/20 rounded-full pl-10 pr-4 text-[10px] tracking-wider outline-none border border-transparent focus:border-accent/20 transition-all"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </form>

        {/* Ícones direita */}
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href="/meus-pedidos"
            className="p-2.5 text-primary/50 hover:text-primary transition-colors flex items-center gap-2"
          >
            <Package className="h-5 w-5" />
            <span className="hidden md:block text-[9px] font-bold uppercase tracking-widest">Pedidos</span>
          </Link>

          {isAdmin && (
            <button
              onClick={handleAdminClick}
              className="p-2.5 text-primary/50 hover:text-accent transition-colors"
              title="Painel Administrativo"
            >
              <LayoutDashboard className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={onOpenLogin}
            className="p-2.5 text-primary/50 hover:text-primary transition-colors"
          >
            <User className="h-5 w-5" />
          </button>

          <button
            onClick={onOpenCart}
            className="relative p-2.5 text-primary/50 hover:text-primary transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full bg-accent text-white text-[8px] font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenFavorites}
            className="relative p-2.5 text-accent hover:text-primary transition-colors"
          >
            <Heart className="h-5 w-5" />
            {favoritesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full bg-primary text-white text-[8px] font-black flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            className="lg:hidden p-2.5 text-primary/50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-primary/5 px-6 py-6 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-300">
          {navLinks.map((link: any) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "flex items-center py-3.5 border-b border-primary/5 text-[11px] font-bold tracking-[0.3em] transition-colors hover:text-accent",
                link.highlight ? "text-accent" : "text-primary/60"
              )}
            >
              {link.label}
            </Link>
          ))}
          <form onSubmit={handleSearchSubmit} className="relative pt-4">
            <Search className="absolute left-4 top-1/2 mt-2 -translate-y-1/2 h-4 w-4 text-primary/30" />
            <input
              placeholder="Procurar..."
              className="w-full h-12 bg-secondary/20 rounded-full pl-12 pr-6 text-[10px] tracking-wider outline-none"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </form>
        </div>
      )}
    </header>
  );
}