
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-8">
      {/* Thumbnails */}
      <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-visible no-scrollbar pb-4 lg:pb-0">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={cn(
              "relative h-24 w-24 shrink-0 rounded-3xl overflow-hidden border-2 transition-all duration-500",
              activeIndex === idx ? "border-accent shadow-premium" : "border-transparent opacity-50 hover:opacity-100"
            )}
          >
            <Image
              src={img}
              alt={`${name} thumbnail ${idx + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div 
        className="relative flex-1 aspect-[4/5] rounded-[4rem] overflow-hidden bg-secondary/20 shadow-premium cursor-zoom-in group"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <Image
          src={images[activeIndex]}
          alt={name}
          fill
          className={cn(
            "object-cover transition-transform duration-700 ease-out",
            isZoomed ? "scale-110" : "scale-100"
          )}
          priority
        />
        
        {/* Subtle Overlay Decoration */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
