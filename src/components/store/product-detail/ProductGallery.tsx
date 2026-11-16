
"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useFirestore, useUser, useDoc, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn, getItemImageUrl } from '@/lib/utils';
import { Heart, Camera, ZoomIn } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import cloudinaryLoader from '@/lib/cloudinaryLoader';

interface ProductGalleryProps {
  images: any[];
  name: string;
  productId: string;
  activeVariation?: any;
  video?: string; // URL de vídeo curto (mp4), opcional
}

export function ProductGallery({ images, name, productId, activeVariation, video }: ProductGalleryProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const galleryRef = useRef<HTMLDivElement>(null);

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [zoomIdx, setZoomIdx] = useState<number | null>(null);
  const [hoverZoom, setHoverZoom] = useState<{ idx: number; x: number; y: number } | null>(null);
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

  useEffect(() => {
    if (!api) return;
    const on = () => setCurrent(api.selectedScrollSnap());
    on();
    api.on('select', on);
    return () => { api.off('select', on); };
  }, [api]);

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

  const hasVideo = isValidUrl(video);
  const total = displayImages.length + (hasVideo ? 1 : 0);

  const renderImage = (img: any, idx: number, isPriority = false) => {
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
        sizes="(max-width: 768px) 100vw, 800px"
        onError={() => handleImageError(idx)}
      />
    );
  };

  const videoEl = (
    <video src={video} controls playsInline muted preload="metadata" className="absolute inset-0 h-full w-full object-cover bg-black" />
  );

  const zoomUrl = zoomIdx !== null ? getItemImageUrl(displayImages[zoomIdx]) : '';

  return (
    <div ref={galleryRef} className="relative">
      {/* Container principal com chave p/ resetar animações ao trocar variação */}
      <div key={activeVariation?.color || 'default'} className="animate-in fade-in duration-500 space-y-4">
        {/* Desktop: grade com zoom ao passar o mouse; clique abre a foto grande */}
        <div className={cn("hidden md:grid gap-4", total === 1 ? "grid-cols-1 max-w-[55%] mx-auto" : "grid-cols-2")}>
          {displayImages.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-[3/5] overflow-hidden bg-[#F5F5F5] rounded-sm cursor-zoom-in"
              onClick={() => setZoomIdx(idx)}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setHoverZoom({ idx, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
              }}
              onMouseLeave={() => setHoverZoom(null)}
            >
              <div
                className="absolute inset-0 transition-transform duration-200"
                style={hoverZoom && hoverZoom.idx === idx ? { transform: "scale(2)", transformOrigin: `${hoverZoom.x}% ${hoverZoom.y}%` } : undefined}
              >
                {renderImage(img, idx, idx === 0)}
              </div>
            </div>
          ))}
          {hasVideo && <div className="relative aspect-[3/5] overflow-hidden bg-black rounded-sm">{videoEl}</div>}
        </div>

        {/* Mobile: carrossel com toque para ampliar */}
        <div className="md:hidden relative">
          <Carousel setApi={setApi} opts={{ loop: false }}>
            <CarouselContent className="-ml-0">
              {displayImages.map((img, idx) => (
                <CarouselItem key={idx} className="pl-0">
                  <button
                    type="button"
                    aria-label="Ampliar foto"
                    onClick={() => setZoomIdx(idx)}
                    className="relative block aspect-[3/5] w-full overflow-hidden bg-[#F5F5F5]"
                  >
                    {renderImage(img, idx, idx === 0)}
                  </button>
                </CarouselItem>
              ))}
              {hasVideo && (
                <CarouselItem className="pl-0">
                  <div className="relative aspect-[3/5] w-full overflow-hidden bg-black">{videoEl}</div>
                </CarouselItem>
              )}
            </CarouselContent>
          </Carousel>
          {total > 1 && (
            <>
              <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white">
                {current + 1}/{total}
              </span>
            </>
          )}
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white pointer-events-none">
            <ZoomIn className="h-3.5 w-3.5" /> Toque para ampliar
          </span>
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

      {/* Foto ampliada: no celular dá para arrastar e dar pinça; no computador, rolar */}
      <Dialog open={zoomIdx !== null} onOpenChange={(o) => !o && setZoomIdx(null)}>
        <DialogContent className="max-w-none w-screen h-[100dvh] p-0 border-none rounded-none bg-black/95 sm:max-w-none">
          <DialogTitle className="sr-only">{name}</DialogTitle>
          <div className="h-full w-full overflow-auto" style={{ touchAction: 'pan-x pan-y pinch-zoom' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {zoomUrl && <img src={zoomUrl} alt={name} className="mx-auto h-full w-auto max-w-none object-contain md:h-auto md:max-h-none md:w-[min(100%,900px)]" />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
