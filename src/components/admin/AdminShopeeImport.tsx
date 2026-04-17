
"use client";

import React, { useState } from 'react';
import { ShoppingBag, Link as LinkIcon, Loader2, Search, CheckCircle2, AlertCircle, Image as ImageIcon, Sparkles, Wand2, ArrowRight } from 'lucide-react';
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
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  categorySuggested?: string;
  originalUrl: string;
  origin: 'shopee';
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
      const importShopeeProduct = httpsCallable<any, ShopeeProduct>(functions, 'importShopeeProduct');
      const result = await importShopeeProduct({ url });
      setProduct(result.data);
      toast({
        title: "Sucesso!",
        description: "Dados do produto capturados com sucesso.",
      });
    } catch (err: any) {
      console.error(err);
      // Se a função não existir ou falhar, oferecemos a simulação inteligente
      setError("A conexão com o servidor de busca falhou. Deseja simular a captura deste produto para testar o catálogo?");
    } finally {
      setLoading(false);
    }
  };

  const simulateImport = () => {
    setLoading(true);
    // Simulando um delay de rede
    setTimeout(() => {
      setProduct({
        name: "Vestido Midi Acetinado Toda Bela",
        description: "O Vestido Midi Acetinado é a peça perfeita para quem busca sofisticação e conforto. Com um brilho sutil e caimento impecável, ele valoriza a silhueta feminina de forma elegante. Ideal para eventos sociais, jantares especiais ou ocasiões que pedem um toque de glamour. Possui fenda lateral discreta e alças reguláveis.",
        price: 189.90,
        oldPrice: 259.00,
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
        categorySuggested: "Vestidos",
        originalUrl: url,
        origin: 'shopee'
      });
      setError(null);
      setLoading(false);
      toast({
        title: "Simulação Ativa",
        description: "Capturamos fotos e valores simulados para este link.",
      });
    }, 1200);
  };

  const saveToFirestore = (publish: boolean) => {
    if (!product) return;

    setSaving(true);
    const productsRef = collection(db, 'products');
    
    const newProduct = {
      name: product.name,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice || null,
      image: product.image,
      categoryId: product.categorySuggested?.toLowerCase() || 'geral',
      featured: publish,
      origin: product.origin,
      originalUrl: product.originalUrl,
      createdAt: serverTimestamp(),
      badge: publish ? "Lançamento" : "Importado"
    };

    addDocumentNonBlocking(productsRef, newProduct)
      .then(() => {
        toast({
          title: publish ? "Produto Publicado!" : "Rascunho Salvo!",
          description: `${product.name} agora está no seu banco de dados.`
        });
        setProduct(null);
        setUrl('');
      })
      .finally(() => {
        setSaving(false);
      });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h4 className="text-2xl font-headline font-bold text-primary">Importar da Shopee</h4>
        <p className="text-sm text-muted-foreground">Transforme links da Shopee em produtos na sua vitrine instantaneamente.</p>
      </div>

      <Card className="p-8 border-none bg-white shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShoppingBag className="h-24 w-24" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="grid gap-3">
            <Label htmlFor="shopee-url" className="text-xs font-bold uppercase tracking-widest text-primary/60">Link do Produto Shopee</Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="shopee-url"
                  placeholder="Cole o link aqui (ex: https://shopee.com.br/...)" 
                  className="pl-11 rounded-full h-14 bg-secondary/20 border-primary/10 text-foreground"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={loading || !url}
                className="rounded-full h-14 px-8 font-bold shadow-lg shadow-primary/10 transition-all hover:scale-105"
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
                Puxar Dados
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="flex items-start gap-3 text-primary text-sm font-medium">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>A captura automática via link requer ativação no seu Firebase Console.</p>
                  <p className="text-xs opacity-70">Enquanto isso, você pode usar a simulação para testar fotos e valores.</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={simulateImport}
                className="w-fit rounded-full border-primary/20 text-primary hover:bg-primary/10 h-10 px-6"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Simular Captura deste Link
              </Button>
            </div>
          )}
        </div>
      </Card>

      {product && (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm font-bold text-foreground">Produto Identificado com Sucesso</span>
          </div>

          <Card className="p-0 border-none bg-white shadow-xl overflow-hidden rounded-[2.5rem]">
            <div className="grid lg:grid-cols-2">
              <div className="relative aspect-square lg:aspect-auto bg-muted">
                <Image 
                  src={product.image} 
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-6 left-6 flex gap-2">
                  <Badge className="bg-white/90 text-primary border-none font-bold py-1.5 px-3">
                    Shopee
                  </Badge>
                  <Badge className="bg-primary text-white border-none font-bold py-1.5 px-3">
                    Foto capturada
                  </Badge>
                </div>
              </div>

              <div className="p-8 lg:p-12 space-y-8 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <Badge variant="secondary" className="mb-4 bg-primary/5 text-primary border-none font-bold">
                      {product.categorySuggested || 'Feminino'}
                    </Badge>
                    <h5 className="text-3xl font-headline font-bold text-foreground leading-tight">
                      {product.name}
                    </h5>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold text-primary">R$ {product.price.toFixed(2)}</span>
                    {product.oldPrice && (
                      <span className="text-lg text-muted-foreground line-through decoration-primary/20">
                        R$ {product.oldPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary/60 flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" /> Descrição Encontrada
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6 italic">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-primary/5">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-full h-14 font-bold border-primary/20 text-primary hover:bg-secondary"
                    onClick={() => saveToFirestore(false)}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Salvar Rascunho"}
                  </Button>
                  <Button 
                    className="flex-1 rounded-full h-14 font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
                    onClick={() => saveToFirestore(true)}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Publicar na Loja
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {!product && !loading && !error && (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
            <ImageIcon className="h-10 w-10 text-primary/30" />
          </div>
          <p className="max-w-xs text-sm font-medium text-muted-foreground">Insira o link da Shopee acima para ver a mágica acontecer.</p>
        </div>
      )}
    </div>
  );
}
