
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  Loader2, 
  Upload, 
  Sparkles, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Box, 
  Globe,
  ImageIcon,
  X,
  Palette,
  Image as ImageIconLucide
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { cn } from '@/lib/utils';
import { adminGenerateProductDescription } from '@/ai/flows/admin-generate-product-description-flow';

interface ProductFormProps {
  initialData?: any;
  onSuccess: () => void;
}

export function ProductForm({ initialData, onSuccess }: ProductFormProps) {
  const db = useFirestore();
  const { storage } = useFirebase();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const variationInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [activeVariationIndex, setActiveVariationIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    longDescription: '',
    category: 'Vestidos',
    subcategory: '',
    brand: 'Toda Bela',
    sku: '',
    price: '',
    oldPrice: '',
    cost: '',
    stock: '10',
    weight: '0.3',
    height: '2',
    width: '15',
    length: '20',
    shippingTime: '10-20 dias',
    status: 'active',
    featured: false,
    bestseller: false,
    sourceUrl: '',
    vendorName: '',
    originalPrice: '',
    image: '',
    gallery: [] as string[],
    variations: [] as { color: string; image: string }[],
    metaTitle: '',
    metaDescription: '',
    tags: '',
    colors: '',
    sizes: 'P, M, G, GG'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        price: initialData.price?.toString() || '',
        oldPrice: initialData.oldPrice?.toString() || '',
        cost: initialData.cost?.toString() || '',
        stock: initialData.stock?.toString() || '',
        originalPrice: initialData.originalPrice?.toString() || '',
        tags: initialData.seo?.tags?.join(', ') || '',
        metaTitle: initialData.seo?.metaTitle || '',
        metaDescription: initialData.seo?.metaDescription || '',
        gallery: initialData.images || [],
        variations: initialData.variations || [],
        colors: initialData.colors?.join(', ') || '',
        sizes: initialData.sizes?.join(', ') || 'P, M, G, GG'
      });
    }
  }, [initialData]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }));
  };

  const handleAddVariation = () => {
    setFormData(prev => ({
      ...prev,
      variations: [...prev.variations, { color: '', image: '' }]
    }));
  };

  const handleVariationChange = (index: number, field: string, value: string) => {
    const newVars = [...formData.variations];
    newVars[index] = { ...newVars[index], [field]: value };
    setFormData({ ...formData, variations: newVars });
  };

  const handleRemoveVariation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = ref(storage!, `products/${Date.now()}-${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(url);
      }
      if (isGallery) {
        setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...uploadedUrls] }));
      } else {
        setFormData(prev => ({ ...prev, image: uploadedUrls[0] }));
      }
      toast({ title: "Upload concluído" });
    } catch (error: any) {
      toast({ title: "Erro no upload", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleVariationUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeVariationIndex === null) return;
    
    setUploading(true);
    try {
      const storageRef = ref(storage!, `products/variations/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      
      handleVariationChange(activeVariationIndex, 'image', url);
      toast({ title: "Foto da cor carregada!" });
    } catch (error: any) {
      toast({ title: "Erro no upload da variação", variant: "destructive" });
    } finally {
      setUploading(false);
      setActiveVariationIndex(null);
      e.target.value = '';
    }
  };

  const handleAIGenerate = async () => {
    if (!formData.name || !formData.price) {
      toast({ title: "Preencha nome e preço", variant: "destructive" });
      return;
    }
    setGeneratingAI(true);
    try {
      const res = await adminGenerateProductDescription({
        productName: formData.name,
        category: formData.category,
        price: `R$ ${formData.price}`,
        keyFeatures: [formData.brand, formData.shippingTime]
      });
      setFormData(prev => ({ 
        ...prev, 
        longDescription: res.description,
        description: res.description.split('.')[0] + '.'
      }));
      toast({ title: "Descrição gerada!" });
    } catch (e) {
      toast({ title: "Erro na IA", variant: "destructive" });
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSave = async () => {
    const finalMainImage = formData.image || (formData.gallery.length > 0 ? formData.gallery[0] : '');
    if (!formData.name || !formData.price || !finalMainImage) {
      toast({ title: "Campos obrigatórios", description: "Preencha nome, preço e imagem.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const id = initialData?.id || `prod-${Date.now()}`;
      const productRef = doc(db, 'products', id);

      const payload = {
        ...formData,
        id,
        price: parseFloat(formData.price),
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
        cost: parseFloat(formData.cost) || 0,
        stock: parseInt(formData.stock),
        image: finalMainImage,
        images: formData.gallery.length > 0 ? formData.gallery : [finalMainImage],
        colors: formData.colors.split(',').map(c => c.trim()).filter(Boolean),
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
        createdAt: initialData?.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(productRef, payload, { merge: true });
      toast({ title: "Produto salvo!" });
      onSuccess();
    } catch (e: any) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary tracking-tighter">
            {initialData ? 'Editar Peça' : 'Novo Item da Boutique'}
          </h1>
          <p className="text-muted-foreground italic font-light">Gestão visual de cores e detalhes editoriais.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={onSuccess} className="rounded-full h-12 px-8 uppercase text-[10px] font-bold tracking-widest">Cancelar</Button>
          <Button onClick={handleSave} disabled={loading} className="rounded-full h-12 px-10 bg-primary text-white shadow-xl hover:scale-105 transition-transform uppercase text-[10px] font-bold tracking-widest">
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} Salvar Produto
          </Button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-10">
          <Card className="p-8 border-none bg-white shadow-premium rounded-[3rem] space-y-10">
            {/* 1. IDENTIDADE */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4"><Box className="h-5 w-5" /><h2 className="text-[11px] font-bold uppercase tracking-[0.4em]">Informações Principais</h2></div>
              <div className="grid gap-6">
                <div className="grid gap-2"><Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Nome do Produto</Label><Input value={formData.name} onChange={handleNameChange} className="rounded-2xl h-14 bg-secondary/20 border-none px-6" /></div>
                <div className="grid md:grid-cols-2 gap-6">
                   <div className="grid gap-2"><Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Coleção</Label><Input value={formData.collection} onChange={e => setFormData({...formData, collection: e.target.value})} className="rounded-2xl h-14 bg-secondary/20 border-none px-6" /></div>
                   <div className="grid gap-2"><Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Tamanhos</Label><Input value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} className="rounded-2xl h-14 bg-secondary/20 border-none px-6" /></div>
                </div>
              </div>
            </div>

            {/* 2. VARIAÇÕES DE CORES (LISTA VISÍVEL) */}
            <div className="space-y-6 bg-[#FFF9F7] p-8 rounded-[2.5rem] border border-primary/5 shadow-sm">
              <input 
                type="file" 
                ref={variationInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleVariationUpload} 
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-accent">
                  <Palette className="h-5 w-5" />
                  <h4 className="text-[11px] font-bold uppercase tracking-widest">Miniaturas por Cor (Clique p/ Upload)</h4>
                </div>
                <Button variant="ghost" size="sm" onClick={handleAddVariation} className="h-8 text-accent text-[9px] font-bold uppercase border border-accent/20 px-4 rounded-full">Nova Cor</Button>
              </div>
              <div className="grid gap-4">
                {formData.variations.map((v, i) => (
                  <div key={i} className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-primary/5 shadow-sm">
                    <div 
                      className="h-16 w-12 rounded-lg overflow-hidden bg-secondary/10 flex-shrink-0 relative cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => { setActiveVariationIndex(i); variationInputRef.current?.click(); }}
                    >
                      {v.image ? <img src={v.image} className="h-full w-full object-cover" /> : <div className="h-full w-full flex flex-col items-center justify-center opacity-30"><Upload className="h-4 w-4" /><span className="text-[6px] font-bold uppercase">Foto</span></div>}
                      {uploading && activeVariationIndex === i && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>}
                    </div>
                    <Input placeholder="Nome da Cor" value={v.color} onChange={e => handleVariationChange(i, 'color', e.target.value)} className="h-12 text-xs bg-secondary/10 border-none rounded-xl px-4 flex-1" />
                    <Input placeholder="Link da imagem" value={v.image} onChange={e => handleVariationChange(i, 'image', e.target.value)} className="h-12 text-xs bg-secondary/10 border-none rounded-xl px-4 flex-[2]" />
                    <button onClick={() => handleRemoveVariation(i)} className="text-red-300 hover:text-red-500 transition-colors p-2"><X className="h-5 w-5" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. EDITORIAL */}
            <div className="space-y-6">
               <div className="flex justify-between items-center px-4">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Descrição Editorial</Label>
                  <Button variant="ghost" size="sm" onClick={handleAIGenerate} disabled={generatingAI} className="h-8 text-accent text-[9px] font-bold uppercase"><Sparkles className="h-3 w-3 mr-1" /> IA</Button>
                </div>
                <Textarea value={formData.longDescription} onChange={e => setFormData({...formData, longDescription: e.target.value})} placeholder="Conte a história desta peça..." className="rounded-[2rem] min-h-[200px] bg-secondary/10 border-none p-6" />
            </div>
          </Card>
        </div>

        <div className="space-y-10">
           <Card className="p-8 border-none bg-white shadow-premium rounded-[3rem] space-y-6">
            <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4"><TrendingUp className="h-4 w-4" /><h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Valores</h3></div>
            <div className="space-y-4">
              <div className="grid gap-2"><Label className="text-[9px] uppercase font-bold text-muted-foreground ml-2">Preço de Venda (R$)</Label><Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="rounded-xl h-12 bg-secondary/10 border-none" /></div>
              <div className="grid gap-2"><Label className="text-[9px] uppercase font-bold text-muted-foreground ml-2">Preço Original / "De" (R$)</Label><Input type="number" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} className="rounded-xl h-12 bg-secondary/10 border-none" /></div>
              <div className="grid gap-2"><Label className="text-[9px] uppercase font-bold text-muted-foreground ml-2">Estoque</Label><Input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="rounded-xl h-12 bg-secondary/10 border-none" /></div>
            </div>
          </Card>

          <Card className="p-8 border-none bg-white shadow-premium rounded-[3rem] space-y-6">
            <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4"><ImageIcon className="h-5 w-5" /><h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Capa da Peça</h3></div>
            <div className={cn("aspect-[3/4] rounded-[2rem] border-2 border-dashed border-primary/10 relative overflow-hidden group cursor-pointer", formData.image && "border-none")} onClick={() => fileInputRef.current?.click()}>
               {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center"><Upload className="h-10 w-10 text-accent/20" /></div>}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => handleUpload(e)} />
          </Card>
        </div>
      </div>
    </div>
  );
}

