
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
    <article className="group flex flex-col h-full bg-white transition-all duration-700 relative">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F3EFF0]">
        <Image
          src={image || 'https://picsum.photos/seed/placeholder/600/800'}
          alt={name}
          fill
          className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
          data-ai-hint="fashion clothes"
        />
        
        {badge && (
          <Badge className="absolute top-4 left-4 bg-primary text-white border-none px-4 py-1.5 font-bold uppercase text-[8px] rounded-full tracking-widest z-10">
            {badge}
          </Badge>
        )}
        
        {/* Botão de Favoritos - Z-INDEX 20 para ficar acima do overlay */}
        <button 
          onClick={handleToggleFavorite}
          className={cn(
            "absolute right-4 top-4 h-11 w-11 rounded-full backdrop-blur-sm flex items-center justify-center transition-all z-20 shadow-sm border border-black/5",
            isFavorited 
              ? "bg-primary text-white" 
              : "bg-white/90 text-primary hover:bg-primary hover:text-white"
          )}
        >
          <Heart className={cn("h-5 w-5", isFavorited && "fill-current")} />
        </button>

        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center z-10">
          <Link href={`/products/${id}`}>
            <Button className="rounded-full bg-white text-primary font-bold uppercase text-[9px] tracking-widest px-8 py-6 shadow-2xl hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-700">
              Ver Detalhes
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-1 pb-4 pt-6 text-center flex flex-col flex-1">
        <h3 className="line-clamp-2 text-[13px] uppercase leading-tight tracking-tight text-primary/80 font-medium mb-2">
          {name}
        </h3>
        
        <div className="mt-auto space-y-1">
          <p className="text-[24px] font-light text-primary leading-none">
            {formatCurrency(price)}
          </p>
          {oldPrice && (
            <p className="text-[11px] text-muted-foreground line-through font-light italic">
              {formatCurrency(oldPrice)}
            </p>
          )}
          <p className="text-[13px] text-accent font-medium italic">
            10x {formatCurrency(price / 10)}
          </p>

          <Link href={`/products/${id}`} className="block mt-4">
            <button
              className="w-full rounded-full border border-primary/10 bg-transparent px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-secondary hover:border-primary active:scale-95"
            >
              Comprar Agora
            </button>
          </Link>
        </div>
      </div>
    </article>
  );
}
