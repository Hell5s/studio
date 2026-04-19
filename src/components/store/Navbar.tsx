"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Search, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenCart: () => void;
  onOpenFavorites: () => void;
  cartCount: number;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onSearch?: (query: string) => void;
}

export function Navbar({ 
  onOpenLogin, 
  onOpenCart, 
  onOpenFavorites,
  cartCount, 
  onSearch 
}: NavbarProps) {
  const [searchValue, setSearchValue] = useState("");
  const { user } = useUser();
  const db = useFirestore();

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 py-3">
      <div className="container mx-auto px-4 flex items-center justify-between gap-4">
        
        {/* Search Bar - Matches Reference */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-sm flex items-center bg-[#F4F4F4] rounded-sm overflow-hidden">
          <input 
            placeholder="Procurar no site..." 
            className="bg-transparent text-[13px] px-4 py-2.5 outline-none w-full"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <button type="submit" className="px-4 py-2.5 hover:bg-gray-200 transition-colors">
            <Search className="h-4 w-4 text-black" />
          </button>
        </form>

        {/* Logo Placeholder / Brand Name (Optional in this layout) */}
        <Link href="/" className="hidden lg:block">
           <span className="font-headline font-bold text-xl tracking-tighter uppercase">Toda Bela</span>
        </Link>

        {/* Actions - Matches Reference */}
        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={onOpenLogin} className="text-black hover:opacity-70 transition-opacity">
            <User className="h-6 w-6 stroke-[1.5]" />
          </button>

          <button onClick={onOpenFavorites} className="relative text-black hover:opacity-70 transition-opacity">
            <Heart className="h-6 w-6 stroke-[1.5]" />
            <span className="absolute -bottom-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-white border border-gray-200 text-[10px] font-bold">
              {favoritesCount}
            </span>
          </button>

          <button onClick={onOpenCart} className="relative text-black hover:opacity-70 transition-opacity">
            <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
            <span className="absolute -bottom-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
