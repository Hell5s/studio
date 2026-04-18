
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Search, Menu, X, Heart, ShieldCheck, Trash2, LogOut, Settings, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LogoMark } from './LogoMark';
import { useCollection, useFirestore, useUser, useMemoFirebase, deleteDocumentNonBlocking, useAuth } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from '@/components/ui/separator';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenTrack: () => void;
  onOpenOrders: () => void;
  onOpenCart: () => void;
  cartCount: number;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onSearch?: (query: string) => void;
}

export function Navbar({ onOpenLogin, onOpenTrack, onOpenOrders, onOpenCart, cartCount, isAdmin, onOpenAdmin, onSearch }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const db = useFirestore();
  const auth = useAuth();
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

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  const links = [
    { name: 'COLEÇÕES', href: '#colecoes' },
    { name: 'NOVIDADES', href: '#vitrine' },
    { name: 'MAIS VENDIDOS', href: '#mais-vendidos' },
    { name: 'PRODUTOS', href: '#vitrine' },
    { name: 'RASTREAR', onClick: onOpenTrack },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full">
      <header 
        className={cn(
          "transition-all duration-500 w-full border-b border-primary/5",
          scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"
        )}
      >
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
          
          {/* Logo - Left Side */}
          <div className="flex-shrink-0">
            <Link href="/" className="transition-transform duration-500 hover:opacity-80">
              <LogoMark className="scale-75 md:scale-90 origin-left" />
            </Link>
          </div>

          {/* Nav Links - Center (Desktop) */}
          <nav className="hidden lg:flex items-center justify-center gap-6 xl:gap-10">
            {links.map((link) => (
              link.href ? (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="relative text-[11px] font-bold tracking-wider text-primary group py-2"
                >
                  <span>{link.name}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full" />
                </Link>
              ) : (
                <button 
                  key={link.name} 
                  onClick={link.onClick}
                  className="relative text-[11px] font-bold tracking-wider text-primary group py-2"
                >
                  <span>{link.name}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full" />
                </button>
              )
            ))}
          </nav>

          {/* Search and Actions - Right Side */}
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            {/* Search Bar */}
            <form 
              onSubmit={handleSearchSubmit} 
              className="hidden md:flex items-center bg-[#F5F5F5] rounded-md h-9 w-40 lg:w-56 overflow-hidden border border-transparent focus-within:border-accent/30 focus-within:bg-white transition-all"
            >
              <input
                placeholder="Procurar no site..."
                className="flex-1 bg-transparent px-3 text-[11px] outline-none text-primary placeholder:text-gray-400"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  onSearch?.(e.target.value);
                }}
              />
              <button type="submit" className="px-3 text-gray-500 hover:text-primary transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </form>

            <div className="flex items-center gap-1 md:gap-2">
              {/* User Account / Login */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full h-9 w-9 text-primary hover:bg-gray-100 relative"
                    >
                      <User className="h-5 w-5" />
                      {isAdmin && <span className="absolute -top-1 -right-1 bg-accent h-2 w-2 rounded-full animate-pulse" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-primary/5">
                    <DropdownMenuLabel className="px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bem-vinda</p>
                      <p className="text-xs font-semibold text-primary truncate">{user.email || 'Usuária'}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-primary/5" />
                    
                    {isAdmin && (
                      <DropdownMenuItem 
                        onClick={onOpenAdmin}
                        className="rounded-xl px-4 py-3 cursor-pointer text-primary hover:bg-primary/5"
                      >
                        <ShieldCheck className="mr-3 h-4 w-4 text-accent" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Painel Administrativo</span>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem className="rounded-xl px-4 py-3 cursor-pointer text-primary hover:bg-primary/5">
                      <User className="mr-3 h-4 w-4 text-muted-foreground" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Minha Conta</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={onOpenOrders}
                      className="rounded-xl px-4 py-3 cursor-pointer text-primary hover:bg-primary/5"
                    >
                      <Package className="mr-3 h-4 w-4 text-muted-foreground" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Meus Pedidos</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-primary/5" />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="rounded-xl px-4 py-3 cursor-pointer text-red-500 hover:bg-red-50 focus:bg-red-50 focus:text-red-500"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Sair da Conta</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-9 w-9 text-primary hover:bg-gray-100"
                  onClick={onOpenLogin}
                >
                  <User className="h-5 w-5" />
                </Button>
              )}
              
              {/* Wishlist */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9 text-primary hover:bg-gray-100">
                    <Heart className="h-5 w-5" />
                    {favoritesCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white border border-white">
                        {favoritesCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md bg-[#FFF9F7] p-8">
                  <SheetHeader className="pb-6">
                    <SheetTitle className="text-2xl font-headline font-bold text-primary flex items-center gap-3">
                      Minha Wishlist
                    </SheetTitle>
                  </SheetHeader>
                  <Separator className="mb-6 opacity-10 bg-primary" />
                  
                  <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2 no-scrollbar">
                    {favorites && favorites.length > 0 ? (
                      favorites.map((fav) => (
                        <div key={fav.id} className="flex gap-4 items-center group">
                          <div className="h-20 w-16 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-primary/5">
                             <div className="w-full h-full flex items-center justify-center bg-accent/5">
                               <ShoppingBag className="h-5 w-5 text-accent/20" />
                             </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-primary uppercase truncate">{fav.productName || 'Produto'}</p>
                            <Link 
                              href={`/products/${fav.productId}`} 
                              className="text-[9px] text-accent font-bold uppercase tracking-widest hover:text-primary mt-1 inline-block"
                            >
                              Ver Produto
                            </Link>
                          </div>
                          <button 
                            onClick={() => removeFavorite(fav.id)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-20 text-center opacity-40">
                        <Heart className="h-12 w-12 mx-auto mb-4" />
                        <p className="text-xs italic">Sua lista está vazia.</p>
                      </div>
                    )}
                  </div>
                  
                  {favoritesCount > 0 && (
                    <div className="mt-10">
                      <Button onClick={onOpenCart} className="w-full h-14 rounded-md bg-black text-white font-bold uppercase text-[10px] tracking-widest hover:bg-gray-900 transition-colors">
                        Ver Sacola de Compras
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
              
              {/* Shopping Bag */}
              <button 
                onClick={onOpenCart}
                className="relative flex items-center justify-center h-9 w-9 text-primary hover:bg-gray-100 rounded-full transition-colors"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden h-9 w-9 flex items-center justify-center rounded-full text-primary hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-right duration-300">
            <div className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-center mb-10">
                <LogoMark className="scale-75 origin-left" />
                <button onClick={() => setMobileMenuOpen(false)} className="h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-10">
                <form onSubmit={handleSearchSubmit} className="flex items-center bg-gray-100 rounded-md h-12 overflow-hidden">
                  <input
                    placeholder="O que você procura?"
                    className="flex-1 bg-transparent px-5 text-sm outline-none"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                  <button type="submit" className="px-5">
                    <Search className="h-5 w-5 text-gray-400" />
                  </button>
                </form>
              </div>
              
              <nav className="flex flex-col gap-6">
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
                    className="text-left text-xl font-bold text-primary border-b border-gray-50 pb-2 relative group"
                  >
                    <span>{link.name}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-auto space-y-4">
                 {user ? (
                   <div className="space-y-4">
                      {isAdmin && (
                        <button 
                          onClick={() => { onOpenAdmin?.(); setMobileMenuOpen(false); }} 
                          className="w-full py-4 rounded-md bg-accent text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <ShieldCheck className="h-4 w-4" /> GERENCIAR LOJA
                        </button>
                      )}
                      <button 
                        onClick={() => { onOpenOrders(); setMobileMenuOpen(false); }} 
                        className="w-full py-4 rounded-md border border-primary text-primary text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <Package className="h-4 w-4" /> MEUS PEDIDOS
                      </button>
                      <button 
                        onClick={handleLogout} 
                        className="w-full py-4 rounded-md border border-red-100 text-red-500 text-[10px] font-bold uppercase tracking-widest"
                      >
                        SAIR DA CONTA
                      </button>
                   </div>
                 ) : (
                   <button 
                      onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }} 
                      className="w-full py-4 rounded-md bg-black text-white text-[10px] font-bold uppercase tracking-widest"
                    >
                     ENTRAR / CADASTRAR
                   </button>
                 )}
                 <button 
                    onClick={() => { onOpenTrack(); setMobileMenuOpen(false); }} 
                    className="w-full py-4 rounded-md border border-gray-200 text-primary text-[10px] font-bold uppercase tracking-widest"
                  >
                    RASTREAR PEDIDO
                  </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
