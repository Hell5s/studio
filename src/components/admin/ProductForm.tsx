"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  Loader2, 
  Upload, 
  Sparkles, 
  Trash2, 
  Plus, 
  Link as LinkIcon, 
  TrendingUp, 
  DollarSign, 
  Box, 
  Search,
  Globe,
  Tag,
  ImageIcon,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useFirebase } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
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
    metaTitle: '',
    metaDescription: '',
    tags: '',
    variations: [] as any[]
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
        gallery: initialData.images || []
      });
    }
  }, [initialData]);

  // Gerar Slug Automaticamente
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  // Cálculos Financeiros
  const price = parseFloat(formData.price) || 0;
  const cost = parseFloat(formData.cost) || 0;
  const profit = price - cost;
  const margin = price > 0 ? (profit / price) * 100 : 0;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!storage) {
      toast({
        title: "Erro de Configuração",
        description: "O serviço de armazenamento não está disponível. Verifique sua conexão.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Caminho organizado: produtos/timestamp-nome-arquivo
        const storageRef = ref(storage, `products/${Date.now()}-${file.name.replace(/\s+/g, '_')}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(url);
      }

      if (isGallery) {
        setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...uploadedUrls] }));
      } else {
        setFormData(prev => ({ ...prev, image: uploadedUrls[0] }));
      }
      
      toast({
        title: "Upload concluído",
        description: `${uploadedUrls.length} imagem(ns) enviada(s) com sucesso.`,
      });
    } catch (error: any) {
      console.error("Erro no upload do Storage:", error);
      toast({ 
        title: "Erro no upload", 
        description: "Verifique se você tem permissão para enviar arquivos ou se o arquivo é muito grande.", 
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
      // Reseta o input para permitir selecionar o mesmo arquivo novamente
      e.target.value = '';
    }
  };

  const handleAIGenerate = async () => {
    if (!formData.name || !formData.price) {
      toast({ title: "Preencha o nome e preço primeiro", variant: "destructive" });
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
      toast({ title: "Descrição editorial gerada!" });
    } catch (e) {
      toast({ title: "Erro na IA", variant: "destructive" });
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSave = async () => {
    // Se a imagem principal estiver vazia, tenta pegar a primeira da galeria
    const finalMainImage = formData.image || (formData.gallery.length > 0 ? formData.gallery[0] : '');

    if (!formData.name || !formData.price || !finalMainImage) {
      toast({ 
        title: "Campos obrigatórios", 
        description: "Nome, preço e pelo menos uma imagem (principal ou galeria) são necessários.", 
        variant: "destructive" 
      });
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
        profit,
        margin,
        stock: parseInt(formData.stock),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        image: finalMainImage,
        images: formData.gallery.length > 0 ? formData.gallery : [finalMainImage],
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
          <p className="text-muted-foreground italic font-light">Configure os detalhes editoriais e financeiros do seu produto.</p>
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
        {/* Main Columns */}
        <div className="space-y-10">
          {/* Informações Principais */}
          <Card className="p-8 border-none bg-white shadow-premium rounded-[3rem] space-y-8">
            <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
              <Box className="h-5 w-5" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.4em]">Informações Principais</h2>
            </div>
            
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Nome do Produto</Label>
                <Input 
                  value={formData.name} 
                  onChange={handleNameChange}
                  placeholder="Ex: Vestido Midi Satin Noir"
                  className="rounded-2xl h-14 bg-secondary/20 border-none px-6 text-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">URL Amigável (Slug)</Label>
                  <Input 
                    value={formData.slug} 
                    onChange={e => setFormData({...formData, slug: e.target.value})}
                    placeholder="vestido-midi-satin-noir"
                    className="rounded-2xl h-14 bg-secondary/10 border-none px-6 font-mono text-xs"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Categoria</Label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="rounded-2xl h-14 bg-secondary/20 border-none px-6 text-sm outline-none"
                  >
                    <option>Vestidos</option>
                    <option>Conjuntos</option>
                    <option>Moda Fitness</option>
                    <option>Plus Size</option>
                    <option>Acessórios</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between items-center px-4">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Descrição Editorial</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleAIGenerate}
                    disabled={generatingAI}
                    className="h-8 text-accent hover:text-accent/80 gap-2 text-[9px] font-bold uppercase"
                  >
                    {generatingAI ? <Loader2 className="animate-spin h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                    Melhorar com IA
                  </Button>
                </div>
                <Textarea 
                  value={formData.longDescription}
                  onChange={e => setFormData({...formData, longDescription: e.target.value})}
                  placeholder="Conte a história desta peça..."
                  className="rounded-[2rem] min-h-[200px] bg-secondary/10 border-none p-6 text-primary/80 italic font-light leading-relaxed"
                />
              </div>
            </div>
          </Card>

          {/* Precificação */}
          <Card className="p-8 border-none bg-white shadow-premium rounded-[3rem] space-y-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
              <DollarSign className="h-40 w-40" />
            </div>
            
            <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4 relative z-10">
              <TrendingUp className="h-5 w-5" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.4em]">Financeiro e Margens</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              <div className="grid gap-2">
                <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Custo (R$)</Label>
                <Input 
                  type="number"
                  value={formData.cost} 
                  onChange={e => setFormData({...formData, cost: e.target.value})}
                  className="rounded-2xl h-14 bg-secondary/20 border-none px-6"
                />
              </div>
              <div className="grid gap-2">
                <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Preço de Venda (R$)</Label>
                <Input 
                  type="number"
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="rounded-2xl h-14 bg-primary text-white border-none px-6 placeholder:text-white/30"
                />
              </div>
              <div className="grid gap-2">
                <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Preço Comparativo (R$)</Label>
                <Input 
                  type="number"
                  value={formData.oldPrice} 
                  onChange={e => setFormData({...formData, oldPrice: e.target.value})}
                  className="rounded-2xl h-14 bg-secondary/10 border-none px-6"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 relative z-10">
              <div className="bg-secondary/30 p-6 rounded-3xl border border-primary/5 text-center">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Lucro Bruto</p>
                <p className="text-3xl font-bold text-primary">R$ {profit.toFixed(2)}</p>
              </div>
              <div className={cn(
                "p-6 rounded-3xl border text-center transition-colors",
                margin > 40 ? "bg-green-50 border-green-100 text-green-700" : "bg-orange-50 border-orange-100 text-orange-700"
              )}>
                <p className="text-[10px] font-bold uppercase mb-1">Margem de Lucro</p>
                <p className="text-3xl font-bold">{margin.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          {/* Galeria de Imagens */}
          <Card className="p-8 border-none bg-white shadow-premium rounded-[3rem] space-y-8">
            <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
              <ImageIcon className="h-5 w-5" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.4em]">Mídia da Peça</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Imagem Principal</Label>
                <div 
                  className={cn(
                    "aspect-[3/4] rounded-[2.5rem] border-2 border-dashed border-primary/10 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition-all hover:bg-secondary/20",
                    formData.image && "border-none"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.image ? (
                    <>
                      <img src={formData.image} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="h-10 w-10 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-2 p-6">
                      <Upload className="h-10 w-10 text-accent/40 mx-auto" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Upload Capa</p>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => handleUpload(e)} />
              </div>

              <div className="space-y-4">
                <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Galeria de Detalhes</Label>
                <div className="grid grid-cols-2 gap-4">
                  {formData.gallery.map((url, i) => (
                    <div key={i} className="aspect-[3/4] rounded-2xl relative overflow-hidden group">
                      <img src={url} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, idx) => idx !== i) }))}
                        className="absolute top-2 right-2 h-8 w-8 bg-white/90 rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={uploading}
                    className="aspect-[3/4] rounded-2xl border-2 border-dashed border-primary/10 flex flex-col items-center justify-center hover:bg-secondary/20 transition-all text-primary/30 relative"
                  >
                    {uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Plus className="h-8 w-8" />}
                    <span className="text-[8px] font-bold uppercase tracking-widest mt-2">Add Foto</span>
                  </button>
                </div>
                <input type="file" ref={galleryInputRef} className="hidden" multiple accept="image/*" onChange={e => handleUpload(e, true)} />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Columns */}
        <div className="space-y-10">
          {/* Status e Publicação */}
          <Card className="p-8 border-none bg-primary text-white shadow-xl rounded-[3rem] space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Publicação</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Status do Produto</span>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="bg-white/10 border-none rounded-xl h-10 px-3 text-xs outline-none"
                >
                  <option value="active" className="text-primary">Ativo</option>
                  <option value="inactive" className="text-primary">Inativo</option>
                  <option value="draft" className="text-primary">Rascunho</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Destaque na Home</span>
                <Switch checked={formData.featured} onCheckedChange={v => setFormData({...formData, featured: v})} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Mais Vendido</span>
                <Switch checked={formData.bestseller} onCheckedChange={v => setFormData({...formData, bestseller: v})} />
              </div>
            </div>
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-accent/60">
                <span>Estoque</span>
                <span>{formData.stock} unidades</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={formData.stock} 
                onChange={e => setFormData({...formData, stock: e.target.value})}
                className="w-full mt-2 accent-accent"
              />
            </div>
          </Card>

          {/* Fornecedor / Shopee */}
          <Card className="p-8 border-none bg-white shadow-premium rounded-[3rem] space-y-6">
            <div className="flex items-center gap-3 text-accent">
              <LinkIcon className="h-4 w-4" />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Fornecedor Shopee</h3>
            </div>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-2">Link do Produto</Label>
                <Input 
                  value={formData.sourceUrl} 
                  onChange={e => setFormData({...formData, sourceUrl: e.target.value})}
                  placeholder="Cole o link da Shopee aqui..."
                  className="rounded-xl h-12 bg-secondary/10 border-none text-xs"
                />
              </div>
              {formData.sourceUrl && (
                <Button 
                  variant="outline" 
                  onClick={() => window.open(formData.sourceUrl, '_blank')}
                  className="w-full rounded-xl h-12 text-[10px] font-bold uppercase border-primary/10"
                >
                  Abrir no Fornecedor
                </Button>
              )}
              <div className="grid gap-2">
                <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-2">Nome da Loja</Label>
                <Input 
                  value={formData.vendorName} 
                  onChange={e => setFormData({...formData, vendorName: e.target.value})}
                  placeholder="Ex: Boutique Global Store"
                  className="rounded-xl h-12 bg-secondary/10 border-none text-xs"
                />
              </div>
            </div>
          </Card>

          {/* SEO e Tags */}
          <Card className="p-8 border-none bg-white shadow-premium rounded-[3rem] space-y-6">
            <div className="flex items-center gap-3 text-accent">
              <Globe className="h-4 w-4" />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">SEO & Tags</h3>
            </div>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-2">Meta Título</Label>
                <Input 
                  value={formData.metaTitle} 
                  onChange={e => setFormData({...formData, metaTitle: e.target.value})}
                  className="rounded-xl h-12 bg-secondary/10 border-none text-xs"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-2">Palavras-Chave (vírgula)</Label>
                <Input 
                  value={formData.tags} 
                  onChange={e => setFormData({...formData, tags: e.target.value})}
                  placeholder="moda, vestidos, seda"
                  className="rounded-xl h-12 bg-secondary/10 border-none text-xs"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
