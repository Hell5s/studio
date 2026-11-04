"use client";

import React, { useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Camera, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useUser, useDoc, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn, getItemImageUrl } from '@/lib/utils';
import { QuickAddPopover } from './QuickAddPopover';
import cloudinaryLoader from '@/lib/cloudinaryLoader';

interface ProductCardProps {
  id: string | number;
  name: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  image: any; 
  onAddToCart?: (p?: any) => void;
  sizes?: string[];
  colors?: string[];
  variations?: any[];
  createdAt?: any;
  images?: any[];
}

// A etiqueta "Novo" só vale para produtos cadastrados nos últimos 30 dias.
const NEW_BADGE_DAYS = 30;
function isRecent(createdAt: any): boolean {
  const date = createdAt?.toDate ? createdAt.toDate()
    : typeof createdAt?.seconds === 'number' ? new Date(createdAt.seconds * 1000)
    : createdAt ? new Date(createdAt) : null;
  if (!date || isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() < NEW_BADGE_DAYS * 24 * 60 * 60 * 1000;
}

export const ProductCard = React.memo(function ProductCard({
  id,
  name,
  price,
  oldPrice,
  badge,
  image,
  onAddToCart,
  sizes,
  colors,
  variations,
  createdAt,
  images
}: ProductCardProps) {
  const visibleBadge = badge?.trim().toLowerCase() === 'novo' && !isRecent(createdAt) ? undefined : badge;
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const stringId = String(id);

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [image]);

  const favoriteRef = useMemo(() => {
    if (!db || !user?.uid || !stringId) return null;
    return doc(db, 'users', user.uid, 'favorites', stringId);
  }, [db, user?.uid, stringId]);

  const { data: favoriteData } = useDoc(favoriteRef);
  const isFavorited = !!favoriteData;

  const hasVariations = useMemo(() => {
    return (sizes && sizes.length > 0) || (variations && variations.length > 0) || (colors && colors.length > 0);
  }, [sizes, variations, colors]);

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
      const displayImg = getItemImageUrl(image);
      setDocumentNonBlocking(favoriteRef, {
        productId: stringId,
        productName: name,
        productImage: displayImg,
        addedAt: serverTimestamp()
      }, { merge: true });
      toast({ title: "Salvo nos seus favoritos!" });
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onAddToCart) {
      // Passa o objeto completo do produto para garantir que o carrinho receba os dados necessários
      onAddToCart({ id, name, price, oldPrice, badge, image, sizes, colors, variations });
      toast({
        title: "Adicionado ao carrinho!",
        description: "O item foi reservado na sua sacola."
      });
    }
  };

  const url = getItemImageUrl(image);
  const isValidUrl = url && typeof url === 'string' && url.length > 0 && (url.startsWith('http') || url.startsWith('/'));
  const discount = oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;

  // Fotos do produto passando no card: no hover (computador) ou quando o card está na tela (celular).
  const gallery = useMemo(() => {
    const all = [url, ...(images || []).map(getItemImageUrl)].filter((u): u is string => typeof u === 'string' && /^(https?:)?\//.test(u));
    return Array.from(new Set(all)).slice(0, 5);
  }, [url, images]);
  const SLIDE_MS = 2200;
  const [slide, setSlide] = useState(0);
  const [playing, setPlaying] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!playing || gallery.length < 2) return;
    setSlide(1);
    const t = setInterval(() => setSlide(s => (s + 1) % gallery.length), SLIDE_MS);
    return () => { clearInterval(t); setSlide(0); };
  }, [playing, gallery.length]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || gallery.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover: none)').matches) return;
    const io = new IntersectionObserver(([e]) => setPlaying(e.intersectionRatio > 0.6), { threshold: [0, 0.6] });
    io.observe(el);
    return () => io.disconnect();
  }, [gallery.length]);

  const canHover = () => matchMedia('(hover: hover)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;

  const addButton = (
    <button className="tb-add" title="Adicionar à sacola" onClick={hasVariations ? undefined : handleQuickAdd}>
      Adicionar à sacola
    </button>
  );

  return (
    <article
      ref={cardRef}
      className={cn("tb-card group flex flex-col h-full", playing && "tb-play")}
      style={{ ['--tb-dur' as any]: `${SLIDE_MS}ms` }}
      onMouseEnter={() => canHover() && setPlaying(true)}
      onMouseLeave={() => canHover() && setPlaying(false)}
    >
      <div className="tb-media relative w-full aspect-[3/5] overflow-hidden bg-[#F3EFF0] flex-shrink-0">
        <Link href={`/products/${id}`} className="absolute inset-0 z-10">
          <span className="sr-only">Ver detalhes de {name}</span>
          {isValidUrl && !hasError ? (
            gallery.map((src, i) => (playing || i === 0) && (
              <Image
                key={src}
                loader={cloudinaryLoader}
                src={src}
                alt={i === 0 ? name : ''}
                fill
                loading="lazy"
                className={cn("tb-img object-cover", i === slide && "tb-on")}
                style={{ objectPosition: '50% 15%' }}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                onError={i === 0 ? () => setHasError(true) : undefined}
              />
            ))
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-300">
              <Camera className="h-8 w-8 mb-2 opacity-20" />
              <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">Imagem Indisponível</span>
            </div>
          )}
        </Link>

        {gallery.length > 1 && (
          <div className="tb-bars" aria-hidden="true" key={playing ? 'on' : 'off'}>
            {gallery.map((_, i) => <i key={i} className={i < slide ? 'tb-done' : i === slide && playing ? 'tb-run' : ''}><b /></i>)}
          </div>
        )}

        <div className="absolute top-3 md:top-4 left-3 md:left-4 z-20 flex flex-col items-start gap-1.5">
          {discount > 0 && <span className="tb-off">-{discount}%</span>}
          {visibleBadge && (
            <Badge className="bg-primary text-white border-none px-2 md:px-3 py-0.5 md:py-1 font-bold uppercase text-[7px] md:text-[9px] rounded-full tracking-widest">
              {visibleBadge}
            </Badge>
          )}
        </div>

        <button
          onClick={handleToggleFavorite}
          aria-label={isFavorited ? 'Remover dos favoritos' : 'Favoritar'}
          className={cn("tb-glass absolute z-20 right-2.5 top-2.5 h-9 md:h-10 w-9 md:w-10 rounded-full flex items-center justify-center transition-transform hover:scale-110", isFavorited && "text-white !bg-primary")}
        >
          <Heart className={cn("h-4 md:h-5 w-4 md:w-5", isFavorited ? "fill-current" : "text-[#2A1F22]")} />
        </button>

        <div className="absolute z-20 left-2.5 right-2.5 bottom-2.5">
          {hasVariations ? (
            <QuickAddPopover
              product={{ id, name, price, oldPrice, badge, image, sizes, colors, variations }}
              onConfirm={(p) => onAddToCart?.(p)}
              trigger={addButton}
            />
          ) : addButton}
        </div>
      </div>

      <div className="pt-4 px-1 text-center flex flex-col flex-1">
        <h3 className="![font-family:var(--font-inter),sans-serif] line-clamp-2 text-[13px] md:text-sm font-medium leading-snug text-[#2A1F22] min-h-[2.8em]">
          {name}
        </h3>
        <div className="tb-price mt-auto">
          <span className="tb-now">{formatCurrency(price)}</span>
          {discount > 0 && <span className="tb-old">{formatCurrency(oldPrice!)}</span>}
          <span className="tb-inst">Até 10x no cartão</span>
        </div>
      </div>
    </article>
  );
});
