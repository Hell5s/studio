"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Search, Heart } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenCart: () => void;
  onOpenFavorites: () => void;
  cartCount: number;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onSearch?: (query: string) => void;
}

export function Navbar({ onOpenLogin, onOpenCart, onOpenFavorites, cartCount, onSearch }: NavbarProps) {
  const [searchValue, setSearchValue] = useState("");
  const { user } = useUser();
  const db = useFirestore();

  // Verificação de Admin para exibir o link do Dashboard
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-primary/5 py-6">
      <div className="container mx-auto px-6 flex items-center justify-between">
        
        {/* Barra de Busca - Design Editorial */}
        <div className="flex-1 hidden md:block max-w-xs">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent/40 group-focus-within:text-primary transition-colors" />
            <input 
              placeholder="Buscar inspiração..." 
              className="w-full h-12 bg-secondary/20 rounded-full pl-12 pr-6 text-xs outline-none border border-transparent focus:border-accent/20 transition-all"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </form>
        </div>

        {/* Logotipo Centralizado */}
        <Link href="/" className="flex flex-col items-center">
           <h1 className="font-headline font-bold text-2xl md:text-3xl tracking-tighter text-primary leading-none">
             Toda <span className="italic font-light text-accent">Bela</span>
           </h1>
           <span className="text-[8px] uppercase tracking-[0.4em] text-accent font-black mt-1">Moda feminina</span>
        </Link>

        {/* Ações e Ícones */}
        <div className="flex-1 flex items-center justify-end gap-6 md:gap-10">
          {isAdmin && (
             <Link href="/admin/products" className="hidden lg:block text-[9px] font-bold uppercase tracking-widest text-accent hover:text-primary transition-colors">
               Dashboard
             </Link>
          )}
          
          <button onClick={onOpenLogin} className="text-primary/60 hover:text-primary transition-colors" title="Minha Conta">
            <User className="h-5 w-5" />
          </button>

          <button onClick={onOpenFavorites} className="relative text-primary/60 hover:text-primary transition-colors" title="Favoritos">
            <Heart className="h-5 w-5" />
            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white text-[9px] font-bold">
              {favoritesCount}
            </span>
          </button>

          <button onClick={onOpenCart} className="flex items-center gap-3 group" title="Ver Carrinho">
            <div className="relative">
              <ShoppingBag className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-white text-[9px] font-bold">
                {cartCount}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary hidden md:block">Carrinho</span>
          </button>
        </div>
      </div>
    </header>
  );
}
