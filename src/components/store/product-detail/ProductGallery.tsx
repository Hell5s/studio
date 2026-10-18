
"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useFirestore, useUser, useDoc, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn, getItemImageUrl } from '@/lib/utils';
import { Heart, Camera } from 'lucide-react';
import cloudinaryLoader from '@/lib/cloudinaryLoader';

interface ProductGalleryProps {
  images: any[];
  name: string;
  productId: string;
  activeVariation?: any;
}

export function ProductGallery({ images, name, productId, activeVariation }: ProductGalleryProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const galleryRef = useRef<HTMLDivElement>(null);

  const [errorImages, setErrorImages] = useState<Record<number, boolean>>({});

  const favoriteRef = useMemo(() => {
    if (!db || !user?.uid || !productId) return null;
    return doc(db, 'users', user.uid, 'favorites', productId);
  }, [db, user?.uid, productId]);

  const { data: favoriteData } = useDoc(favoriteRef);
  const isFavorited = !!favoriteData;

  // Sincronização de galeria dinâmica
  const displayImages = useMemo(() => {
    // 1. Prioridade: Array de fotos específicas da variação
    if (activeVariation?.images && activeVariation.images.length > 0) {
      return activeVariation.images;
    }

    // 2. Fallback: Miniatura da variação + galeria original (sem duplicar)
    if (activeVariation?.image) {
      const mainUrl = getItemImageUrl(activeVariation.image);
      const others = images.filter(img => getItemImageUrl(img) !== mainUrl);
      return [activeVariation.image, ...others];
    }

    // 3. Padrão: Galeria completa do produto
    return images;
  }, [activeVariation, images]);

  // Efeitos colaterais ao trocar a variação
  useEffect(() => {
    setErrorImages({});

    // Scroll suave no mobile para facilitar a visualização da mudança
    if (activeVariation && window.innerWidth < 768 && galleryRef.current) {
      const headerHeight = 80;
      const elementPosition = galleryRef.current.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, [activeVariation]);

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
      const firstImage = getItemImageUrl(images[0]);
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

  const isValidUrl = (url: any) => typeof url === 'string' && url.length > 0 && (url.startsWith('http') || url.startsWith('/'));

  const renderImage = (img: any, idx: number, isPriority = false) => {
    const url = getItemImageUrl(img);
    if (errorImages[idx] || !isValidUrl(url)) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-300">
          <Camera className="h-12 w-12 mb-3 opacity-20" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Preview Indisponível</span>
        </div>
      );
    }

    return (
      <Image
        loader={cloudinaryLoader}
        src={url}
        alt={`${name} - Imagem ${idx + 1}`}
        fill
        className="object-cover transition-transform duration-2000 group-hover:scale-105"
        priority={isPriority}
        sizes="(max-width: 768px) 100vw, 800px"
        onError={() => handleImageError(idx)}
      />
    );
  };

  return (
    <div ref={galleryRef} className="relative">
      {/* Container principal com chave p/ resetar animações ao trocar variação */}
      <div key={activeVariation?.color || 'default'} className="animate-in fade-in duration-500 space-y-4">
        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-2 gap-4">
          {displayImages.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-[3/5] overflow-hidden bg-[#F5F5F5] group rounded-sm"
            >
              {renderImage(img, idx, idx === 0)}
            </div>
          ))}
        </div>

        {/* Mobile Stack */}
        <div className="flex flex-col md:hidden gap-2">
          {displayImages.map((img, idx) => (
            <div key={idx} className="relative aspect-[3/5] w-full overflow-hidden bg-[#F5F5F5] rounded-sm">
              {renderImage(img, idx, idx === 0)}
            </div>
          ))}
        </div>
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
