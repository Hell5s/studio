"use client";

import React, { useState } from 'react';
import { ShoppingBag, Link as LinkIcon, Loader2, Search, CheckCircle2, AlertCircle, Image as ImageIcon, Sparkles, ArrowRight, Package, TrendingUp, DollarSign, Layers } from 'lucide-react';
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

interface ShopeeVariant {
  name: string;
  basePrice: number;
  finalPrice: number;
  stock: number;
}

interface ShopeeProduct {
  title: string;
  description: string;
  images: string[];
  category: string;
  originalUrl: string;
  variants: ShopeeVariant[];
  source: 'Shopee';
  basePrice: number;
  finalPrice: number;
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

  const calculateFinalPrice = (basePrice: number) => {
    let finalPrice = basePrice;
    
    if (basePrice <= 20) {
      finalPrice = basePrice * 2.5;
    } else if (basePrice > 20 && basePrice <= 50) {
      finalPrice = basePrice * 2.0;
    } else {
      finalPrice = basePrice + 30;
    }

    // Round to .90
    return Math.ceil(finalPrice) - 0.10;
  };

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
      
      // Process variants and prices
      const variants: ShopeeVariant[] = (data.variants || []).map((v: any) => ({
        name: v.name,
        basePrice: v.price,
        finalPrice: calculateFinalPrice(v.price),
        stock: v.stock || 100
      }));

      const mainBasePrice = data.price;
      const mainFinalPrice = calculateFinalPrice(mainBasePrice);

      setProduct({
        title: data.title || data.name,
        description: data.description,
        images: data.images || [data.image],
        category: data.category || 'Geral',
        originalUrl: url,
        variants: variants,
        source: 'Shopee',
        basePrice: mainBasePrice,
        finalPrice: mainFinalPrice
      });
      
