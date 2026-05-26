
"use client";

import React, { useState, useRef } from 'react';
import { Layers, Plus, Trash2, Edit, Loader2, Upload, X, Image as ImageIcon, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function AdminCategories() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  
  const [newCat, setNewCat] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState('');

  const q = useMemoFirebase(() => query(collection(db, 'categories'), orderBy('order', 'asc')), [db]);
  const { data: categories, isLoading } = useCollection(q);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      
      if (isEdit) {
        setEditImage(url);
      } else {
        setNewCatImage(url);
      }
      
      toast({ title: "Imagem carregada no Cloudinary!" });
    } catch (error: any) {
      console.error("Erro upload categoria:", error);
      toast({ 
        title: "Erro no upload", 
        description: "Falha ao enviar para o Cloudinary. Verifique sua conexão.",
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleAdd = () => {
    if (!newCat) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    
    addDocumentNonBlocking(collection(db, 'categories'), {
      name: newCat,
      image: newCatImage,
      order: (categories?.length || 0) + 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    setNewCat('');
    setNewCatImage('');
    toast({ title: "Categoria criada!" });
  };

  const handleUpdate = () => {
    if (!editingCategory || !editName) return;

    updateDocumentNonBlocking(doc(db, 'categories', editingCategory.id), {
      name: editName,
      image: editImage,
      updatedAt: serverTimestamp()
    });

    toast({ title: "Categoria atualizada!" });
    setEditingCategory(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (!id) return;
    
    try {
      const categoryRef = doc(db, 'categories', id);
      deleteDocumentNonBlocking(categoryRef);
      toast({ title: "Categoria removida com sucesso!" });
    } catch (error: any) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    }
  };

  const openEdit = (cat: any) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditImage(cat.image || '');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h4 className="text-3xl font-headline font-bold text-primary">Categorias</h4>
        <p className="text-sm text-muted-foreground italic font-light">Organize seu catálogo por estilos e coleções visuais.</p>
      </div>

      <Card className="p-10 border-none shadow-2xl bg-white rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
          <Layers className="h-40 w-40" />
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="grid md:grid-cols-[200px_1fr_auto] gap-8 items-end">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent ml-2">Imagem de Capa</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "aspect-square rounded-[2rem] border-2 border-dashed border-primary/10 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/30 transition-all overflow-hidden relative group",
                  newCatImage && "border-none"
                )}
              >
                {newCatImage ? (
                  <>
                    <img src={newCatImage} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Upload className="text-white h-6 w-6" />
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    {uploading ? <Loader2 className="h-6 w-6 animate-spin text-accent mx-auto" /> : <ImageIcon className="h-6 w-6 text-accent/30 mx-auto" />}
                    <span className="text-[8px] font-bold uppercase mt-2 block text-primary/40">Upload</span>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e)} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent ml-2">Nome da Categoria</label>
              <Input 
                placeholder="Ex: Moda Fitness, Vestidos, Plus Size..." 
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                className="h-16 rounded-full px-8 bg-secondary/20 border-none text-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <button 
              onClick={handleAdd} 
              disabled={!newCat || uploading}
              className="h-16 rounded-full px-10 bg-primary text-white shadow-xl hover:scale-105 transition-all font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />} Criar Categoria
            </button>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {isLoading ? (
          <div className="col-span-full py-32 text-center">
            <Loader2 className="animate-spin mx-auto h-12 w-12 text-accent/30" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mt-4">Sincronizando categorias...</p>
          </div>
        ) : categories && categories.length > 0 ? (
          categories.map((cat) => (
            <Card key={cat.id} className="group overflow-hidden border-none shadow-lg bg-white rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl">
              <div className="aspect-[4/5] relative bg-secondary/20">
                {cat.image ? (
                  <img src={cat.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={cat.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary/10">
                    <ImageIcon className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-60" />
                
                <div className="absolute top-4 right-4 flex gap-2 z-20">
                   <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openEdit(cat);
                    }}
                    className="h-10 w-10 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-all"
                   >
                     <Edit className="h-4 w-4" />
                   </button>
                   <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(cat.id, cat.name);
                    }}
                    className="h-10 w-10 rounded-full bg-white/90 text-red-500 flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all"
                   >
                     <Trash2 className="h-4 w-4" />
                   </button>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                   <p className="text-[9px] font-bold uppercase text-accent tracking-[0.3em] mb-1">Ordem #{cat.order}</p>
                   <h5 className="text-xl font-headline font-bold text-white tracking-tight truncate">{cat.name}</h5>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-32 text-center space-y-6 bg-white/40 rounded-[4rem] border-2 border-dashed border-primary/10">
             <Layers className="h-12 w-12 text-primary/10 mx-auto" />
             <div className="space-y-2">
                <h5 className="text-xl font-headline font-bold text-primary/40 uppercase tracking-widest">Nenhuma Categoria</h5>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto font-light italic">Comece adicionando categorias para organizar sua vitrine.</p>
             </div>
          </div>
        )}
      </div>

      <Dialog open={!!editingCategory} onOpenChange={(o) => !o && setEditingCategory(null)}>
        <DialogContent className="rounded-[2.5rem] bg-[#FFF9F7] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-primary p-8 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline font-bold">Editar Categoria</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex gap-6 items-center">
              <div 
                className="h-24 w-24 rounded-2xl bg-secondary/50 border-2 border-dashed border-primary/10 flex items-center justify-center overflow-hidden cursor-pointer relative group"
                onClick={() => editFileInputRef.current?.click()}
              >
                {editImage ? (
                  <img src={editImage} className="h-full w-full object-cover" alt="Edit Preview" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-primary/20" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   {uploading ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white h-5 w-5" />}
                </div>
                <input type="file" ref={editFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, true)} />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-accent ml-1">Nome da Categoria</label>
                <Input value={editName} onChange={e => setEditName(e.target.value)} className="rounded-xl h-12" />
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-secondary/20 flex gap-3">
            <button onClick={() => setEditingCategory(null)} className="rounded-full px-6 h-12 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors">Cancelar</button>
            <Button onClick={handleUpdate} disabled={uploading} className="rounded-full px-8 bg-primary text-white h-12 text-[10px] font-bold uppercase tracking-widest shadow-lg">
              {uploading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
