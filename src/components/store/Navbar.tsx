
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
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
    setIsSearchOpen(false);
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
    { label: 'Coleções', href: '/#colecoes' },
    { label: 'Produtos', href: '/#vitrine' },
    { label: 'Mais Vendidos', href: '/#mais-vendidos' },
    { label: 'Economize', href: '/economize', highlight: true },
  ];

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700",
        scrolled ? "bg-white shadow-[0_1px_20px_rgba(0,0,0,0.06)]" : "bg-white"
      )}>

        {/* Barra superior — frete grátis */}
        <div className={cn(
          "w-full bg-primary text-white flex items-center justify-center transition-all duration-500 overflow-hidden",
          scrolled ? "h-0 opacity-0" : "h-8 opacity-100"
        )}>
          <p className="text-[9px] font-medium tracking-[0.5em] uppercase px-4 text-center">
            Frete Grátis • Sul e Sudeste acima de R$ 249
          </p>
        </div>

        {/* Navbar principal */}
        <div className="w-full border-b border-gray-100">
          <nav className="max-w-[1400px] mx-auto px-4 md:px-12 h-16 md:h-[72px] flex items-center justify-between relative">

            {/* Hamburger mobile */}
            <div className="flex-1 lg:hidden">
              <button
                className="p-1 text-primary/60 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

            {/* Links — esquerda no desktop */}
            <div className="hidden lg:flex items-center gap-10 flex-1">
              {navLinks.map((link: any) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "text-[11px] font-semibold tracking-[0.15em] transition-all duration-200 relative group pb-0.5 uppercase",
                    link.highlight
                      ? "text-accent hover:text-accent/70"
                      : "text-primary/70 hover:text-primary"
                  )}
                >
                  {link.label}
                  <span className={cn(
                    "absolute bottom-0 left-0 h-px transition-all duration-300 group-hover:w-full w-0",
                    link.highlight ? "bg-accent" : "bg-primary"
                  )} />
                </Link>
              ))}
            </div>

            {/* Logo — centro absoluto */}
            <div className="absolute left-1/2 -translate-x-1/2 z-10">
              <Link href="/">
                <LogoMark />
              </Link>
            </div>

            {/* Ícones — direita */}
            <div className="flex items-center gap-0.5 md:gap-1 flex-1 justify-end">

              {/* Busca expansível */}
              <div className="flex items-center">
                {isSearchOpen ? (
                  <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300 absolute right-4 md:relative md:right-0 bg-white md:bg-transparent p-2 md:p-0 z-20 rounded-full shadow-lg md:shadow-none border border-primary/5 md:border-none">
                    <input
                      autoFocus
                      placeholder="Buscar..."
                      className="w-32 md:w-64 h-8 border-b border-primary/20 focus:border-primary bg-transparent text-[11px] tracking-wider outline-none px-1 transition-all"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <button type="button" onClick={() => setIsSearchOpen(false)}>
                      <X className="h-4 w-4 text-primary/40 hover:text-primary transition-colors" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 text-primary/50 hover:text-primary transition-colors"
                  >
                    <Search className="h-[18px] w-[18px]" />
                  </button>
                )}
              </div>

              {/* Pedidos - Visível em tablets e desktop */}
              <Link
                href="/meus-pedidos"
                className="p-2 text-primary/50 hover:text-primary transition-colors hidden sm:flex items-center gap-1.5 group"
              >
                <Package className="h-[18px] w-[18px]" />
                <span className="text-[9px] font-semibold uppercase tracking-widest group-hover:text-primary transition-colors hidden xl:block">
                  Pedidos
                </span>
              </Link>

              {isAdmin && (
                <button
                  onClick={handleAdminClick}
                  className="p-2 text-primary/50 hover:text-accent transition-colors hidden md:flex"
                  title="Painel Admin"
                >
                  <LayoutDashboard className="h-[18px] w-[18px]" />
                </button>
              )}

              {/* Conta - Apenas Desktop para não poluir o celular (já está no drawer) */}
              <button
                onClick={onOpenLogin}
                className="p-2 text-primary/50 hover:text-primary transition-colors hidden lg:block"
              >
                <User className="h-[18px] w-[18px]" />
              </button>

              <button
                onClick={onOpenCart}
                className="relative p-2 text-primary/50 hover:text-primary transition-colors"
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-primary text-white text-[7px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={onOpenFavorites}
                className="relative p-2 text-primary/50 hover:text-accent transition-colors"
              >
                <Heart className="h-[18px] w-[18px]" />
                {favoritesCount > 0 && (
                  <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-accent text-white text-[7px] font-bold flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Menu mobile drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-500"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute top-0 left-0 h-full w-[280px] bg-white shadow-2xl animate-in slide-in-from-left duration-500 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <LogoMark />
              <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-secondary/50 rounded-full transition-colors">
                <X className="h-5 w-5 text-primary/40" />
              </button>
            </div>
            <nav className="flex-1 px-6 py-8 space-y-1 overflow-y-auto no-scrollbar">
              <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-primary/30 mb-4 ml-1">Menu</p>
              {navLinks.map((link: any) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center py-4 border-b border-gray-50 text-[11px] font-bold tracking-[0.2em] transition-colors hover:text-accent uppercase",
                    link.highlight ? "text-accent" : "text-primary/70"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-8 space-y-1">
                <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-primary/30 mb-4 ml-1">Sua Conta</p>
                <Link
                  href="/meus-pedidos"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 py-4 text-[11px] font-bold tracking-[0.2em] text-primary/70 hover:text-accent transition-colors uppercase"
                >
                  <Package className="h-4 w-4" /> Meus Pedidos
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenLogin();
                  }}
                  className="flex items-center gap-3 py-4 text-[11px] font-bold tracking-[0.2em] text-primary/70 hover:text-accent transition-colors uppercase w-full text-left"
                >
                  <User className="h-4 w-4" /> {user ? 'Dados da Conta' : 'Acessar / Criar Conta'}
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleAdminClick();
                    }}
                    className="flex items-center gap-3 py-4 text-[11px] font-bold tracking-[0.2em] text-accent hover:text-primary transition-colors uppercase w-full text-left"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Painel Admin
                  </button>
                )}
              </div>
            </nav>
            <div className="p-6 border-t border-gray-100 bg-secondary/10">
              <p className="text-[9px] text-primary/30 uppercase tracking-[0.4em] text-center italic">Essência Toda Bela</p>
            </div>
          </div>
        </div>
      )}

      {/* Spacer para compensar o header fixo */}
      <div className={cn(
        "transition-all duration-500",
        scrolled ? "h-16 md:h-[72px]" : "h-24 md:h-[104px]"
      )} />
    </>
  );
}
