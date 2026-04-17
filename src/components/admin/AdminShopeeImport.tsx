
"use client";

import React, { useState } from 'react';
import { ShoppingBag, Link as LinkIcon, Loader2, Search, CheckCircle2, AlertCircle, Image as ImageIcon, Sparkles, Wand2, ArrowRight, Package } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useFirebase, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
        title: "Invalid URL",
        description: "Please paste a valid Shopee product link.",
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
      
      // Map to the internal interface
      const data = result.data;
      setProduct({
        title: data.title || data.name,
        description: data.description,
        price: data.price,
        oldPrice: data.oldPrice,
        images: data.images || [data.image],
        category: data.category || 'Kids',
        originalUrl: url,
        source: 'Shopee'
      });
      
      toast({
        title: "Success!",
        description: "Product data retrieved successfully.",
      });
    } catch (err: any) {
      console.error(err);
      setError("Cloud function failed. Do you want to simulate this import for testing?");
    } finally {
      setLoading(false);
    }
  };

  const simulateImport = () => {
    setLoading(true);
    // Simulating the 2-3s import speed as requested
    setTimeout(() => {
      setProduct({
        title: "Kit Balões Frozen Festa Infantil",
        description: "Kit completo decoração infantil temática Frozen. Ideal para festas de aniversário, contendo 50 balões de alta qualidade com estampas exclusivas.",
        price: 29.90,
        oldPrice: 45.00,
        images: [
          "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80"
        ],
        category: "Decoração",
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
      name: product.title, // keeping 'name' for internal UI compatibility but mapping from 'title'
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
      badge: "Shopee Import"
    };

    addDocumentNonBlocking(productsRef, newProduct)
      .then(() => {
        toast({
          title: "Product successfully imported and published.",
          description: `${product.title} is now live in your store.`
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
        <h4 className="text-2xl font-headline font-bold text-primary">Import Product by Link</h4>
        <p className="text-sm text-muted-foreground">Easily add dropshipping products from Shopee to your Encanto Kids store.</p>
      </div>

      <Card className="p-8 border-none bg-white shadow-xl rounded-[2rem] overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Package className="h-24 w-24 text-primary" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="grid gap-3">
            <Label htmlFor="shopee-url" className="text-xs font-bold uppercase tracking-widest text-primary/60">Import product from Shopee</Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="shopee-url"
                  placeholder="Paste Shopee product link here" 
                  className="pl-11 rounded-full h-14 bg-secondary/30 border-none text-foreground"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={loading || !url}
                className="rounded-full h-14 px-8 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105"
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                Import Product
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex flex-col gap-4 p-6 rounded-3xl bg-amber-50 border border-amber-100">
              <div className="flex items-start gap-3 text-amber-700 text-sm font-medium">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>Direct scraping requires the Cloud Function to be active.</p>
                  <p className="text-xs opacity-70">Use the simulation to test the full import flow (2-3s speed).</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={simulateImport}
                className="w-fit rounded-full border-amber-200 text-amber-700 hover:bg-amber-100 h-10 px-6"
              >
                Simulate Shopee Import
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
            <span className="text-sm font-bold text-foreground">Import Preview</span>
          </div>

          <Card className="p-0 border-none bg-white shadow-2xl overflow-hidden rounded-[2.5rem]">
            <div className="grid lg:grid-cols-2">
              <div className="relative aspect-square lg:aspect-auto bg-muted">
                <Image 
                  src={product.images[0]} 
                  alt={product.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-6 left-6 flex gap-2">
                  <Badge className="bg-white/90 text-primary border-none font-bold py-1.5 px-3">
                    {product.source}
                  </Badge>
                  <Badge className="bg-brand-gold text-white border-none font-bold py-1.5 px-3">
                    Auto-Extracted
                  </Badge>
                </div>
                
                {/* Image Gallery Preview Overlay */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-6 left-6 flex gap-2">
                    {product.images.slice(0, 3).map((img, idx) => (
                      <div key={idx} className="h-12 w-12 rounded-lg overflow-hidden border-2 border-white shadow-sm">
                        <img src={img} className="h-full w-full object-cover" />
                      </div>
                    ))}
                    {product.images.length > 3 && (
                      <div className="h-12 w-12 rounded-lg bg-black/50 text-white flex items-center justify-center text-xs font-bold border-2 border-white">
                        +{product.images.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-8 lg:p-12 space-y-8 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-none font-bold">
                      {product.category}
                    </Badge>
                    <h5 className="text-3xl font-headline font-bold text-foreground leading-tight">
                      {product.title}
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
                      <ArrowRight className="h-3 w-3" /> Description
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6 italic">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="pt-8 border-t border-primary/5">
                  <Button 
                    className="w-full rounded-full h-16 font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-lg"
                    onClick={saveToFirestore}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                    Confirm & Publish Product
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {!product && !loading && !error && (
        <div className="py-24 flex flex-col items-center justify-center text-center bg-white/50 rounded-[3rem] border-2 border-dashed border-primary/10">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <ImageIcon className="h-10 w-10 text-primary" />
          </div>
          <p className="max-w-xs text-sm font-medium text-muted-foreground">The product grid will update automatically after import.</p>
        </div>
      )}
    </div>
  );
}
