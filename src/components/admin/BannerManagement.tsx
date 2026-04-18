
"use client";

import React, { useState } from 'react';
import { Sparkles, Loader2, Plus, Trash2, Image as ImageIcon, CheckCircle2, XCircle, Save } from 'lucide-react';
import { generateBannerImage } from '@/ai/flows/admin-generate-banner-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp } from 'firebase/firestore';

export function BannerManagement() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [previewImage, setPreviewImage] = useState('');

  const bannersQuery = query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
  const { data: banners, isLoading } = useCollection(bannersQuery);

  const handleGenerate = async () => {
    if (!prompt) {
      toast({ title: "Prompt necessário", description: "Descreva o conceito do banner.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateBannerImage({ prompt });
      setPreviewImage(result.imageUrl);
      toast({ title: "Imagem gerada!", description: "Sua campanha está pronta para visualização." });
    } catch (error) {
      toast({ title: "Erro na IA", description: "Não foi possível gerar a imagem agora.", variant: "destructive" });
    } finally {
      setIsGenerating(true);
      setTimeout(() => setIsGenerating(false), 2000); // Simular processamento de download/preview
    }
  };

  const handleSaveBanner = () => {
    if (!previewImage) return;

    addDocumentNonBlocking(collection(db, 'banners'), {
      title: prompt,
      subtitle: "Coleção Exclusiva Toda Bela",
      imageUrl: previewImage,
      active: true,
      order: (banners?.length || 0) + 1,
      ctaText: "Comprar Agora",
      createdAt: serverTimestamp()
    });

    setPreviewImage('');
    setPrompt('');
    toast({ title: "Banner Ativado", description: "Sua vitrine foi atualizada." });
  };

  const toggleStatus = (banner: any) => {
    updateDocumentNonBlocking(doc(db, 'banners', banner.id), {
      active: !banner.active
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Remover este banner?')) {
      deleteDocumentNonBlocking(doc(db, 'banners', id));
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col gap-2">
        <h4 className="text-3xl font-headline font-bold text-primary">Estúdio Criativo IA</h4>
        <p className="text-sm text-muted-foreground italic font-light">Crie campanhas visuais exclusivas usando o poder do Imagen 3.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-10">
        <Card className="p-10 border-none bg-white shadow-2xl rounded-[3rem] space-y-8">
          <div className="space-y-4">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-accent">Conceito da Campanha</Label>
            <div className="flex gap-4">
              <Input 
                placeholder="Ex: Primavera elegante em tons pastéis com tecidos leves..." 
                className="rounded-full h-16 px-8 bg-secondary/20 border-none focus:ring-2 focus:ring-primary/10"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              />
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="rounded-full h-16 px-10 bg-primary shadow-xl hover:scale-105 transition-all"
              >
                {isGenerating ? <Loader2 className="animate-spin h-5 w-5" /> : <Sparkles className="h-5 w-5 mr-2" />}
                Gerar com IA
              </Button>
            </div>
          </div>

          <div className="aspect-[21/9] rounded-[2.5rem] bg-secondary/30 overflow-hidden relative group">
            {previewImage ? (
              <>
                <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <Button onClick={handleSaveBanner} className="rounded-full bg-white text-primary font-bold px-8">
                    <Save className="mr-2 h-4 w-4" /> Ativar na Home
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-primary/20 space-y-4">
                <ImageIcon className="h-16 w-16" />
                <p className="text-sm font-bold uppercase tracking-widest">Aguardando sua ideia</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-10 border-none bg-primary text-white shadow-2xl rounded-[3rem] space-y-8">
          <h5 className="text-xl font-headline font-bold">Banners Ativos</h5>
          <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
            {banners?.map(banner => (
              <div key={banner.id} className="p-4 rounded-3xl bg-white/10 border border-white/5 space-y-3">
                <div className="aspect-video rounded-2xl overflow-hidden relative">
                  <img src={banner.imageUrl} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => handleDelete(banner.id)}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase truncate max-w-[150px]">{banner.title}</p>
                  <button onClick={() => toggleStatus(banner)}>
                    {banner.active ? <CheckCircle2 className="h-5 w-5 text-green-400" /> : <XCircle className="h-5 w-5 text-white/20" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
