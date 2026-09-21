
"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Star, 
  CheckCircle2, 
  Check, 
  Loader2, 
  Sparkles, 
  MessageSquare, 
  X, 
  Camera, 
  ThumbsUp, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase, useUser, useFirebase } from '@/firebase';
import { collection, query, where, serverTimestamp, doc, setDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Review {
  id: string;
  user: string;
  headline: string;
  rating: number;
  comment: string;
  recommended: boolean;
  qualityRating?: number;
  fitRating?: number;
  colorRating?: number;
  images: string[];
  status: 'pending' | 'published';
  productId: string;
  productName: string;
  productImage: string;
  userId: string;
  isDemo?: boolean;
  createdAt?: any;
}

const StarRating = ({ 
  rating, 
  size = "h-3.5 w-3.5", 
  interactive = false, 
  onRate 
}: { 
  rating: number; 
  size?: string; 
  interactive?: boolean; 
  onRate?: (r: number) => void 
}) => (
  <div className="flex gap-1">
    {[...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        onClick={() => interactive && onRate?.(i + 1)}
        className={cn(
          size, 
          i < rating ? "fill-current text-accent" : "text-gray-200 fill-current",
          interactive && "cursor-pointer hover:scale-125 transition-transform"
        )} 
      />
    ))}
  </div>
);

