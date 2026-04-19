
"use client";

import React, { useState, useRef } from 'react';
import { 
  Save, 
  Loader2, 
  Upload, 
  Sparkles,
  ShoppingBag,
  Package,
  Layers,
  Image as ImageIcon,
  Palette,
  X,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useFirebase, setDocumentNonBlocking } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Badge } from '@/components/ui/badge';
import { adminGenerateProductDescription } from '@/ai/flows/admin-generate-product-description-flow';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProductDialog({ open, onOpenChange }: AddProductDialogProps) {
  const db = useFirestore();
  const { storage } = useFirebase();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const variationInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [activeVariationIndex, setActiveVariationIndex] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    oldPrice: '',
    description: '',
    longDescription: '',
    category: 'Vestidos',
    collection: 'Nova Coleção',
    badge: 'Novo',
    image: '',
    gallery: '',
    stock: '10',
    sizes: 'P, M, G, GG',
    colors: '',
    published: true,
    featured: false,
    bestseller: false,
    sourceUrl: '',
    variations: [] as { color: string; image: string }[]
  });

  const parsePrice = (val: string) => {
    return Number(String(val).replace(/\./g, "").replace(",", ".")) || 0;
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

  const handleSave = () => {
    const galleryImages = formData.gallery
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    const finalMainImage = formData.image || (galleryImages.length > 0 ? galleryImages[0] : '');

    if (!formData.name || !formData.price || !finalMainImage) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome, o preço e adicione pelo menos uma imagem.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const productId = `prod-${Date.now()}`;
    const productRef = doc(db, 'products', productId);

    const payload = {
      ...formData,
      id: productId,
      price: parsePrice(formData.price),
      oldPrice: formData.oldPrice ? parsePrice(formData.oldPrice) : null,
      stock: formData.stock ? Number(formData.stock) : 0,
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
      colors: formData.colors.split(',').map(c => c.trim()).filter(c => c),
      image: finalMainImage,
      images: galleryImages.length > 0 ? galleryImages : [finalMainImage],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      source: 'Manual'
    };

    setDocumentNonBlocking(productRef, payload, { merge: true });

    toast({
      title: "Produto Cadastrado",
      description: `${formData.name} foi adicionado à Boutique.`,
    });
    
    setLoading(false);
    onOpenChange(false);
    setFormData({
      name: '', price: '', oldPrice: '', description: '', longDescription: '',
      category: 'Vestidos', collection: 'Nova Coleção', badge: 'Novo', image: '', 
      gallery: '', stock: '10', sizes: 'P, M, G, GG', colors: '', published: true, 
      featured: false, bestseller: false, sourceUrl: '', variations: []
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage!, `products/uploads/${Date.now()}-${file.name.replace(/\s+/g, '_')}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ ...prev, image: downloadURL }));
      toast({ title: "Imagem carregada com sucesso" });
    } catch (error: any) {
      toast({ title: "Erro no upload", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleVariationFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      toast({ title: "Dados insuficientes", variant: "destructive" });
      return;
    }

    setGeneratingAI(true);
    try {
      const result = await adminGenerateProductDescription({
        productName: formData.name,
        category: formData.category,
        price: `R$ ${formData.price}`,
        oldPrice: formData.oldPrice ? `R$ ${formData.oldPrice}` : undefined,
        badge: formData.badge,
        keyFeatures: ["Modelagem exclusiva Toda Bela", "Tecido de alta tecnologia"]
      });

      setFormData(prev => ({ 
        ...prev, 
        longDescription: result.description,
        description: result.description.split('.')[0] + '.'
      }));

      toast({ title: "Editorial IA Gerado!" });
    } catch (error) {
      toast({ title: "Erro na IA", variant: "destructive" });
    } finally {
      setGeneratingAI(false);
    }
  };

  const displayImage = formData.image || formData.gallery.split('\n')[0]?.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto rounded-[3rem] p-0 border-none shadow-2xl bg-[#FFF9F7]">
        <div className="bg-primary p-8 text-primary-foreground flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Package className="h-8 w-8 text-accent" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Gestão de Produtos</p>
              <DialogHeader>
                <DialogTitle className="text-3xl font-headline font-bold text-white">Novo Item da Boutique</DialogTitle>
              </DialogHeader>
            </div>
          </div>
          <Button onClick={handleSave} disabled={loading} className="rounded-full px-10 h-14 bg-white text-primary hover:bg-accent hover:text-white font-bold uppercase tracking-widest text-[10px] shadow-xl">
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Produto
          </Button>
        </div>

        <div className="p-10 grid xl:grid-cols-[1fr_400px] gap-12">
          <div className="space-y-12">
            {/* 1. IDENTIDADE */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-accent">
                <Layers className="h-5 w-5" />
                <h4 className="text-[11px] font-bold uppercase tracking-widest">Identidade da Peça</h4>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label>Nome do Produto</Label>
                  <input 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full rounded-2xl h-14 border-primary/5 bg-white shadow-sm px-4 outline-none"
                    placeholder="Ex: Vestido Midi Satin"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Coleção</Label>
                  <select 
                    value={formData.collection}
                    onChange={e => setFormData({...formData, collection: e.target.value})}
                    className="w-full rounded-2xl h-14 border-primary/5 bg-white shadow-sm px-4 text-sm"
                  >
                    <option>Moda Fitness</option>
                    <option>Plus Size</option>
                    <option>Vestidos</option>
                    <option>Conjuntos</option>
                    <option>Casual Chic</option>
                    <option>Nova Coleção</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full rounded-2xl h-14 border-primary/5 bg-white shadow-sm px-4 text-sm"
                  >
                    <option>Tops</option>
                    <option>Leggings</option>
                    <option>Shorts</option>
                    <option>Macacões</option>
                    <option>Vestidos</option>
                    <option>Conjuntos</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 2. VARIAÇÕES DE CORES - CRITICAL SECTION */}
            <section className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm">
              <input 
                type="file" 
                ref={variationInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleVariationFileUpload} 
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-accent">
                  <Palette className="h-5 w-5" />
                  <h4 className="text-[11px] font-bold uppercase tracking-widest">Miniaturas por Cor (Clique na foto p/ Upload)</h4>
                </div>
                <Button variant="outline" size="sm" onClick={handleAddVariation} className="h-8 text-[9px] font-bold uppercase text-accent border-accent/20 px-4 rounded-full">
                  <Plus className="h-3 w-3 mr-1" /> Add Nova Cor
                </Button>
              </div>
              <div className="grid gap-4">
                {formData.variations.map((v, i) => (
                  <div key={i} className="flex gap-4 items-center bg-secondary/10 p-4 rounded-2xl border border-primary/5 group">
                    <div 
                      className="h-16 w-12 rounded-lg overflow-hidden bg-white flex-shrink-0 relative cursor-pointer shadow-sm hover:opacity-80 transition-opacity"
                      onClick={() => {
                        setActiveVariationIndex(i);
                        variationInputRef.current?.click();
                      }}
                    >
                      {v.image ? (
                        <img src={v.image} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center opacity-30">
                          <Upload className="h-4 w-4" />
                          <span className="text-[6px] font-bold">FOTO</span>
                        </div>
                      )}
                      {uploading && activeVariationIndex === i && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                    <input 
                      placeholder="Cor (ex: Branco)" 
                      value={v.color} 
                      onChange={e => handleVariationChange(i, 'color', e.target.value)} 
                      className="h-12 text-xs bg-white border-none rounded-xl px-4 flex-1 outline-none shadow-sm" 
                    />
                    <input 
                      placeholder="Link da imagem" 
                      value={v.image} 
                      onChange={e => handleVariationChange(i, 'image', e.target.value)} 
                      className="h-12 text-xs bg-white border-none rounded-xl px-4 flex-[2] outline-none shadow-sm" 
                    />
                    <button onClick={() => handleRemoveVariation(i)} className="text-red-300 hover:text-red-500 transition-colors p-2">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                {formData.variations.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-primary/5 rounded-2xl">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest italic">Nenhuma cor cadastrada ainda.</p>
                  </div>
                )}
              </div>
            </section>

            {/* 3. FINANCEIRO */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-accent">
                <ShoppingBag className="h-5 w-5" />
                <h4 className="text-[11px] font-bold uppercase tracking-widest">Financeiro e Logística</h4>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Preço da Loja (R$)</Label>
                  <input 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full rounded-2xl h-14 border-primary/5 bg-white shadow-sm px-4 outline-none"
                    placeholder="129,90"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço Comparativo (R$)</Label>
                  <input 
                    value={formData.oldPrice}
                    onChange={e => setFormData({...formData, oldPrice: e.target.value})}
                    className="w-full rounded-2xl h-14 border-primary/5 bg-white shadow-sm px-4 outline-none"
                    placeholder="169,90"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estoque Total</Label>
                  <input 
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: e.target.value})}
                    className="w-full rounded-2xl h-14 border-primary/5 bg-white shadow-sm px-4 outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
            </section>

            {/* 4. MÍDIA */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-accent">
                <ImageIcon className="h-5 w-5" />
                <h4 className="text-[11px] font-bold uppercase tracking-widest">Mídia Principal e Galeria</h4>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-[1fr_auto] gap-4">
                  <div className="relative flex-1">
                    <input 
                      value={formData.image}
                      onChange={e => setFormData({...formData, image: e.target.value})}
                      className="w-full rounded-2xl h-14 border-primary/5 bg-white shadow-sm px-4 outline-none"
                      placeholder="URL ou Upload da Capa"
                    />
                    {uploading && !activeVariationIndex && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
                    )}
                  </div>
                  <Button variant="outline" className="rounded-2xl h-14 border-primary/10" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    <Upload className="h-4 w-4" />
                  </Button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>
                <Label>Galeria de Detalhes (uma URL por linha)</Label>
                <textarea 
                   value={formData.gallery}
                   onChange={e => setFormData({...formData, gallery: e.target.value})}
                   className="w-full rounded-2xl border-primary/5 bg-white shadow-sm min-h-[90px] px-4 py-3 outline-none"
                   placeholder="https://imagem1.jpg&#10;https://imagem2.jpg"
                />
              </div>
            </section>

            {/* 5. PERSUASÃO */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-accent">
                  <Sparkles className="h-5 w-5" />
                  <h4 className="text-[11px] font-bold uppercase tracking-widest">Conteúdo e Persuasão</h4>
                </div>
                <Button variant="outline" size="sm" onClick={handleAIGenerate} disabled={generatingAI} className="rounded-full border-accent/20 text-accent">
                  {generatingAI ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />} IA Editorial
                </Button>
              </div>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>Tamanhos</Label><input value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} className="w-full rounded-2xl h-14 border-primary/5 bg-white shadow-sm px-4 outline-none" /></div>
                  <div className="space-y-2"><Label>Cores Tags</Label><input value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} className="w-full rounded-2xl h-14 border-primary/5 bg-white shadow-sm px-4 outline-none" /></div>
                </div>
                <div className="space-y-2">
                  <Label>Descrição Editorial</Label>
                  <textarea value={formData.longDescription} onChange={e => setFormData({...formData, longDescription: e.target.value})} className="w-full rounded-2xl border-primary/5 bg-white shadow-sm min-h-[160px] px-4 py-3 outline-none" />
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <div className="sticky top-28 space-y-8">
              <div className="rounded-[3rem] bg-white shadow-2xl overflow-hidden border border-primary/5">
                <div className="aspect-[3/4] bg-muted relative">
                  {displayImage ? (
                    <img src={displayImage} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30"><ImageIcon className="h-12 w-12" /></div>
                  )}
                </div>
                <div className="p-8 text-center space-y-4">
                  <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-accent">{formData.collection}</p>
                  <h5 className="font-headline font-bold text-xl text-primary truncate">{formData.name || 'Nome da Peça'}</h5>
                  <p className="text-3xl font-light text-primary">R$ {formData.price || '0,00'}</p>
                </div>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-primary text-primary-foreground space-y-6">
                <h6 className="text-[10px] font-bold uppercase tracking-widest text-accent">Status da Peça</h6>
                <div className="space-y-4">
                   <div className="flex items-center justify-between"><Label className="text-white">Publicar</Label><Switch checked={formData.published} onCheckedChange={v => setFormData({...formData, published: v})} /></div>
                   <div className="flex items-center justify-between"><Label className="text-white">Destaque</Label><Switch checked={formData.featured} onCheckedChange={v => setFormData({...formData, featured: v})} /></div>
                   <div className="flex items-center justify-between"><Label className="text-white">Mais Vendido</Label><Checkbox checked={formData.bestseller} onCheckedChange={(c) => setFormData({...formData, bestseller: !!c})} className="border-white" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
