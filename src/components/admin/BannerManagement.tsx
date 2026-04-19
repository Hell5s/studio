
"use client";

import React, { useState } from 'react';
import { Sparkles, Loader2, Plus, Trash2, Image as ImageIcon, CheckCircle2, XCircle, Save, Type, MousePointer2 } from 'lucide-react';
import { generateBannerImage } from '@/ai/flows/admin-generate-banner-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp } from 'firebase/firestore';

export function BannerManagement() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  
  // Novos campos para personalização do banner
  const [bannerData, setBannerData] = useState({
    title: 'Nova Coleção',
    subtitle: 'A essência da sofisticação para seus dias.',
    ctaText: 'Conferir Looks'
  });

  const bannersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
  }, [db]);
  
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
      setIsGenerating(false);
    }
  };

  const handleSaveBanner = () => {
    if (!previewImage) return;

    addDocumentNonBlocking(collection(db, 'banners'), {
      ...bannerData,
      imageUrl: previewImage,
      active: true,
      order: (banners?.length || 0) + 1,
      createdAt: serverTimestamp()
    });

    setPreviewImage('');
    setPrompt('');
    setBannerData({
      title: 'Nova Coleção',
      subtitle: 'A essência da sofisticação para seus dias.',
      ctaText: 'Conferir Looks'
    });
    toast({ title: "Banner Ativado", description: "Sua vitrine foi atualizada com a nova campanha." });
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
        <p className="text-sm text-muted-foreground italic font-light">Crie e ative campanhas visuais exclusivas para sua página inicial.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-8">
          <Card className="p-10 border-none bg-white shadow-2xl rounded-[3rem] space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-accent">Conceito Visual (IA)</Label>
              <div className="flex gap-4">
                <Input 
                  placeholder="Ex: Editorial de moda em um jardim luxuoso com luz de pôr do sol..." 
                  className="rounded-full h-16 px-8 bg-secondary/20 border-none focus:ring-2 focus:ring-primary/10"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                />
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  className="rounded-full h-16 px-10 bg-primary shadow-xl hover:scale-105 transition-all text-white"
                >
                  {isGenerating ? <Loader2 className="animate-spin h-5 w-5" /> : <Sparkles className="h-5 w-5 mr-2" />}
                  Gerar com IA
                </Button>
              </div>
            </div>

            {previewImage && (
              <div className="grid md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-500">
                <div className="space-y-4">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                    <Type className="h-3 w-3" /> Títulos do Banner
                  </Label>
                  <div className="space-y-3">
                    <Input 
                      placeholder="Título Principal" 
                      value={bannerData.title}
                      onChange={e => setBannerData({...bannerData, title: e.target.value})}
                      className="bg-secondary/10 border-none"
                    />
                    <Input 
                      placeholder="Subtítulo" 
                      value={bannerData.subtitle}
                      onChange={e => setBannerData({...bannerData, subtitle: e.target.value})}
                      className="bg-secondary/10 border-none"
                    />
                    <Input 
                      placeholder="Texto do Botão" 
                      value={bannerData.ctaText}
                      onChange={e => setBannerData({...bannerData, ctaText: e.target.value})}
                      className="bg-secondary/10 border-none"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                   <Label className="text-[10px] font-bold uppercase tracking-widest text-accent">Prévia da Imagem</Label>
                   <div className="aspect-video rounded-2xl overflow-hidden shadow-lg border border-primary/5">
                      <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
                   </div>
                </div>
              </div>
            )}

            <div className="aspect-[21/9] rounded-[2.5rem] bg-secondary/30 overflow-hidden relative group border-2 border-dashed border-primary/10">
              {previewImage ? (
                <>
                  <img src={previewImage} className="w-full h-full object-cover" alt="Final Preview" />
                  {/* Simulação do texto do banner na prévia */}
                  <div className="absolute inset-0 bg-black/20 flex flex-col justify-end p-8 text-white">
                     <h3 className="text-2xl font-bold uppercase tracking-tighter">{bannerData.title}</h3>
                     <p className="text-xs italic opacity-80">{bannerData.subtitle}</p>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <Button onClick={handleSaveBanner} className="rounded-full bg-white text-primary font-bold px-10 h-14 shadow-2xl hover:scale-105 transition-transform">
                      <Save className="mr-2 h-5 w-5" /> Ativar na Home
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
        </div>

        <Card className="p-10 border-none bg-primary text-white shadow-2xl rounded-[3rem] space-y-8">
          <h5 className="text-xl font-headline font-bold">Banners Ativos</h5>
          <div className="space-y-4 max-h-[600px] overflow-y-auto no-scrollbar">
            {isLoading ? (
              <div className="py-20 text-center opacity-20"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>
            ) : banners?.length === 0 ? (
              <p className="text-xs italic opacity-40 text-center py-10">Nenhuma campanha registrada.</p>
            ) : banners?.map(banner => (
              <div key={banner.id} className="p-4 rounded-3xl bg-white/10 border border-white/5 space-y-3 group">
                <div className="aspect-video rounded-2xl overflow-hidden relative">
                  <img src={banner.imageUrl} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => handleDelete(banner.id)}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase truncate">{banner.title}</p>
                    <p className="text-[8px] opacity-50 italic">Ativo na vitrine</p>
                  </div>
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