export function ProductReviews({ product }: { product: any }) {
  const db = useFirestore();
  const { storage } = useFirebase();
  const { user: authUser } = useUser();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<{ images: string[], index: number } | null>(null);
  
  // Filters and Sorting
  const [filterType, setFilterType] = useState<'all' | 'images'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent');
  const [visibleCount, setVisibleCount] = useState(5);

  const [newReview, setNewReview] = useState({
    user: '',
    rating: 5,
    headline: '',
    comment: '',
    recommended: true,
    qualityRating: 5,
    fitRating: 5,
    colorRating: 5
  });

  const reviewsQuery = useMemoFirebase(() => {
    if (!db || !product?.id) return null;
    return query(
      collection(db, 'reviews'), 
      where('productId', '==', product.id),
      where('status', '==', 'published')
    );
  }, [db, product?.id]);

  const { data: allReviews, isLoading } = useCollection<Review>(reviewsQuery);

  // Stats Logic (Real Reviews Only)
  const stats = useMemo(() => {
    const real = allReviews?.filter(r => !r.isDemo) || [];
    if (real.length === 0) return null;

    const total = real.length;
    const avg = Number((real.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1));
    const recPercent = Math.round((real.filter(r => r.recommended).length / total) * 100);
    
    const distribution = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: real.filter(r => r.rating === star).length,
      percent: Math.round((real.filter(r => r.rating === star).length / total) * 100)
    }));

    const getMetricAvg = (key: 'qualityRating' | 'fitRating' | 'colorRating') => {
      const rated = real.filter(r => r[key] !== undefined);
      if (rated.length === 0) return 0;
      return Number((rated.reduce((acc, r) => acc + (r[key] || 0), 0) / rated.length).toFixed(1));
    };

    return { avg, total, recPercent, distribution, quality: getMetricAvg('qualityRating'), fit: getMetricAvg('fitRating'), color: getMetricAvg('colorRating') };
  }, [allReviews]);

  // Client-side Sorting & Filtering
  const displayedReviews = useMemo(() => {
    if (!allReviews) return [];
    let result = [...allReviews];

    if (filterType === 'images') {
      result = result.filter(r => r.images && r.images.length > 0);
    }

    result.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      const timeA = a.createdAt?.toMillis?.() || (typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 0);
      const timeB = b.createdAt?.toMillis?.() || (typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : 0);
      return timeB - timeA;
    });

    return result;
  }, [allReviews, filterType, sortBy]);

  const allCustomerPhotos = useMemo(() => {
    if (!allReviews) return [];
    const photos: string[] = [];
    allReviews.forEach(r => {
      if (r.images) r.images.forEach(img => photos.push(img));
    });
    return photos.slice(0, 12);
  }, [allReviews]);

  // Photo Handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(f => f.type.startsWith('image/') && f.size <= 8 * 1024 * 1024);
    
    if (valid.length + selectedFiles.length > 4) {
      toast({ title: "Limite de fotos", description: "Você pode enviar no máximo 4 fotos.", variant: "destructive" });
      return;
    }

    const newFiles = [...selectedFiles, ...valid];
    setSelectedFiles(newFiles);
    
    const newPreviews = valid.map(f => URL.createObjectURL(f));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeFile = (idx: number) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(idx, 1);
    setSelectedFiles(updatedFiles);

    const updatedPreviews = [...previews];
    URL.revokeObjectURL(updatedPreviews[idx]);
    updatedPreviews.splice(idx, 1);
    setPreviews(updatedPreviews);
  };

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new (window as any).Image();
        img.src = e.target?.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIDE = 1600;

          if (width > height && width > MAX_SIDE) {
            height *= MAX_SIDE / width;
            width = MAX_SIDE;
          } else if (height > MAX_SIDE) {
            width *= MAX_SIDE / height;
            height = MAX_SIDE;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Falha na compressão'));
          }, 'image/jpeg', 0.82);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleSubmit = async () => {
    if (!newReview.user || !newReview.comment) return;
    if (!authUser) {
      toast({ title: "Aguarde um instante", description: "Sincronizando sua sessão segura. Tente enviar novamente em 2 segundos." });
      return;
    }

    setIsSubmitting(true);
    const reviewRef = doc(collection(db, 'reviews'));
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const compressed = await compressImage(selectedFiles[i]);
        const storageRef = ref(storage!, `reviews/${authUser.uid}/${reviewRef.id}/${i}.jpg`);
        await uploadBytes(storageRef, compressed, { contentType: 'image/jpeg' });
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
      }

      await setDoc(reviewRef, {
        ...newReview,
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        userId: authUser.uid,
        images: uploadedUrls,
        status: 'pending',
        isDemo: false,
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setPreviews([]);
      setSelectedFiles([]);
    } catch (err) {
      toast({ title: "Erro ao enviar", description: "Não foi possível processar sua avaliação. Verifique sua conexão.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabels: Record<number, string> = { 1: "Precisa melhorar", 2: "Poderia ser melhor", 3: "Boa", 4: "Muito boa", 5: "Perfeita" };
  const currentRating = hoverRating || newReview.rating;

  return (
    <section id="avaliacoes" className="pt-20 md:pt-32 border-t border-gray-100 bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 md:mb-20 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <div className="h-px w-12 bg-primary/20" />
             <h2 className="text-xs md:text-sm font-bold uppercase tracking-[0.5em] text-primary">Vozes da Comunidade</h2>
          </div>
          <h3 className="text-3xl md:text-5xl font-headline font-bold text-primary">Experiências <span className="italic font-light text-accent">Toda Bela</span></h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100 shadow-sm">
          <CheckCircle2 className="h-4 w-4" /> Ambiente 100% verificado
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        {/* Stats Column */}
        <div className="lg:col-span-4 space-y-12">
          <div className="p-10 bg-[#FFF9F7] rounded-[3rem] border border-primary/5 space-y-8 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-full border-4 border-accent flex items-center justify-center shrink-0 bg-white shadow-xl">
                <span className="text-3xl font-bold text-primary">{stats ? stats.avg : "—"}</span>
              </div>
              <div className="space-y-1">
                <StarRating rating={Math.round(stats?.avg || 0)} size="h-5 w-5" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{stats?.total || 0} Avaliações reais</p>
              </div>
            </div>

            {stats ? (
              <div className="space-y-4">
                {stats.distribution.map(d => (
                  <div key={d.star} className="flex items-center gap-4">
                    <span className="text-[10px] font-bold w-4 text-primary/40">{d.star}</span>
                    <div className="flex-1 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                      <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${d.percent}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-primary/20 w-8">{d.percent}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground font-light text-center">Seja a primeira a avaliar esta peça.</p>
            )}

            {stats && (
              <div className="space-y-6 pt-4 border-t border-primary/5">
                {[
                  { label: 'Qualidade do Tecido', val: stats.quality },
                  { label: 'Caimento no Corpo', val: stats.fit },
                  { label: 'Fidelidade à Cor', val: stats.color }
                ].map(m => (
                  <div key={m.label} className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                      <span className="text-primary/60">{m.label}</span>
                      <span className="text-accent">{m.val > 0 ? `${m.val} / 5.0` : '—'}</span>
                    </div>
                    <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-accent/40" style={{ width: `${(m.val / 5) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={() => { setIsDialogOpen(true); setSuccess(false); }} 
            className="w-full py-6 bg-primary text-white text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-accent transition-all duration-700 shadow-2xl flex items-center justify-center gap-4 group rounded-none"
          >
            <MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" /> Escrever Avaliação
          </button>
        </div>

        {/* Content Column */}
        <div className="lg:col-span-8 space-y-12">
          {/* Photo Strip */}
          {allCustomerPhotos.length > 0 && (
            <div className="space-y-6">
              <h5 className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40">Fotos das Clientes</h5>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                 {allCustomerPhotos.map((img, i) => (
                   <button 
                    key={i} 
                    onClick={() => setLightbox({ images: allCustomerPhotos, index: i })}
                    className="h-24 w-20 rounded-xl overflow-hidden shrink-0 border border-primary/5 shadow-sm hover:scale-105 transition-transform"
                   >
                     <img src={img} className="h-full w-full object-cover" alt="Foto cliente" />
                   </button>
                 ))}
              </div>
            </div>
          )}

          {/* List Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-b border-primary/5 pb-8">
             <div className="flex gap-2">
                <button 
                  onClick={() => setFilterType('all')}
                  className={cn("px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all", filterType === 'all' ? "bg-primary text-white border-primary" : "bg-white text-primary/40 border-primary/5 hover:border-primary/20")}
                >
                  Todas
                </button>
                <button 
                  onClick={() => setFilterType('images')}
                  className={cn("px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all", filterType === 'images' ? "bg-primary text-white border-primary" : "bg-white text-primary/40 border-primary/5 hover:border-primary/20")}
                >
                  Com Fotos
                </button>
             </div>
             <div className="flex items-center gap-3 w-full sm:w-auto">
                <ArrowUpDown className="h-3 w-3 text-primary/20" />
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="w-full sm:w-48 h-10 border-none bg-secondary/20 rounded-full text-[10px] font-bold uppercase tracking-widest focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Mais Recentes</SelectItem>
                    <SelectItem value="rating">Melhor Avaliadas</SelectItem>
                  </SelectContent>
                </Select>
             </div>
          </div>

          {/* Reviews List */}
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-accent/30" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/20">Sincronizando experiências...</p>
            </div>
          ) : displayedReviews.length > 0 ? (
            <div className="space-y-8">
              {displayedReviews.slice(0, visibleCount).map((review) => (
                <article key={review.id} className="p-8 md:p-12 bg-white border border-primary/5 rounded-sm shadow-sm space-y-8 group transition-all duration-700 hover:shadow-premium">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                       <div className="h-11 w-11 rounded-full bg-secondary flex items-center justify-center text-xs font-black text-primary border border-primary/5">
                         {review.user[0]}
                       </div>
                       <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <p className="text-[11px] font-bold uppercase tracking-widest text-primary">{review.user}</p>
                             {review.isDemo && <Badge className="bg-accent/10 text-accent border-none text-[7px] font-black px-1.5 h-3.5">PREVIEW</Badge>}
                          </div>
                          <p className="text-[9px] text-muted-foreground uppercase font-medium">
                            {review.createdAt?.toMillis ? new Date(review.createdAt.toMillis()).toLocaleDateString('pt-BR') : 'Recentemente'}
                          </p>
                       </div>
                    </div>
                    <StarRating rating={review.rating} size="h-4 w-4" />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-primary uppercase tracking-tight">{review.headline}</h4>
                    <p className="text-base text-primary/70 leading-relaxed font-light">{review.comment}</p>
                    
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 pt-2">
                        {review.images.map((img, i) => (
                          <button 
                            key={i} 
                            onClick={() => setLightbox({ images: review.images, index: i })}
                            className="relative h-20 w-16 rounded-lg overflow-hidden border border-primary/5 hover:opacity-80 transition-all"
                          >
                            <img src={img} className="h-full w-full object-cover" alt="Review" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-primary/5">
                     {review.recommended && (
                        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-emerald-600/60">
                           <Check className="h-3.5 w-3.5" /> Recomenda esta peça
                        </div>
                     )}
                     <div className="flex gap-4 opacity-40">
                        {review.qualityRating && <span className="text-[8px] font-bold uppercase tracking-tighter">Qualidade: {review.qualityRating}</span>}
                        {review.fitRating && <span className="text-[8px] font-bold uppercase tracking-tighter">Caimento: {review.fitRating}</span>}
                     </div>
                  </div>
                </article>
              ))}
              
              {displayedReviews.length > visibleCount && (
                <div className="text-center pt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setVisibleCount(prev => prev + 5)}
                    className="rounded-full px-12 h-14 uppercase text-[10px] font-bold tracking-widest border-primary/10 text-primary/60 hover:text-primary transition-all"
                  >
                    Ver mais avaliações
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-24 text-center space-y-6 bg-secondary/5 rounded-[3rem] border-2 border-dashed border-primary/5">
              <MessageSquare className="h-10 w-10 text-primary/10 mx-auto" />
              <p className="text-sm text-muted-foreground italic font-light">Nenhuma experiência publicada com estes critérios.</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[560px] p-0 rounded-[2rem] border-none shadow-2xl bg-white flex flex-col max-h-[90vh] overflow-hidden max-sm:h-[100dvh] max-sm:rounded-none [&>button]:text-white [&>button]:bg-white/10 [&>button]:hover:bg-white/20 [&>button]:rounded-full [&>button]:w-9 [&>button]:h-9 [&>button]:top-5 [&>button]:right-5 z-[100]">
          {success ? (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
               <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-50">
                  <Check className="h-12 w-12" />
               </div>
               <div className="space-y-3">
                  <h3 className="text-3xl font-headline font-bold text-primary">Obrigada por compartilhar!</h3>
                  <p className="text-muted-foreground italic font-light leading-relaxed">Sua avaliação foi enviada com sucesso e será publicada em nossa boutique após a moderação do curador.</p>
               </div>
               <Button onClick={() => setIsDialogOpen(false)} className="rounded-full h-14 px-12 bg-primary text-white font-bold uppercase tracking-widest text-[11px] shadow-xl">
                 Fechar Galeria
               </Button>
            </div>
          ) : (
            <>
              <div className="bg-primary p-8 text-white relative shrink-0">
                <div className="absolute top-4 right-12 p-4 opacity-10 pointer-events-none">
                  <Sparkles className="h-16 w-16" />
                </div>
                <DialogHeader className="relative z-10 text-left space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-accent/80">Compartilhe sua Escolha</p>
                  <DialogTitle className="text-2xl font-headline font-bold uppercase tracking-widest leading-none">Minha Experiência</DialogTitle>
                  <DialogDescription className="text-white/60 italic text-sm mt-1">Sua voz ajuda outras mulheres a escolherem com confiança.</DialogDescription>
                </DialogHeader>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto no-scrollbar flex-1 bg-[#FDFCFD]">
                 {/* Rating Section */}
                 <div className="space-y-4 text-center">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">O que achou da peça?</Label>
                    <div className="flex flex-col items-center gap-3">
                       <div className="flex gap-2">
                          {[1,2,3,4,5].map(s => (
                            <button 
                              key={s} 
                              type="button"
                              onMouseEnter={() => setHoverRating(s)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setNewReview({...newReview, rating: s})}
                              className="transition-transform hover:scale-125 focus:outline-none"
                            >
                              <Star className={cn("h-10 w-10 transition-colors", s <= currentRating ? "fill-current text-accent" : "text-gray-100 fill-current")} />
                            </button>
                          ))}
                       </div>
                       <p className="text-[11px] font-bold uppercase text-accent tracking-[0.2em] h-4">{ratingLabels[currentRating]}</p>
                    </div>
                 </div>

                 {/* Metrics Section */}
                 <div className="space-y-6 p-6 bg-white rounded-3xl border border-primary/5 shadow-sm">
                    <h6 className="text-[9px] font-black uppercase tracking-widest text-primary/30 border-b border-primary/5 pb-3">Detalhes da Peça</h6>
                    <div className="grid gap-5">
                       {[
                         { label: 'Qualidade do Tecido', key: 'qualityRating' },
                         { label: 'Caimento no Corpo', key: 'fitRating' },
                         { label: 'Fidelidade à Cor', key: 'colorRating' }
                       ].map(m => (
                         <div key={m.key} className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-primary/60">{m.label}</span>
                            <StarRating 
                              rating={(newReview as any)[m.key]} 
                              interactive 
                              onRate={(r) => setNewReview({...newReview, [m.key]: r})}
                              size="h-4 w-4" 
                            />
                         </div>
                       ))}
                       <div className="flex items-center justify-between pt-2">
                          <span className="text-[10px] font-bold text-primary/60">Eu recomendo esta peça</span>
                          <Switch 
                            checked={newReview.recommended} 
                            onCheckedChange={v => setNewReview({...newReview, recommended: v})} 
                          />
                       </div>
                    </div>
                 </div>

                 {/* Text Fields */}
                 <div className="space-y-5">
                    <div className="grid gap-2">
                       <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">Seu Nome*</Label>
                       <Input 
                        value={newReview.user} 
                        onChange={e => setNewReview({...newReview, user: e.target.value.toUpperCase()})}
                        className="rounded-2xl h-12 bg-white border-primary/10 px-5 focus-visible:ring-accent/30 focus-visible:border-accent"
                        placeholder="COMO DEVEMOS TE CHAMAR?"
                       />
                    </div>
                    <div className="grid gap-2">
                       <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">Título</Label>
                       <Input 
                        value={newReview.headline} 
                        maxLength={60}
                        onChange={e => setNewReview({...newReview, headline: e.target.value})}
                        className="rounded-2xl h-12 bg-white border-primary/10 px-5"
                        placeholder="RESUMA EM POUCAS PALAVRAS"
                       />
                    </div>
                    <div className="grid gap-2">
                       <div className="flex justify-between items-center px-1">
                          <Label className="text-[10px] font-bold uppercase text-primary/40">Depoimento*</Label>
                          <span className="text-[8px] font-bold text-primary/20">{newReview.comment.length}/1000</span>
                       </div>
                       <Textarea 
                        value={newReview.comment} 
                        maxLength={1000}
                        onChange={e => setNewReview({...newReview, comment: e.target.value})}
                        className="rounded-2xl min-h-[120px] bg-white border-primary/10 p-5 focus-visible:ring-accent/30"
                        placeholder="Conte como foi o tecido, o corte, o brilho da cor..."
                       />
                    </div>
                 </div>

                 {/* Photos Area */}
                 <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">Adicionar Fotos (Até 4)</Label>
                    <div className="flex gap-3">
                       {previews.map((src, i) => (
                         <div key={i} className="relative h-20 w-16 rounded-xl overflow-hidden shadow-md group">
                            <img src={src} className="h-full w-full object-cover" />
                            <button onClick={() => removeFile(i)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                         </div>
                       ))}
                       {selectedFiles.length < 4 && (
                         <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="h-20 w-16 rounded-xl border-2 border-dashed border-primary/10 flex flex-col items-center justify-center text-primary/20 hover:bg-secondary/20 transition-all"
                         >
                           <Camera className="h-6 w-6" />
                           <span className="text-[8px] font-black mt-1 uppercase">FOTO</span>
                         </button>
                       )}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                 </div>
              </div>

              <div className="p-8 border-t border-primary/5 bg-white shrink-0">
                 <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !newReview.user.trim() || !newReview.comment.trim()}
                  className="w-full h-14 bg-primary text-white font-bold uppercase tracking-[0.4em] text-[11px] rounded-full shadow-2xl disabled:opacity-50"
                 >
                    {isSubmitting ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {selectedFiles.length > 0 ? 'ENVIANDO FOTOS...' : 'ENVIANDO...'}
                      </div>
                    ) : 'PUBLICAR MINHA EXPERIÊNCIA'}
                 </Button>
                 <p className="text-[9px] text-center text-primary/40 font-medium tracking-tight mt-4">Sua avaliação será publicada após moderação.</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-[95vw] h-[90vh] md:max-w-4xl p-0 border-none bg-black/95 rounded-none flex flex-col items-center justify-center z-[200]">
           {lightbox && (
             <div className="relative w-full h-full flex items-center justify-center">
                <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 text-white/40 hover:text-white z-50 p-2"><X className="h-8 w-8" /></button>
                
                {lightbox.images.length > 1 && (
                  <>
                    <button 
                      onClick={() => setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length })}
                      className="absolute left-6 text-white/20 hover:text-white p-4 transition-colors z-50"
                    >
                      <ChevronLeft className="h-12 w-12" />
                    </button>
                    <button 
                      onClick={() => setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.images.length })}
                      className="absolute right-6 text-white/20 hover:text-white p-4 transition-colors z-50"
                    >
                      <ChevronRight className="h-12 w-12" />
                    </button>
                  </>
                )}

                <div className="relative w-full h-full max-h-[80vh] aspect-square md:aspect-auto">
                   <img 
                    src={lightbox.images[lightbox.index]} 
                    className="w-full h-full object-contain pointer-events-none" 
                    alt="Lightbox" 
                   />
                </div>
                
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-50">
                   {lightbox.images.map((_, i) => (
                     <div key={i} className={cn("h-1.5 w-1.5 rounded-full transition-all", i === lightbox.index ? "bg-accent w-6" : "bg-white/20")} />
                   ))}
                </div>
             </div>
           )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
