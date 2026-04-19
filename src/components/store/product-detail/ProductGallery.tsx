
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
      {/* Desktop: Grid layout for massive editorial view like reference */}
      <div className="hidden md:grid grid-cols-2 gap-3">
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className={cn(
              "relative aspect-[3/4] overflow-hidden bg-[#F3EFF0] group",
              idx === 0 && images.length % 2 !== 0 ? "col-span-2 aspect-[16/10]" : ""
            )}
          >
            <Image
              src={img}
              alt={`${name} - Imagem ${idx + 1}`}
              fill
              className="object-cover transition-transform duration-[2s] group-hover:scale-105"
              priority={idx === 0}
              sizes="(max-width: 1200px) 100vw, 50vw"
            />
          </div>
        ))}
      </div>

      {/* Mobile: Vertical Stack Layout */}
      <div className="flex flex-col md:hidden gap-2">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-[3/4] w-full overflow-hidden bg-[#F3EFF0]">
            <Image
              src={img}
              alt={`${name} mobile ${idx + 1}`}
              fill
              className="object-cover"
              priority={idx === 0}
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {/* Favorite Button Overlay - Matches Kaisan floating style */}
      <button 
        onClick={handleToggleFavorite}
        className={cn(
          "absolute top-4 right-4 h-11 w-11 rounded-full backdrop-blur-sm flex items-center justify-center transition-all z-20 shadow-lg",
          isFavorited 
            ? "bg-primary text-white" 
            : "bg-white/80 text-primary hover:bg-primary hover:text-white"
        )}
      >
        <Heart className={cn("h-5 w-5", isFavorited && "fill-current")} />
      </button>
    </div>
  );
}
