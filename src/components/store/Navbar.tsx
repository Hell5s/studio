
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingBag, Search, Heart, Package, Menu, X, LayoutDashboard } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import { LogoMark } from './LogoMark';
import { LoginDialog } from '../auth/LoginDialog';
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
  const pathname = usePathname();

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
    { label: 'COLEÇÕES', href: '/#colecoes' },
    { label: 'PRODUTOS', href: '/#vitrine' },
    { label: 'MAIS VENDIDOS', href: '/#mais-vendidos' },
    { label: 'SALE', href: '/economize', highlight: true },
  ];

  // Lógica de transparência dinâmica — SOMENTE NA HOME (/)
  const isHomePage = pathname === '/';
  const isTransparent = isHomePage && !scrolled;

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isTransparent
          ? "bg-transparent border-transparent"
          : "bg-white shadow-[0_1px_20px_rgba(0,0,0,0.06)] border-b border-black/[0.08]"
      )}>

        {/* Barra superior — frete grátis (Aparece apenas na home sem scroll) */}
        <div className={cn(
          "w-full bg-primary text-white flex items-center justify-center transition-all duration-500 overflow-hidden",
          (!isHomePage || scrolled) ? "h-0 opacity-0" : "h-8 opacity-100"
        )}>
          <p className="text-[7px] md:text-[10px] font-medium tracking-[0.2em] md:tracking-[0.5em] uppercase px-4 text-center whitespace-nowrap">
            Frete Grátis • Sul e Sudeste acima de R$ 249
          </p>
        </div>

        {/* Navbar principal */}
        <div className="w-full">
          <nav className="max-w-[1400px] mx-auto px-4 md:px-12 h-16 md:h-[72px] flex items-center justify-between relative">

            {/* Hamburger mobile */}
            <div className="flex-1 lg:hidden">
              <button
                className={cn("p-2 -ml-2 transition-colors focus:outline-none", isTransparent ? "text-white" : "text-primary/60")}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Abrir Menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Links Desktop */}
            <div className="hidden lg:flex items-center gap-10 flex-1">
              {navLinks.map((link: any) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "text-[11px] font-semibold tracking-[0.15em] transition-all duration-200 relative group pb-0.5",
                    isTransparent
                      ? link.highlight ? "text-accent" : "text-white hover:text-white/70"
                      : link.highlight ? "text-accent" : "text-primary/70 hover:text-primary"
                  )}
                >
                  {link.label}
                  <span className={cn(
                    "absolute bottom-0 left-0 h-px transition-all duration-300 group-hover:w-full w-0",
                    link.highlight ? "bg-accent" : (isTransparent ? "bg-white" : "bg-primary")
                  )} />
                </Link>
              ))}
            </div>

            {/* Logo Central */}
            <div className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
              <Link href="/">
                <div className={cn(
                  "transition-all duration-500 scale-90 md:scale-100",
                  isTransparent 
                    ? "brightness-0 invert [&_#logo-ball]:opacity-0 [&_#logo-ball]:pointer-events-none [&_#logo-ball]:w-0 [&_#logo-ball]:overflow-hidden" 
                    : "[&_#logo-ball]:opacity-100 [&_#logo-ball]:w-auto"
                )}>
                  <LogoMark />
                </div>
              </Link>
            </div>

            {/* Ícones Direita */}
            <div className="flex items-center gap-0.5 flex-1 justify-end">

              {/* Busca */}
              <div className="hidden lg:flex items-center">
                {isSearchOpen ? (
                  <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300 mr-2">
                    <input
                      autoFocus
                      placeholder="Buscar na loja..."
                      className={cn(
                        "w-48 h-8 border-b text-[11px] tracking-wider outline-none px-1 transition-all",
                        isTransparent 
                          ? "border-white/20 focus:border-white text-white placeholder:text-white/50 bg-transparent"
                          : "border-primary/20 focus:border-primary text-primary" 
                      )}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className={cn(
                      "p-2.5 transition-colors",
                      isTransparent ? "text-white" : "text-primary/50 hover:text-primary"
                    )}
                  >
                    <Search className="h-[18px] w-[18px]" />
                  </button>
                )}
              </div>

              {/* Pedidos */}
              <Link
                href="/meus-pedidos"
                className={cn(
                  "p-2.5 transition-colors group flex items-center gap-0.5 hidden xs:flex",
                  isTransparent ? "text-white" : "text-primary/50 hover:text-primary"
                )}
              >
                <Package className="h-[18px] w-[18px]" />
                <span className="text-[8px] font-bold uppercase tracking-widest hidden xl:block">Pedidos</span>
              </Link>

              {/* Menu de Conta (Popover) */}
              <LoginDialog 
                open={false} 
                onOpenChange={() => {}} 
                isTransparent={isTransparent}
                isAdmin={isAdmin}
                onOpenAdmin={handleAdminClick}
                onOpenFavorites={onOpenFavorites}
              />

              {/* Sacola */}
              <button
                onClick={onOpenCart}
                className={cn(
                  "relative p-2.5 transition-colors flex items-center gap-0.5",
                  isTransparent ? "text-white" : "text-primary/50 hover:text-primary"
                )}
              >
                <div className="relative">
                  <ShoppingBag className="h-[18px] w-[18px]" />
                  {cartCount > 0 && (
                    <span className={cn(
                      "absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full text-white text-[7px] font-bold flex items-center justify-center",
                      isTransparent ? "bg-accent" : "bg-primary"
                    )}>
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest hidden xl:block">Bolsa</span>
              </button>

              {/* Favoritos */}
              <button
                onClick={onOpenFavorites}
                className={cn(
                  "relative p-2.5 transition-colors flex items-center gap-0.5 hidden xs:flex",
                  isTransparent ? "text-white hover:text-accent" : "text-primary/50 hover:text-accent"
                )}
              >
                <div className="relative">
                  <Heart className="h-[18px] w-[18px]" />
                  {favoritesCount > 0 && (
                    <span className={cn(
                      "absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full text-white text-[7px] font-bold flex items-center justify-center",
                      isTransparent ? "bg-primary" : "bg-accent"
                    )}>
                      {favoritesCount}
                    </span>
                  )}
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest hidden xl:block">Desejos</span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Menu mobile drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute top-0 left-0 h-full w-[80vw] max-w-[320px] bg-white shadow-2xl animate-in slide-in-from-left duration-500 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <LogoMark />
              <button onClick={() => setIsMenuOpen(false)} className="p-2 focus:outline-none" aria-label="Fechar Menu">
                <X className="h-6 w-6 text-primary/40" />
              </button>
            </div>
            <nav className="flex-1 px-8 py-10 space-y-1 overflow-y-auto">
              {navLinks.map((link: any) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center py-5 border-b border-gray-50 text-[13px] font-bold uppercase tracking-[0.2em] transition-colors hover:text-accent",
                    link.highlight ? "text-accent" : "text-primary/70"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/meus-pedidos"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 py-5 border-b border-gray-50 text-[13px] font-bold uppercase tracking-[0.2em] text-primary/70 hover:text-accent transition-colors"
              >
                <Package className="h-4 w-4" /> Meus Pedidos
              </Link>
            </nav>
            <div className="p-8 border-t border-gray-100 bg-secondary/10">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/30" />
                <input
                  placeholder="Buscar na loja..."
                  className="w-full h-12 bg-white rounded-full pl-11 pr-4 text-[11px] tracking-widest outline-none border border-primary/5 focus:border-accent/40 transition-all placeholder:italic placeholder:font-light"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
