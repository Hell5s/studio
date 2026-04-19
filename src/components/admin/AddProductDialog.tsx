
"use client";

import React, { useState, useRef } from 'react';
import { 
  Save, 
  Loader2, 
  Upload, 
  Sparkles,
  Package,
  Layers,
  Image as ImageIcon,
  Palette,
  X,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useFirebase, setDocumentNonBlocking } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
    cost: '',
    supplierUrl: '',
    supplierName: '',
    internalNotes: '',
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
        description: "Preencha nome, preço e imagem de capa (ou a galeria).",
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
      cost: parsePrice(formData.cost),
      stock: formData.stock ? Number(formData.stock) : 0,
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
      colors: formData.colors.split(',').map(c => c.trim()).filter(c => c),
      image: finalMainImage,
      images: galleryImages.length > 0 ? galleryImages : [finalMainImage],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    setDocumentNonBlocking(productRef, payload, { merge: true });

    toast({
      title: "Produto Cadastrado",
      description: `${formData.name} foi adicionado à Boutique.`,
    });
    
    setLoading(false);
    onOpenChange(false);
    setFormData({
      name: '', price: '', oldPrice: '', cost: '', supplierUrl: '', supplierName: '',
      internalNotes: '', description: '', longDescription: '',
      category: 'Vestidos', collection: 'Nova Coleção', badge: 'Novo', image: '', 
      gallery: '', stock: '10', sizes: 'P, M, G, GG', colors: '', published: true, 
      featured: false, bestseller: false, variations: []
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage!, `products/uploads/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ ...prev, image: url }));
      toast({ title: "Imagem carregada!" });
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
      toast({ title: "Foto da cor OK!" });
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
      toast({ title: "Preencha nome e preço", variant: "destructive" });
      return;
    }
    setGeneratingAI(true);
    try {
      const res = await adminGenerateProductDescription({
        productName: formData.name,
        category: formData.category,
        price: `R$ ${formData.price}`,
        keyFeatures: ["Modelagem exclusiva", "Dropshipping Premium"]
      });
      setFormData(prev => ({ ...prev, longDescription: res.description, description: res.description.split('.')[0] + '.' }));
      toast({ title: "IA: Editorial Gerado!" });
    } catch (e) {
      toast({ title: "IA Indisponível", variant: "destructive" });
    } finally {
      setGeneratingAI(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto rounded-[2rem] p-0 border-none shadow-2xl bg-[#F4F6F8]">
        <div className="bg-[#2A1F22] p-8 text-white flex items-center justify-between sticky top-0 z-20 shadow-lg">
          <div className="flex items-center gap-6">
            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent/80">Novo Cadastro</p>
              <DialogHeader><DialogTitle className="text-2xl font-bold">Peça de Boutique</DialogTitle></DialogHeader>
            </div>
          </div>
          <Button onClick={handleSave} disabled={loading} className="rounded-full px-10 h-12 bg-accent text-primary hover:brightness-110 font-bold uppercase tracking-widest text-[10px] shadow-xl border-none">
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            Publicar Produto
          </Button>
        </div>

        <div className="p-10 grid xl:grid-cols-[1fr_400px] gap-10">
          <div className="space-y-10">
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-primary border-b border-gray-200 pb-3">
                <Layers className="h-5 w-5" />
                <h4 className="text-[11px] font-bold uppercase tracking-widest">Informações Vitrine</h4>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label>Nome da Peça</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-white border-gray-200 h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm">
                    <option>Moda Fitness</option><option>Vestidos</option><option>Conjuntos</option><option>Plus Size</option><option>Casual Chic</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Preço Vitrine (R$)</Label>
                  <Input value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-white border-gray-200 h-12 rounded-xl" />
                </div>
              </div>
            </section>

            <section className="space-y-6 bg-white p-8 rounded-3xl border border-primary/5 shadow-sm">
              <div className="flex items-center gap-3 text-accent border-b border-gray-100 pb-3">
                <LinkIcon className="h-5 w-5" />
                <h4 className="text-[11px] font-bold uppercase tracking-widest">Dados Operacionais (Apenas Admin)</h4>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label>Link do Fornecedor (AliExpress, Shopee, etc)</Label>
                  <Input value={formData.supplierUrl} onChange={e => setFormData({...formData, supplierUrl: e.target.value})} placeholder="https://..." className="bg-gray-50/50" />
                </div>
                <div className="space-y-2">
                  <Label>Custo no Fornecedor (R$)</Label>
                  <Input value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} placeholder="Ex: 45.00" className="bg-gray-50/50" />
                </div>
                <div className="space-y-2">
                  <Label>Nome do Fornecedor</Label>
                  <Input value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} placeholder="Ex: Boutique Global Store" className="bg-gray-50/50" />
                </div>
                <div className="md:col-span-2 space-y-2">
                   <Label>Observações Internas</Label>
                   <Textarea value={formData.internalNotes} onChange={e => setFormData({...formData, internalNotes: e.target.value})} placeholder="Ex: Tamanho chinês é menor, pedir um número a mais." className="bg-gray-50/50" />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <input type="file" ref={variationInputRef} className="hidden" accept="image/*" onChange={handleVariationFileUpload} />
              <div className="flex justify-between items-center text-primary border-b border-gray-200 pb-3">
                <div className="flex items-center gap-3"><Palette className="h-5 w-5" /><h4 className="text-[11px] font-bold uppercase tracking-widest">Cores e Miniaturas</h4></div>
                <Button variant="ghost" size="sm" onClick={handleAddVariation} className="h-8 text-accent text-[10px] font-bold uppercase border border-accent/20 rounded-full px-4">+ Cor</Button>
              </div>
              <div className="grid gap-4">
                {formData.variations.map((v, i) => (
                  <div key={i} className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100 group">
                    <div 
                      className="h-16 w-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => { setActiveVariationIndex(i); variationInputRef.current?.click(); }}
                    >
                      {v.image ? <img src={v.image} className="h-full w-full object-cover" alt="Variation" /> : <div className="h-full w-full flex items-center justify-center opacity-30"><Upload className="h-4 w-4" /></div>}
                      {uploading && activeVariationIndex === i && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>}
                    </div>
                    <Input placeholder="Cor (ex: Branco)" value={v.color} onChange={e => handleVariationChange(i, 'color', e.target.value)} className="h-12 border-none bg-gray-50 rounded-xl" />
                    <Input placeholder="URL da Foto" value={v.image} onChange={e => handleVariationChange(i, 'image', e.target.value)} className="h-12 border-none bg-gray-50 rounded-xl flex-[2]" />
                    <button onClick={() => handleRemoveVariation(i)} className="text-red-300 hover:text-red-500 p-2"><X className="h-5 w-5" /></button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <div className="sticky top-28 space-y-8">
              <Card className="rounded-[2.5rem] bg-white shadow-xl overflow-hidden border-none">
                <div className="aspect-[3/4] bg-gray-100 relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {formData.image ? <img src={formData.image} className="w-full h-full object-cover" alt="Product Preview" /> : <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30"><ImageIcon className="h-12 w-12" /><span className="text-[10px] font-bold mt-2">CAPA DO PRODUTO</span></div>}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                  {uploading && !activeVariationIndex && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}
                </div>
                <div className="p-8 text-center space-y-2">
                  <h5 className="font-bold text-lg text-primary truncate">{formData.name || 'Nome da Peça'}</h5>
                  <p className="text-2xl font-light text-primary">R$ {formData.price || '0,00'}</p>
                </div>
              </Card>

              <Card className="p-8 rounded-[2rem] bg-primary text-white space-y-6 shadow-xl border-none">
                <h6 className="text-[10px] font-bold uppercase tracking-widest text-accent">Configurações</h6>
                <div className="space-y-4">
                   <div className="flex items-center justify-between"><Label className="text-white text-xs">Publicado</Label><Switch checked={formData.published} onCheckedChange={v => setFormData({...formData, published: v})} /></div>
                   <div className="flex items-center justify-between"><Label className="text-white text-xs">Destaque</Label><Switch checked={formData.featured} onCheckedChange={v => setFormData({...formData, featured: v})} /></div>
                   <div className="flex items-center justify-between"><Label className="text-white text-xs">Mais Vendido</Label><Checkbox checked={formData.bestseller} onCheckedChange={v => setFormData({...formData, bestseller: !!v})} className="border-white" /></div>
                </div>
              </Card>
              
              <Button variant="outline" onClick={handleAIGenerate} disabled={generatingAI} className="w-full h-14 rounded-2xl border-accent/20 text-accent hover:bg-accent/5 font-bold uppercase text-[10px] tracking-widest">
                {generatingAI ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Gerar Editorial com IA
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
