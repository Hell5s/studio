
"use client";

import React, { useState } from 'react';
import { ShoppingBag, Link as LinkIcon, Loader2, Search, CheckCircle2, AlertCircle, Image as ImageIcon, Sparkles, ArrowRight, Package, TrendingUp, DollarSign } from 'lucide-react';
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
  originalPrice: number; // Preço na Shopee
  price: number; // Preço de venda calculado
  oldPrice?: number; // Preço "riscado" calculado
  images: string[];
  category: string;
  originalUrl: string;
  margin: number;
  profit: number;
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

  // Regra de Preço Inteligente (Dropshipping)
  const calculateDropshippingPrice = (originalPrice: number) => {
    let margin = 1.0;
    
    if (originalPrice < 50) margin = 2.5;
    else if (originalPrice >= 50 && originalPrice < 100) margin = 2.2;
    else if (originalPrice >= 100 && originalPrice < 200) margin = 2.0;
    else margin = 1.8;

    const rawPrice = originalPrice * margin;
    
    // Arredondamento Psicológico: 147 -> 149.90
    // Lógica: Teto para a dezena mais próxima - 0.10
    const adjustedPrice = Math.ceil(rawPrice / 10) * 10 - 0.10;
    
    // Preço Antigo (Fake Desconto)
    const oldPrice = adjustedPrice * 1.3;
    
    // Lucro Estimado
    const profit = adjustedPrice - originalPrice;

    return { adjustedPrice, oldPrice, margin, profit };
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
      const pricing = calculateDropshippingPrice(data.price);

      setProduct({
        title: data.title || data.name,
        description: data.description,
        originalPrice: data.price,
        price: pricing.adjustedPrice,
        oldPrice: pricing.oldPrice,
        margin: pricing.margin,
        profit: pricing.profit,
        images: data.images || [data.image],
        category: data.category || 'Vestidos',
        originalUrl: url,
        source: 'Shopee'
      });
      
      toast({
        title: "Sucesso!",
        description: "Dados do produto recuperados com precificação automática.",
      });
    } catch (err: any) {
      setError("A função de busca automática requer configuração no Firebase Console. Use a simulação para validar as regras de preço.");
    } finally {
      setLoading(false);
    }
  };

  const simulateImport = () => {
    setLoading(true);
    setTimeout(() => {
      // Simulação de um produto de R$ 62,00 (Exemplo do prompt)
      const mockOriginalPrice = 62.00;
      const pricing = calculateDropshippingPrice(mockOriginalPrice);

      setProduct({
        title: "Vestido Midi Satin Luxury - Coleção Dropshipping",
        description: "Vestido em cetim premium com toque de seda. Peça importada com acabamento de alta costura, ideal para eventos sofisticados. Caimento fluido que valoriza a silhueta com elegância atemporal.",
        originalPrice: mockOriginalPrice,
        price: pricing.adjustedPrice,
        oldPrice: pricing.oldPrice,
        margin: pricing.margin,
        profit: pricing.profit,
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
    }, 1500);
  };

  const saveToFirestore = (status: 'published' | 'draft') => {
    if (!product) return;

    setSaving(true);
    const productsRef = collection(db, 'products');
    
    const newProduct = {
      name: product.title,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice,
      image: product.images[0],
      images: product.images,
      categoryId: product.category.toLowerCase(),
      category: product.category,
      featured: false,
      badge: status === 'published' ? "Oferta" : "Rascunho",
      status: status,
      published: status === 'published',
      source: "shopee",
      sourceUrl: product.originalUrl,
      originalPrice: product.originalPrice,
      profitMargin: product.margin,
      estimatedProfit: product.profit,
      createdAt: serverTimestamp()
    };

    addDocumentNonBlocking(productsRef, newProduct)
      .then(() => {
        toast({
          title: status === 'published' ? "Produto publicado com sucesso!" : "Salvo como rascunho",
          description: `${product.title} foi adicionado ao seu catálogo.`
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
        <h4 className="text-3xl font-headline font-bold text-brand-wine">Importar Produto</h4>
        <p className="text-sm text-brand-wine/40 italic font-light">Cole o link da Shopee para precificação automática com lucro garantido.</p>
      </div>

      <Card className="p-10 border-none bg-white shadow-2xl rounded-[3rem] overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-5">
          <TrendingUp className="h-32 w-32 text-brand-wine" />
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="grid gap-4">
            <Label htmlFor="shopee-url" className="text-[11px] font-bold uppercase tracking-[0.4em] text-brand-wine/40 ml-2">Link do Produto Shopee</Label>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-wine/20" />
                <Input 
                  id="shopee-url"
                  placeholder="https://shopee.com.br/produto-exemplo..." 
                  className="pl-14 rounded-full h-16 bg-brand-blush/20 border-none text-brand-wine text-lg focus:ring-2 focus:ring-brand-gold/20"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={loading || !url}
                className="rounded-full h-16 px-10 font-bold text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-brand-wine/10 bg-brand-wine text-white transition-all hover:scale-105"
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                Importar Produto
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex flex-col gap-4 p-8 rounded-[2.5rem] bg-brand-blush/50 border border-brand-wine/5 animate-in slide-in-from-top-4">
              <div className="flex items-start gap-4 text-brand-wine font-medium">
                <AlertCircle className="h-6 w-6 shrink-0 text-brand-gold" />
                <div className="space-y-1">
                  <p className="text-sm">O serviço de captura automática requer implementação no Firebase Functions.</p>
                  <p className="text-xs opacity-70 italic font-light">Deseja simular a captura deste link com a Regra de Preço Automática?</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={simulateImport}
                className="w-fit rounded-full border-brand-wine/20 text-brand-wine hover:bg-white h-12 px-8 font-bold uppercase tracking-widest text-[10px]"
              >
                Simular Captura e Precificação
              </Button>
            </div>
          )}
        </div>
      </Card>

      {product && (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-wine/60">Análise de Lucro Concluída</span>
            </div>
            <Badge className="bg-brand-gold text-white border-none font-bold py-2 px-6 rounded-full uppercase tracking-widest text-[10px]">
              Markup {product.margin}x
            </Badge>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Imagem Preview */}
            <Card className="lg:col-span-5 p-0 border-none bg-white shadow-2xl overflow-hidden rounded-[4rem] aspect-square relative">
              <Image 
                src={product.images[0]} 
                alt={product.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-wine/40 to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 flex gap-4">
                <div className="flex-1 bg-white/90 backdrop-blur p-5 rounded-3xl shadow-xl text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-wine/40 mb-1">Preço Shopee</p>
                  <p className="text-xl font-bold text-brand-wine/60">R$ {product.originalPrice.toFixed(2)}</p>
                </div>
                <div className="flex-1 bg-brand-wine text-white p-5 rounded-3xl shadow-xl text-center border border-white/20">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Preço Toda Bela</p>
                  <p className="text-xl font-bold text-brand-gold">R$ {product.price.toFixed(2)}</p>
                </div>
              </div>
            </Card>

            {/* Dados e Lucro */}
            <Card className="lg:col-span-7 p-12 space-y-10 border-none bg-white shadow-2xl rounded-[4rem] flex flex-col justify-between">
              <div className="space-y-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Badge variant="secondary" className="bg-brand-blush text-brand-wine border-none font-bold uppercase tracking-[0.4em] text-[10px] px-5 py-2 rounded-full">
                      {product.category}
                    </Badge>
                    <h5 className="text-4xl font-headline font-bold text-brand-wine leading-tight">
                      {product.title}
                    </h5>
                  </div>
                </div>

                {/* Bloco de Lucro Destacado */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-8 rounded-[2.5rem] bg-brand-blush/30 border border-brand-wine/5 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-wine/40 flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" /> Lucro Bruto
                    </p>
                    <p className="text-4xl font-bold text-brand-wine">R$ {product.profit.toFixed(2)}</p>
                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-tighter">Margem de Seguranca inclusa</p>
                  </div>
                  <div className="p-8 rounded-[2.5rem] bg-brand-gold/10 border border-brand-gold/10 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-wine/40 flex items-center gap-2">
                      <DollarSign className="h-3 w-3" /> Preço Antigo
                    </p>
                    <p className="text-4xl font-bold text-brand-wine/30 line-through">R$ {product.oldPrice?.toFixed(2)}</p>
                    <p className="text-[10px] text-brand-gold font-bold uppercase tracking-tighter">Valor de Ancoragem</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-wine/30 flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" /> Resumo do Produto
                  </p>
                  <p className="text-sm text-brand-wine/60 leading-relaxed italic font-light line-clamp-4">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="pt-10 border-t border-brand-wine/5 flex flex-col sm:flex-row gap-4">
                <Button 
                  className="flex-1 rounded-full h-16 font-bold shadow-xl shadow-brand-wine/20 bg-brand-wine hover:bg-brand-plum text-white uppercase tracking-[0.2em] text-[11px]"
                  onClick={() => saveToFirestore('published')}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  Publicar Direto
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 rounded-full h-16 font-bold border-brand-wine/20 text-brand-wine hover:bg-brand-blush/20 uppercase tracking-[0.2em] text-[11px]"
                  onClick={() => saveToFirestore('draft')}
                  disabled={saving}
                >
                  Salvar Rascunho
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {!product && !loading && !error && (
        <div className="py-32 flex flex-col items-center justify-center text-center bg-white/40 rounded-[5rem] border-2 border-dashed border-brand-wine/10">
          <div className="h-24 w-24 rounded-full bg-brand-blush/50 flex items-center justify-center mb-8">
            <Package className="h-12 w-12 text-brand-wine/20" />
          </div>
          <h5 className="text-xl font-headline font-bold text-brand-wine/30 uppercase tracking-widest mb-2">Aguardando Link</h5>
          <p className="max-w-xs text-[10px] uppercase tracking-widest font-bold text-brand-wine/20 leading-relaxed">
            Cole um link da Shopee acima para iniciar o processo de importação inteligente.
          </p>
        </div>
      )}
    </div>
  );
}
