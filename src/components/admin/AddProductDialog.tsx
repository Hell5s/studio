
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
  Plus,
  Move,
  Pencil,
  TrendingUp,
  Minus,
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
import { Badge } from '@/components/ui/badge';

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
  const [colorInput, setColorInput] = useState('');

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
    image: '' as any,
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
      await addDoc(collection(db, 'products', productId, 'reviews'), review);
    }
  };

  const parseSafeNumber = (val: any) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    let str = String(val).trim();
    if (str.includes(',') && str.includes('.')) {
      // Formato "1.234,56" -> remove separador de milhar, vírgula vira ponto decimal
      str = str.replace(/\./g, '').replace(',', '.');
    } else if (str.includes(',')) {
      // Formato "129,90" -> só troca a vírgula por ponto
      str = str.replace(',', '.');
    }
    // Se só tem ponto (ex: "129.90" vindo de toFixed), já está no formato certo, não mexe
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  const handleCalculateIA = () => {
    const cost = parseSafeNumber(formData.cost);
    if (!cost) {
      toast({ title: "Custo inválido", variant: "destructive" });
      return;
    }
    const price = (Math.ceil(cost * 3) - 0.10).toFixed(2);
    const oldPrice = (Math.ceil(cost * 4) - 0.10).toFixed(2);
    setFormData(prev => ({ ...prev, price, oldPrice }));
    toast({ title: "Preços calculados!", description: "Margem de 3x aplicada com sucesso." });
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

  const handleToggleSize = (size: string) => {
    let sizesArr = formData.sizes.split(',').map(s => s.trim()).filter(Boolean);
    if (sizesArr.includes(size)) {
      sizesArr = sizesArr.filter(s => s !== size);
    } else {
      sizesArr.push(size);
    }
    setFormData({ ...formData, sizes: sizesArr.join(', ') });
  };

  const handleAddColor = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = e.currentTarget.value.trim();
      if (val) {
        let colorsArr = formData.colors.split(',').map(c => c.trim()).filter(Boolean);
        if (!colorsArr.includes(val)) {
          colorsArr.push(val);
          setFormData({ ...formData, colors: colorsArr.join(', ') });
        }
        setColorInput('');
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('draggedIndex', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    const draggedIndex = parseInt(e.dataTransfer.getData('draggedIndex'));
    if (draggedIndex === targetIndex || isNaN(draggedIndex)) return;

    const newGallery = [...formData.gallery];
    const [draggedItem] = newGallery.splice(draggedIndex, 1);
    newGallery.splice(targetIndex, 0, draggedItem);

    setFormData(prev => ({ ...prev, gallery: newGallery }));
  };

  const handleOpenChangeAttempt = (open: boolean) => {
    if (!open) {
      const isDirty = formData.name || parseSafeNumber(formData.price) > 0 || formData.description;
      if (isDirty) {
        if (confirm("Você tem alterações não salvas. Deseja sair mesmo assim?")) {
          onOpenChange(false);
        }
      } else {
        onOpenChange(false);
      }
    } else {
      onOpenChange(true);
    }
  };

  const costNum = parseSafeNumber(formData.cost);
  const priceNum = parseSafeNumber(formData.price);
  const profit = priceNum - costNum;
  const margin = costNum > 0 ? (profit / costNum) * 100 : 0;
  const marginColor = margin > 50 ? "text-green-600" : margin > 20 ? "text-yellow-600" : "text-red-600";

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChangeAttempt}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto rounded-[2rem] p-0 border-none shadow-2xl bg-[#F4F6F8]">
          <div className="bg-[#2A1F22] p-8 text-white flex items-center justify-between sticky top-0 z-20 shadow-lg">
            <div className="flex items-center gap-6">
              <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center"><Package className="h-6 w-6 text-primary" /></div>
              <DialogHeader>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent/60 mb-1">NOVO CADASTRO</p>
                <DialogTitle className="text-2xl font-bold">{product ? 'Editar Peça' : 'Peça Exclusiva'}</DialogTitle>
              </DialogHeader>
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
                  
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Descrição do Produto</Label>
                      <span className={cn("text-[9px] font-bold uppercase", formData.description.length > 150 ? "text-red-500" : "text-primary/40")}>
                        {formData.description.length}/150
                      </span>
                    </div>
                    <Textarea 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      placeholder="Breve descrição para a vitrine..."
                      className="bg-white border-gray-200 min-h-[100px] rounded-xl" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm">
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Preço Venda (R$)</Label><Input value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-white border-gray-200 h-12 rounded-xl" /></div>
                    <div className="space-y-2"><Label>Preço Original "De" (R$)</Label><Input value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} className="bg-white border-gray-200 h-12 rounded-xl" /></div>
                  </div>

                  <div className="space-y-3">
                    <Label>Tamanhos Disponíveis</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['PP', 'P', 'M', 'G', 'GG', 'G1', 'G2'].map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleToggleSize(size)}
                          className={cn(
                            "px-4 py-2 rounded-full text-[10px] font-bold border transition-all",
                            formData.sizes.split(',').map(s => s.trim()).includes(size)
                              ? "bg-primary text-white border-primary shadow-md"
                              : "bg-white text-primary border-primary/10 hover:border-primary/40"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Cores (Digite e aperte Enter)</Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-white border border-gray-200 rounded-xl min-h-[56px] items-center">
                      {formData.colors.split(',').map(c => c.trim()).filter(Boolean).map((color, i) => (
                        <Badge key={i} className="bg-secondary text-primary hover:bg-secondary flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/5">
                          {color}
                          <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => {
                            const arr = formData.colors.split(',').map(c => c.trim()).filter(Boolean);
                            setFormData({...formData, colors: arr.filter(c => c !== color).join(', ')});
                          }} />
                        </Badge>
                      ))}
                      <input
                        value={colorInput}
                        onChange={e => setColorInput(e.target.value)}
                        onKeyDown={handleAddColor}
                        placeholder={formData.colors ? "Adicionar..." : "Ex: Rose, Off-White..."}
                        className="flex-1 bg-transparent border-none outline-none text-xs px-2 min-w-[120px]"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div className="flex items-center gap-3"><ImageIcon className="h-5 w-5 text-primary" /><h4 className="text-[11px] font-bold uppercase tracking-widest">Galeria de Fotos</h4></div>
                  <Button variant="ghost" size="sm" onClick={() => galleryInputRef.current?.click()} className="h-8 text-accent text-[10px] font-bold uppercase border border-accent/20 px-4 rounded-full">+ Fotos</Button>
                </div>
                <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" multiple onChange={handleGalleryUpload} />
                <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                   {formData.gallery.map((img, idx) => (
                     <div 
                      key={idx} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, idx)}
                      className="relative aspect-square rounded-xl overflow-hidden bg-white border border-gray-100 group shadow-sm cursor-move active:scale-95 transition-transform"
                     >
                        <img src={getImageUrl(img)} className="w-full h-full object-cover pointer-events-none" style={{ objectPosition: img.crop ? `${img.crop.x}% ${img.crop.y}%` : 'center', transform: img.zoom ? `scale(${img.zoom})` : 'none' }} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity z-10">
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleOpenEditor(idx, 'gallery'); }} 
                             className="p-1.5 bg-blue-500 text-white rounded-md hover:scale-110 transition-transform"
                           >
                             <Pencil className="h-3 w-3" />
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== idx) })); }} 
                             className="p-1.5 bg-red-500 text-white rounded-md hover:scale-110 transition-transform"
                           >
                             <X className="h-3 w-3" />
                           </button>
                        </div>
                        <div className="absolute top-1 left-1 p-1 bg-white/80 rounded-md opacity-0 group-hover:opacity-100">
                          <Move className="h-2.5 w-2.5 text-primary" />
                        </div>
                     </div>
                   ))}
                   {uploading && <div className="aspect-square rounded-xl bg-white flex items-center justify-center border-2 border-dashed border-accent/20"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div>}
                </div>
              </section>

              {/* Dados Operacionais */}
              <section className="space-y-6 bg-white p-8 rounded-[2rem] shadow-sm border border-primary/5">
                <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-3"><TrendingUp className="h-5 w-5" /><h4 className="text-[11px] font-bold uppercase tracking-widest">Dados Operacionais (Apenas Admin)</h4></div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label>Link do Fornecedor (AliExpress, Shopee, etc)</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input value={formData.supplierUrl} onChange={e => setFormData({...formData, supplierUrl: e.target.value})} placeholder="https://..." className="h-11 pl-12 bg-secondary/10 border-none rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Custo no Fornecedor (R$)</Label>
                      <Input value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} placeholder="Ex: 45.00" className="h-11 bg-secondary/10 border-none rounded-xl" />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleCalculateIA}
                      className="h-8 text-accent text-[9px] font-bold uppercase bg-accent/10 hover:bg-accent hover:text-white rounded-full px-4"
                    >
                      <Sparkles className="h-3 w-3 mr-1" /> + Calcular Preço com IA
                    </Button>
                    {costNum > 0 && priceNum > 0 && (
                      <p className={cn("text-[9px] font-bold uppercase italic ml-2", marginColor)}>
                        Lucro: R$ {profit.toFixed(2)} ({margin.toFixed(0)}%)
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Nome do Fornecedor</Label>
                    <Input value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} placeholder="Ex: Global Store" className="h-11 bg-secondary/10 border-none rounded-xl" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Observações Internas</Label>
                    <Textarea value={formData.internalNotes} onChange={e => setFormData({...formData, internalNotes: e.target.value})} placeholder="Ex: Tamanho chinês é menor, pedir um número a mais." className="bg-secondary/10 border-none min-h-[80px] rounded-xl p-4 text-xs italic" />
                  </div>
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
                      <Input placeholder="Nome da Cor" value={v.image} onChange={e => {
                        const newVars = [...formData.variations];
                        newVars[i].image = e.target.value;
                        setFormData({...formData, variations: newVars});
                      }} className="h-10 text-xs bg-white border-none rounded-xl px-4 flex-[2]" />
                      <button onClick={() => setFormData(prev => ({ ...prev, variations: prev.variations.filter((_, idx) => idx !== i) }))} className="text-red-300 hover:text-red-500 p-2"><X className="h-5 w-5" /></button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <div className="sticky top-28 space-y-8">
                <Card className="rounded-[2.5rem] bg-white shadow-xl overflow-hidden border-none">
                  <div 
                    className="aspect-[3/5] bg-gray-100 relative group cursor-pointer" 
                    onClick={() => !formData.image && fileInputRef.current?.click()}
                  >
                    {formData.image ? (
                      <>
                        <img 
                          src={getImageUrl(formData.image)} 
                          className="w-full h-full object-cover" 
                          style={{ 
                            objectPosition: (formData.image as any).crop ? `${(formData.image as any).crop.x}% ${(formData.image as any).crop.y}%` : 'center', 
                            transform: (formData.image as any).zoom ? `scale(${(formData.image as any).zoom})` : 'none' 
                          }} 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleOpenEditor(0, 'image'); }} 
                             className="p-3 bg-blue-500 text-white rounded-full hover:scale-110 transition-transform shadow-xl"
                             title="Editar Enquadramento"
                           >
                             <Pencil className="h-5 w-5" />
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} 
                             className="p-3 bg-accent text-primary rounded-full hover:scale-110 transition-transform shadow-xl"
                             title="Trocar Foto"
                           >
                             <Upload className="h-5 w-5" />
                           </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30" onClick={() => fileInputRef.current?.click()}>
                        <ImageIcon className="h-12 w-12" />
                        <span className="text-[10px] font-bold mt-2">CAPA</span>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    {uploading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-30"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}
                  </div>
                  <div className="p-6 text-center">
                    <p className="font-bold text-primary truncate">{formData.name || 'Preview'}</p>
                    <p className="text-sm font-bold text-accent">R$ {formData.price || '0,00'}</p>
                  </div>
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
                     <div className="flex items-center justify-between"><Label className="text-white text-xs">Mais Vendido</Label><Switch checked={formData.bestseller} onCheckedChange={v => setFormData({...formData, bestseller: v})} /></div>
                  </div>
                </Card>
                
                <Button variant="outline" onClick={handleAIGenerate} disabled={generatingAI} className="w-full h-14 rounded-2xl border-accent/20 text-accent font-bold uppercase text-[10px] tracking-widest">
                  {generatingAI ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />} Gerar Editorial com IA
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
              crop={crop} 
              zoom={zoom} 
              aspect={editingImage?.field === 'image' ? 3/5 : 9/16} 
              onCropChange={setCrop} 
              onZoomChange={setZoom} 
              showGrid={false}
              cropShape="rect"
              classes={{
                containerClassName: "h-full w-full",
                mediaClassName: "max-w-none max-h-none object-none"
              }}
            />
          </div>
          <div className="p-8 bg-[#2A1F22] flex items-center justify-between gap-8">
            <div className="flex-1 flex items-center gap-4">
              <button onClick={() => setZoom(z => Math.max(1, z - 0.1))} className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"><Minus className="h-4 w-4" /></button>
              <input 
                type="range" 
                min={1} 
                max={3} 
                step={0.1} 
                value={zoom} 
                onChange={e => setZoom(Number(e.target.value))} 
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accent" 
              />
              <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"><Plus className="h-4 w-4" /></button>
            </div>
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
