
"use client";

import React, { useState } from 'react';
import { ShoppingBag, Link as LinkIcon, Loader2, Search, CheckCircle2, AlertCircle, Image as ImageIcon, Sparkles, ArrowRight, Package } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useFirebase, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ShopeeProduct {
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  images: string[];
  category: string;
  originalUrl: string;
  source: 'Shopee';
}

export function AdminShopeeImport() {
  const { functions } = useFirebase();
  const db = useFirestore();
  const { toast } = useToast();

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<ShopeeProduct | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!url || (!url.includes('shopee.com') && !url.includes('shp.ee'))) {
      toast({
        title: "URL Inválida",
        description: "Por favor, cole um link válido da Shopee.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);
    setProduct(null);

    try {
      const importShopeeProduct = httpsCallable<any, any>(functions, 'importShopeeProduct');
      const result = await importShopeeProduct({ url });
      
      const data = result.data;
      setProduct({
        title: data.title || data.name,
        description: data.description,
        price: data.price,
        oldPrice: data.oldPrice,
        images: data.images || [data.image],
        category: data.category || 'Novidades',
        originalUrl: url,
        source: 'Shopee'
      });
      
      toast({
        title: "Sucesso!",
        description: "Dados do produto recuperados.",
      });
    } catch (err: any) {
      setError("A função de busca automática falhou. Deseja simular a captura para teste?");
    } finally {
      setLoading(false);
    }
  };

  const simulateImport = () => {
    setLoading(true);
    setTimeout(() => {
      setProduct({
        title: "Vestido Midi Satin Luxury",
        description: "Vestido midi em cetim premium com toque de seda. Modelagem impecável que valoriza a silhueta feminina com elegância e sofisticação para noites inesquecíveis.",
        price: 249.90,
        oldPrice: 389.00,
        images: [
          "https://images.unsplash.com/photo-1539109132314-34a773ad0214?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80"
        ],
        category: "Vestidos",
        originalUrl: url,
        source: 'Shopee'
      });
      setError(null);
      setLoading(false);
    }, 2000);
  };

  const saveToFirestore = () => {
    if (!product) return;

    setSaving(true);
    const productsRef = collection(db, 'products');
    
    const newProduct = {
      name: product.title,
      title: product.title,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice || null,
      image: product.images[0],
      images: product.images,
      categoryId: product.category.toLowerCase(),
      category: product.category,
      featured: true,
      source: product.source,
      originalUrl: product.originalUrl,
      createdAt: serverTimestamp(),
      badge: "Lançamento Shopee"
    };

    addDocumentNonBlocking(productsRef, newProduct)
      .then(() => {
        toast({
          title: "Produto importado e publicado.",
          description: `${product.title} já está disponível na sua vitrine.`
        });
        setProduct(null);
        setUrl('');
      })
      .finally(() => {
        setSaving(false);
      });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h4 className="text-2xl font-headline font-bold text-brand-wine">Importar Produto por Link</h4>
        <p className="text-sm text-brand-wine/40 italic font-light">Adicione peças da Shopee diretamente ao catálogo Toda Bela Maison.</p>
      </div>

      <Card className="p-8 border-none bg-white shadow-xl rounded-[3rem] overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Package className="h-24 w-24 text-brand-wine" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="grid gap-3">
            <Label htmlFor="shopee-url" className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-wine/40">Link do Produto Shopee</Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-wine/20" />
                <Input 
                  id="shopee-url"
                  placeholder="Cole aqui o link do produto..." 
                  className="pl-11 rounded-full h-14 bg-brand-blush/30 border-none text-brand-wine focus:ring-2 focus:ring-brand-gold/20"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={loading || !url}
                className="rounded-full h-14 px-8 font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-brand-wine/10 bg-brand-wine text-white transition-all hover:scale-105"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Buscar Produto
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex flex-col gap-4 p-6 rounded-[2rem] bg-brand-blush/50 border border-brand-wine/5">
              <div className="flex items-start gap-3 text-brand-wine text-sm font-medium">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-brand-gold" />
                <div className="space-y-1">
                  <p>A captura automática requer o servidor de backend ativo.</p>
                  <p className="text-xs opacity-70 italic font-light">Deseja simular uma captura completa com fotos e descrições reais para teste?</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={simulateImport}
                className="w-fit rounded-full border-brand-wine/10 text-brand-wine hover:bg-white h-10 px-6 font-bold uppercase tracking-widest text-[9px]"
              >
                Simular Captura deste Link
              </Button>
            </div>
          )}
        </div>
      </Card>

      {product && (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-wine/60">Prévia do Editorial</span>
          </div>

          <Card className="p-0 border-none bg-white shadow-2xl overflow-hidden rounded-[4rem]">
            <div className="grid lg:grid-cols-2">
              <div className="relative aspect-square lg:aspect-auto bg-muted">
                <Image 
                  src={product.images[0]} 
                  alt={product.title}
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                />
                <div className="absolute top-8 left-8 flex gap-2">
                  <Badge className="bg-brand-wine text-white border-none font-bold py-1.5 px-4 rounded-full uppercase tracking-widest text-[9px]">
                    {product.source}
                  </Badge>
                  <Badge className="bg-brand-gold text-brand-wine border-none font-bold py-1.5 px-4 rounded-full uppercase tracking-widest text-[9px]">
                    Captura Premium
                  </Badge>
                </div>
              </div>

              <div className="p-12 lg:p-16 space-y-8 flex flex-col justify-between">
                <div className="space-y-8">
                  <div>
                    <Badge variant="secondary" className="mb-6 bg-brand-blush text-brand-wine border-none font-bold uppercase tracking-[0.3em] text-[10px] px-4 py-1 rounded-full">
                      {product.category}
                    </Badge>
                    <h5 className="text-4xl font-headline font-bold text-brand-wine leading-[0.9] tracking-tighter">
                      {product.title}
                    </h5>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-4xl font-bold text-brand-wine">R$ {product.price.toFixed(2)}</span>
                    {product.oldPrice && (
                      <span className="text-xl text-brand-wine/20 line-through decoration-brand-gold/30 font-light italic">
                        R$ {product.oldPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-wine/30 flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" /> Descrição Editorial
                    </p>
                    <p className="text-sm text-brand-wine/60 leading-relaxed italic font-light line-clamp-6">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="pt-10 border-t border-brand-wine/5">
                  <Button 
                    className="w-full rounded-full h-16 font-bold shadow-xl shadow-brand-wine/20 bg-brand-wine hover:bg-brand-plum text-white uppercase tracking-[0.2em] text-[11px]"
                    onClick={saveToFirestore}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                    Confirmar & Publicar na Maison
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {!product && !loading && !error && (
        <div className="py-24 flex flex-col items-center justify-center text-center bg-white/50 rounded-[4rem] border-2 border-dashed border-brand-wine/10">
          <div className="h-20 w-20 rounded-full bg-brand-blush/50 flex items-center justify-center mb-6">
            <ImageIcon className="h-10 w-10 text-brand-wine/20" />
          </div>
          <p className="max-w-xs text-[11px] uppercase tracking-widest font-bold text-brand-wine/30">O catálogo editorial será atualizado após a importação bem-sucedida.</p>
        </div>
      )}
    </div>
  );
}
