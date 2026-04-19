
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  Loader2, 
  Sparkles,
  Upload,
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
  DialogFooter
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useFirebase, updateDocumentNonBlocking } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { adminGenerateProductDescription } from '@/ai/flows/admin-generate-product-description-flow';

interface EditProductDialogProps {
  product: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProductDialog({ product, open, onOpenChange }: EditProductDialogProps) {
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
    category: '',
    collection: '',
    badge: '',
    image: '',
    gallery: '',
    stock: '',
    sizes: '',
    colors: '',
    published: true,
    featured: false,
    bestseller: false,
    sourceUrl: '',
    variations: [] as { color: string; image: string }[]
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price?.toString() || '',
        oldPrice: product.oldPrice?.toString() || '',
        description: product.description || '',
        longDescription: product.longDescription || '',
        category: product.category || '',
        collection: product.collection || 'Moda Fitness',
        badge: product.badge || '',
        image: product.image || '',
        gallery: product.images?.join('\n') || '',
        stock: product.stock?.toString() || '',
        sizes: product.sizes?.join(', ') || '',
        colors: product.colors?.join(', ') || '',
        published: product.published !== false,
        featured: !!product.featured,
        bestseller: !!product.bestseller,
        sourceUrl: product.sourceUrl || '',
        variations: product.variations || []
      });
    }
  }, [product]);

  const parsePrice = (val: string) => {
    if (!val) return 0;
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
    if (!product?.id) return;
    
    setLoading(true);
    const docRef = doc(db, 'products', product.id);
    
    const galleryImages = formData.gallery
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    updateDocumentNonBlocking(docRef, {
      ...formData,
      price: parsePrice(formData.price),
      oldPrice: formData.oldPrice ? parsePrice(formData.oldPrice) : null,
      stock: Number(formData.stock) || 0,
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
      colors: formData.colors.split(',').map(c => c.trim()).filter(c => c),
      images: galleryImages.length > 0 ? galleryImages : [formData.image],
      updatedAt: serverTimestamp()
    });

    toast({ title: "Alterações Salvas!" });
    setLoading(false);
    onOpenChange(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product?.id) return;

    setUploading(true);
    try {
      const storageRef = ref(storage!, `products/${product.id}/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ ...prev, image: downloadURL }));
      toast({ title: "Imagem atualizada" });
    } catch (error: any) {
      toast({ title: "Erro no upload", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleVariationFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeVariationIndex === null || !product?.id) return;
    
    setUploading(true);
    try {
      const storageRef = ref(storage!, `products/${product.id}/variations/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      
      handleVariationChange(activeVariationIndex, 'image', url);
      toast({ title: "Foto da cor carregada!" });
    } catch (error: any) {
      toast({ title: "Erro no upload da cor", variant: "destructive" });
    } finally {
      setUploading(false);
      setActiveVariationIndex(null);
      e.target.value = '';
    }
  };

  const handleAIGenerate = async () => {
    if (!formData.name || !formData.price) {
      toast({ title: "Dados incompletos", variant: "destructive" });
      return;
    }
    setGeneratingAI(true);
    try {
      const result = await adminGenerateProductDescription({
        productName: formData.name,
        category: formData.category,
        price: `R$ ${formData.price}`,
        keyFeatures: [formData.colors, formData.sizes].filter(Boolean)
      });
      setFormData(prev => ({ 
        ...prev, 
        longDescription: result.description,
        description: result.description.split('.')[0] + '.'
      }));
      toast({ title: "IA: Texto Criado" });
    } catch (error) {
      toast({ title: "IA Indisponível", variant: "destructive" });
    } finally {
      setGeneratingAI(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-0 border-none shadow-2xl bg-[#FFF9F7]">
        <div className="bg-primary p-8 text-primary-foreground relative">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-md border border-white/10 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {formData.image ? (
                <img src={formData.image} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center"><ImageIcon className="h-6 w-6 opacity-20" /></div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading && activeVariationIndex === null ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Gestão de Produto</p>
              <h3 className="text-2xl font-headline font-bold">{formData.name || 'Editando Peça'}</h3>
            </div>
          </div>
        </div>

        <div className="p-10 grid md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="grid gap-4">
              <Label className="text-accent uppercase tracking-widest text-[10px] font-bold flex items-center gap-2"><Package className="h-3 w-3" /> Identidade</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nome do Produto" />
              <div className="grid grid-cols-2 gap-4">
                <Input value={formData.collection} onChange={e => setFormData({...formData, collection: e.target.value})} placeholder="Coleção" />
                <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Categoria" />
              </div>
            </div>

            {/* SEÇÃO DE CORES COM UPLOAD - EDIT */}
            <div className="grid gap-4 bg-white p-6 rounded-3xl border border-primary/5 shadow-sm">
              <input 
                type="file" 
                ref={variationInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleVariationFileUpload} 
              />
              <div className="flex justify-between items-center">
                <Label className="text-accent uppercase tracking-widest text-[10px] font-bold flex items-center gap-2"><Palette className="h-3 w-3" /> Miniaturas por Cor (Clique p/ Upload)</Label>
                <Button variant="ghost" size="sm" onClick={handleAddVariation} className="h-7 text-[8px] font-bold uppercase text-accent border border-accent/10 px-3">Add Cor</Button>
              </div>
              <div className="space-y-3">
                {formData.variations.map((v, i) => (
                  <div key={i} className="flex gap-3 items-center bg-secondary/20 p-3 rounded-2xl border border-primary/5">
                    <div 
                      className="h-12 w-10 rounded-lg overflow-hidden bg-white border border-primary/10 flex-shrink-0 relative cursor-pointer group/thumb"
                      onClick={() => {
                        setActiveVariationIndex(i);
                        variationInputRef.current?.click();
                      }}
                    >
                      {v.image ? (
                        <img src={v.image} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-secondary/50 text-primary/20"><Upload className="h-3 w-3" /></div>
                      )}
                      {uploading && activeVariationIndex === i && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                    <Input placeholder="Cor" value={v.color} onChange={e => handleVariationChange(i, 'color', e.target.value)} className="h-10 text-[10px] bg-white border-none rounded-xl" />
                    <Input placeholder="Link da foto" value={v.image} onChange={e => handleVariationChange(i, 'image', e.target.value)} className="h-10 text-[10px] bg-white border-none rounded-xl flex-[2]" />
                    <button onClick={() => handleRemoveVariation(i)} className="text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <Label className="text-accent uppercase tracking-widest text-[10px] font-bold flex items-center gap-2"><Layers className="h-3 w-3" /> Valores e Atributos</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Preço Venda</span>
                  <Input value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="129,90" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Preço Original "De"</span>
                  <Input value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} placeholder="169,90" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} placeholder="Estoque" />
                <Input value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} placeholder="Badge (Novo, Oferta)" />
              </div>
              <Input value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} placeholder="Tamanhos (P, M, G)" />
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label className="text-accent uppercase tracking-widest text-[10px] font-bold flex items-center gap-2"><Sparkles className="h-3 w-3" /> Editorial IA</Label>
                <Button variant="outline" size="sm" onClick={handleAIGenerate} disabled={generatingAI} className="h-8 rounded-full border-accent/20 text-accent">IA Editorial</Button>
              </div>
              <Textarea value={formData.longDescription} onChange={e => setFormData({...formData, longDescription: e.target.value})} placeholder="Descrição Completa" className="min-h-[200px]" />
            </div>

            <div className="p-6 rounded-3xl bg-secondary/30 border border-primary/5 space-y-4">
              <div className="flex items-center justify-between"><Label className="font-bold">Publicado</Label><Switch checked={formData.published} onCheckedChange={v => setFormData({...formData, published: v})} /></div>
              <div className="flex items-center justify-between"><Label className="font-bold">Destaque na Home</Label><Switch checked={formData.featured} onCheckedChange={v => setFormData({...formData, featured: v})} /></div>
              <div className="flex items-center justify-between"><Label className="font-bold">Mais Vendido</Label><Checkbox checked={formData.bestseller} onCheckedChange={(v) => setFormData({...formData, bestseller: !!v})} /></div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 bg-secondary/20 border-t border-primary/5">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full px-8 text-[10px] font-bold uppercase tracking-widest">Cancelar</Button>
          <Button onClick={handleSave} disabled={loading} className="rounded-full px-12 h-14 bg-primary text-white text-[10px] font-bold uppercase tracking-widest shadow-xl">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

