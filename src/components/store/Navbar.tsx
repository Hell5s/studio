
"use client";

import React, { useState } from 'react';
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
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-primary/5 shadow-sm">
      <nav className="w-full px-4 md:px-6 h-16 md:h-28 flex items-center justify-between">
        
        {/* Lado Esquerdo: Logo */}
        <div className="flex items-center">
          <Link href="/" className="inline-block max-w-[130px] md:max-w-none overflow-hidden">
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
                  "text-[10px] font-bold tracking-[0.3em] transition-all hover:opacity-70",
                  link.highlight ? "text-accent" : "text-primary/70"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full max-sm group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-accent/40 group-focus-within:text-primary transition-colors" />
            <input 
              placeholder="PROCURAR..." 
              className="w-full h-12 bg-secondary/20 rounded-full pl-14 pr-6 text-[10px] font-bold tracking-[0.2em] outline-none border border-transparent focus:border-accent/10 transition-all uppercase"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </form>
        </div>

        {/* Lado Direito: Ações / Ícones */}
        <div className="flex items-center gap-1 md:gap-3 shrink-0">
          <Link 
            href="/meus-pedidos" 
            className="p-2 text-primary/60 hover:text-primary transition-all flex items-center gap-2"
            title="Meus Pedidos"
          >
            <Package className="h-5 w-5 md:h-6 md:w-6" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden md:inline">
              Pedidos
            </span>
          </Link>

          {isAdmin && (
            <button 
              onClick={handleAdminClick}
              className="p-2 text-primary/60 hover:text-accent transition-all"
              title="Painel Administrativo"
            >
              <LayoutDashboard className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          )}

          <button 
            onClick={onOpenLogin} 
            className="p-2 text-primary/60 hover:text-primary transition-all"
            title="Conta"
          >
            <User className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          <button 
            onClick={onOpenCart} 
            className="relative p-2 text-primary/60 hover:text-primary transition-all"
            title="Carrinho"
          >
            <ShoppingBag className="h-5 w-5 md:h-6 md:w-6" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-white text-[8px] font-black">
                {cartCount}
              </span>
            )}
          </button>

          <button 
            className="relative p-2 text-accent hover:text-primary transition-all"
            title="Favoritos"
            onClick={onOpenFavorites}
          >
            <Heart className="h-5 w-5 md:h-6 md:w-6" />
            {favoritesCount > 0 && (
              <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-white text-[8px] font-black">
                {favoritesCount}
              </span>
            )}
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
        <div className="lg:hidden bg-white border-t border-primary/5 px-6 py-6 space-y-4 shadow-lg">
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
