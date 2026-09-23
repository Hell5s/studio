"use client";

import React, { useState, useMemo } from 'react';
import { 
  Presentation, 
  Plus, 
  Trash2, 
  Edit, 
  Loader2, 
  Search, 
  Save, 
  Layers,
  CheckCircle2,
  XCircle,
  Package,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase, 
  addDocumentNonBlocking, 
  deleteDocumentNonBlocking, 
  updateDocumentNonBlocking 
} from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn, getItemImageUrl } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function AdminShowcaseSections() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [productSearch, setProductSearch] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);

  const [formData, setFormData] = useState({
    eyebrow: 'EDITORIAL DE ESTILO',
    title: '',
    linkText: 'VER TODAS AS PEÇAS',
    linkUrl: '/#vitrine',
    productIds: [] as string[],
    order: 1,
    active: true
  });

  // Consulta de Seções
  const sectionsQuery = useMemoFirebase(() => query(collection(db, 'homeShowcaseSections'), orderBy('order', 'asc')), [db]);
  const { data: sections, isLoading: loadingSections } = useCollection(sectionsQuery);

  // Consulta de Produtos para o seletor
  const productsQuery = useMemoFirebase(() => query(collection(db, 'products'), orderBy('createdAt', 'desc')), [db]);
  const { data: allProducts, isLoading: loadingProducts } = useCollection(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    const s = productSearch.toLowerCase().trim();
    if (!s) return allProducts.slice(0, 10);
    return allProducts.filter(p => p.name?.toLowerCase().includes(s) || p.category?.toLowerCase().includes(s)).slice(0, 20);
  }, [allProducts, productSearch]);

  const handleOpenDialog = (section?: any) => {
    if (section) {
      setEditingSection(section);
      setFormData({
        eyebrow: section.eyebrow || 'EDITORIAL DE ESTILO',
        title: section.title || '',
        linkText: section.linkText || 'VER TODAS AS PEÇAS',
        linkUrl: section.linkUrl || '/#vitrine',
        productIds: section.productIds || [],
        order: section.order || 1,
        active: section.active !== false
      });
    } else {
      setEditingSection(null);
      setFormData({
        eyebrow: 'EDITORIAL DE ESTILO',
        title: '',
        linkText: 'VER TODAS AS PEÇAS',
        linkUrl: '/#vitrine',
        productIds: [],
        order: (sections?.length || 0) + 1,
        active: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleMigrateDefaults = async () => {
    if (!allProducts || allProducts.length === 0) {
      toast({ title: "Catálogo vazio", description: "Cadastre produtos antes de migrar as vitrines.", variant: "destructive" });
      return;
    }
    
    setIsMigrating(true);
    try {
      // 1. Vitrine "Novas Peças" (Editorial)
      const featuredIds = allProducts
        .filter(p => p.featured || p.badge === 'Destaque' || p.badge === 'Lançamento' || p.published !== false)
        .slice(0, 12)
        .map(p => p.id);

      // 2. Vitrine "Mais Vendidos" (Destaques Absolutos)
      const bestsellerIds = allProducts
        .filter(p => p.bestseller || p.published !== false)
        .reverse() // Lógica diferente para simular outra seleção
        .slice(0, 12)
        .map(p => p.id);

      if (featuredIds.length > 0) {
        await addDoc(collection(db, 'homeShowcaseSections'), {
          eyebrow: 'EDITORIAL DE ESTILO',
          title: 'Novas Peças',
          linkText: 'VER TODAS AS PEÇAS',
          linkUrl: '/#vitrine',
          productIds: featuredIds,
          order: 1,
          active: true,
          createdAt: serverTimestamp()
        });
      }

      if (bestsellerIds.length > 0) {
        await addDoc(collection(db, 'homeShowcaseSections'), {
          eyebrow: 'DESTAQUES ABSOLUTOS',
          title: 'Mais Vendidos',
          linkText: 'EXPLORAR OFERTAS',
          linkUrl: '/economize',
          productIds: bestsellerIds,
          order: 10,
          active: true,
          createdAt: serverTimestamp()
        });
      }

      toast({ title: "Migração Concluída!", description: "As vitrines fixas agora são editáveis." });
    } catch (e) {
      toast({ title: "Erro na migração", variant: "destructive" });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSave = () => {
    if (!formData.title || formData.productIds.length === 0) {
      toast({ title: "Dados incompletos", description: "Preencha o título e escolha pelo menos um produto.", variant: "destructive" });
      return;
    }

    if (editingSection) {
      updateDocumentNonBlocking(doc(db, 'homeShowcaseSections', editingSection.id), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Vitrine atualizada!" });
    } else {
      addDocumentNonBlocking(collection(db, 'homeShowcaseSections'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      toast({ title: "Vitrine criada!" });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Remover a vitrine "${title}" permanentemente?`)) {
      deleteDocumentNonBlocking(doc(db, 'homeShowcaseSections', id));
      toast({ title: "Vitrine removida." });
    }
  };

  const toggleProduct = (id: string) => {
    setFormData(prev => {
      const newIds = new Set(prev.productIds);
      if (newIds.has(id)) newIds.delete(id);
      else newIds.add(id);
      return { ...prev, productIds: Array.from(newIds) };
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="h-px w-8 bg-accent" />
             <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Curadoria Visual</span>
          </div>
          <h1 className="text-4xl font-headline font-bold text-primary tracking-tighter">Vitrines da Home</h1>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={() => handleOpenDialog()}
            className="rounded-full h-16 px-10 bg-primary text-white shadow-xl hover:scale-105 transition-all font-bold uppercase tracking-widest text-[10px]"
          >
            <Plus className="mr-2 h-5 w-5" /> Criar Nova Seção
          </Button>
        </div>
      </header>

      <div className="grid gap-6">
        {loadingSections ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin h-10 w-10 text-accent mx-auto" /></div>
        ) : sections && sections.length > 0 ? (
          sections.map((section) => (
            <Card key={section.id} className="p-8 border-none shadow-sm bg-white rounded-[2.5rem] group hover:shadow-premium transition-all duration-500">
               <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                     <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center text-primary shrink-0">
                        <Presentation className="h-7 w-7" />
                     </div>
                     <div className="space-y-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase text-accent tracking-[0.3em]">{section.eyebrow}</p>
                        <h4 className="text-xl font-headline font-bold text-primary truncate">{section.title}</h4>
                        <div className="flex items-center gap-4 text-[9px] font-black uppercase text-primary/30 tracking-widest">
                           <span>Ordem: {section.order}</span>
                           <span>•</span>
                           <span>{section.productIds?.length || 0} Produtos selecionados</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                     <div className="flex items-center gap-2 px-4 py-2 bg-secondary/30 rounded-full border border-primary/5">
                        <Switch 
                          checked={section.active !== false} 
                          onCheckedChange={(v) => updateDocumentNonBlocking(doc(db, 'homeShowcaseSections', section.id), { active: v })}
                        />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60">{section.active !== false ? 'No Ar' : 'Oculta'}</span>
                     </div>
                     <div className="flex gap-2 ml-auto">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(section)} className="rounded-full h-10 w-10 text-primary hover:bg-secondary"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(section.id, section.title)} className="rounded-full h-10 w-10 text-red-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                     </div>
                  </div>
               </div>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center bg-white/40 border-2 border-dashed border-primary/10 rounded-[4rem] space-y-8 flex flex-col items-center">
             <Presentation className="h-16 w-16 text-primary/10 mx-auto" />
             <div className="space-y-2">
                <h5 className="text-xl font-headline font-bold text-primary/40 uppercase tracking-widest">Sem Vitrines Ativas</h5>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto font-light italic">Comece criando suas seleções manuais ou restaure as vitrines padrão para o seu catálogo.</p>
             </div>
             
             <Button 
                onClick={handleMigrateDefaults}
                disabled={isMigrating}
                className="rounded-full h-14 px-10 bg-accent text-primary hover:brightness-110 font-bold uppercase tracking-widest text-[10px] shadow-xl"
              >
                {isMigrating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Migrar Vitrines Padrão
              </Button>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-0 border-none shadow-2xl bg-[#FFF9F7]">
          <div className="bg-primary p-8 text-white flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <Presentation className="h-6 w-6 text-accent" />
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline font-bold">{editingSection ? 'Editar Vitrine' : 'Nova Vitrine'}</DialogTitle>
              </DialogHeader>
            </div>
            <Button onClick={handleSave} className="rounded-full px-8 bg-accent text-primary font-bold uppercase text-[10px] tracking-widest shadow-xl border-none h-11">
              <Save className="mr-2 h-4 w-4" /> {editingSection ? 'Salvar Alterações' : 'Criar Vitrine'}
            </Button>
          </div>

          <div className="p-10 grid lg:grid-cols-[1fr_400px] gap-12">
            <div className="space-y-10">
               <section className="space-y-6">
                  <div className="flex items-center gap-3 text-primary border-b border-primary/5 pb-3">
                    <Layers className="h-5 w-5 text-accent" />
                    <h5 className="text-[11px] font-bold uppercase tracking-widest">Informações Editoriais</h5>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className="ml-2 text-[9px] font-bold uppercase text-muted-foreground">Chamada (Eyebrow)</Label>
                       <Input value={formData.eyebrow} onChange={e => setFormData({...formData, eyebrow: e.target.value.toUpperCase()})} className="rounded-xl h-12 bg-white" />
                    </div>
                    <div className="space-y-2">
                       <Label className="ml-2 text-[9px] font-bold uppercase text-muted-foreground">Título Principal</Label>
                       <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="rounded-xl h-12 bg-white font-bold" />
                    </div>
                    <div className="space-y-2">
                       <Label className="ml-2 text-[9px] font-bold uppercase text-muted-foreground">Texto do Link</Label>
                       <Input value={formData.linkText} onChange={e => setFormData({...formData, linkText: e.target.value.toUpperCase()})} className="rounded-xl h-12 bg-white" />
                    </div>
                    <div className="space-y-2">
                       <Label className="ml-2 text-[9px] font-bold uppercase text-muted-foreground">URL de Destino</Label>
                       <Input value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} className="rounded-xl h-12 bg-white" />
                    </div>
                    <div className="space-y-2">
                       <Label className="ml-2 text-[9px] font-bold uppercase text-muted-foreground">Ordem de Exibição</Label>
                       <Input type="number" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} className="rounded-xl h-12 bg-white" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-primary/5">
                       <Label className="text-[11px] font-bold uppercase text-primary">Seção Ativa</Label>
                       <Switch checked={formData.active} onCheckedChange={v => setFormData({...formData, active: v})} />
                    </div>
                  </div>
               </section>

               <section className="space-y-6">
                  <div className="flex items-center justify-between text-primary border-b border-primary/5 pb-3">
                    <div className="flex items-center gap-3 text-accent"><Package className="h-5 w-5" /><h5 className="text-[11px] font-bold uppercase tracking-widest">Escolher Produtos</h5></div>
                    <Badge className="bg-primary text-white rounded-full px-4">{formData.productIds.length} Selecionados</Badge>
                  </div>
                  
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20" />
                    <Input 
                      placeholder="Buscar no catálogo..." 
                      className="rounded-full h-12 pl-12 bg-white border-none shadow-sm"
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                    {loadingProducts ? (
                       <div className="col-span-full py-10 text-center"><Loader2 className="animate-spin h-6 w-6 text-accent mx-auto" /></div>
                    ) : filteredProducts.map(p => {
                      const pImg = getItemImageUrl(p.image);
                      return (
                        <div 
                          key={p.id} 
                          onClick={() => toggleProduct(p.id)}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group",
                            formData.productIds.includes(p.id) ? "bg-white border-primary shadow-md" : "bg-white/40 border-transparent hover:border-accent/30"
                          )}
                        >
                           <div className="h-16 w-12 rounded-lg overflow-hidden bg-secondary shrink-0 border border-primary/5">
                              {pImg ? <img src={pImg} className="w-full h-full object-cover" alt="product" /> : <div className="h-full w-full bg-secondary/20" />}
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-primary truncate uppercase">{p.name}</p>
                              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">{p.category}</p>
                              <p className="text-[10px] font-bold text-accent mt-1">R$ {p.price?.toFixed(2)}</p>
                           </div>
                           <Checkbox checked={formData.productIds.includes(p.id)} onCheckedChange={() => {}} className="pointer-events-none" />
                        </div>
                      );
                    })}
                  </div>
               </section>
            </div>

            <div className="space-y-8">
               <Card className="p-8 rounded-[2.5rem] bg-white shadow-xl space-y-6 sticky top-28">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-accent border-b border-primary/5 pb-4">Sua Seleção</h5>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar pr-2">
                    {formData.productIds.length > 0 ? (
                      formData.productIds.map(id => {
                        const p = allProducts?.find(item => item.id === id);
                        if (!p) return null;
                        const pImg = getItemImageUrl(p.image);
                        return (
                          <div key={id} className="flex items-center gap-4 p-3 bg-secondary/20 rounded-xl group relative">
                             {pImg ? <img src={pImg} className="h-12 w-10 object-cover rounded-lg border border-primary/5" alt="item" /> : <div className="h-12 w-10 rounded-lg bg-secondary/20" />}
                             <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-primary truncate uppercase">{p.name}</p>
                                <p className="text-[9px] text-accent font-bold">R$ {p.price?.toFixed(2)}</p>
                             </div>
                             <button 
                              onClick={(e) => { e.stopPropagation(); toggleProduct(id); }}
                              className="opacity-0 group-hover:opacity-100 p-1 bg-red-500 text-white rounded-full transition-opacity absolute -top-1 -right-1"
                             >
                               <X className="h-3 w-3" />
                             </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-20 text-center space-y-3 opacity-20">
                         <Plus className="h-10 w-10 mx-auto" />
                         <p className="text-[10px] font-bold uppercase">Nenhum item selecionado</p>
                      </div>
                    )}
                  </div>
                  
                  {formData.productIds.length > 0 && (
                    <div className="pt-4 border-t border-primary/5">
                       <Button variant="ghost" onClick={() => setFormData({...formData, productIds: []})} className="w-full h-10 text-[9px] font-bold uppercase text-red-400 hover:text-red-600 hover:bg-red-50">Remover Todos</Button>
                    </div>
                  )}
               </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
