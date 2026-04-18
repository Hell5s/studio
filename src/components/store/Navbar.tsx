
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Search, Menu, X, Heart, ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LogoMark } from './LogoMark';
import { useCollection, useFirestore, useUser, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from '@/components/ui/separator';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenTrack: () => void;
  onOpenCart: () => void;
  cartCount: number;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onSearch?: (query: string) => void;
}

export function Navbar({ onOpenLogin, onOpenTrack, onOpenCart, cartCount, isAdmin, onOpenAdmin, onSearch }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const db = useFirestore();
  const { user } = useUser();

  const favoritesQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'favorites'));
  }, [db, user?.uid]);

  const { data: favorites } = useCollection(favoritesQuery);
  const favoritesCount = favorites?.length || 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchValue);
    setMobileMenuOpen(false);
  };

  const removeFavorite = (productId: string) => {
    if (!user?.uid || !db) return;
    deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'favorites', productId));
  };

  const links = [
    { name: 'Novidades', href: '#vitrine' },
    { name: 'Mais vendidos', href: '#mais-vendidos' },
    { name: 'Coleções', href: '#colecoes' },
    { name: 'Rastrear Pedido', onClick: onOpenTrack },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full">
      {/* Top Banner - Luxurious & Minimalist */}
      <div className="bg-primary/95 px-4 py-2 text-center text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-white/90 border-b border-white/5">
        Curadoria exclusiva para sua melhor versão
      </div>

      <header 
        className={cn(
          "transition-all duration-1000 w-full",
          scrolled 
            ? "bg-white/80 backdrop-blur-2xl py-3 md:py-4 shadow-premium border-b border-primary/5" 
            : "bg-white py-6 md:py-10"
        )}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between gap-4">
          
          {/* Left Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-10 w-1/3">
            {links.map((link) => (
              link.href ? (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 hover:text-primary transition-all duration-500 relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-1/2 w-0 h-px bg-accent transition-all duration-700 group-hover:w-full group-hover:left-0" />
                </Link>
              ) : (
                <button 
                  key={link.name} 
                  onClick={link.onClick}
                  className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 hover:text-primary transition-all duration-500 relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-1/2 w-0 h-px bg-accent transition-all duration-700 group-hover:w-full group-hover:left-0" />
                </button>
              )
            ))}
          </nav>

          {/* Center Logo */}
          <div className="flex justify-start lg:justify-center flex-1 lg:w-1/3">
            <Link href="/" className="transition-transform duration-700 hover:scale-105 shrink-0 scale-90 md:scale-100">
              <LogoMark />
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center justify-end gap-1 md:gap-5 lg:w-1/3">
            {/* Search (Desktop) */}
            <form onSubmit={handleSearchSubmit} className="hidden xl:flex items-center overflow-hidden rounded-full border border-primary/5 bg-secondary/10 h-10 w-44 group focus-within:w-64 focus-within:bg-white focus-within:shadow-sm transition-all duration-700">
              <input
                placeholder="buscar produto"
                className="flex-1 bg-transparent px-5 text-[10px] font-medium outline-none text-primary placeholder:text-primary/20 placeholder:uppercase placeholder:tracking-widest"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  onSearch?.(e.target.value);
                }}
              />
              <button type="submit" className="flex h-10 w-10 items-center justify-center text-primary/30 group-focus-within:text-primary transition-colors">
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>

            <div className="flex items-center gap-0.5 md:gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "rounded-full h-10 w-10 transition-all duration-500",
                  isAdmin ? "bg-accent/10 text-accent" : "text-primary/50 hover:text-primary hover:bg-secondary/40"
                )} 
                onClick={isAdmin ? onOpenAdmin : onOpenLogin}
              >
                {isAdmin ? <ShieldCheck className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full h-10 w-10 text-primary/50 hover:text-primary hover:bg-secondary/40 transition-all duration-500">
                    <Heart className="h-4.5 w-4.5" />
                    {favoritesCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white shadow-sm animate-in zoom-in duration-500">
                        {favoritesCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md rounded-l-[3rem] border-none shadow-premium bg-[#FFF9F7] p-8 md:p-12">
                  <SheetHeader className="pb-8">
                    <SheetTitle className="text-3xl font-headline font-bold text-primary flex items-center gap-4">
                      <Heart className="h-7 w-7 text-accent fill-accent" />
                      Wishlist
                    </SheetTitle>
                  </SheetHeader>
                  <Separator className="mb-8 opacity-5 bg-primary" />
                  
                  <div className="space-y-6 overflow-y-auto max-h-[65vh] no-scrollbar pr-2">
                    {favorites && favorites.length > 0 ? (
                      favorites.map((fav) => (
                        <div key={fav.id} className="flex gap-5 group items-center">
                          <div className="h-24 w-18 rounded-2xl bg-secondary/30 overflow-hidden shrink-0 shadow-sm border border-primary/5">
                             <div className="w-full h-full flex items-center justify-center bg-accent/5">
                               <ShoppingBag className="h-6 w-6 text-accent/10" />
                             </div>
                          </div>
                          <div className="flex-1 flex flex-col justify-center gap-1.5">
                            <p className="text-[11px] font-bold text-primary uppercase tracking-widest">{fav.productName || 'Peça Toda Bela'}</p>
                            <Link href={`/products/${fav.productId}`} className="text-[9px] text-accent font-bold uppercase tracking-[0.3em] hover:text-primary transition-colors">
                              Ver Detalhes
                            </Link>
                          </div>
                          <button 
                            onClick={() => removeFavorite(fav.id)}
                            className="p-3 text-primary/10 hover:text-red-400 hover:bg-red-50 rounded-full transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-24 text-center space-y-5">
                        <Heart className="h-16 w-16 text-primary/5 mx-auto" />
                        <p className="text-sm text-muted-foreground italic font-light">
                          Sua lista de desejos está vazia.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {favoritesCount > 0 && (
                    <div className="mt-12">
                      <Button onClick={() => { onOpenCart(); }} className="w-full h-16 rounded-full bg-primary text-white font-bold uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:bg-black transition-all duration-700">
                        Visualizar Sacola
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
              
              <button 
                onClick={onOpenCart}
                className="relative flex items-center gap-3 px-5 h-11 rounded-full bg-primary text-white hover:bg-black transition-all duration-700 shadow-xl group overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                <ShoppingBag className="h-4 w-4 relative z-10" />
                <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-[0.2em] relative z-10">Sacola</span>
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white shadow-lg border-2 border-primary">
                    {cartCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden h-11 w-11 flex items-center justify-center rounded-full bg-secondary/50 text-primary transition-colors hover:bg-secondary"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Full Screen Luxury */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-right duration-700 overflow-y-auto">
            <div className="p-8 md:p-12 flex flex-col min-h-full">
              <div className="flex justify-between items-center mb-16">
                <LogoMark />
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="h-14 w-14 flex items-center justify-center rounded-full bg-secondary text-primary"
                >
                  <X className="h-7 w-7" />
                </button>
              </div>

              <div className="mb-16">
                <form onSubmit={handleSearchSubmit} className="flex items-center overflow-hidden rounded-full border border-primary/5 bg-secondary/20 h-16">
                  <input
                    placeholder="O que você procura?"
                    className="flex-1 bg-transparent px-8 text-sm outline-none text-primary placeholder:text-primary/20"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                  <button type="submit" className="flex h-16 w-16 items-center justify-center border-l border-primary/5 text-primary">
                    <Search className="h-5 w-5" />
                  </button>
                </form>
              </div>
              
              <nav className="flex flex-col gap-8">
                {links.map((link) => (
                  <button 
                    key={link.name} 
                    onClick={() => {
                      if (link.href) {
                        const el = document.querySelector(link.href);
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }
                      if (link.onClick) link.onClick();
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-4xl font-headline font-bold text-primary group flex items-center justify-between"
                  >
                    <span>{link.name}</span>
                    <div className="h-px w-0 bg-accent transition-all duration-700 group-hover:w-12" />
                  </button>
                ))}
              </nav>

              <div className="mt-auto pt-16 space-y-5">
                 <button 
                    onClick={() => { isAdmin ? onOpenAdmin?.() : onOpenLogin(); setMobileMenuOpen(false); }} 
                    className="w-full py-6 rounded-full bg-primary text-white text-[11px] font-bold uppercase tracking-[0.4em] shadow-xl"
                  >
                   {isAdmin ? "Painel Administrativo" : "Acessar Conta"}
                 </button>
                 <button 
                    onClick={() => { onOpenTrack(); setMobileMenuOpen(false); }} 
                    className="w-full py-6 rounded-full border border-primary/10 text-primary text-[11px] font-bold uppercase tracking-[0.4em]"
                  >
                    Rastrear Pedido
                  </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

