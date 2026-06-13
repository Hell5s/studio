
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useFirestore, useUser, useDoc, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Heart, Camera } from 'lucide-react';

interface ProductGalleryProps {
  images: any[];
  name: string;
  productId: string;
}

export function ProductGallery({ images, name, productId }: ProductGalleryProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [errorImages, setErrorImages] = useState<Record<number, boolean>>({});

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
      const firstImage = typeof images[0] === 'string' ? images[0] : images[0]?.url;
      setDocumentNonBlocking(favoriteRef, {
        productId,
        productName: name,
        productImage: firstImage,
        addedAt: serverTimestamp()
      }, { merge: true });
      toast({ title: "Salvo nos seus favoritos!" });
    }
  };

  const handleImageError = (idx: number) => {
    setErrorImages(prev => ({ ...prev, [idx]: true }));
  };

  const getImageUrl = (img: any) => typeof img === 'string' ? img : img?.url;
  const getImageSettings = (img: any) => typeof img === 'string' ? {} : {
    objectPosition: img?.crop ? `${img.crop.x}% ${img.crop.y}%` : 'center',
    transform: img?.zoom ? `scale(${img.zoom})` : 'none'
  };

  const isValidUrl = (url: any) => typeof url === 'string' && url.length > 0 && (url.startsWith('http') || url.startsWith('/'));

  const renderImage = (img: any, idx: number, isPriority = false) => {
    const url = getImageUrl(img);
    if (errorImages[idx] || !isValidUrl(url)) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-300">
          <Camera className="h-12 w-12 mb-3 opacity-20" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Preview Indisponível</span>
        </div>
      );
    }

    const settings = getImageSettings(img);

    return (
      <Image
        src={url}
        alt={`${name} - Imagem ${idx + 1}`}
        fill
        className="object-cover transition-transform duration-2000 group-hover:scale-105"
        style={settings}
        priority={isPriority}
        quality={90}
        sizes="(max-width: 768px) 100vw, 50vw"
        onError={() => handleImageError(idx)}
      />
    );
  };

  return (
    <div className="relative space-y-4">
      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-2 gap-4">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative aspect-[9/16] overflow-hidden bg-[#F5F5F5] group rounded-sm"
          >
            {renderImage(img, idx, idx === 0)}
          </div>
        ))}
      </div>

      {/* Mobile Stack */}
      <div className="flex flex-col md:hidden gap-2">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-[9/16] w-full overflow-hidden bg-[#F5F5F5] rounded-sm">
            {renderImage(img, idx, idx === 0)}
          </div>
        ))}
      </div>

      <button
        onClick={handleToggleFavorite}
        className={cn(
          "absolute top-4 right-4 h-12 md:h-14 w-12 md:w-14 rounded-full flex items-center justify-center transition-all z-20 shadow-xl border min-h-[44px] min-w-[44px]",
          isFavorited
            ? "bg-primary text-white border-primary"
            : "bg-white/95 text-gray-400 border-gray-200 hover:border-primary hover:text-primary"
        )}
      >
        <Heart className={cn("h-6 w-6", isFavorited && "fill-current")} />
      </button>
    </div>
  );
}
