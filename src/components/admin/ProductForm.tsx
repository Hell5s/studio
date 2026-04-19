
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
  Palette
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

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

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
        seo: {
          metaTitle: formData.metaTitle || formData.name,
          metaDescription: formData.metaDescription || formData.description,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        },
        createdAt: initialData?.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(productRef, payload, { merge: true });
      toast({ title: "Produto salvo com sucesso!" });
      onSuccess();
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
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
          <p className="text-muted-foreground italic font-light">Gerencie detalhes editoriais e variações visuais.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={onSuccess} className="rounded-full h-12 px-8 uppercase text-[10px] font-bold tracking-widest">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading} className="rounded-full h-12 px-10 bg-primary text-white shadow-xl hover:scale-105 transition-transform uppercase text-[10px] font-bold tracking-widest">
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Produto
          </Button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-10">
          <Card className="p-8 border-none bg-white shadow-premium rounded-[3rem] space-y-8">
            <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
              <Box className="h-5 w-5" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.4em]">Informações Principais</h2>
            </div>
            
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Nome do Produto</Label>
                <Input value={formData.name} onChange={handleNameChange} placeholder="Ex: Vestido Midi Satin Noir" className="rounded-2xl h-14 bg-secondary/20 border-none px-6" />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Categorias Rápidas</Label>
                  <Input value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} placeholder="Vinho, Preto (Legado)" className="rounded-2xl h-14 bg-secondary/20 border-none px-6" />
                </div>
                <div className="grid gap-2">
                  <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Tamanhos</Label>
                  <Input value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} placeholder="P, M, G" className="rounded-2xl h-14 bg-secondary/20 border-none px-6" />
                </div>
              </div>

              {/* Seção de Variações Visuais */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-2 text-accent">
                    <Palette className="h-4 w-4" />
                    <Label className="text-[10px] font-bold uppercase tracking-widest">Variações de Cores Visuais</Label>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleAddVariation} className="h-8 text-accent text-[9px] font-bold uppercase">
                    <Plus className="h-3 w-3 mr-1" /> Add Cor + Imagem
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  {formData.variations.map((v, i) => (
                    <div key={i} className="flex gap-4 items-center bg-secondary/10 p-4 rounded-2xl border border-primary/5">
                      <div className="flex-1 space-y-2">
                        <Input 
                          placeholder="Nome da Cor (ex: Dourado)" 
                          value={v.color} 
                          onChange={e => handleVariationChange(i, 'color', e.target.value)}
                          className="h-10 text-xs bg-white border-none rounded-xl"
                        />
                      </div>
                      <div className="flex-[2] space-y-2">
                        <Input 
                          placeholder="Link da Imagem para esta cor" 
                          value={v.image} 
                          onChange={e => handleVariationChange(i, 'image', e.target.value)}
                          className="h-10 text-xs bg-white border-none rounded-xl"
                        />
                      </div>
                      <button onClick={() => handleRemoveVariation(i)} className="text-red-400 hover:text-red-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between items-center px-4">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Descrição Editorial</Label>
                  <Button variant="ghost" size="sm" onClick={handleAIGenerate} disabled={generatingAI} className="h-8 text-accent text-[9px] font-bold uppercase">
                    {generatingAI ? <Loader2 className="animate-spin h-3 w-3" /> : <Sparkles className="h-3 w-3" />} Melhore com IA
                  </Button>
                </div>
                <Textarea value={formData.longDescription} onChange={e => setFormData({...formData, longDescription: e.target.value})} placeholder="Conte a história desta peça..." className="rounded-[2rem] min-h-[200px] bg-secondary/10 border-none p-6 text-primary/80 italic font-light leading-relaxed" />
              </div>
            </div>
          </Card>

          <Card className="p-8 border-none bg-white shadow-premium rounded-[3rem] space-y-8">
            <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4"><ImageIcon className="h-5 w-5" /><h2 className="text-[11px] font-bold uppercase tracking-[0.4em]">Mídia da Peça</h2></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Imagem Principal</Label>
                <div className={cn("aspect-[3/4] rounded-[2.5rem] border-2 border-dashed border-primary/10 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition-all hover:bg-secondary/20", formData.image && "border-none")} onClick={() => fileInputRef.current?.click()}>
                  {formData.image ? (<><img src={formData.image} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Upload className="h-10 w-10 text-white" /></div></>) : (<div className="text-center space-y-2 p-6"><Upload className="h-10 w-10 text-accent/40 mx-auto" /><p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Upload Capa</p></div>)}
                  {uploading && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => handleUpload(e)} />
              </div>
              <div className="space-y-4">
                <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Galeria de Detalhes</Label>
                <div className="grid grid-cols-2 gap-4">
                  {formData.gallery.map((url, i) => (
                    <div key={i} className="aspect-[3/4] rounded-2xl relative overflow-hidden group"><img src={url} className="w-full h-full object-cover" /><button onClick={() => setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, idx) => idx !== i) }))} className="absolute top-2 right-2 h-8 w-8 bg-white/90 rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><X className="h-4 w-4" /></button></div>
                  ))}
                  <button onClick={() => galleryInputRef.current?.click()} disabled={uploading} className="aspect-[3/4] rounded-2xl border-2 border-dashed border-primary/10 flex flex-col items-center justify-center hover:bg-secondary/20 transition-all text-primary/30 relative">{uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Plus className="h-8 w-8" /><span className="text-[8px] font-bold uppercase tracking-widest mt-2">Add Foto</span>}</button>
                </div>
                <input type="file" ref={galleryInputRef} className="hidden" multiple accept="image/*" onChange={e => handleUpload(e, true)} />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-10">
          <Card className="p-8 border-none bg-primary text-white shadow-xl rounded-[3rem] space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Publicação</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between"><span className="text-xs font-bold">Destaque na Home</span><Switch checked={formData.featured} onCheckedChange={v => setFormData({...formData, featured: v})} /></div>
              <div className="flex items-center justify-between"><span className="text-xs font-bold">Mais Vendido</span><Switch checked={formData.bestseller} onCheckedChange={v => setFormData({...formData, bestseller: v})} /></div>
            </div>
          </Card>
          
          <Card className="p-8 border-none bg-white shadow-premium rounded-[3rem] space-y-6">
            <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4"><TrendingUp className="h-4 w-4" /><h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Valores</h3></div>
            <div className="space-y-4">
              <div className="grid gap-2"><Label className="text-[9px] uppercase font-bold text-muted-foreground ml-2">Preço Loja (R$)</Label><Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="rounded-xl h-12 bg-secondary/10 border-none text-xs" /></div>
              <div className="grid gap-2"><Label className="text-[9px] uppercase font-bold text-muted-foreground ml-2">Preço Antigo (R$)</Label><Input type="number" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} className="rounded-xl h-12 bg-secondary/10 border-none text-xs" /></div>
              <div className="grid gap-2"><Label className="text-[9px] uppercase font-bold text-muted-foreground ml-2">Estoque</Label><Input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="rounded-xl h-12 bg-secondary/10 border-none text-xs" /></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
