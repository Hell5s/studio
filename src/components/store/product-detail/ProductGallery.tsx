
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Expand, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const nextImage = () => setActiveIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="grid lg:grid-cols-[120px_1fr] gap-8">
      {/* Thumbnails Sidebar - Desktop Only */}
      <div className="hidden lg:flex flex-col gap-4 max-h-[800px] overflow-y-auto no-scrollbar pr-2">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={cn(
              "relative aspect-[3/4] w-full shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-500",
              activeIndex === idx ? "border-accent shadow-xl scale-105" : "border-transparent opacity-40 hover:opacity-100"
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

      {/* Main Large Editorial Image */}
      <div className="relative group">
        <div 
          className="relative aspect-[3/4.5] rounded-[3rem] md:rounded-[4rem] overflow-hidden bg-secondary/10 shadow-editorial cursor-zoom-in group"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
        >
          <Image
            src={images[activeIndex]}
            alt={name}
            fill
            className={cn(
              "object-cover transition-transform duration-[2s] ease-out",
              isZoomed ? "scale-110" : "scale-100"
            )}
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
          />
          
          {/* Decorative Corner Trace */}
          <div className="absolute inset-8 border border-white/10 rounded-[2rem] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          {/* Image Navigation Arrows */}
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <button 
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="h-14 w-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-primary shadow-xl pointer-events-auto hover:bg-primary hover:text-white transition-all active:scale-95"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="h-14 w-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-primary shadow-xl pointer-events-auto hover:bg-primary hover:text-white transition-all active:scale-95"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Expand Badge */}
          <div className="absolute bottom-10 right-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <Expand className="h-5 w-5" />
          </div>
        </div>

        {/* Mobile Thumbnails Row */}
        <div className="flex lg:hidden gap-3 mt-6 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory px-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative aspect-[3/4] h-24 shrink-0 rounded-xl overflow-hidden border-2 snap-start transition-all",
                activeIndex === idx ? "border-accent scale-105" : "border-transparent opacity-60"
              )}
            >
              <Image src={img} alt="thumb" fill className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