      toast({
        title: "Importação concluída!",
        description: "Os preços foram calculados conforme as regras do Encanto Kids.",
      });
    } catch (err: any) {
      setError("A função de busca requer configuração no Firebase. Clique abaixo para simular.");
    } finally {
      setLoading(false);
    }
  };

  const simulateImport = () => {
    setLoading(true);
    setTimeout(() => {
      const mockBasePrice = 35.00;
      const mockFinalPrice = calculateFinalPrice(mockBasePrice);
      
      const mockVariants: ShopeeVariant[] = [
        { name: "Azul (Pequeno)", basePrice: 20, finalPrice: calculateFinalPrice(20), stock: 50 },
        { name: "Rosa (Médio)", basePrice: 35, finalPrice: calculateFinalPrice(35), stock: 30 },
        { name: "Verde (Grande)", basePrice: 55, finalPrice: calculateFinalPrice(55), stock: 15 }
      ];

      setProduct({
        title: "Kit Mágico Encanto Kids - Balões de Festa",
        description: "Transforme a festa do seu pequeno em um reino encantado com nosso kit exclusivo. Qualidade premium, cores vibrantes e durabilidade garantida.",
        images: [
          "https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=80"
        ],
        category: "Decoração",
        originalUrl: url,
        variants: mockVariants,
        source: 'Shopee',
        basePrice: mockBasePrice,
        finalPrice: mockFinalPrice
      });
      setError(null);
      setLoading(false);
    }, 1500);
  };

  const saveToFirestore = (published: boolean) => {
    if (!product) return;

    setSaving(true);
    const productsRef = collection(db, 'products');
    
    const newProduct = {
      title: product.title,
      description: product.description,
      price: product.finalPrice,
      images: product.images,
      variants: product.variants,
      category: product.category,
      source: "Shopee",
      profitApplied: true,
      published: published,
      createdAt: serverTimestamp(),
      sourceUrl: product.originalUrl
    };

    addDocumentNonBlocking(productsRef, newProduct)
      .then(() => {
        toast({
          title: published ? "Produto Publicado!" : "Produto Salvo",
          description: `${product.title} foi adicionado ao catálogo.`
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
        <h4 className="text-3xl font-headline font-bold text-foreground">Auto Import Product</h4>
        <p className="text-sm text-muted-foreground italic">Cole o link da Shopee para importar com preços prontos para vender.</p>
      </div>

      <Card className="p-8 border-none bg-white shadow-xl rounded-[2rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <TrendingUp className="h-32 w-32" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="grid gap-3">
            <Label htmlFor="shopee-url" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Paste Shopee link</Label>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30" />
                <Input 
                  id="shopee-url"
                  placeholder="Link do produto shopee..." 
                  className="pl-12 rounded-full h-14 bg-secondary/30 border-none text-foreground focus:ring-2 focus:ring-primary"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={loading || !url}
                className="rounded-full h-14 px-8 font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:scale-105 transition-all"
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                Import Automatically
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex flex-col gap-3 p-6 rounded-2xl bg-secondary/50 border border-primary/10">
              <div className="flex items-start gap-3 text-foreground font-medium text-sm">
                <AlertCircle className="h-5 w-5 text-primary" />
                <p>O serviço automático requer backend. Deseja simular a importação com as regras de preço?</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={simulateImport}
                className="w-fit rounded-full h-10 px-6 font-bold uppercase tracking-widest text-[10px]"
              >
                Simulate Import
              </Button>
            </div>
          )}
        </div>
      </Card>

      {product && (
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Preview Image */}
            <Card className="lg:col-span-5 p-0 border-none bg-white shadow-xl overflow-hidden rounded-[2.5rem] aspect-square relative">
              <Image 
                src={product.images[0]} 
                alt={product.title}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-lg border border-white/50">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Preço Sugerido</p>
                <p className="text-2xl font-bold text-primary">R$ {product.finalPrice.toFixed(2)}</p>
              </div>
            </Card>

            {/* Data & Variants */}
            <Card className="lg:col-span-7 p-10 space-y-8 border-none bg-white shadow-xl rounded-[2.5rem]">
              <div className="space-y-4">
                <Badge className="bg-primary/20 text-primary border-none font-bold py-1 px-4 uppercase tracking-widest text-[10px]">
                  {product.category}
                </Badge>
                <h5 className="text-3xl font-headline font-bold text-foreground leading-tight">
                  {product.title}
                </h5>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 italic">
                  {product.description}
                </p>
              </div>

              {/* Variants Section */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Layers className="h-3 w-3" /> Variations Detected ({product.variants.length})
                </p>
                <div className="grid gap-3">
                  {product.variants.map((variant, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-primary/5">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-foreground">{variant.name}</p>
                        <p className="text-[10px] text-muted-foreground">Estoque: {variant.stock} unidades</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground line-through">R$ {variant.basePrice.toFixed(2)}</p>
                        <p className="text-sm font-bold text-primary">R$ {variant.finalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  className="flex-1 rounded-full h-14 font-bold bg-primary text-primary-foreground uppercase tracking-widest text-[11px]"
                  onClick={() => saveToFirestore(true)}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Publish Product"}
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 rounded-full h-14 font-bold border-primary/20 text-foreground hover:bg-secondary/50 uppercase tracking-widest text-[11px]"
                  onClick={() => saveToFirestore(false)}
                  disabled={saving}
                >
                  Save as Draft
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {!product && !loading && !error && (
        <div className="py-24 flex flex-col items-center justify-center text-center bg-white/40 rounded-[3rem] border-2 border-dashed border-primary/20">
          <Package className="h-16 w-16 text-primary/20 mb-6" />
          <h5 className="text-xl font-headline font-bold text-foreground/40 uppercase tracking-widest">Aguardando Link</h5>
          <p className="text-xs text-muted-foreground mt-2 max-w-xs">Cole um link da Shopee acima para iniciar a automação Encanto Kids.</p>
        </div>
      )}
    </div>
  );
}