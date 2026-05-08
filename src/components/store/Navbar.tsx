
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
    const handleScroll = () => setScrolled(window.scrollY > 80);
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-white shadow-[0_1px_12px_rgba(0,0,0,0.06)]"
          : "bg-transparent"
      )}>

        {/* Barra superior — frete grátis */}
        <div className={cn(
          "w-full bg-primary text-white flex items-center justify-center transition-all duration-500 overflow-hidden",
          scrolled ? "h-0 opacity-0" : "h-8 opacity-100"
        )}>
          <p className="text-[9px] font-medium tracking-[0.5em] uppercase">
            Frete Grátis • Sul e Sudeste acima de R$ 249
          </p>
        </div>

        {/* Navbar principal */}
        <div className={cn(
          "w-full transition-all duration-500",
          !scrolled && "border-b border-white/10"
        )}>
          <nav className="max-w-[1400px] mx-auto px-4 md:px-12 h-16 md:h-[72px] flex items-center justify-between">

            {/* Hamburger mobile */}
            <button
              className={cn(
                "lg:hidden p-1 transition-colors",
                scrolled ? "text-primary/60 hover:text-primary" : "text-white/80 hover:text-white"
              )}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Links — esquerda no desktop */}
            <div className="hidden lg:flex items-center gap-10 flex-1">
              {navLinks.map((link: any) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "text-[10px] font-semibold tracking-[0.25em] uppercase transition-all duration-200 relative group pb-0.5",
                    scrolled
                      ? link.highlight ? "text-accent" : "text-primary/60 hover:text-primary"
                      : link.highlight ? "text-accent" : "text-white/80 hover:text-white"
                  )}
                >
                  {link.label}
                  <span className={cn(
                    "absolute bottom-0 left-0 h-px transition-all duration-300 group-hover:w-full w-0",
                    link.highlight ? "bg-accent" : (scrolled ? "bg-primary" : "bg-white")
                  )} />
                </Link>
              ))}
            </div>

            {/* Logo — centro absoluto */}
            <div className={cn(
              "absolute left-1/2 -translate-x-1/2 transition-all duration-500",
              !scrolled && "brightness-0 invert"
            )}>
              <Link href="/">
                <LogoMark />
              </Link>
            </div>

            {/* Ícones — direita */}
            <div className="flex items-center gap-0.5 flex-1 justify-end">

              {/* Busca expansível */}
              <div className="flex items-center">
                {isSearchOpen ? (
                  <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
                    <input
                      autoFocus
                      placeholder="Buscar..."
                      className={cn(
                        "w-48 md:w-64 h-8 border-b focus:border-primary bg-transparent text-[11px] tracking-wider outline-none px-1 transition-all",
                        scrolled ? "border-primary/20 text-primary" : "border-white/20 text-white"
                      )}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <button type="button" onClick={() => setIsSearchOpen(false)}>
                      <X className={cn("h-4 w-4 transition-colors", scrolled ? "text-primary/40 hover:text-primary" : "text-white/40 hover:text-white")} />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className={cn(
                      "p-2 transition-colors",
                      scrolled ? "text-primary/40 hover:text-primary" : "text-white/80 hover:text-white"
                    )}
                  >
                    <Search className="h-[18px] w-[18px]" />
                  </button>
                )}
              </div>

              <Link
                href="/meus-pedidos"
                className={cn(
                  "p-2 transition-colors hidden md:flex items-center gap-1.5 group",
                  scrolled ? "text-primary/40 hover:text-primary" : "text-white/80 hover:text-white"
                )}
              >
                <Package className="h-[18px] w-[18px]" />
                <span className="text-[9px] font-semibold uppercase tracking-widest hidden xl:block">
                  Pedidos
                </span>
              </Link>

              {isAdmin && (
                <button
                  onClick={handleAdminClick}
                  className={cn(
                    "p-2 transition-colors hidden md:flex",
                    scrolled ? "text-primary/40 hover:text-accent" : "text-white/80 hover:text-accent"
                  )}
                  title="Painel Admin"
                >
                  <LayoutDashboard className="h-[18px] w-[18px]" />
                </button>
              )}

              <button
                onClick={onOpenLogin}
                className={cn(
                  "p-2 transition-colors",
                  scrolled ? "text-primary/40 hover:text-primary" : "text-white/80 hover:text-white"
                )}
              >
                <User className="h-[18px] w-[18px]" />
              </button>

              <button
                onClick={onOpenCart}
                className={cn(
                  "relative p-2 transition-colors",
                  scrolled ? "text-primary/40 hover:text-primary" : "text-white/80 hover:text-white"
                )}
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-white text-[8px] font-bold flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={onOpenFavorites}
                className={cn(
                  "relative p-2 transition-colors",
                  scrolled ? "text-primary/40 hover:text-accent" : "text-accent hover:text-white"
                )}
              >
                <Heart className="h-[18px] w-[18px]" />
                {favoritesCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-accent text-white text-[8px] font-bold flex items-center justify-center shadow-sm">
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
              </div>
            </nav>
            <div className="p-6 border-t border-gray-100 bg-secondary/10">
              <p className="text-[9px] text-primary/30 uppercase tracking-[0.4em] text-center italic">Essência Toda Bela</p>
            </div>
          </div>
        </div>
      )}

      {/* Spacer removido para o header sobrepor o banner */}
      <div className="h-0" />
    </>
  );
}
