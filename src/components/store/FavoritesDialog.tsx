
"use client";

import React from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Trash2, 
  Loader2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FavoritesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FavoritesDialog({ open, onOpenChange }: FavoritesDialogProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const favoritesQuery = useMemoFirebase(() => {
    if (!db || !user?.uid || !open) return null;
    return query(collection(db, 'users', user.uid, 'favorites'));
  }, [db, user?.uid, open]);

  const { data: favorites, isLoading } = useCollection(favoritesQuery);

  const handleRemove = (productId: string) => {
    if (!user?.uid) return;
    const favRef = doc(db, 'users', user.uid, 'favorites', productId);
    deleteDocumentNonBlocking(favRef);
    toast({ title: "Removido dos favoritos" });
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-0 border-none shadow-2xl bg-[#FFF9F7]">
        <div className="bg-primary p-10 text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <Heart className="h-40 w-40 fill-current" />
          </div>
          <DialogHeader className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent mb-2">Curadoria Pessoal</p>
            <DialogTitle className="text-4xl font-headline font-bold">
              Minha <span className="italic font-light text-accent">Wishlist</span>
            </DialogTitle>
            <DialogDescription className="text-white/60 font-light italic text-lg mt-2">
              As peças que conquistaram seu coração.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 md:p-10">
          {!user ? (
            <div className="py-20 text-center space-y-6 bg-white rounded-[2.5rem] border-2 border-dashed border-primary/5">
              <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mx-auto">
                <Heart className="h-10 w-10 text-primary/20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-headline font-bold text-primary">Acesso Necessário</h3>
                <p className="text-muted-foreground italic max-w-xs mx-auto text-sm">Realize o login para salvar e visualizar suas peças favoritas em qualquer dispositivo.</p>
              </div>
              <Button className="rounded-full bg-primary text-white font-bold uppercase tracking-widest text-[10px] h-12 px-10">Fazer Login</Button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-accent" />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40">Sincronizando Desejos...</p>
            </div>
          ) : favorites && favorites.length > 0 ? (
            <div className="space-y-6">
              {favorites.map((item: any) => (
                <div key={item.id} className="group flex gap-6 items-center p-4 rounded-[2.5rem] bg-white shadow-sm border border-primary/5 hover:shadow-editorial transition-all duration-500">
                  <div className="h-28 w-24 rounded-2xl overflow-hidden shadow-sm shrink-0 border border-primary/5 relative">
                    {/* Tentativa de pegar a imagem do favorito ou placeholder */}
                    <img 
                      src={item.productImage || 'https://picsum.photos/seed/placeholder/300/400'} 
                      className="h-full w-full object-cover" 
                      alt={item.productName} 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-bold uppercase tracking-widest text-accent">Essencial</span>
                    </div>
                    <h5 className="text-lg font-bold text-primary leading-tight line-clamp-1">{item.productName}</h5>
                    <p className="text-sm font-light text-primary/60 italic">Adicionado em {new Date(item.addedAt?.toDate ? item.addedAt.toDate() : item.addedAt).toLocaleDateString('pt-BR')}</p>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <Link href={`/products/${item.productId}`}>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-12 w-12 rounded-full text-primary hover:bg-secondary transition-colors"
                        onClick={() => onOpenChange(false)}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </Link>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-10 w-10 rounded-full text-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-colors"
                      onClick={() => handleRemove(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="pt-8 text-center border-t border-primary/5">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/30 mb-4 flex items-center justify-center gap-2">
                  <Sparkles className="h-3 w-3" /> Escolhas com Propósito
                </p>
                <Button 
                  onClick={() => onOpenChange(false)}
                  className="rounded-full border-primary text-primary hover:bg-primary hover:text-white h-14 px-12 uppercase text-[10px] font-bold tracking-widest"
                  variant="outline"
                >
                  Continuar Explorando
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center space-y-8 bg-white rounded-[3rem] border-2 border-dashed border-primary/5">
              <div className="h-24 w-24 bg-secondary/50 rounded-full flex items-center justify-center mx-auto">
                <Heart className="h-10 w-10 text-accent/30" />
              </div>
              <div className="space-y-4">
                 <h3 className="text-3xl font-headline font-bold text-primary">Sua Wishlist está vazia</h3>
                 <p className="text-muted-foreground italic font-light max-w-xs mx-auto">Navegue pela boutique e salve as peças que refletem sua essência.</p>
              </div>
              <Button 
                onClick={() => onOpenChange(false)}
                className="rounded-full px-12 h-16 bg-primary text-white font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-transform shadow-xl"
              >
                Descobrir Looks
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
