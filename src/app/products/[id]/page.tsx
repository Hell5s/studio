
"use client";

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, limit } from 'firebase/firestore';
import { Navbar } from '@/components/store/Navbar';
import { Newsletter } from '@/components/store/Newsletter';
import { ProductGallery } from '@/components/store/product-detail/ProductGallery';
import { ProductInfo } from '@/components/store/product-detail/ProductInfo';
import { ProductTabs } from '@/components/store/product-detail/ProductTabs';
import { RelatedProducts } from '@/components/store/product-detail/RelatedProducts';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { OrderTrackingDialog } from '@/components/store/OrderTrackingDialog';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const [isTrackOpen, setIsTrackOpen] = React.useState(false);

  const productRef = useMemo(() => {
    if (!db || !id) return null;
    return doc(db, 'products', id as string);
  }, [db, id]);

  const { data: product, isLoading } = useDoc(productRef);

  const relatedQuery = useMemoFirebase(() => {
    if (!db || !product) return null;
    return query(
      collection(db, 'products'),
      where('category', '==', product.category || ''),
      limit(4)
    );
  }, [db, product]);

  const { data: relatedProducts } = useCollection(relatedQuery);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creme">
        <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-creme">
        <h1 className="text-3xl font-headline font-bold text-primary">Objeto de desejo não encontrado</h1>
        <Button onClick={() => router.push('/')} variant="outline" className="rounded-full px-12">
          Voltar para a Maison
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-accent/30 selection:text-primary">
      <Navbar onOpenLogin={() => setIsLoginOpen(true)} onOpenTrack={() => setIsTrackOpen(true)} />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-12">
          {/* Breadcrumb / Back */}
          <div className="mb-12">
            <Link href="/" className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
              Voltar para Coleções
            </Link>
          </div>

          <div className="grid lg:grid-cols-12 gap-16 xl:gap-24 items-start">
            {/* Gallery Column */}
            <div className="lg:col-span-7 xl:col-span-8">
              <ProductGallery 
                images={product.images || [product.image]} 
                name={product.name} 
              />
            </div>

            {/* Info Column */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-32">
              <ProductInfo product={product} />
            </div>
          </div>

          {/* Detailed Content Section */}
          <div className="mt-32 grid lg:grid-cols-12 gap-16 xl:gap-24 border-t border-primary/5 pt-32">
            <div className="lg:col-span-7 xl:col-span-8 space-y-24">
              <section>
                <div className="flex items-center gap-4 mb-12">
                  <div className="h-px w-12 bg-accent/40" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.8em] text-accent">L'Essence du Produit</span>
                </div>
                <div className="prose prose-primary max-w-none">
                  <h3 className="text-4xl font-headline font-bold text-primary mb-8">Elegância em cada detalhe</h3>
                  <div className="text-lg text-muted-foreground/80 leading-relaxed font-light italic whitespace-pre-line">
                    {product.longDescription || product.description}
                  </div>
                </div>
              </section>

              <section className="bg-secondary/20 rounded-[4rem] p-12 md:p-20">
                <div className="grid md:grid-cols-2 gap-16">
                  <div>
                    <h4 className="text-xl font-headline font-bold text-primary uppercase tracking-widest mb-6">Como Usar</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                      Ideal para eventos que exigem uma presença marcante e sofisticada. Combine com acessórios dourados Toda Bela para um look completo de gala.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xl font-headline font-bold text-primary uppercase tracking-widest mb-6">Diferenciais Maison</h4>
                    <ul className="space-y-4 text-sm text-muted-foreground font-light italic">
                      <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-accent" /> Modelagem que esculpe a silhueta</li>
                      <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-accent" /> Tecido com toque de seda premium</li>
                      <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-accent" /> Acabamento artesanal invisível</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-5 xl:col-span-4">
              <ProductTabs product={product} />
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-40">
              <RelatedProducts products={relatedProducts} />
            </div>
          )}
        </div>
      </main>

      <Newsletter />
      
      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      <OrderTrackingDialog open={isTrackOpen} onOpenChange={setIsTrackOpen} />
    </div>
  );
}
