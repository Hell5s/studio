
"use client";

import React, { useState, useRef, useEffect } from 'react';
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
  Link as LinkIcon,
  Plus,
  Move,
  Pencil,
  Check,
  Presentation
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
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { doc, serverTimestamp, collection, getDocs, query, orderBy, where, arrayUnion, arrayRemove, getDoc, addDoc } from 'firebase/firestore';
import { useFirestore, setDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase, useCollection } from '@/firebase';
import { adminGenerateProductDescription } from '@/ai/flows/admin-generate-product-description-flow';
import { cn } from '@/lib/utils';
import Cropper from 'react-easy-crop';

// Pool de dados para avaliações demonstrativas
const DEMO_REVIEWS_POOL = {
  names: ["VALENTINA S.", "HELENA M.", "BEATRIZ R.", "ISABELA F.", "CAMILA G.", "LARISSA P.", "JULIANA B.", "MARIA CLARA T.", "SOPHIA V.", "ALICE L.", "GIOVANNA C.", "MANUELA D.", "LÍVIA H.", "LORENA K.", "MAYA P."],
  headlines: [
    "Simplesmente deslumbrante!", "Caimento impecável", "Qualidade surpreendente", 
    "Superou as expectativas", "Elegância pura", "Minha nova peça favorita", 
    "Acabamento de luxo", "Veste muito bem", "Amei cada detalhe", "Sofisticação garantida"
  ],
  comments: [
    "O tecido é maravilhoso e o caimento valoriza muito o corpo. Recomendo demais!",
    "A cor é ainda mais bonita pessoalmente. Entrega rápida e embalagem caprichada.",
    "Fiquei impressionada com a qualidade do acabamento. Vale cada centavo.",
    "Uma peça atemporal que toda mulher deveria ter no guarda-roupa. Sofisticação pura.",
    "O atendimento foi ótimo e o produto é de altíssimo nível. Com certeza comprarei mais.",
    "Tecido leve e confortável, perfeito para qualquer ocasião especial.",
    "A modelagem é perfeita, seguiu exatamente a tabela de medidas.",
    "Simplesmente apaixonada! O brilho do tecido é sutil e elegante.",
    "Chegou super rápido. A Toda Bela realmente entende de moda feminina de luxo.",
    "É difícil encontrar peças com esse nível de detalhe. Parabéns pela curadoria."
  ]
};

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
}

