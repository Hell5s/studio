
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
  Image as ImageIcon,
  X,
  Palette,
  Image as ImageIconLucide,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { adminGenerateProductDescription } from '@/ai/flows/admin-generate-product-description-flow';

interface ProductFormProps {
  initialData?: any;
  onSuccess: () => void;
}

export function ProductForm({ initialData, onSuccess }: ProductFormProps) {
  const db = useFirestore();
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

  const uploadToCloudinary = async (file: File) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'todabela_upload');
    
    const response = await fetch('https://api.cloudinary.com/v1_1/djtuzexfd/image/upload', {
      method: 'POST',
      body: data
    });

    if (!response.ok) throw new Error('Falha no upload para o Cloudinary');
    const result = await response.json();
    return result.secure_url;
  };

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
        const url = await uploadToCloudinary(file);
        uploadedUrls.push(url);
      }
      if (isGallery) {
        setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...uploadedUrls] }));
      } else {
        setFormData(prev => ({ ...prev, image: uploadedUrls[0] }));
      }
      toast({ title: "Upload Cloudinary concluído" });
    } catch (error: any) {
      toast({ title: "Erro no upload Cloudinary", variant: "destructive" });
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
      const url = await uploadToCloudinary(file);
      handleVariationChange(activeVariationIndex, 'image', url);
      toast({ title: "Variação salva no Cloudinary!" });
    } catch (error: any) {
      toast({ title: "Erro no upload Cloudinary", variant: "destructive" });
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

  const handleCalculateIA = () => {
    const cost = parseFloat(formData.cost);
    if (isNaN(cost)) {
      toast({ title: "Custo inválido", variant: "destructive" });
      return;
    }
    
    const price = (Math.ceil(cost * 3) - 0.10).toFixed(2);
    const oldPrice = (Math.ceil(cost * 4) - 0.10).toFixed(2);
    
    setFormData({
      ...formData,
      price,
      oldPrice
    });
    
    toast({ title: "Preços calculados!", description: "Margem de 3x aplicada com sucesso." });
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
                
                <div className="grid gap-2">
                  <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Link do Produto (Fornecedor)</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent/40" />
                    <Input value={formData.sourceUrl} onChange={e => setFormData({...formData, sourceUrl: e.target.value})} placeholder="https://..." className="rounded-2xl h-14 pl-12 bg-secondary/20 border-none" />
                  </div>
                </div>

                <div className="grid gap-2"><Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Coleção</Label><Input value={formData.collection} onChange={e => setFormData({...formData, collection: e.target.value})} className="rounded-2xl h-14 bg-secondary/20 border-none px-6" /></div>
                <div className="grid gap-2"><Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Tamanhos Disponíveis</Label><div className="flex flex-wrap gap-2 p-4 bg-secondary/20 rounded-2xl">{['PP','P','M','G','GG','XG','G1','G2','Único'].map(size => { const selected = formData.sizes.split(',').map((s:string)=>s.trim()).includes(size); return (<button key={size} type="button" onClick={()=>{const current=formData.sizes.split(',').map((s:string)=>s.trim()).filter(Boolean);const updated=selected?current.filter((s:string)=>s!==size):[...current,size];setFormData({...formData,sizes:updated.join(', ')});}} className={`h-9 px-4 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${selected?'bg-primary text-white border-primary':'bg-white text-primary/40 border-primary/10'}`}>{size}</button>);})}</div><p className="text-[9px] text-muted-foreground ml-4 mt-1">Selecionados: {formData.sizes||'nenhum'}</p></div>
              </div>
            </div>

            {/* Galeria de Fotos */}
            <div className="space-y-6">
              <div className="flex items-center justify-between text-primary border-b border-gray-200 pb-3">
                <div className="flex items-center gap-3 text-accent">
                  <ImageIcon className="h-5 w-5" />
                  <h4 className="text-[11px] font-bold uppercase tracking-widest">Galeria de Fotos (Cloudinary)</h4>
                </div>
                <Button variant="ghost" size="sm" onClick={() => galleryInputRef.current?.click()} className="h-8 text-accent text-[10px] font-bold uppercase border border-accent/20 rounded-full px-4">+ Fotos</Button>
              </div>
              <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" multiple onChange={e => handleUpload(e, true)} />
              
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                 {formData.gallery.map((img, idx) => (
                   <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-white border border-gray-100 group shadow-sm">
                      <img src={img} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== idx) }))}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                   </div>
                 ))}
                 {uploading && (
                   <div className="aspect-square rounded-xl bg-white flex items-center justify-center border-2 border-dashed border-accent/20">
                     <Loader2 className="h-5 w-5 animate-spin text-accent" />
                   </div>
                 )}
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
                  <h4 className="text-[11px] font-bold uppercase tracking-widest">Miniaturas por Cor</h4>
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
              <div className="grid gap-2">
                <Label className="ml-4 text-[9px] uppercase font-bold text-muted-foreground">Custo no Fornecedor (R$)</Label>
                <Input type="number" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="rounded-xl h-12 bg-secondary/10 border-none px-6" />
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={handleCalculateIA}
                  className="h-9 px-4 rounded-full bg-accent/10 text-accent text-[9px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-all w-fit ml-4"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-2" /> Calcular com IA
                </Button>
                {formData.cost && formData.price && (
                  <p className="text-[9px] text-emerald-600 font-bold uppercase italic ml-4">
                    Lucro: R$ {(parseFloat(formData.price) - parseFloat(formData.cost)).toFixed(2)}
                  </p>
                )}
              </div>
              <div className="grid gap-2"><Label className="text-[9px] uppercase font-bold text-muted-foreground ml-2">Preço de Venda (R$)</Label><Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="rounded-xl h-12 bg-secondary/10 border-none px-6" /></div>
              <div className="grid gap-2"><Label className="text-[9px] uppercase font-bold text-muted-foreground ml-2">Preço Original / "De" (R$)</Label><Input type="number" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} className="rounded-xl h-12 bg-secondary/10 border-none px-6" /></div>
              <div className="grid gap-2"><Label className="text-[9px] uppercase font-bold text-muted-foreground ml-2">Estoque</Label><Input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="rounded-xl h-12 bg-secondary/10 border-none px-6" /></div>
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
