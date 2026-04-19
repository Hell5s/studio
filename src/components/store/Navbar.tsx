
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Search, Heart, Menu } from 'lucide-react';
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
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
      {/* Barra de Promoção VIP */}
      <div className="bg-primary text-[8px] md:text-[9px] font-bold uppercase tracking-[0.3em] text-white py-2 text-center border-b border-white/5">
        Frete VIP Grátis em compras acima de R$ 299 • 10x sem juros no cartão
      </div>

      <nav className="bg-white/90 backdrop-blur-xl border-b border-primary/5 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 h-24 flex items-center justify-between">
          
          {/* Lado Esquerdo: Busca e Menu */}
          <div className="flex-1 flex items-center gap-4">
            <button className="lg:hidden text-primary p-2 hover:bg-secondary/50 rounded-full transition-colors">
              <Menu className="h-5 w-5" />
            </button>
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex relative items-center group max-w-[260px]">
              <Search className="absolute left-4 h-4 w-4 text-accent/40 group-focus-within:text-primary transition-colors" />
              <input 
                placeholder="BUSCAR INSPIRAÇÃO..." 
                className="w-full h-11 bg-secondary/30 rounded-full pl-11 pr-4 text-[10px] font-bold tracking-widest outline-none border border-transparent focus:border-accent/20 transition-all uppercase"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </form>
          </div>

          {/* Centro: Identidade Visual de Luxo */}
          <Link href="/" className="flex-shrink-0 scale-90 md:scale-100 hover:opacity-90 transition-opacity">
            <LogoMark />
          </Link>

          {/* Lado Direito: Ações da Cliente */}
          <div className="flex-1 flex items-center justify-end gap-2 md:gap-5">
            {isAdmin && (
               <Link 
                href="/admin/products" 
                className="hidden xl:block text-[9px] font-black uppercase tracking-[0.2em] text-accent hover:text-primary transition-colors border-r border-primary/5 pr-5 mr-1"
               >
                 Dashboard
               </Link>
            )}
            
            <button 
              onClick={onOpenLogin} 
              className="p-2 text-primary/60 hover:text-primary hover:bg-secondary/50 rounded-full transition-all"
              title="Minha Conta"
            >
              <User className="h-5 w-5 stroke-[1.5]" />
            </button>

            <button 
              onClick={onOpenFavorites} 
              className="relative p-2 text-primary/60 hover:text-primary hover:bg-secondary/50 rounded-full transition-all"
              title="Favoritos"
            >
              <Heart className="h-5 w-5 stroke-[1.5]" />
              {favoritesCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white text-[8px] font-black border-2 border-white">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button 
              onClick={onOpenCart} 
              className="flex items-center gap-3 pl-5 pr-1.5 h-14 rounded-full hover:bg-secondary/60 transition-all group relative"
              title="Carrinho"
            >
              <div className="flex flex-col items-end hidden lg:flex">
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary">Carrinho</span>
                <span className="text-[8px] font-bold text-accent italic leading-none">Ver detalhes</span>
              </div>
              <div className="relative h-11 w-11 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/20 group-hover:scale-105 group-hover:bg-black transition-all duration-500">
                <ShoppingBag className="h-4.5 w-4.5 text-white" />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-primary text-[10px] font-black border-2 border-white animate-in zoom-in duration-300">
                  {cartCount}
                </span>
              </div>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