export function AddProductDialog({ open, onOpenChange, product }: AddProductDialogProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const variationInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [activeVariationIndex, setActiveVariationIndex] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>(['Vestidos', 'Plus Size', 'Moda Fitness', 'Conjuntos', 'Casual Chic']);

  // Vitrines
  const showcasesQuery = useMemoFirebase(() => query(collection(db, 'homeShowcaseSections'), where('active', '==', true)), [db]);
  const { data: showcases } = useCollection(showcasesQuery);
  const [selectedShowcaseIds, setSelectedShowcaseIds] = useState<Set<string>>(new Set());

  // Editor de Recorte
  const [editingImage, setEditingImage] = useState<{ index: number, field: 'gallery' | 'image' } | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'categories'), orderBy('name')));
        const names = snap.docs.map(d => d.data().name).filter(Boolean);
        if (names.length > 0) setCategories(names);
      } catch (e) {}
    };
    fetchCategories();
  }, [db]);
  
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
    gallery: [] as any[],
    stock: '10',
    sizes: 'P, M, G, GG',
    colors: '',
    published: true,
    featured: false,
    bestseller: false,
    variations: [] as { color: string; image: string }[]
  });

  useEffect(() => {
    if (open) {
      if (product) {
        setFormData({
          name: product.name || '',
          price: product.price?.toString() || '',
          oldPrice: product.oldPrice?.toString() || '',
          cost: product.cost?.toString() || '',
          supplierUrl: product.supplierUrl || product.sourceUrl || '',
          supplierName: product.supplierName || product.vendorName || '',
          internalNotes: product.internalNotes || '',
          description: product.description || '',
          longDescription: product.longDescription || '',
          category: product.category || 'Vestidos',
          collection: product.collection || 'Nova Coleção',
          badge: product.badge || '',
          image: product.image || '',
          gallery: product.images || [],
          stock: product.stock?.toString() || '10',
          sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : (product.sizes || 'P, M, G, GG'),
          colors: Array.isArray(product.colors) ? product.colors.join(', ') : (product.colors || ''),
          published: product.published !== false,
          featured: !!product.featured,
          bestseller: !!product.bestseller,
          variations: product.variations || []
        });

        if (showcases) {
          const initial = new Set<string>();
          showcases.forEach(s => {
            if (s.productIds?.includes(product.id)) {
              initial.add(s.id);
            }
          });
          setSelectedShowcaseIds(initial);
        }
      } else {
        setFormData({
          name: '', price: '', oldPrice: '', cost: '', supplierUrl: '', supplierName: '',
          internalNotes: '', description: '', longDescription: '',
          category: 'Vestidos', collection: 'Nova Coleção', badge: 'Novo', image: '', 
          gallery: [], stock: '10', sizes: 'P, M, G, GG', colors: '', published: true, 
          featured: false, bestseller: false, variations: []
        });
        setSelectedShowcaseIds(new Set());
      }
    }
  }, [product, open, showcases]);

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

  const generateDemoReviews = async (productId: string, productName: string, productImage: string) => {
    const settingsSnap = await getDoc(doc(db, 'settings', 'reviews'));
    const settings = settingsSnap.data();
    
    if (settings?.demoEnabled === false) return;

    const min = settings?.minQty || 4;
    const max = settings?.maxQty || 12;
    const qty = Math.floor(Math.random() * (max - min + 1)) + min;

    const shuffle = (array: any[]) => [...array].sort(() => 0.5 - Math.random());
    const names = shuffle(DEMO_REVIEWS_POOL.names);
    const headlines = shuffle(DEMO_REVIEWS_POOL.headlines);
    const comments = shuffle(DEMO_REVIEWS_POOL.comments);

    const sizes = ["P", "M", "G", "GG"];

    for (let i = 0; i < qty; i++) {
      const review = {
        productId,
        productName,
        productImage,
        user: names[i % names.length],
        headline: headlines[i % headlines.length],
        comment: comments[i % comments.length],
        rating: Math.random() > 0.3 ? 5 : 4,
        size: sizes[Math.floor(Math.random() * sizes.length)],
        recommended: true,
        isDemo: true,
        status: 'published',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 15 * 24 * 60 * 60 * 1000)).toISOString()
      };
      // Grava na subcoleção conforme as regras de segurança
      await addDoc(collection(db, 'products', productId, 'reviews'), review);
    }
  };

  const parseSafeNumber = (val: any) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const str = String(val).trim();
    // Remove pontos de milhar e converte vírgula decimal em ponto
    const normalized = str.replace(/\./g, "").replace(",", ".");
    const num = parseFloat(normalized);
    return isNaN(num) ? 0 : num;
  };

  const handleSave = async () => {
    const finalMainImage = formData.image || (formData.gallery.length > 0 ? formData.gallery[0] : '');

    if (!formData.name || !formData.price || !finalMainImage) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, preço de venda e imagem de capa.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const isEdit = !!product?.id;
    const productId = isEdit ? product.id : `prod-${Date.now()}`;
    const productRef = doc(db, 'products', productId);

    const payload = {
      ...formData,
      id: productId,
      price: parseSafeNumber(formData.price),
      oldPrice: formData.oldPrice ? parseSafeNumber(formData.oldPrice) : null,
      cost: parseSafeNumber(formData.cost),
      stock: parseSafeNumber(formData.stock),
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
      colors: formData.colors.split(',').map(c => c.trim()).filter(c => c),
      image: finalMainImage,
      images: formData.gallery.length > 0 ? formData.gallery : [finalMainImage],
      updatedAt: serverTimestamp(),
      ...(isEdit ? {} : { createdAt: serverTimestamp() })
    };

    try {
      if (isEdit) {
        updateDocumentNonBlocking(productRef, payload);
      } else {
        setDocumentNonBlocking(productRef, payload, { merge: true });
        const displayImg = typeof finalMainImage === 'string' ? finalMainImage : finalMainImage?.url;
        await generateDemoReviews(productId, formData.name, displayImg || '');
      }

      showcases?.forEach(showcase => {
        const showcaseRef = doc(db, 'homeShowcaseSections', showcase.id);
        if (selectedShowcaseIds.has(showcase.id)) {
          updateDocumentNonBlocking(showcaseRef, { productIds: arrayUnion(productId) });
        } else {
          updateDocumentNonBlocking(showcaseRef, { productIds: arrayRemove(productId) });
        }
      });

      toast({
        title: isEdit ? "Produto Atualizado" : "Produto Cadastrado",
        description: `${formData.name} foi ${isEdit ? 'atualizado' : 'adicionado'} com sucesso.`,
      });
      
      onOpenChange(false);
    } catch (e) {
      console.error("Erro ao salvar produto:", e);
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, image: { url, crop: { x: 0, y: 0 }, zoom: 1 } as any }));
      toast({ title: "Imagem carregada!" });
    } catch (error: any) {
      toast({ title: "Erro no upload", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    try {
      const newItems: any[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadToCloudinary(files[i]);
        newItems.push({ url, crop: { x: 0, y: 0 }, zoom: 1 });
      }
      setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...newItems] }));
      toast({ title: "Galeria atualizada!" });
    } catch (error: any) {
      toast({ title: "Erro na galeria", variant: "destructive" });
    } finally {
      setUploading(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleVariationFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeVariationIndex === null) return;
    
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      const newVars = [...formData.variations];
      newVars[activeVariationIndex] = { ...newVars[activeVariationIndex], image: url };
      setFormData(prev => ({ ...prev, variations: newVars }));
      toast({ title: "Variação salva!" });
    } catch (error: any) {
      toast({ title: "Erro no upload", variant: "destructive" });
    } finally {
      setUploading(false);
      setActiveVariationIndex(null);
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
      toast({ title: "Editorial Gerado!" });
    } catch (e) {
      toast({ title: "IA Indisponível", variant: "destructive" });
    } finally {
      setGeneratingAI(false);
    }
  };

  const getImageUrl = (img: any) => typeof img === 'string' ? img : img?.url;

  const handleOpenEditor = (index: number, field: 'gallery' | 'image') => {
    const img = field === 'image' ? formData.image : formData.gallery[index];
    setEditingImage({ index, field });
    setCrop(img?.crop || { x: 0, y: 0 });
    setZoom(img?.zoom || 1);
  };

  const handleSaveCrop = () => {
    if (!editingImage) return;
    const { index, field } = editingImage;
    if (field === 'image') {
      const current = typeof formData.image === 'string' ? { url: formData.image } : formData.image;
      setFormData({ ...formData, image: { ...current, crop, zoom } as any });
    } else {
      const newGallery = [...formData.gallery];
      const current = typeof newGallery[index] === 'string' ? { url: newGallery[index] } : newGallery[index];
      newGallery[index] = { ...current, crop, zoom };
      setFormData({ ...formData, gallery: newGallery });
    }
    setEditingImage(null);
  };

  const toggleShowcaseSelection = (id: string) => {
    setSelectedShowcaseIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
      return newSet;
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto rounded-[2rem] p-0 border-none shadow-2xl bg-[#F4F6F8]">
          <div className="bg-[#2A1F22] p-8 text-white flex items-center justify-between sticky top-0 z-20 shadow-lg">
            <div className="flex items-center gap-6">
              <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center"><Package className="h-6 w-6 text-primary" /></div>
              <DialogHeader><DialogTitle className="text-2xl font-bold">{product ? 'Editar Peça' : 'Peça Exclusiva'}</DialogTitle></DialogHeader>
            </div>
            <Button onClick={handleSave} disabled={loading} className="rounded-full px-10 h-12 bg-accent text-primary hover:brightness-110 font-bold uppercase tracking-widest text-[10px] shadow-xl border-none">
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} {product ? 'Salvar Alterações' : 'Publicar Produto'}
            </Button>
          </div>

          <div className="p-10 grid xl:grid-cols-[1fr_400px] gap-10">
            <div className="space-y-10">
              <section className="space-y-6">
                <div className="flex items-center gap-3 text-primary border-b border-gray-200 pb-3"><Layers className="h-5 w-5" /><h4 className="text-[11px] font-bold uppercase tracking-widest">Informações Vitrine</h4></div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2"><Label>Nome da Peça</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-white border-gray-200 h-12 rounded-xl" /></div>
                  <div className="md:col-span-2 space-y-2"><Label>Descrição</Label><Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-white border-gray-200 min-h-[100px] rounded-xl" /></div>
                  
                  <div className="space-y-2"><Label>Link do Fornecedor (Dropshipping)</Label><Input value={formData.supplierUrl} onChange={e => setFormData({...formData, supplierUrl: e.target.value})} placeholder="https://..." className="bg-white border-gray-200 h-12 rounded-xl" /></div>
                  <div className="space-y-2"><Label>Nome do Fornecedor</Label><Input value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} placeholder="Ex: Kaisan, Shopee..." className="bg-white border-gray-200 h-12 rounded-xl" /></div>

                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm">
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Preço (R$)</Label><Input value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-white border-gray-200 h-12 rounded-xl" /></div>
                    <div className="space-y-2"><Label>Original (R$)</Label><Input value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} className="bg-white border-gray-200 h-12 rounded-xl" /></div>
                  </div>
                  <div className="space-y-2"><Label>Tamanhos (P, M, G...)</Label><Input value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} className="bg-white border-gray-200 h-12 rounded-xl" /></div>
                  <div className="space-y-2"><Label>Cores (Rosa, Azul...)</Label><Input value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} className="bg-white border-gray-200 h-12 rounded-xl" /></div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div className="flex items-center gap-3"><ImageIcon className="h-5 w-5 text-primary" /><h4 className="text-[11px] font-bold uppercase tracking-widest">Galeria</h4></div>
                  <Button variant="ghost" size="sm" onClick={() => galleryInputRef.current?.click()} className="text-accent text-[10px] font-bold uppercase">+ Fotos</Button>
                </div>
                <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" multiple onChange={handleGalleryUpload} />
                <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                   {formData.gallery.map((img, idx) => (
                     <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-white border border-gray-100 group shadow-sm">
                        <img src={getImageUrl(img)} className="w-full h-full object-cover" style={{ objectPosition: img.crop ? `${img.crop.x}% ${img.crop.y}%` : 'center', transform: img.zoom ? `scale(${img.zoom})` : 'none' }} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1">
                           <button onClick={() => handleOpenEditor(idx, 'gallery')} className="p-1.5 bg-blue-500 text-white rounded-md"><Pencil className="h-3 w-3" /></button>
                           <button onClick={() => setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== idx) }))} className="p-1.5 bg-red-500 text-white rounded-md"><X className="h-3 w-3" /></button>
                        </div>
                     </div>
                   ))}
                   {uploading && <div className="aspect-square rounded-xl bg-white flex items-center justify-center border-2 border-dashed border-accent/20"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div>}
                </div>
              </section>

              <section className="space-y-6 bg-white p-8 rounded-[2rem] shadow-sm border border-primary/5">
                <input type="file" ref={variationInputRef} className="hidden" accept="image/*" onChange={handleVariationFileUpload} />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-accent"><Palette className="h-5 w-5" /><h4 className="text-[11px] font-bold uppercase tracking-widest">Variações por Cor</h4></div>
                  <Button variant="ghost" size="sm" onClick={() => setFormData(prev => ({ ...prev, variations: [...prev.variations, { color: '', image: '' }] }))} className="text-accent text-[9px] font-bold uppercase">+ Nova Cor</Button>
                </div>
                <div className="grid gap-4">
                  {formData.variations.map((v, i) => (
                    <div key={i} className="flex gap-4 items-center bg-secondary/10 p-4 rounded-2xl border border-primary/5">
                      <div 
                        className="h-16 w-12 rounded-lg overflow-hidden bg-white border border-primary/10 cursor-pointer relative group"
                        onClick={() => { setActiveVariationIndex(i); variationInputRef.current?.click(); }}
                      >
                        {v.image ? <img src={v.image} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center opacity-20"><Upload className="h-4 w-4" /></div>}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Upload className="text-white h-4 w-4" /></div>
                      </div>
                      <Input placeholder="Nome da Cor" value={v.color} onChange={e => {
                        const newVars = [...formData.variations];
                        newVars[i].color = e.target.value;
                        setFormData({...formData, variations: newVars});
                      }} className="h-10 text-xs bg-white border-none rounded-xl px-4 flex-1" />
                      <button onClick={() => setFormData(prev => ({ ...prev, variations: prev.variations.filter((_, idx) => idx !== i) }))} className="text-red-300 hover:text-red-500 p-2"><X className="h-5 w-5" /></button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <div className="sticky top-28 space-y-8">
                <Card className="rounded-[2.5rem] bg-white shadow-xl overflow-hidden border-none">
                  <div className="aspect-[3/5] bg-gray-100 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {formData.image ? (
                      <img src={getImageUrl(formData.image)} className="w-full h-full object-cover" style={{ objectPosition: (formData.image as any).crop ? `${(formData.image as any).crop.x}% ${(formData.image as any).crop.y}%` : 'center', transform: (formData.image as any).zoom ? `scale(${(formData.image as any).zoom})` : 'none' }} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30"><ImageIcon className="h-12 w-12" /><span className="text-[10px] font-bold mt-2">CAPA</span></div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    {uploading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}
                  </div>
                  <div className="p-6 text-center"><p className="font-bold text-primary truncate">{formData.name || 'Preview'}</p></div>
                </Card>

                <Card className="p-8 rounded-[2rem] bg-white border-none shadow-premium space-y-4">
                   <h6 className="text-[10px] font-bold uppercase tracking-widest text-accent border-b border-primary/5 pb-2">Vitrines da Home</h6>
                   <div className="space-y-3">
                      {showcases?.map(s => (
                        <div key={s.id} className="flex items-center gap-3">
                          <Checkbox id={s.id} checked={selectedShowcaseIds.has(s.id)} onCheckedChange={() => toggleShowcaseSelection(s.id)} />
                          <Label htmlFor={s.id} className="text-[11px] font-medium text-primary/80 cursor-pointer">{s.title}</Label>
                        </div>
                      ))}
                      {!showcases?.length && <p className="text-[10px] italic text-muted-foreground">Nenhuma vitrine ativa.</p>}
                   </div>
                </Card>

                <Card className="p-8 rounded-[2rem] bg-primary text-white space-y-4 shadow-xl border-none">
                  <h6 className="text-[10px] font-bold uppercase tracking-widest text-accent">Configurações</h6>
                  <div className="space-y-3">
                     <div className="flex items-center justify-between"><Label className="text-white text-xs">Publicado</Label><Switch checked={formData.published} onCheckedChange={v => setFormData({...formData, published: v})} /></div>
                     <div className="flex items-center justify-between"><Label className="text-white text-xs">Destaque</Label><Switch checked={formData.featured} onCheckedChange={v => setFormData({...formData, featured: v})} /></div>
                  </div>
                </Card>
                
                <Button variant="outline" onClick={handleAIGenerate} disabled={generatingAI} className="w-full h-14 rounded-2xl border-accent/20 text-accent font-bold uppercase text-[10px] tracking-widest">
                  {generatingAI ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />} IA Editorial
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Crop Editor */}
      <Dialog open={!!editingImage} onOpenChange={(o) => !o && setEditingImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none rounded-[2rem]">
          <div className="relative h-[60vh] w-full">
            <Cropper
              image={getImageUrl(editingImage?.field === 'image' ? formData.image : formData.gallery[editingImage?.index || 0])}
              crop={crop} zoom={zoom} aspect={3/5} onCropChange={setCrop} onZoomChange={setZoom} showGrid={false}
            />
          </div>
          <div className="p-8 bg-[#2A1F22] flex items-center justify-between gap-8">
            <div className="flex-1"><input type="range" min={1} max={3} step={0.1} value={zoom} onChange={e => setZoom(Number(e.target.value))} className="w-full accent-accent" /></div>
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setEditingImage(null)} className="text-white uppercase text-[10px] font-bold">Cancelar</Button>
              <Button onClick={handleSaveCrop} className="bg-accent text-primary font-bold uppercase text-[10px] h-12 px-10 rounded-full">Salvar Enquadramento</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
