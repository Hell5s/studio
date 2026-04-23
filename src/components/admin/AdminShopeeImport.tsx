
"use client";

import React, { useState } from 'react';
import { ShoppingBag, Link as LinkIcon, Loader2, Search, AlertCircle, Image as ImageIcon, Sparkles, Package, DollarSign, Layers } from 'lucide-react';
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
  image?: string;
  sku?: string;
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
      
      const variants: ShopeeVariant[] = (data.variants || []).map((v: any) => ({
        name: v.name,
        basePrice: v.price,
        finalPrice: calculateFinalPrice(v.price),
        stock: v.stock || 100,
        image: v.image,
        sku: v.sku
      }));

      const mainBasePrice = data.price;
      const mainFinalPrice = calculateFinalPrice(mainBasePrice);

      setProduct({
        title: data.title || data.name,
        description: data.description,
        images: data.images || [data.image],
        category: data.category || 'Vestidos',
        originalUrl: url,
        variants: variants,
        source: 'Shopee',
        basePrice: mainBasePrice,
        finalPrice: mainFinalPrice
      });
      
      toast({
        title: "Dados capturados!",
        description: "Preços calculados com sucesso.",
      });
    } catch (err: any) {
      setError("Função de backend não detectada. Deseja simular a importação para testar a lógica de preços?");
    } finally {
      setLoading(false);
    }
  };

  const simulateImport = () => {
    setLoading(true);
    setTimeout(() => {
      const mockBasePrice = 62.00;
      const mockFinalPrice = calculateFinalPrice(mockBasePrice);
      
      const mockVariants: ShopeeVariant[] = [
        { name: "P - Rose", basePrice: 62, finalPrice: mockFinalPrice, stock: 15, sku: "TB-V-01" },
        { name: "M - Rose", basePrice: 62, finalPrice: mockFinalPrice, stock: 20, sku: "TB-V-02" },
        { name: "G - Rose", basePrice: 62, finalPrice: mockFinalPrice, stock: 10, sku: "TB-V-03" }
      ];

      setProduct({
        title: "Vestido Midi Satin Rouge - Coleção Boutique",
        description: "Elegância e sofisticação em cetim premium. Um corte que valoriza a silhueta feminina com o toque de luxo que a mulher Toda Bela merece.",
        images: [
          "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80"
        ],
        category: "Vestidos",
        originalUrl: url,
        variants: mockVariants,
        source: 'Shopee',
        basePrice: mockBasePrice,
        finalPrice: mockFinalPrice
      });
      setError(null);
      setLoading(false);
      toast({
        title: "Simulação Ativa",
        description: "Produto gerado com as regras de preço da Toda Bela.",
      });
    }, 1200);
  };

  const saveToFirestore = (published: boolean) => {
    if (!product) return;

    setSaving(true);
    const productsRef = collection(db, 'products');
    
    const newProduct = {
      name: product.title,
      description: product.description,
      price: product.finalPrice,
      oldPrice: product.finalPrice * 1.3,
      image: product.images[0],
      images: product.images,
      variants: product.variants,
      category: product.category,
      source: "Shopee",
      sourceUrl: product.originalUrl,
      published: published,
      createdAt: serverTimestamp(),
      badge: published ? "Destaque" : null,
      featured: false
    };

    addDocumentNonBlocking(productsRef, newProduct);
    
    toast({
      title: published ? "Produto Publicado!" : "Salvo como Rascunho",
      description: `${product.title} foi adicionado ao catálogo.`,
    });
    
    setProduct(null);
    setUrl('');
    setSaving(false);
  };

  const estimatedProfit = product ? product.finalPrice - product.basePrice : 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h4 className="text-3xl font-headline font-bold text-primary">Importar Produto Shopee</h4>
        <p className="text-sm text-muted-foreground italic font-light">Cole o link do fornecedor para calcular margens e publicar automaticamente.</p>
      </div>

      <Card className="p-10 border-none bg-white shadow-2xl rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
          <ShoppingBag className="h-40 w-40" />
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="grid gap-4">
            <Label htmlFor="shopee-url" className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent ml-6">Link da Shopee</Label>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-accent/40" />
                <Input 
                  id="shopee-url"
                  placeholder="https://shopee.com.br/produto-exemplo..." 
                  className="pl-14 rounded-full h-16 bg-secondary/20 border-none text-primary focus:ring-2 focus:ring-primary/20"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button 
                onClick={handleSearch} 
                disabled={loading || !url}
                className="rounded-full h-16 px-10 font-bold uppercase tracking-widest text-[10px] bg-primary text-primary-foreground hover:scale-105 transition-all shadow-xl shadow-primary/20"
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                Importar Produto
              </button>
            </div>
          </div>

          {error && (
            <div className="flex flex-col gap-4 p-8 rounded-[2rem] bg-accent/5 border border-accent/10 animate-in zoom-in-95">
              <div className="flex items-start gap-4 text-primary font-medium text-sm">
                <AlertCircle className="h-6 w-6 text-accent shrink-0" />
                <p className="leading-relaxed">{error}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={simulateImport}
                className="w-fit rounded-full h-12 px-8 font-bold uppercase tracking-widest text-[9px] border-accent/20 hover:bg-white"
              >
                Simular Importação com Margens
              </Button>
            </div>
          )}
        </div>
      </Card>

      {product && (
        <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-1000">
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Visual Preview */}
            <Card className="lg:col-span-5 p-0 border-none bg-white shadow-2xl overflow-hidden rounded-[4rem] aspect-[3/4] relative group">
              <Image 
                src={product.images[0]} 
                alt={product.title}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-8 left-8 right-8 glass p-6 rounded-[2.5rem] shadow-2xl border-white/40">
                <p className="text-[10px] font-bold uppercase text-accent mb-2 tracking-widest">Lucro Bruto Estimado</p>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <p className="text-3xl font-bold text-primary">R$ {estimatedProfit.toFixed(2)}</p>
                </div>
              </div>
            </Card>

            {/* Product Details & Variations */}
            <Card className="lg:col-span-7 p-12 space-y-10 border-none bg-white shadow-2xl rounded-[4rem]">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <Badge className="bg-accent/10 text-accent border-none font-bold py-2 px-5 uppercase tracking-widest text-[9px] rounded-full">
                    {product.category}
                  </Badge>
                  <div className="text-right">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest mb-1">Preço Original</p>
                    <p className="text-sm font-medium text-muted-foreground line-through italic">R$ {product.basePrice.toFixed(2)}</p>
                  </div>
                </div>
                <h5 className="text-4xl font-headline font-bold text-primary leading-tight">
                  {product.title}
                </h5>
                <p className="text-base text-muted-foreground leading-relaxed italic font-light">
                  {product.description}
                </p>
              </div>

              {/* Variations Grid */}
              <div className="space-y-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent flex items-center gap-3">
                  <Layers className="h-4 w-4" /> Variações Detectadas ({product.variants.length})
                </p>
                <div className="grid gap-4">
                  {product.variants.map((variant, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 rounded-[2rem] bg-secondary/30 border border-primary/5 hover:bg-white hover:shadow-lg transition-all duration-500">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-muted overflow-hidden">
                          {variant.image ? (
                            <img src={variant.image} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-full w-full p-3 text-muted-foreground/20" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-primary">{variant.name}</p>
                          <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Estoque: {variant.stock}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">R$ {variant.finalPrice.toFixed(2)}</p>
                        <p className="text-[9px] text-accent uppercase font-bold tracking-widest">Venda Sugerida</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-10">
                <button 
                  className="flex-1 rounded-full h-16 font-bold bg-primary text-primary-foreground uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  onClick={() => saveToFirestore(true)}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : "Publicar na Vitrine"}
                </button>
                <button 
                  className="flex-1 rounded-full h-16 font-bold border-primary/10 text-primary hover:bg-secondary/50 uppercase tracking-widest text-[10px] transition-all"
                  onClick={() => saveToFirestore(false)}
                  disabled={saving}
                >
                  Salvar como Rascunho
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {!product && !loading && !error && (
        <div className="py-32 flex flex-col items-center justify-center text-center space-y-8 bg-white/40 rounded-[4rem] border-2 border-dashed border-primary/10">
          <div className="h-24 w-24 rounded-full bg-secondary/50 flex items-center justify-center text-primary/20">
            <Package className="h-12 w-12" />
          </div>
          <div className="space-y-2">
            <h5 className="text-xl font-headline font-bold text-primary/40 uppercase tracking-widest">Aguardando Importação</h5>
            <p className="text-xs text-muted-foreground max-w-xs font-light italic">Insira um link da Shopee acima para iniciar a automação do seu estoque.</p>
          </div>
        </div>
      )}
    </div>
  );
}
