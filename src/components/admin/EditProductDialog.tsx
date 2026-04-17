"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Loader2, 
  Image as ImageIcon,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Layout,
  Link as LinkIcon,
  Upload,
  Check
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
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    oldPrice: 0,
    description: '',
    category: '',
    badge: '',
    image: '',
    published: true,
    featured: false
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || 0,
        oldPrice: product.oldPrice || 0,
        description: product.description || '',
        category: product.category || '',
        badge: product.badge || '',
        image: product.image || product.images?.[0] || '',
        published: product.published !== false,
        featured: !!product.featured
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
      
      toast({
        title: "Upload concluído",
        description: "Imagem carregada com sucesso para a Maison.",
      });
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a imagem no momento.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-0 border-none shadow-2xl">
        <div className="bg-primary p-8 text-primary-foreground relative">
          <DialogHeader className="sr-only">
            <DialogTitle>Editar Produto: {product?.name}</DialogTitle>
            <DialogDescription>Ajuste os detalhes da sua curadoria.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-md border border-white/10 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img src={formData.image} className="h-full w-full object-cover" alt="Preview" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Edição de Curadoria</p>
              <h3 className="text-2xl font-headline font-bold">{formData.name}</h3>
            </div>
          </div>
        </div>

        <div className="p-10 grid md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Identificação e Mídia</Label>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nome do Produto</Label>
                  <Input 
                    id="edit-name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="rounded-2xl border-primary/5 bg-secondary/20 h-12 focus:bg-white transition-all"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>Imagem do Produto</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        value={formData.image}
                        onChange={(e) => setFormData({...formData, image: e.target.value})}
                        className="rounded-2xl border-primary/5 bg-secondary/20 h-12 pl-12 focus:bg-white transition-all"
                        placeholder="Cole a URL ou use o botão ao lado"
                      />
                    </div>
                    <Button 
                      type="button"
                      variant="outline" 
                      className="rounded-2xl h-12 px-4 border-primary/10 hover:bg-white"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </Button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Categoria</Label>
                  <Input 
                    id="edit-category" 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="rounded-2xl border-primary/5 bg-secondary/20 h-12 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Precificação</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Preço Venda (R$)</Label>
                  <Input 
                    id="edit-price" 
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    className="rounded-2xl border-primary/5 bg-secondary/20 h-12 focus:bg-white transition-all"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-old-price">Preço Antigo (R$)</Label>
                  <Input 
                    id="edit-old-price" 
                    type="number"
                    value={formData.oldPrice}
                    onChange={(e) => setFormData({...formData, oldPrice: Number(e.target.value)})}
                    className="rounded-2xl border-primary/5 bg-secondary/20 h-12 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Conteúdo e Vitrine</Label>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Descrição Editorial</Label>
                  <Textarea 
                    id="edit-description" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="rounded-2xl border-primary/5 bg-secondary/20 min-h-[120px] focus:bg-white transition-all resize-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-badge">Selo Promocional</Label>
                  <Input 
                    id="edit-badge" 
                    placeholder="Ex: Novo, Destaque, Off"
                    value={formData.badge}
                    onChange={(e) => setFormData({...formData, badge: e.target.value})}
                    className="rounded-2xl border-primary/5 bg-secondary/20 h-12 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 p-6 rounded-3xl bg-secondary/30 border border-primary/5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Publicar Produto</Label>
                  <p className="text-[10px] text-muted-foreground italic">Visível para clientes na vitrine.</p>
                </div>
                <Switch 
                  checked={formData.published} 
                  onCheckedChange={(val) => setFormData({...formData, published: val})} 
                />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-primary/5">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Destaque Hero</Label>
                  <p className="text-[10px] text-muted-foreground italic">Exibir na seção principal.</p>
                </div>
                <Switch 
                  checked={formData.featured} 
                  onCheckedChange={(val) => setFormData({...formData, featured: val})} 
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 bg-secondary/20 border-t border-primary/5">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="rounded-full px-8 text-[10px] font-bold uppercase tracking-widest"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading || uploading}
            className="rounded-full px-12 h-14 bg-primary text-white shadow-xl shadow-primary/20 text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
