
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Save, Loader2, Upload, Image as ImageIcon, Video, Link as LinkIcon, Type, MousePointer2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function AdminMovementSection() {
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'movementSection'), [db]);
  const { data: movementSettings, isLoading } = useDoc(settingsRef);

  const [formData, setFormData] = useState({
    eyebrow: 'MOVIMENTO TODA BELA',
    title: 'Moda com Propósito',
    description: 'Cada peça em nossa boutique é selecionada pela nossa equipe para elevar sua confiança e refletir sua autenticidade em cada movimento.',
    buttonText: 'CONHEÇA A COLEÇÃO',
    buttonLink: '/#colecoes',
    mediaType: 'image' as 'image' | 'video',
    mediaUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80'
  });

  useEffect(() => {
    if (movementSettings) {
      setFormData(prev => ({ ...prev, ...movementSettings }));
    }
  }, [movementSettings]);

  const uploadToCloudinary = async (file: File) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'todabela_upload');
    
    const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
    const response = await fetch(`https://api.cloudinary.com/v1_1/djtuzexfd/${resourceType}/upload`, {
      method: 'POST',
      body: data
    });

    if (!response.ok) throw new Error('Falha no upload para o Cloudinary');
    const result = await response.json();
    return result.secure_url;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      setFormData(prev => ({ ...prev, mediaUrl: url, mediaType: type }));
      toast({ title: "Arquivo carregado!" });
    } catch (error: any) {
      toast({ title: "Erro no upload", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(settingsRef, formData, { merge: true });
      toast({ title: "Seção Movimento atualizada!" });
    } catch (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-primary/5 sticky top-0 z-30">
         <div>
            <h4 className="text-2xl font-headline font-bold text-primary flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-accent" /> Seção Movimento
            </h4>
            <p className="text-xs text-muted-foreground italic">Gerencie o manifesto visual da sua marca na Home.</p>
         </div>
         <Button 
          onClick={handleSave} 
          disabled={loading} 
          className="bg-primary text-white rounded-full px-12 h-14 font-bold uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all"
         >
           {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
           Salvar Alterações
         </Button>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-10">
          <Card className="p-10 border-none bg-white shadow-premium rounded-[3rem] space-y-8">
            <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
               <Type className="h-5 w-5" />
               <h5 className="text-[11px] font-bold uppercase tracking-[0.4em]">Textos da Seção</h5>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Chamada (Eyebrow)</Label>
                <Input 
                  value={formData.eyebrow} 
                  onChange={e => setFormData({...formData, eyebrow: e.target.value.toUpperCase()})} 
                  className="h-14 rounded-2xl bg-secondary/10 border-none px-6" 
                />
              </div>
              <div className="space-y-2">
                <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Título Principal</Label>
                <Input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="h-14 rounded-2xl bg-secondary/10 border-none px-6 font-headline text-lg" 
                />
              </div>
              <div className="space-y-2">
                <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Descrição / Manifesto</Label>
                <Textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="rounded-[2rem] bg-secondary/10 border-none p-8 italic min-h-[140px] leading-relaxed" 
                />
              </div>
            </div>
          </Card>

          <Card className="p-10 border-none bg-white shadow-premium rounded-[3rem] space-y-8">
            <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
               <MousePointer2 className="h-5 w-5" />
               <h5 className="text-[11px] font-bold uppercase tracking-[0.4em]">Configuração do Botão</h5>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Texto do Botão</Label>
                <Input value={formData.buttonText} onChange={e => setFormData({...formData, buttonText: e.target.value.toUpperCase()})} className="h-14 rounded-2xl bg-secondary/10 border-none px-6" />
              </div>
              <div className="space-y-2">
                <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Link (URL)</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent/40" />
                  <Input value={formData.buttonLink} onChange={e => setFormData({...formData, buttonLink: e.target.value})} className="h-14 rounded-2xl bg-secondary/10 border-none pl-12" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-10">
          <Card className="p-8 border-none bg-white shadow-premium rounded-[3rem] space-y-6">
            <div className="flex items-center justify-between border-b border-primary/5 pb-4">
               <div className="flex items-center gap-3 text-accent">
                 <ImageIcon className="h-5 w-5" />
                 <h5 className="text-[10px] font-bold uppercase tracking-[0.3em]">Mídia da Seção</h5>
               </div>
               <div className="flex gap-2">
                 <button 
                  onClick={() => setFormData({...formData, mediaType: 'image'})}
                  className={cn("p-2 rounded-lg transition-colors", formData.mediaType === 'image' ? "bg-accent text-primary" : "bg-secondary/20 text-primary/40")}
                 >
                   <ImageIcon className="h-4 w-4" />
                 </button>
                 <button 
                  onClick={() => setFormData({...formData, mediaType: 'video'})}
                  className={cn("p-2 rounded-lg transition-colors", formData.mediaType === 'video' ? "bg-accent text-primary" : "bg-secondary/20 text-primary/40")}
                 >
                   <Video className="h-4 w-4" />
                 </button>
               </div>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[4/5] rounded-[2rem] border-2 border-dashed border-primary/10 relative overflow-hidden group cursor-pointer bg-secondary/5"
            >
              {formData.mediaUrl ? (
                formData.mediaType === 'video' ? (
                  <video src={formData.mediaUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={formData.mediaUrl} className="w-full h-full object-cover" alt="Preview" />
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-primary/20 space-y-2">
                   <Upload className="h-10 w-10" />
                   <span className="text-[8px] font-bold uppercase">Upload Mídia</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 {uploading ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white h-8 w-8" />}
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/mp4" onChange={handleFileUpload} />
            
            <p className="text-[9px] text-center text-muted-foreground italic px-4">
              Dica: Use vídeos verticais em MP4 ou imagens em alta resolução (mínimo 1200x1500px).
            </p>
          </Card>

          <div className="p-8 rounded-[2.5rem] bg-primary text-white space-y-4 shadow-xl">
             <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-accent" />
                <h6 className="text-[10px] font-bold uppercase tracking-widest">Preview de Texto</h6>
             </div>
             <div className="space-y-2">
                <span className="text-accent text-[8px] font-black uppercase tracking-[0.4em]">{formData.eyebrow}</span>
                <h5 className="font-headline text-xl leading-tight">{formData.title}</h5>
                <p className="text-[11px] opacity-60 italic font-light line-clamp-3 leading-relaxed">{formData.description}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
