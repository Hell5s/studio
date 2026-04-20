"use client";

import React from 'react';
import Image from 'next/image';
import { useFirestore, useUser, useDoc, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  name: string;
  productId: string;
}

export function ProductGallery({ images, name, productId }: ProductGalleryProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const favoriteRef = React.useMemo(() => {
    if (!db || !user?.uid || !productId) return null;
    return doc(db, 'users', user.uid, 'favorites', productId);
  }, [db, user?.uid, productId]);

  const { data: favoriteData } = useDoc(favoriteRef);
  const isFavorited = !!favoriteData;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
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
        productId,
        productName: name,
        productImage: images[0],
        addedAt: serverTimestamp()
      }, { merge: true });
      toast({ title: "Salvo nos seus favoritos!" });
    }
  };

  return (
    <div className="relative">
      <div className="hidden md:grid grid-cols-2 gap-2">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative aspect-[3/4] overflow-hidden bg-[#F5F5F5] group"
          >
            <Image
              src={img}
              alt={`${name} - Imagem ${idx + 1}`}
              fill
              className="object-cover transition-transform duration-[2s] group-hover:scale-105"
              priority={idx === 0}
              sizes="(max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col md:hidden gap-1">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F5F5]">
            <Image
              src={img}
              alt={`${name} - ${idx + 1}`}
              fill
              className="object-cover"
              priority={idx === 0}
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleToggleFavorite}
        className={cn(
          "absolute top-4 right-4 h-10 md:h-12 w-10 md:w-12 rounded-full flex items-center justify-center transition-all z-20 shadow-lg border",
          isFavorited
            ? "bg-primary text-white border-primary"
            : "bg-white/90 text-gray-400 border-gray-200 hover:border-primary hover:text-primary"
        )}
      >
        <Heart className={cn("h-5 md:h-6 w-5 md:w-6", isFavorited && "fill-current")} />
      </button>
    </div>
  );
}
