
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useFirestore, useUser, useDoc, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  id: string | number;
  name: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  image: string;
  category?: string;
  onAddToCart?: () => void;
}

export function ProductCard({
  id,
  name,
  price,
  oldPrice,
  badge,
  image,
  onAddToCart,
}: ProductCardProps) {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  // Garante que o ID seja string para o Firestore
  const stringId = String(id);

  // Referência estável para o documento de favorito
  const favoriteRef = React.useMemo(() => {
    if (!db || !user?.uid || !stringId) return null;
    return doc(db, 'users', user.uid, 'favorites', stringId);
  }, [db, user?.uid, stringId]);

  const { data: favoriteData, isLoading: isFavLoading } = useDoc(favoriteRef);
  const isFavorited = !!favoriteData;

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Acesso necessário",
        description: "Faça login ou acesse como visitante no menu para salvar suas peças favoritas.",
        variant: "destructive"
      });
      return;
    }

    if (!favoriteRef) return;

    if (isFavorited) {
      deleteDocumentNonBlocking(favoriteRef);
      toast({
        title: "Removido",
        description: "Peça removida da sua lista de desejos.",
      });
    } else {
      setDocumentNonBlocking(favoriteRef, {
        productId: stringId,
        productName: name,
        addedAt: serverTimestamp()
      }, { merge: true });
      toast({
        title: "Favoritado",
        description: "Peça salva em seus favoritos!",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <article className="group flex flex-col h-full bg-white transition-all duration-700">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F3EFF0]">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
          data-ai-hint="fashion clothes"
        />
        
        {badge && (
          <Badge className="absolute top-4 left-4 bg-[#6E3C47] text-white border-none px-4 py-1.5 font-bold uppercase text-[8px] rounded-full tracking-widest z-10 shadow-lg">
            {badge}
          </Badge>
        )}
        
        <button 
          onClick={toggleFavorite}
          disabled={isFavLoading}
          className={cn(
            "absolute right-4 top-4 h-11 w-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all z-10 shadow-sm",
            isFavorited 
              ? "bg-[#6E3C47] text-white" 
              : "bg-white/95 text-[#6E3C47] hover:bg-[#6E3C47] hover:text-white"
          )}
        >
          <Heart className={cn("h-4.5 w-4.5 transition-transform duration-300", isFavorited && "fill-current scale-110")} />
        </button>

        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 hidden md:flex items-center justify-center z-10">
          <Link href={`/products/${stringId}`}>
            <Button className="rounded-full bg-white text-[#6E3C47] font-bold uppercase text-[9px] tracking-[0.4em] px-8 py-6 shadow-2xl hover:bg-[#6E3C47] hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-700">
              Ver Detalhes
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-1 pb-4 pt-6 text-center flex flex-col flex-1">
        <Link href={`/products/${stringId}`} className="block group-hover:text-primary transition-colors mb-2">
          <h3 className="line-clamp-2 text-[15px] uppercase leading-tight tracking-tight text-[#3A3133] font-medium min-h-[2.5rem]">
            {name}
          </h3>
        </Link>
        
        <div className="mt-auto space-y-2">
          <div className="space-y-1">
            <p className="text-[22px] md:text-[28px] font-light text-[#2A1F22] leading-none">
              {formatCurrency(price)}
            </p>
            {oldPrice && (
              <p className="text-[12px] text-[#6D575D]/40 line-through font-light italic">
                {formatCurrency(oldPrice)}
              </p>
            )}
            <p className="text-[13px] md:text-[14px] text-[#6D575D] font-medium italic">
              ou 10x de {formatCurrency(price / 10)}
            </p>
          </div>

          <button
            onClick={onAddToCart}
            className="mt-6 w-full rounded-full border border-[#E7C5CC] bg-transparent px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#6E3C47] transition-all hover:bg-[#F7E8EA] hover:border-[#6E3C47] active:scale-95"
          >
            Adicionar
          </button>
        </div>
      </div>
    </article>
  );
}
