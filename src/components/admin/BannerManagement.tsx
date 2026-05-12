
"use client";

import React, { useState, useRef, useMemo } from 'react';
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
  Link as LinkIcon,
  Move,
  Film,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Minus,
  Maximize2
} from 'lucide-react';
import { generateBannerImage } from '@/ai/flows/admin-generate-banner-flow';
import { generateBannerTexts } from '@/ai/flows/admin-generate-banner-text-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useFirebase } from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp, addDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
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
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [duration, setDuration] = useState(6);
  
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 20 });
  const [zoom, setZoom] = useState(100);

  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [editData, setEditData] = useState({ 
    title: '', 
    subtitle: '', 
    ctaText: '', 
    duration: 6,
    imagePosition: { x: 50, y: 50 }
  });

  const [showAiTextPanel, setShowAiTextPanel] = useState(false);
  const [aiTextContext, setAiTextContext] = useState('');
  const textSuggestions = ["Plus Size", "Dia das Mães", "Inverno", "Festa & Glamour", "Moda Praia", "Estilo Executivo"];

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

  const sortedBanners = useMemo(() => {
    if (!banners) return [];
    return [...banners].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [banners]);

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    setImagePosition(prev => {
      const step = 5;
      switch (direction) {
        case 'up': return { ...prev, y: Math.max(0, prev.y - step) };
        case 'down': return { ...prev, y: Math.min(100, prev.y + step) };
        case 'left': return { ...prev, x: Math.max(0, prev.x - step) };
        case 'right': return { ...prev, x: Math.min(100, prev.x + step) };
        default: return prev;
      }
    });
  };

  const handleUseUrl = () => {
    if (!imageUrl) return;
    if (!imageUrl.startsWith('http')) {
      toast({ title: "URL Inválida", description: "O link deve começar com http:// ou https://", variant: "destructive" });
      return;
    }
    setPreviewImage(imageUrl);
    setImageUrl('');
    setImagePosition({ x: 50, y: 20 });
    setZoom(100);
    toast({ title: "Link da mídia carregado!" });
  };

  const handleGenerate = async () => {
    if (!prompt) {
      toast({ title: "Inspiração necessária", description: "Diga à IA o que você imagina para o banner.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setPreviewImage('');
    setMediaType('image');
    try {
      const result = await generateBannerImage({ prompt, aspectRatio });
      setPreviewImage(result.imageUrl);
      setImagePosition({ x: 50, y: 20 });
      setZoom(100);
      toast({ title: "Imagem gerada!" });
    } catch (error: any) {
      toast({ title: "Erro na IA", description: error.message || "Não foi possível gerar a imagem.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateTexts = async () => {
    const combinedContext = aiTextContext 
      ? (prompt ? `${aiTextContext}. ${prompt}` : aiTextContext)
      : prompt;

    if (!previewImage && !combinedContext) {
      toast({ title: "Falta informação", description: "Adicione uma imagem ou especifique um tema/contexto.", variant: "destructive" });
      return;
    }

    setIsGeneratingTexts(true);
    try {
      const result = await generateBannerTexts({ 
        concept: combinedContext,
        imageUrl: previewImage.startsWith('data:') || previewImage.includes('cloudinary.com') ? previewImage : undefined 
      });
      setBannerData({ title: result.title, subtitle: result.subtitle, ctaText: result.ctaText });
      toast({ title: "Textos criados!" });
      setShowAiTextPanel(false);
    } catch (error: any) {
      toast({ title: "Falha na redação", description: "Tente novamente mais tarde.", variant: "destructive" });
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
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'todabela_upload');

      const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
      const uploadUrl = `https://api.cloudinary.com/v1_1/djtuzexfd/${resourceType}/upload`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Falha no upload para o Cloudinary');
      }

      const data = await response.json();
      const url = data.secure_url;
      
      setPreviewImage(url);
      setMediaType(resourceType === 'video' ? 'video' : 'image');
      setImagePosition({ x: 50, y: 20 });
      setZoom(100);
      toast({ title: "Mídia carregada com sucesso!" });
    } catch (error: any) {
      console.error("Cloudinary Upload Error:", error);
      toast({ 
        title: "Erro no upload", 
        description: error.message || "Não foi possível enviar o arquivo.",
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveBanner = async () => {
    if (!previewImage) return;
    try {
      let finalUrl = previewImage;

      // Se for imagem gerada por IA (Base64), envia para o Cloudinary
      if (previewImage.startsWith('data:')) {
        const formData = new FormData();
        formData.append('file', previewImage);
        formData.append('upload_preset', 'todabela_upload');

        const response = await fetch('https://api.cloudinary.com/v1_1/djtuzexfd/image/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Falha ao salvar imagem da IA no Cloudinary');
        const data = await response.json();
        finalUrl = data.secure_url;
      }

      await addDoc(collection(db, 'banners'), {
        ...bannerData,
        imageUrl: finalUrl,
        imagePosition: imagePosition,
        zoom: zoom,
        mediaType: mediaType,
        aspectRatio,
        duration,
        active: true,
        order: (banners?.length || 0) + 1,
        createdAt: serverTimestamp()
      });

      setPreviewImage('');
      setPrompt('');
      setBannerData({ title: '', subtitle: '', ctaText: 'Conferir Looks' });
      setImagePosition({ x: 50, y: 20 });
      setZoom(100);
      toast({ title: "Banner Ativado!" });
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    }
  };

  const toggleStatus = (banner: any) => {
    updateDocumentNonBlocking(doc(db, 'banners', banner.id), { active: !banner.active });
  };

  const handleDelete = async (banner: any) => {
    if (!banner?.id) return;
    
    // Se a imagem for legado do Firebase Storage, tenta deletar
    if (banner.imageUrl && banner.imageUrl.includes('firebasestorage.googleapis.com')) {
      try {
        const fileRef = ref(storage!, banner.imageUrl);
        await deleteObject(fileRef);
      } catch (error) {
        console.warn("Erro ao deletar arquivo legado do Storage");
      }
    }

    deleteDocumentNonBlocking(doc(db, 'banners', banner.id));
    toast({ title: "Banner removido" });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col gap-2">
        <h4 className="text-3xl font-headline font-bold text-primary">Estúdio Criativo</h4>
        <p className="text-sm text-muted-foreground italic font-light">Gerencie campanhas com upload via Cloudinary e inteligência artificial.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-8">
          <Card className="p-10 border-none bg-white shadow-2xl rounded-[3rem] space-y-8">
            <div className="grid md:grid-cols-[1fr_200px] gap-6">
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-accent">Inspiração (Opcional)</Label>
                <Input 
                  placeholder="Ex: Verão Tropical..." 
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
                  <option value="16:9">16:9</option><option value="1:1">1:1</option><option value="4:3">4:3</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-accent">Mídia</Label>
              <div className="flex gap-4">
                <button onClick={() => setMediaType('image')} className={cn("flex-1 h-12 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-2", mediaType === 'image' ? "bg-primary text-white" : "text-primary hover:bg-secondary/30")}>
                  <ImageIcon className="h-4 w-4" /> Imagem
                </button>
                <button onClick={() => setMediaType('video')} className={cn("flex-1 h-12 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-2", mediaType === 'video' ? "bg-primary text-white" : "text-primary hover:bg-secondary/30")}>
                  <Film className="h-4 w-4" /> Vídeo
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-accent/40" />
                  <Input placeholder={`Colar URL (https://...)`} className="rounded-full h-16 pl-14 bg-secondary/10 border-none" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                </div>
                <Button onClick={handleUseUrl} disabled={!imageUrl} className="rounded-full h-16 px-8 bg-accent text-primary font-bold uppercase tracking-widest text-[10px]">Usar URL</Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleGenerate} disabled={isGenerating || mediaType === 'video'} className="rounded-full h-16 bg-primary shadow-xl text-white font-bold uppercase tracking-widest text-[11px]">
                  {isGenerating ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : <Sparkles className="h-5 w-5 mr-3" />} Gerar com IA
                </Button>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="rounded-full h-16 border-accent text-accent shadow-xl font-bold uppercase tracking-widest text-[11px]">
                  {isUploading ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : <Upload className="h-5 w-5 mr-3" />} Upload Foto/Vídeo
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
              </div>
            </div>

            {previewImage && (
              <div className="grid md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 bg-[#FFF9F7] p-8 rounded-[2rem] border border-primary/5">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-accent">Textos</Label>
                    <button 
                      onClick={() => setShowAiTextPanel(!showAiTextPanel)} 
                      className={cn(
                        "text-[9px] font-black uppercase flex items-center gap-1.5 transition-colors",
                        showAiTextPanel ? "text-accent" : "text-primary/60 hover:text-accent"
                      )}
                    >
                      <MessageSquareText className="h-2.5 w-2.5" /> IA Textos
                    </button>
                  </div>

                  {showAiTextPanel && (
                    <div className="p-5 bg-white border border-accent/10 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-2">
                        <Label className="text-[8px] font-bold uppercase text-primary/40 ml-1">Contexto da Campanha</Label>
                        <Input 
                          placeholder="Ex: Campanha Verão 2024..." 
                          value={aiTextContext}
                          onChange={e => setAiTextContext(e.target.value)}
                          className="h-10 text-xs border-none bg-secondary/10 rounded-lg px-4"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {textSuggestions.map(s => (
                          <button 
                            key={s} 
                            onClick={() => setAiTextContext(s)}
                            className={cn(
                              "px-2.5 py-1 text-[8px] font-bold uppercase tracking-tight rounded-md transition-all",
                              aiTextContext === s ? "bg-accent text-primary" : "bg-secondary/20 text-primary/60 hover:bg-accent/10"
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      <Button 
                        onClick={handleGenerateTexts} 
                        disabled={isGeneratingTexts} 
                        size="sm" 
                        className="w-full h-10 text-[9px] font-bold uppercase bg-primary text-white hover:bg-accent"
                      >
                        {isGeneratingTexts ? <Loader2 className="animate-spin h-3 w-3 mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
                        Gerar com IA
                      </Button>
                    </div>
                  )}

                  <div className="space-y-4">
                    <Input placeholder="Título" value={bannerData.title} onChange={e => setBannerData({...bannerData, title: e.target.value})} className="bg-white border-none h-12 rounded-xl" />
                    <Input placeholder="Subtítulo" value={bannerData.subtitle} onChange={e => setBannerData({...bannerData, subtitle: e.target.value})} className="bg-white border-none h-12 rounded-xl" />
                    <Input placeholder="CTA" value={bannerData.ctaText} onChange={e => setBannerData({...bannerData, ctaText: e.target.value})} className="bg-white border-none h-12 rounded-xl" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-accent">Tempo de Exibição</Label>
                    <select
                      value={duration}
                      onChange={e => setDuration(Number(e.target.value))}
                      className="w-full h-12 rounded-xl bg-white border-none px-4 text-sm font-bold text-primary outline-none"
                    >
                      <option value={3}>3 segundos</option>
                      <option value={5}>5 segundos</option>
                      <option value={6}>6 segundos (padrão)</option>
                      <option value={8}>8 segundos</option>
                      <option value={10}>10 segundos</option>
                      <option value={15}>15 segundos</option>
                    </select>
                  </div>

                  <Button onClick={handleSaveBanner} className="w-full rounded-full bg-primary text-white font-bold h-14 shadow-xl text-[10px] uppercase tracking-widest"><Save className="mr-2 h-5 w-5" /> Ativar na Vitrine</Button>
                </div>

                <div className="space-y-6">
                   <Label className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                     {mediaType === 'video' ? <Film className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />} 
                     Enquadramento Profissional
                   </Label>
                   
                   <div 
                    className={cn("rounded-2xl overflow-hidden shadow-2xl border-4 border-white relative bg-black", aspectRatio === '16:9' ? 'aspect-video' : 'aspect-square')}
                    style={mediaType === 'image' ? { 
                      backgroundImage: `url(${previewImage})`, 
                      backgroundSize: zoom === 100 ? 'cover' : `${zoom}%`, 
                      backgroundPosition: `${imagePosition.x}% ${imagePosition.y}%` 
                    } : {}}
                   >
                      {mediaType === 'video' && (
                        <video key={previewImage} autoPlay muted loop playsInline className="w-full h-full object-cover">
                          <source src={previewImage} type="video/mp4" />
                        </video>
                      )}
                   </div>

                   {mediaType === 'image' && (
                     <div className="p-6 bg-white rounded-3xl border border-primary/5 space-y-8 shadow-sm">
                        <div className="grid grid-cols-3 gap-2 w-32 mx-auto">
                           <div />
                           <Button size="icon" variant="secondary" onClick={() => handleMove('up')} className="h-10 w-10 rounded-xl"><ChevronUp className="h-4 w-4" /></Button>
                           <div />
                           <Button size="icon" variant="secondary" onClick={() => handleMove('left')} className="h-10 w-10 rounded-xl"><ChevronLeft className="h-4 w-4" /></Button>
                           <Button size="icon" variant="secondary" onClick={() => handleMove('down')} className="h-10 w-10 rounded-xl"><ChevronDown className="h-4 w-4" /></Button>
                           <Button size="icon" variant="secondary" onClick={() => handleMove('right')} className="h-10 w-10 rounded-xl"><ChevronRight className="h-4 w-4" /></Button>
                        </div>

                        <div className="space-y-6">
                           <div className="space-y-3">
                              <div className="flex justify-between items-center"><Label className="text-[9px] font-bold uppercase text-primary/40">Posição Horizontal (X)</Label><span className="text-[9px] font-mono font-bold text-accent">{imagePosition.x}%</span></div>
                              <Slider value={[imagePosition.x]} min={0} max={100} step={1} onValueChange={([v]) => setImagePosition(p => ({...p, x: v}))} />
                           </div>
                           <div className="space-y-3">
                              <div className="flex justify-between items-center"><Label className="text-[9px] font-bold uppercase text-primary/40">Posição Vertical (Y)</Label><span className="text-[9px] font-mono font-bold text-accent">{imagePosition.y}%</span></div>
                              <Slider value={[imagePosition.y]} min={0} max={100} step={1} onValueChange={([v]) => setImagePosition(p => ({...p, y: v}))} />
                           </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-primary/5 pt-6">
                           <Label className="text-[9px] font-bold uppercase text-primary/40">Escala de Zoom</Label>
                           <div className="flex items-center gap-3">
                              <Button size="icon" variant="outline" onClick={() => setZoom(z => Math.max(100, z - 10))} className="h-9 w-9 rounded-full border-primary/10"><Minus className="h-3 w-3" /></Button>
                              <span className="text-[10px] font-black w-10 text-center text-primary">{zoom}%</span>
                              <Button size="icon" variant="outline" onClick={() => setZoom(z => z + 10)} className="h-9 w-9 rounded-full border-primary/10"><Plus className="h-3 w-3" /></Button>
                           </div>
                        </div>
                     </div>
                   )}
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
            ) : sortedBanners.map(banner => (
              <div key={banner.id} className="p-4 rounded-3xl bg-white/10 border border-white/5 space-y-4 group hover:bg-white/15 transition-all">
                <div className="aspect-video rounded-2xl overflow-hidden relative bg-black">
                  {banner.mediaType === 'video' ? (
                    <video key={banner.imageUrl} src={banner.imageUrl} muted loop playsInline className="w-full h-full object-cover" onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => e.currentTarget.pause()} />
                  ) : (
                    <img 
                      src={banner.imageUrl} 
                      className="w-full h-full object-cover" 
                      style={{ 
                        objectPosition: banner.imagePosition ? `${banner.imagePosition.x}% ${banner.imagePosition.y}%` : 'center center',
                        transform: banner.zoom && banner.zoom > 100 ? `scale(${banner.zoom / 100})` : 'none'
                      }} 
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setEditingBanner(banner)
                        setEditData({
                          title: banner.title || '',
                          subtitle: banner.subtitle || '',
                          ctaText: banner.ctaText || 'Conferir Looks',
                          duration: banner.duration || 6,
                          imagePosition: banner.imagePosition || { x: 50, y: 50 }
                        })
                      }}
                      className="p-3 bg-blue-500 text-white rounded-full hover:scale-110 transition-transform shadow-xl"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(banner)} className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-xl"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase truncate tracking-tight">{banner.title || 'Sem Título'}</p>
                    <p className="text-[8px] opacity-50 uppercase font-black">{banner.duration || 6}s • {banner.active ? 'No Ar' : 'Pausado'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => updateDocumentNonBlocking(doc(db, 'banners', banner.id), { order: (banner.order || 0) - 1 })}
                        className="h-5 w-5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => updateDocumentNonBlocking(doc(db, 'banners', banner.id), { order: (banner.order || 0) + 1 })}
                        className="h-5 w-5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                    <button onClick={() => toggleStatus(banner)} className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-all", banner.active ? "bg-accent text-primary" : "bg-white/10 text-white/40")}>
                      {banner.active ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Dialog open={!!editingBanner} onOpenChange={(o) => !o && setEditingBanner(null)}>
        <DialogContent className="rounded-[2rem] bg-white border-none shadow-2xl p-0 overflow-hidden max-w-md">
          <div className="bg-primary p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-headline font-bold">Editar Banner</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-4">
            <div className="rounded-xl overflow-hidden aspect-video bg-black relative">
              {editingBanner?.mediaType === 'video' ? (
                <video key={editingBanner?.imageUrl} muted loop playsInline className="w-full h-full object-cover">
                  <source src={editingBanner?.imageUrl} type="video/mp4" />
                </video>
              ) : (
                <img 
                  src={editingBanner?.imageUrl} 
                  className="w-full h-full object-cover" 
                  style={{
                    objectPosition: `${editData.imagePosition.x}% ${editData.imagePosition.y}%`
                  }}
                />
              )}
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Título</Label>
                <Input placeholder="Título" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} className="h-12 rounded-xl border-primary/10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Subtítulo</Label>
                <Input placeholder="Subtítulo" value={editData.subtitle} onChange={e => setEditData({...editData, subtitle: e.target.value})} className="h-12 rounded-xl border-primary/10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Texto do Botão</Label>
                <Input placeholder="Texto do Botão" value={editData.ctaText} onChange={e => setEditData({...editData, ctaText: e.target.value})} className="h-12 rounded-xl border-primary/10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Tempo de Exibição</Label>
                <select
                  value={editData.duration}
                  onChange={e => setEditData({...editData, duration: Number(e.target.value)})}
                  className="w-full h-12 rounded-xl border border-primary/10 px-4 text-sm font-bold text-primary outline-none"
                >
                  <option value={3}>3 segundos</option>
                  <option value={5}>5 segundos</option>
                  <option value={6}>6 segundos (padrão)</option>
                  <option value={8}>8 segundos</option>
                  <option value={10}>10 segundos</option>
                  <option value={15}>15 segundos</option>
                </select>
              </div>

              <div className="space-y-4 pt-4 border-t border-primary/5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-accent">Enquadramento</Label>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-[9px] font-bold uppercase text-primary/40">Posição Horizontal (X): {editData.imagePosition.x}%</Label>
                    </div>
                    <Slider 
                      value={[editData.imagePosition.x]} 
                      min={0} 
                      max={100} 
                      step={1} 
                      onValueChange={([v]) => setEditData(prev => ({ ...prev, imagePosition: { ...prev.imagePosition, x: v } }))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-[9px] font-bold uppercase text-primary/40">Posição Vertical (Y): {editData.imagePosition.y}%</Label>
                    </div>
                    <Slider 
                      value={[editData.imagePosition.y]} 
                      min={0} 
                      max={100} 
                      step={1} 
                      onValueChange={([v]) => setEditData(prev => ({ ...prev, imagePosition: { ...prev.imagePosition, y: v } }))} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-8 pb-8 flex gap-3">
            <button
              onClick={() => setEditingBanner(null)}
              className="flex-1 h-12 rounded-full border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-secondary/20 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (!editingBanner) return
                updateDocumentNonBlocking(doc(db, 'banners', editingBanner.id), {
                  title: editData.title,
                  subtitle: editData.subtitle,
                  ctaText: editData.ctaText,
                  duration: editData.duration,
                  imagePosition: editData.imagePosition
                })
                toast({ title: "Banner atualizado!" })
                setEditingBanner(null)
              }}
              className="flex-1 h-12 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors"
            >
              Salvar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
