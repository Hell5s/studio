
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, User, Search, Heart, Package, Menu, LayoutDashboard } from 'lucide-react';
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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Configurações Globais para Links Dinâmicos
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
        ? "bg-white/95 backdrop-blur-md border-b border-primary/5 shadow-sm py-0" 
        : "bg-white/0 border-b border-transparent py-2"
    )}>
      {/* Barra Superior Slim (Desktop) */}
      <div className={cn(
        "hidden md:flex items-center justify-center py-2 text-[9px] font-bold uppercase tracking-[0.4em] transition-all duration-500",
        scrolled ? "h-0 overflow-hidden opacity-0" : "h-8 bg-primary text-white opacity-100"
      )}>
        <span>Frete Grátis acima de R$ 249 • Sul e Sudeste</span>
      </div>

      <nav className={cn(
        "w-full px-4 md:px-6 h-16 md:h-20 flex items-center justify-between transition-all duration-500"
      )}>
        
        {/* Lado Esquerdo: Logo */}
        <div className="flex items-center">
          <Link href="/" className="inline-block max-w-[140px] md:max-w-[200px] overflow-hidden transition-all duration-500">
            <LogoMark />
          </Link>
        </div>

        {/* Centro: Links e Busca (Apenas Desktop) */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-10 mx-6">
          <div className="hidden xl:flex items-center gap-8">
            {navLinks.map((link: any) => (
              <Link 
                key={link.label} 
                href={link.href}
                className={cn(
                  "text-[9px] font-black tracking-[0.4em] transition-all duration-300 relative group",
                  scrolled ? "text-primary/70 hover:text-primary" : "text-primary/70 hover:text-primary",
                  link.highlight ? "text-accent" : ""
                )}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-500" />
              </Link>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[240px] group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-accent/40 group-focus-within:text-primary transition-colors" />
            <input 
              placeholder="PROCURAR..." 
              className={cn(
                "w-full h-10 bg-secondary/20 rounded-full pl-14 pr-6 text-[9px] font-bold tracking-[0.2em] outline-none border border-transparent focus:border-accent/10 transition-all uppercase",
                scrolled ? "bg-secondary/40" : "bg-white/40"
              )}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </form>
        </div>

        {/* Lado Direito: Ações / Ícones */}
        <div className="flex items-center gap-1 md:gap-3 shrink-0">
          <Link 
            href="/meus-pedidos" 
            className="p-2 text-primary/60 hover:text-primary transition-all"
            title="Meus Pedidos"
          >
            <div className="flex flex-col items-center gap-0.5">
              <Package className="h-5 w-5" />
              <span className="text-[8px] font-bold uppercase tracking-widest hidden md:block">Pedidos</span>
            </div>
          </Link>

          {isAdmin && (
            <button 
              onClick={handleAdminClick}
              className="p-2 text-primary/60 hover:text-accent transition-all"
              title="Painel Administrativo"
            >
              <div className="flex flex-col items-center gap-0.5">
                <LayoutDashboard className="h-5 w-5" />
                <span className="text-[8px] font-bold uppercase tracking-widest hidden md:block">Admin</span>
              </div>
            </button>
          )}

          <button 
            onClick={onOpenLogin} 
            className="p-2 text-primary/60 hover:text-primary transition-all"
            title="Conta"
          >
            <div className="flex flex-col items-center gap-0.5">
              <User className="h-5 w-5" />
              <span className="text-[8px] font-bold uppercase tracking-widest hidden md:block">Conta</span>
            </div>
          </button>

          <button 
            onClick={onOpenCart} 
            className="relative p-2 text-primary/60 hover:text-primary transition-all"
            title="Carrinho"
          >
            <div className="flex flex-col items-center gap-0.5">
              <div className="relative">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-accent text-white text-[7px] font-black">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest hidden md:block">Bolsa</span>
            </div>
          </button>

          <button 
            className="relative p-2 text-accent hover:text-primary transition-all"
            title="Favoritos"
            onClick={onOpenFavorites}
          >
            <div className="flex flex-col items-center gap-0.5">
              <div className="relative">
                <Heart className="h-5 w-5" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-white text-[7px] font-black">
                    {favoritesCount}
                  </span>
                )}
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest hidden md:block">Desejos</span>
            </div>
          </button>

          <button 
            className="lg:hidden p-2 text-primary ml-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-primary/5 px-6 py-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-300">
          {navLinks.map((link: any) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "block text-[11px] font-bold tracking-[0.3em] py-3 border-b border-primary/5 transition-all hover:text-accent",
                link.highlight ? "text-accent" : "text-primary/70"
              )}
            >
              {link.label}
            </Link>
          ))}
          <form onSubmit={handleSearchSubmit} className="relative mt-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent/40" />
            <input
              placeholder="PROCURAR..."
              className="w-full h-12 bg-secondary/20 rounded-full pl-12 pr-6 text-[10px] font-bold tracking-widest outline-none uppercase"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </form>
        </div>
      )}
    </header>
  );
}
