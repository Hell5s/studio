
"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowLeft, Heart, Share2, ShieldCheck, Truck } from 'lucide-react';
import Image from 'next/image';
import { LogoMark } from '@/components/store/LogoMark';
import { Newsletter } from '@/components/store/Newsletter';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  
  const productRef = React.useMemo(() => {
    if (!db || !id) return null;
    return doc(db, 'products', id as string);
  }, [db, id]);

  const { data: product, isLoading } = useDoc(productRef);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">Produto não encontrado</h1>
        <Button onClick={() => router.push('/')}>Voltar para a loja</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
          <Link href="/">
            <LogoMark />
          </Link>
          <Button onClick={() => router.push('/')} variant="ghost" className="rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Imagem do Produto */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-[3rem] shadow-2xl border-8 border-white">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Detalhes do Produto */}
          <div className="space-y-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/60">
                {product.badge || "Exclusivo"}
              </span>
              <h1 className="mt-4 text-4xl md:text-5xl font-headline font-bold text-foreground leading-tight">
                {product.name}
              </h1>
              <div className="mt-6 flex items-center gap-4">
                <span className="text-3xl font-bold text-primary">{formatCurrency(product.price)}</span>
                {product.oldPrice && (
                  <span className="text-lg text-muted-foreground line-through decoration-brand-wine/30">
                    {formatCurrency(product.oldPrice)}
                  </span>
                )}
              </div>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="flex-1 rounded-full py-8 text-lg font-semibold shadow-xl shadow-primary/20">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Adicionar ao Carrinho
              </Button>
              <Button size="icon" variant="outline" className="rounded-full h-16 w-16 border-primary/20">
                <Heart className="h-6 w-6 text-primary" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-full h-16 w-16 border-primary/20">
                <Share2 className="h-6 w-6 text-primary" />
              </Button>
            </div>

            <div className="grid gap-4 pt-8">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-brand-blush/30 border border-white/60">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Frete Grátis</p>
                  <p className="text-xs text-muted-foreground">Em compras acima de R$ 299,00</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-brand-blush/30 border border-white/60">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Compra Segura</p>
                  <p className="text-xs text-muted-foreground">Sua privacidade e segurança são nossa prioridade</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Newsletter />
    </div>
  );
}

// Helper Link component to avoid errors if not imported properly
import Link from 'next/link';
