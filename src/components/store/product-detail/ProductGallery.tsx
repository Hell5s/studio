
"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback, memo } from 'react';
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
  video?: string; // URL de vídeo curto (mp4), opcional
}

const isValidSrc = (url: any) => typeof url === 'string' && url.length > 0 && (url.startsWith('http') || url.startsWith('/'));

// Memoizado: trocar de slide (setCurrent) não re-renderiza as <Image>.
const MobileSlide = memo(function MobileSlide({ url, idx, name, failed, onError }: {
  url: string; idx: number; name: string; failed: boolean;
  onError: (i: number) => void;
}) {
  return (
    <div className="shrink-0 basis-full w-full snap-center snap-always">
      <div className="relative block aspect-[3/5] w-full overflow-hidden bg-[#F5F5F5]">
        {failed || !isValidSrc(url) ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
            <Camera className="h-12 w-12 mb-3 opacity-40" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Foto indisponível</span>
          </div>
        ) : (
          <Image
            loader={cloudinaryLoader}
            src={url}
            alt={`${name} - Imagem ${idx + 1}`}
            fill
            className="object-cover"
            priority={idx < 2}
            fetchPriority={idx === 0 ? 'high' : 'auto'}
            loading={idx < 2 ? 'eager' : 'lazy'}
            decoding="async"
            sizes="100vw"
            onError={() => onError(idx)}
          />
        )}
      </div>
    </div>
  );
});

export function ProductGallery({ images, name, productId, activeVariation, video }: ProductGalleryProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const galleryRef = useRef<HTMLDivElement>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const [current, setCurrent] = useState(0);
  const [errorImages, setErrorImages] = useState<Record<number, boolean>>({});

  const favoriteRef = useMemo(() => {
    if (!db || !user?.uid || !productId) return null;
    return doc(db, 'users', user.uid, 'favorites', productId);
  }, [db, user?.uid, productId]);

  const { data: favoriteData } = useDoc(favoriteRef);
  const isFavorited = !!favoriteData;

  // A cliente pode voltar a ver a galeria completa depois de escolher uma cor.
  const [showAll, setShowAll] = useState(false);
  useEffect(() => setShowAll(false), [activeVariation]);

  // Sincronização de galeria dinâmica
  const displayImages = useMemo<any[]>(() => {
    if (showAll) return images;

    // 1. Prioridade: Array de fotos específicas da variação
    if (activeVariation?.images && activeVariation.images.length > 0) {
      return activeVariation.images;
    }

    // 2. Cor sem lista de fotos: mostra só a miniatura dela. Misturar com a galeria
    // completa exibia fotos de outras cores. Para mais fotos da cor, use
    // "Fotos desta cor" no cadastro do produto.
    if (activeVariation?.image) {
      return [activeVariation.image];
    }

    // 3. Padrão: Galeria completa do produto
    return images;
  }, [activeVariation, images, showAll]);

  const isFiltered = !!activeVariation && !showAll && images.length > displayImages.length;

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

  // Scroll nativo com snap (compositor); current atualizado via rAF.
  const handleScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const el = scrollRef.current;
      if (!el || !el.clientWidth) return;
      setCurrent(Math.round(el.scrollLeft / el.clientWidth));
    });
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
    setCurrent(0);
  }, [activeVariation]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

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

  const handleImageError = useCallback((idx: number) => {
    setErrorImages(prev => ({ ...prev, [idx]: true }));
  }, []);

  const isValidUrl = (url: any) => typeof url === 'string' && url.length > 0 && (url.startsWith('http') || url.startsWith('/'));

  const hasVideo = isValidUrl(video);
  const total = displayImages.length + (hasVideo ? 1 : 0);

  // Só desktop: priority fica no slide mobile (evita baixar a 1ª foto duas vezes no celular).
  const renderImage = (img: any, idx: number, isPriority = false, eager = false) => {
    const url = getItemImageUrl(img);
    if (errorImages[idx] || !isValidUrl(url)) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
          <Camera className="h-12 w-12 mb-3 opacity-40" />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">Foto indisponível</span>
        </div>
      );
    }

    return (
      <Image
        loader={cloudinaryLoader}
        src={url}
        alt={`${name} - Imagem ${idx + 1}`}
        fill
        className="object-cover"
        priority={isPriority}
        loading={isPriority || eager ? 'eager' : 'lazy'}
        decoding="async"
        sizes="(max-width: 768px) 100vw, 450px"
        onError={() => handleImageError(idx)}
      />
    );
  };

  const videoEl = (
    <video src={video} controls playsInline muted preload="metadata" className="absolute inset-0 h-full w-full object-cover bg-black" />
  );

  return (
    <div ref={galleryRef} className="relative">
      {/* Container principal com chave p/ resetar animações ao trocar variação */}
      <div key={activeVariation?.color || 'default'} className="space-y-4">
        {/* Desktop: grade de fotos */}
        <div className={cn("hidden md:grid gap-4", total === 1 ? "grid-cols-1 max-w-[55%] mx-auto" : "grid-cols-2")}>
          {displayImages.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-[3/5] overflow-hidden bg-[#F5F5F5] rounded-sm"
            >
              {renderImage(img, idx)}
            </div>
          ))}
          {hasVideo && <div className="relative aspect-[3/5] overflow-hidden bg-black rounded-sm">{videoEl}</div>}
        </div>

        {/* Mobile: carrossel com toque para ampliar */}
        <div className="md:hidden relative">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
              {displayImages.map((img, idx) => (
                <MobileSlide
                  key={idx}
                  url={getItemImageUrl(img)}
                  idx={idx}
                  name={name}
                  failed={!!errorImages[idx]}
                  onError={handleImageError}
                />
              ))}
              {hasVideo && (
                <div className="shrink-0 basis-full w-full snap-center snap-always">
                  <div className="relative aspect-[3/5] w-full overflow-hidden bg-black">{videoEl}</div>
                </div>
              )}
          </div>
          {total > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 pointer-events-none">
              {Array.from({ length: total }).map((_, i) => (
                <span key={i} className={cn("h-1.5 rounded-full bg-white shadow transition-all", i === current ? "w-4" : "w-1.5 opacity-60")} />
              ))}
            </div>
          )}
        </div>

        {isFiltered && (
          <div className="flex justify-center">
            <button
              onClick={() => setShowAll(true)}
              className="text-xs font-bold uppercase tracking-widest text-primary/80 hover:text-primary underline underline-offset-4 py-2 min-h-[44px]"
            >
              Ver todas as fotos ({images.length})
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleToggleFavorite}
        aria-label={isFavorited ? 'Remover dos favoritos' : 'Favoritar'}
        className={cn(
          "absolute top-4 right-4 h-12 md:h-14 w-12 md:w-14 rounded-full flex items-center justify-center transition-all z-20 shadow-xl border min-h-[44px] min-w-[44px]",
          isFavorited
            ? "bg-primary text-white border-primary"
            : "bg-white/95 text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
        )}
      >
        <Heart className={cn("h-6 w-6", isFavorited && "fill-current")} />
      </button>

    </div>
  );
}
