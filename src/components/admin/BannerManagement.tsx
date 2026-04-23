
"use client";

import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  CheckCircle2, 
  XCircle, 
  Save, 
  Type, 
  Upload,
  Layers,
  MessageSquareText,
  Link as LinkIcon
} from 'lucide-react';
import { generateBannerImage } from '@/ai/flows/admin-generate-banner-flow';
import { generateBannerTexts } from '@/ai/flows/admin-generate-banner-text-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useFirebase } from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { cn } from '@/lib/utils';

export function BannerManagement() {
  const db = useFirestore();
  const { storage } = useFirebase();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingTexts, setIsGeneratingTexts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '1:1' | '4:3'>('16:9');
  const [previewImage, setPreviewImage] = useState('');
  
  const [bannerData, setBannerData] = useState({
    title: '',
    subtitle: '',
    ctaText: 'Conferir Looks'
  });

  const bannersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
  }, [db]);
  
  const { data: banners, isLoading } = useCollection(bannersQuery);

  const handleUseUrl = () => {
    if (!imageUrl) return;
    if (!imageUrl.startsWith('http')) {
      toast({ title: "URL Inválida", description: "O link deve começar com http:// ou https://", variant: "destructive" });
      return;
    }
    setPreviewImage(imageUrl);
    setImageUrl('');
    toast({ title: "Link da imagem carregado!" });
  };

  const handleGenerate = async () => {
    if (!prompt) {
      toast({ title: "Inspiração necessária", description: "Diga à IA o que você imagina para o banner (ex: Verão em Paris).", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setPreviewImage('');
    try {
      const result = await generateBannerImage({ prompt, aspectRatio });
      setPreviewImage(result.imageUrl);
      toast({ title: "Imagem gerada!" });
    } catch (error: any) {
      toast({ 
        title: "Erro na IA", 
        description: error.message || "Não foi possível gerar a imagem agora.", 
        variant: "destructive" 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateTexts = async () => {
    if (!prompt && !previewImage) {
      toast({ title: "Falta informação", description: "Envie uma imagem ou escreva um tema para a IA se inspirar.", variant: "destructive" });
      return;
    }

    setIsGeneratingTexts(true);
    try {
      const result = await generateBannerTexts({ 
        concept: prompt,
        imageUrl: previewImage 
      });
      setBannerData({
        title: result.title,
        subtitle: result.subtitle,
        ctaText: result.ctaText
      });
      toast({ title: "Textos criados!" });
    } catch (error: any) {
      toast({ title: "Falha na redação", description: "Não conseguimos gerar os textos agora.", variant: "destructive" });
    } finally {
      setIsGeneratingTexts(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setPreviewImage('');
    try {
      const storageRef = ref(storage!, `banners/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000',
      });
      const url = await getDownloadURL(snapshot.ref);
      setPreviewImage(url);
      toast({ title: "Imagem carregada com sucesso!" });
    } catch (error: any) {
      toast({ 
        title: "Erro no upload", 
        description: "Não foi possível carregar a imagem.", 
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveBanner = () => {
    if (!previewImage) return;

    addDocumentNonBlocking(collection(db, 'banners'), {
      ...bannerData,
      imageUrl: previewImage,
      aspectRatio,
      active: true,
      order: (banners?.length || 0) + 1,
      createdAt: serverTimestamp()
    });

    setPreviewImage('');
    setPrompt('');
    setBannerData({ title: '', subtitle: '', ctaText: 'Conferir Looks' });
    toast({ title: "Banner Ativado" });
  };

  const toggleStatus = (banner: any) => {
    updateDocumentNonBlocking(doc(db, 'banners', banner.id), {
      active: !banner.active
    });
  };

  const handleDelete = (id: string) => {
    if (!id) return;
    deleteDocumentNonBlocking(doc(db, 'banners', id));
    toast({ title: "Banner removido" });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col gap-2">
        <h4 className="text-3xl font-headline font-bold text-primary">Estúdio Criativo</h4>
        <p className="text-sm text-muted-foreground italic font-light">Crie por IA, URL direta ou upload manual de campanhas para sua vitrine.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-8">
          <Card className="p-10 border-none bg-white shadow-2xl rounded-[3rem] space-y-8">
            <div className="grid md:grid-cols-[1fr_200px] gap-6">
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-accent">Tema da Campanha (Opcional)</Label>
                <Input 
                  placeholder="Ex: Coleção de Inverno, Promoção 20%, Vibe Tropical..." 
                  className="rounded-full h-16 px-8 bg-secondary/20 border-none focus:ring-2 focus:ring-primary/10"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                />
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-accent">Proporção</Label>
                <select 
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as any)}
                  className="w-full h-16 rounded-full px-6 bg-secondary/20 border-none text-sm font-bold text-primary outline-none"
                >
                  <option value="16:9">Horizontal (16:9)</option>
                  <option value="1:1">Quadrado (1:1)</option>
                  <option value="4:3">Clássico (4:3)</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              {/* Opção de URL Direta */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-accent/40" />
                  <Input 
                    placeholder="Colar URL da imagem (ex: https://...)" 
                    className="rounded-full h-16 pl-14 pr-6 bg-secondary/10 border-none focus:ring-1 focus:ring-accent/20"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleUseUrl}
                  disabled={!imageUrl}
                  className="rounded-full h-16 px-8 bg-accent text-primary font-bold uppercase tracking-widest text-[10px] hover:brightness-110 shadow-lg"
                >
                  Usar esta URL
                </Button>
              </div>

              {/* Divisor Visual */}
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-primary/5"></div>
                <span className="flex-shrink mx-4 text-[9px] font-black text-primary/10 uppercase tracking-[0.3em]">OU</span>
                <div className="flex-grow border-t border-primary/5"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || isUploading}
                  className="rounded-full h-16 bg-primary shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-white font-bold uppercase tracking-widest text-[11px]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-3" />
                      Gerando Obra...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-3" />
                      Gerar Foto com IA
                    </>
                  )}
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGenerating || isUploading}
                  className="rounded-full h-16 border-accent text-accent shadow-xl hover:scale-[1.02] active:scale-95 transition-all font-bold uppercase tracking-widest text-[11px]"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-3" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-3" />
                      Enviar Minha Foto
                    </>
                  )}
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>
            </div>

            {previewImage && (
              <div className="grid md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-500 bg-[#FFF9F7] p-8 rounded-[2rem] border border-primary/5">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                      <Type className="h-3 w-3" /> Textos do Banner
                    </Label>
                    <button 
                      onClick={handleGenerateTexts}
                      disabled={isGeneratingTexts}
                      className="text-[9px] font-black uppercase text-primary/60 hover:text-accent flex items-center gap-1.5 transition-colors disabled:opacity-30"
                    >
                      {isGeneratingTexts ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <MessageSquareText className="h-2.5 w-2.5" />}
                      IA: Criar Ideias de Texto
                    </button>
                  </div>
                  <div className="space-y-4">
                    <Input placeholder="Título (ex: Elegância Pura)" value={bannerData.title} onChange={e => setBannerData({...bannerData, title: e.target.value})} className="bg-white border-none h-12 rounded-xl" />
                    <Input placeholder="Subtítulo (ex: Descubra o novo)" value={bannerData.subtitle} onChange={e => setBannerData({...bannerData, subtitle: e.target.value})} className="bg-white border-none h-12 rounded-xl" />
                    <Input placeholder="Texto do Botão" value={bannerData.ctaText} onChange={e => setBannerData({...bannerData, ctaText: e.target.value})} className="bg-white border-none h-12 rounded-xl" />
                  </div>
                  <Button onClick={handleSaveBanner} className="w-full rounded-full bg-primary text-white font-bold h-14 shadow-xl hover:bg-accent transition-colors text-[10px] uppercase tracking-widest">
                    <Save className="mr-2 h-5 w-5" /> Ativar na Vitrine
                  </Button>
                </div>
                <div className="space-y-4">
                   <Label className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                     <ImageIcon className="h-3 w-3" /> Visualização
                   </Label>
                   <div className={cn(
                     "rounded-2xl overflow-hidden shadow-2xl border border-white relative bg-white",
                     aspectRatio === '16:9' ? 'aspect-video' : 'aspect-square'
                   )}>
                      <img src={previewImage} className="w-full h-full object-cover" alt="Banner Result" />
                      <div className="absolute inset-0 bg-black/20 flex flex-col justify-end p-6 text-white pointer-events-none">
                         <h3 className="text-xl font-bold uppercase tracking-tighter leading-none">{bannerData.title}</h3>
                         <p className="text-[10px] italic opacity-80 mt-1">{bannerData.subtitle}</p>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        <Card className="p-10 border-none bg-primary text-white shadow-2xl rounded-[3rem] space-y-8 h-fit lg:sticky lg:top-28">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Layers className="h-5 w-5 text-accent" />
            <h5 className="text-xl font-headline font-bold">Arquivos Ativos</h5>
          </div>
          <div className="space-y-6 max-h-[500px] overflow-y-auto no-scrollbar pr-2">
            {isLoading ? (
              <div className="py-20 text-center opacity-20"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>
            ) : banners?.map(banner => (
              <div key={banner.id} className="p-4 rounded-3xl bg-white/10 border border-white/5 space-y-4 group hover:bg-white/15 transition-all">
                <div className="aspect-video rounded-2xl overflow-hidden relative shadow-lg">
                  <img src={banner.imageUrl} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => handleDelete(banner.id)}
                      className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-xl"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase truncate tracking-tight">{banner.title || 'Sem Título'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={cn("h-1.5 w-1.5 rounded-full", banner.active ? "bg-green-400" : "bg-white/20")} />
                      <p className="text-[8px] opacity-50 uppercase font-black">{banner.active ? 'No Ar' : 'Pausado'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleStatus(banner)}
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                      banner.active ? "bg-accent text-primary" : "bg-white/10 text-white/40"
                    )}
                  >
                    {banner.active ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
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
