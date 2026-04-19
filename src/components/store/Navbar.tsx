
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
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
  const { user } = useUser();
  const db = useFirestore();

  // Verificação de Admin para lógica interna se necessário
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
  };

  const navLinks = [
    { label: 'COLEÇÕES', href: '/#colecoes' },
    { label: 'PRODUTOS', href: '/#vitrine' },
    { label: 'MAIS VENDIDOS', href: '/#mais-vendidos' },
    { label: 'ECONOMIZE', href: '/economize', highlight: true },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
      <nav className="bg-white border-b border-primary/5 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 h-24 flex items-center justify-between gap-4">
          
          {/* Lado Esquerdo: Logo e Nav Links */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex-shrink-0 scale-75 md:scale-90 transform origin-left">
              <LogoMark />
            </Link>

            <div className="hidden xl:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.label} 
                  href={link.href}
                  className={cn(
                    "text-[10px] font-bold tracking-[0.2em] transition-all hover:opacity-70",
                    link.highlight ? "text-accent border-b-2 border-accent/20 pb-0.5" : "text-primary/70"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Centro-Direito: Busca */}
          <div className="flex-1 flex justify-center max-w-sm ml-auto hidden lg:flex">
            <form onSubmit={handleSearchSubmit} className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-accent/40 group-focus-within:text-primary transition-colors" />
              <input 
                placeholder="Procurar no site..." 
                className="w-full h-11 bg-secondary/20 rounded-full pl-11 pr-4 text-[10px] font-bold tracking-widest outline-none border border-transparent focus:border-accent/10 transition-all uppercase"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </form>
          </div>

          {/* Lado Direito: Ações */}
          <div className="flex items-center gap-3 md:gap-6">
            <Link 
              href="/meus-pedidos" 
              className="hidden sm:flex items-center gap-2.5 group transition-all"
            >
              <Package className="h-4.5 w-4.5 text-primary/60 group-hover:text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 group-hover:text-primary">
                Meus Pedidos
              </span>
            </Link>
            
            <div className="h-4 w-px bg-primary/10 hidden sm:block" />

            {isAdmin && (
              <button 
                onClick={onOpenAdmin}
                className="p-2 text-primary/60 hover:text-accent transition-all"
                title="Painel Administrativo"
              >
                <LayoutDashboard className="h-5 w-5 stroke-[1.5]" />
              </button>
            )}

            <button 
              onClick={onOpenLogin} 
              className="p-2 text-primary/60 hover:text-primary transition-all"
              title="Minha Conta"
            >
              <User className="h-5 w-5 stroke-[1.5]" />
            </button>

            <button 
              onClick={onOpenCart} 
              className="relative p-2 text-primary/60 hover:text-primary transition-all"
              title="Carrinho"
            >
              <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white text-[8px] font-black">
                  {cartCount}
                </span>
              )}
            </button>

            <button 
              className="relative p-2 text-accent hover:text-primary transition-all"
              title="Favoritos"
              onClick={onOpenFavorites}
            >
              <Heart className="h-5 w-5 stroke-[1.5]" />
              {favoritesCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white text-[8px] font-black animate-in zoom-in duration-300">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button className="lg:hidden text-primary p-2">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
