
"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useUser, useDoc, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  id: string | number;
  name: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  image: string;
  onAddToCart?: () => void;
}

export function ProductCard({
  id,
  name,
  price,
  oldPrice,
  badge,
  image,
}: ProductCardProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const stringId = String(id);

  const favoriteRef = useMemo(() => {
    if (!db || !user?.uid || !stringId) return null;
    return doc(db, 'users', user.uid, 'favorites', stringId);
  }, [db, user?.uid, stringId]);

  const { data: favoriteData } = useDoc(favoriteRef);
  const isFavorited = !!favoriteData;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Acesso necessário",
        description: "Faça login para salvar suas peças favoritas.",
        variant: "destructive"
      });
      return;
    }

    if (!favoriteRef) return;

    if (isFavorited) {
      deleteDocumentNonBlocking(favoriteRef);
      toast({ title: "Removido dos favoritos" });
    } else {
      setDocumentNonBlocking(favoriteRef, {
        productId: stringId,
        productName: name,
        productImage: image,
        addedAt: serverTimestamp()
      }, { merge: true });
      toast({ title: "Salvo nos seus favoritos!" });
    }
  };

  return (
    <article className="group flex flex-col h-full bg-white transition-all duration-700 relative overflow-hidden">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F3EFF0]">
        <Image
          src={image || 'https://picsum.photos/seed/placeholder/600/800'}
          alt={name}
          fill
          className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          data-ai-hint="fashion clothes"
        />
        
        {badge && (
          <Badge className="absolute top-2 md:top-4 left-2 md:left-4 bg-primary text-white border-none px-2 md:px-4 py-1 md:py-1.5 font-bold uppercase text-[6px] md:text-[8px] rounded-full tracking-widest z-10">
            {badge}
          </Badge>
        )}
        
        <button 
          onClick={handleToggleFavorite}
          className={cn(
            "absolute right-2 md:right-4 top-2 md:top-4 h-8 md:h-11 w-8 md:w-11 rounded-full backdrop-blur-sm flex items-center justify-center transition-all z-20 shadow-sm border border-black/5",
            isFavorited 
              ? "bg-primary text-white" 
              : "bg-white/90 text-primary hover:bg-primary hover:text-white"
          )}
        >
          <Heart className={cn("h-3.5 md:h-5 w-3.5 md:w-5", isFavorited && "fill-current")} />
        </button>

        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center z-10">
          <Link href={`/products/${id}`}>
            <Button className="rounded-full bg-white text-primary font-bold uppercase text-[8px] md:text-[9px] tracking-widest px-6 md:px-8 py-4 md:py-6 shadow-2xl hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-700 hidden md:flex">
              Ver Detalhes
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-1.5 pb-4 pt-3 md:pt-6 text-center flex flex-col flex-1">
        <h3 className="line-clamp-2 text-[9px] md:text-[13px] uppercase leading-tight tracking-tight text-primary/80 font-bold mb-1.5 h-6 md:h-auto overflow-hidden">
          {name}
        </h3>
        
        <div className="mt-auto space-y-0.5">
          <p className="text-[14px] md:text-[24px] font-bold text-primary leading-none">
            {formatCurrency(price)}
          </p>
          {oldPrice && (
            <p className="text-[8px] md:text-[11px] text-muted-foreground line-through font-light italic">
              {formatCurrency(oldPrice)}
            </p>
          )}
          <p className="text-[8px] md:text-[13px] text-accent font-medium">
            ou 10x de {formatCurrency(price / 10)}
          </p>

          <Link href={`/products/${id}`} className="block mt-2 md:mt-4">
            <button
              className="w-full rounded-full border border-primary/10 bg-transparent px-2 md:px-6 py-1.5 md:py-3 text-[7px] md:text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-secondary hover:border-primary active:scale-95"
            >
              Comprar Agora
            </button>
          </Link>
        </div>
      </div>
    </article>
  );
}
