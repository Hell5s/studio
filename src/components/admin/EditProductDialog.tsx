
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  Loader2, 
  Sparkles,
  Link as LinkIcon,
  Upload,
  ShoppingBag,
  Package,
  Layers
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
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
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
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    oldPrice: 0,
    description: '',
    longDescription: '',
    category: '',
    badge: '',
    image: '',
    stock: 0,
    sizes: '',
    colors: '',
    published: true,
    featured: false,
    sourceUrl: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || 0,
        oldPrice: product.oldPrice || 0,
        description: product.description || '',
        longDescription: product.longDescription || '',
        category: product.category || '',
        badge: product.badge || '',
        image: product.image || product.images?.[0] || '',
        stock: product.stock || 0,
        sizes: product.sizes?.join(', ') || '',
        colors: product.colors?.join(', ') || '',
        published: product.published !== false,
        featured: !!product.featured,
        sourceUrl: product.sourceUrl || ''
      });
    }
  }, [product]);

  const handleSave = () => {
    if (!product?.id) return;
    
    setLoading(true);
    const docRef = doc(db, 'products', product.id);
    
    updateDocumentNonBlocking(docRef, {
      ...formData,
      price: Number(formData.price),
      oldPrice: Number(formData.oldPrice),
      stock: Number(formData.stock),
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
      colors: formData.colors.split(',').map(c => c.trim()).filter(c => c),
      updatedAt: new Date().toISOString()
    });

    toast({
      title: "Edição salva",
      description: "As alterações foram aplicadas ao catálogo com sucesso.",
    });
    
    setLoading(false);
    onOpenChange(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product?.id) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `products/${product.id}/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ ...prev, image: downloadURL }));
      toast({ title: "Upload concluído" });
    } catch (error) {
      toast({ title: "Erro no upload", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!formData.name || !formData.price) {
      toast({
        title: "Dados insuficientes",
        description: "Preencha o nome e preço para a IA criar a descrição.",
        variant: "destructive"
      });
      return;
    }

    setGeneratingAI(true);
    try {
      const features = [
        ...(formData.colors ? [`Disponível nas cores: ${formData.colors}`] : []),
        ...(formData.sizes ? [`Tamanhos: ${formData.sizes}`] : []),
        "Tecido premium",
        "Corte sofisticado"
      ];

      const result = await adminGenerateProductDescription({
        productName: formData.name,
        category: formData.category,
        price: `R$ ${formData.price}`,
        oldPrice: formData.oldPrice ? `R$ ${formData.oldPrice}` : undefined,
        badge: formData.badge,
        keyFeatures: features
      });

      setFormData(prev => ({ 
        ...prev, 
        longDescription: result.description,
        description: result.description.split('.')[0] + '.'
      }));

      toast({
        title: "Descrição Criada!",
        description: "A IA gerou um texto editorial para sua peça.",
      });
    } catch (error) {
      toast({
        title: "Erro na IA",
        description: "Não foi possível gerar o texto agora.",
        variant: "destructive"
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-0 border-none shadow-2xl bg-[#FFF9F7]">
        <div className="bg-primary p-8 text-primary-foreground relative">
          <DialogHeader className="sr-only">
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-md border border-white/10 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img src={formData.image} className="h-full w-full object-cover" alt="Preview" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Edição de Curadoria</p>
              <h3 className="text-2xl font-headline font-bold">{formData.name || 'Nova Peça'}</h3>
            </div>
          </div>
        </div>

        <div className="p-10 grid md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="grid gap-4">
              <Label className="text-accent uppercase tracking-widest text-[10px] font-bold flex items-center gap-2"><Package className="h-3 w-3" /> Essencial</Label>
              <div className="grid gap-2">
                <Label>Nome do Produto</Label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-12 w-full rounded-xl bg-white border border-primary/5 px-4 text-sm outline-none focus:ring-1 focus:ring-accent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Coleção</Label>
                  <input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="h-12 w-full rounded-xl bg-white border border-primary/5 px-4 text-sm outline-none" />
                </div>
                <div className="grid gap-2">
                  <Label>Badge</Label>
                  <input value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} className="h-12 w-full rounded-xl bg-white border border-primary/5 px-4 text-sm outline-none" />
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <Label className="text-accent uppercase tracking-widest text-[10px] font-bold flex items-center gap-2"><Layers className="h-3 w-3" /> Estoque e Variantes</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Preço</Label>
                  <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="h-12 w-full rounded-xl bg-white border border-primary/5 px-4 text-sm outline-none" />
                </div>
                <div className="grid gap-2">
                  <Label>Estoque</Label>
                  <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="h-12 w-full rounded-xl bg-white border border-primary/5 px-4 text-sm outline-none" />
                </div>
                <div className="grid gap-2">
                  <Label>Venda (De)</Label>
                  <input type="number" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: Number(e.target.value)})} className="h-12 w-full rounded-xl bg-white border border-primary/5 px-4 text-sm outline-none" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Tamanhos (P, M, G...)</Label>
                <input value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} className="h-12 w-full rounded-xl bg-white border border-primary/5 px-4 text-sm outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label className="text-accent uppercase tracking-widest text-[10px] font-bold flex items-center gap-2"><Sparkles className="h-3 w-3" /> Conteúdo Editorial</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAIGenerate} 
                  disabled={generatingAI}
                  className="rounded-full border-accent/20 text-accent hover:bg-accent hover:text-white h-8"
                >
                  {generatingAI ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
                  Gerar com IA
                </Button>
              </div>
              <div className="grid gap-2">
                <Label>Resumo (Vitrine)</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-xl border-primary/5 bg-white min-h-[80px]" />
              </div>
              <div className="grid gap-2">
                <Label>Descrição Completa</Label>
                <Textarea value={formData.longDescription} onChange={e => setFormData({...formData, longDescription: e.target.value})} className="rounded-xl border-primary/5 bg-white min-h-[160px]" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-secondary/30 border border-primary/5 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-bold">Publicado</Label>
                <Switch checked={formData.published} onCheckedChange={v => setFormData({...formData, published: v})} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-bold">Destaque</Label>
                <Switch checked={formData.featured} onCheckedChange={v => setFormData({...formData, featured: v})} />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 bg-secondary/20 border-t border-primary/5">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full px-8 text-[10px] font-bold uppercase tracking-widest">Cancelar</Button>
          <Button onClick={handleSave} disabled={loading} className="rounded-full px-12 h-14 bg-primary text-white text-[10px] font-bold uppercase tracking-widest shadow-xl">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
