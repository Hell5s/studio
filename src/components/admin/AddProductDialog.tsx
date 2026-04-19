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
  Image as ImageIcon
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
import { collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useFirebase, addDocumentNonBlocking } from '@/firebase';
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
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    oldPrice: '',
    description: '',
    longDescription: '',
    category: 'Tops',
    collection: 'Moda Fitness',
    badge: 'Novo',
    image: '',
    gallery: '',
    stock: '',
    sizes: 'P, M, G, GG',
    colors: '',
    published: true,
    featured: false,
    bestseller: false,
    sourceUrl: ''
  });

  const parsePrice = (val: string) => {
    return Number(String(val).replace(/\./g, "").replace(",", ".")) || 0;
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.image) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, preço e imagem principal.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const productsRef = collection(db, 'products');
    
    const galleryImages = formData.gallery
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    addDocumentNonBlocking(productsRef, {
      ...formData,
      price: parsePrice(formData.price),
      oldPrice: formData.oldPrice ? parsePrice(formData.oldPrice) : null,
      stock: formData.stock ? Number(formData.stock) : 0,
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
      colors: formData.colors.split(',').map(c => c.trim()).filter(c => c),
      images: galleryImages.length > 0 ? galleryImages : [formData.image],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      source: 'Manual'
    });

    toast({
      title: "Produto Cadastrado",
      description: `${formData.name} foi adicionado à Boutique.`,
    });
    
    setLoading(false);
    onOpenChange(false);
    setFormData({
      name: '', price: '', oldPrice: '', description: '', longDescription: '',
      category: 'Tops', collection: 'Moda Fitness', badge: 'Novo', image: '', 
      gallery: '', stock: '', sizes: 'P, M, G, GG', colors: '', published: true, 
      featured: false, bestseller: false, sourceUrl: ''
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!storage) {
      toast({
        title: "Erro de Configuração",
        description: "O serviço de armazenamento não está disponível.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const storageRef = ref(storage, `products/uploads/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ ...prev, image: downloadURL }));
      toast({ title: "Imagem carregada com sucesso" });
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast({ 
        title: "Erro no upload", 
        description: error.message || "Não foi possível enviar a imagem.",
        variant: "destructive" 
      });
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
        ...(formData.colors ? [`Cores: ${formData.colors}`] : []),
        ...(formData.sizes ? [`Tamanhos: ${formData.sizes}`] : []),
        "Modelagem exclusiva Toda Bela",
        "Tecido de alta tecnologia"
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
        title: "Descrição Editorial Gerada!",
        description: "O texto foi criado seguindo a voz da marca.",
      });
    } catch (error) {
      toast({
        title: "Erro na IA",
        description: "Não foi possível conectar ao motor de IA.",
        variant: "destructive"
      });
    } finally {
      setGeneratingAI(false);
    }
  };

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
          {/* Form Side */}
          <div className="space-y-12">
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-accent">
                <Layers className="h-5 w-5" />
                <h4 className="text-[11px] font-bold uppercase tracking-widest">Coleção e Identidade</h4>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label>Nome do Produto</Label>
                  <input 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full rounded-2xl h-14 border-primary/5 bg-white shadow-sm px-4 outline-none"
                    placeholder="Ex: Top Alongado Decote Alto"
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
                    <option>Linha Básica</option>
                    <option>Casual Chic</option>
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
                    <option>Blusas</option>
                    <option>Acessórios</option>
                  </select>
                </div>
              </div>
            </section>

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

            <section className="space-y-6">
              <div className="flex items-center gap-3 text-accent">
                <ImageIcon className="h-5 w-5" />
                <h4 className="text-[11px] font-bold uppercase tracking-widest">Mídia e Distribuição</h4>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-[1fr_auto] gap-4">
                  <input 
                    value={formData.image}
                    onChange={e => setFormData({...formData, image: e.target.value})}
                    className="w-full rounded-2xl h-14 border-primary/5 bg-white shadow-sm px-4 outline-none"
                    placeholder="URL ou Upload da Imagem Principal"
                  />
                  <Button variant="outline" className="rounded-2xl h-14 border-primary/10" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  </Button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>
                <Label>Galeria de Imagens (uma URL por linha)</Label>
                <textarea 
                   value={formData.gallery}
                   onChange={e => setFormData({...formData, gallery: e.target.value})}
                   className="w-full rounded-2xl border-primary/5 bg-white shadow-sm min-h-[90px] px-4 py-3 outline-none"
                   placeholder="https://imagem1.jpg&#10;https://imagem2.jpg"
                />
                <input 
                  value={formData.sourceUrl}
                  onChange={e => setFormData({...formData, sourceUrl: e.target.value})}
                  className="w-full rounded-2xl h-14 border-primary/5 bg-white shadow-sm px-4 outline-none"
                  placeholder="Link Shopee (Privado)"
                />
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-accent">
                  <Sparkles className="h-5 w-5" />
                  <h4 className="text-[11px] font-bold uppercase tracking-widest">Conteúdo e Persuasão</h4>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAIGenerate} 
                  disabled={generatingAI}
                  className="rounded-full border-accent/20 text-accent hover:bg-accent hover:text-white"
                >
                  {generatingAI ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
                  Gerar Copys com IA
                </Button>
              </div>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Tamanhos Disponíveis</Label>
                    <input 
                      value={formData.sizes}
                      onChange={e => setFormData({...formData, sizes: e.target.value})}
                      className="w-full rounded-2xl h-14 border-primary/5 bg-white shadow-sm px-4 outline-none"
                      placeholder="P, M, G, GG"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cores Principais</Label>
                    <input 
                      value={formData.colors}
                      onChange={e => setFormData({...formData, colors: e.target.value})}
                      className="w-full rounded-2xl h-14 border-primary/5 bg-white shadow-sm px-4 outline-none"
                      placeholder="Preto, Rose, Off White"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Resumo Vitrine (Curta)</Label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full rounded-2xl border-primary/5 bg-white shadow-sm min-h-[80px] px-4 py-3 outline-none"
                    placeholder="Uma frase impactante para a listagem"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição Completa (Editorial)</Label>
                  <textarea 
                    value={formData.longDescription}
                    onChange={e => setFormData({...formData, longDescription: e.target.value})}
                    className="w-full rounded-2xl border-primary/5 bg-white shadow-sm min-h-[160px] px-4 py-3 outline-none"
                    placeholder="História da peça, tecidos, cuidados e sugestões de uso..."
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Preview Side */}
          <div className="space-y-8">
            <div className="sticky top-28 space-y-8">
              <div className="rounded-[3rem] bg-white shadow-2xl overflow-hidden border border-primary/5">
                <div className="p-6 bg-secondary/30 border-b border-primary/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Prévia Boutique</span>
                  <Badge variant="outline" className="rounded-full">{formData.badge}</Badge>
                </div>
                <div className="aspect-[3/4] bg-muted relative">
                  {formData.image ? (
                    <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                      <ImageIcon className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <div className="p-8 text-center space-y-4">
                  <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-accent">{formData.collection}</p>
                  <h5 className="font-headline font-bold text-xl text-primary truncate">{formData.name || 'Nome da Peça'}</h5>
                  <div className="space-y-1">
                    <p className="text-3xl font-light text-primary">R$ {formData.price || '0,00'}</p>
                    <p className="text-[10px] text-muted-foreground/60 italic">ou 10x de R$ {(parsePrice(formData.price) / 10).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-primary text-primary-foreground space-y-6">
                <h6 className="text-[10px] font-bold uppercase tracking-widest text-accent">Status da Peça</h6>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                    <Label className="text-white">Publicar Agora</Label>
                    <Switch checked={formData.published} onCheckedChange={v => setFormData({...formData, published: v})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Destaque Principal</Label>
                    <Switch checked={formData.featured} onCheckedChange={v => setFormData({...formData, featured: v})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Mais Vendido</Label>
                    <Checkbox 
                      checked={formData.bestseller} 
                      onCheckedChange={(checked) => setFormData({...formData, bestseller: !!checked})}
                      className="border-white data-[state=checked]:bg-accent data-[state=checked]:text-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}