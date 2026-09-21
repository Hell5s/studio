
"use client";

import React, { useState, useMemo } from 'react';
import { Star, CheckCircle2, Check, Loader2, Sparkles, MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, where, serverTimestamp } from 'firebase/firestore';
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

interface Review {
  id: string;
  user: string;
  headline: string;
  rating: number;
  comment: string;
  recommended: boolean;
  status?: 'pending' | 'published';
  productId: string;
  productName: string;
  productImage: string;
  isDemo?: boolean;
  createdAt?: any;
}

const StarRating = ({ rating, size = "h-3.5 w-3.5", interactive = false, onRate }: { rating: number; size?: string; interactive?: boolean; onRate?: (r: number) => void }) => (
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
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const [newReview, setNewReview] = useState({
    user: '',
    rating: 5,
    headline: '',
    comment: '',
    recommended: true
  });

  const reviewsQuery = useMemoFirebase(() => {
    if (!db || !product?.id) return null;
    return query(
      collection(db, 'products', product.id, 'reviews'), 
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc')
    );
  }, [db, product?.id]);

  const { data: allReviews, isLoading } = useCollection<Review>(reviewsQuery);

  const stats = useMemo(() => {
    const realReviews = allReviews?.filter(r => !r.isDemo) || [];
    if (realReviews.length === 0) return { avg: 5.0, total: 0, recommendedPercent: 100 };
    const total = realReviews.length;
    const sum = realReviews.reduce((acc, r) => acc + r.rating, 0);
    const recommended = realReviews.filter(r => r.recommended).length;
    return {
      avg: Number((sum / total).toFixed(1)),
      total,
      recommendedPercent: Math.round((recommended / total) * 100)
    };
  }, [allReviews]);

  const handleSubmit = () => {
    if (!newReview.user || !newReview.comment) return;

    setIsSubmitting(true);
    addDocumentNonBlocking(collection(db, 'products', product.id, 'reviews'), {
      ...newReview,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      isDemo: false,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    toast({ title: "Avaliação enviada!", description: "Obrigada! Publicaremos após moderação." });
    setIsSubmitting(false);
    setIsDialogOpen(false);
    setNewReview({ user: '', rating: 5, headline: '', comment: '', recommended: true });
  };

  const ratingLabels: Record<number, string> = {
    1: "Precisa melhorar",
    2: "Poderia ser melhor",
    3: "Boa",
    4: "Muito boa",
    5: "Perfeita"
  };

  const currentRating = hoverRating || newReview.rating;

  return (
    <section id="avaliacoes" className="pt-20 md:pt-32 border-t border-gray-100 bg-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 md:mb-20 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <div className="h-px w-12 bg-primary/20" />
             <h2 className="text-xs md:text-sm font-bold uppercase tracking-[0.5em] text-primary">Experiência das Clientes</h2>
          </div>
          <h3 className="text-3xl md:text-5xl font-headline font-bold text-primary">Vozes da <span className="italic font-light text-accent">Comunidade</span></h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100 shadow-sm">
          <CheckCircle2 className="h-4 w-4" /> Ambiente 100% verificado
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        {/* Stats Column */}
        <div className="lg:col-span-4 space-y-12">
          <div className="flex items-center gap-8 p-8 bg-secondary/10 rounded-[2.5rem] border border-primary/5">
            <div className="h-20 w-20 rounded-full border-4 border-accent flex items-center justify-center shrink-0 bg-white shadow-xl">
              <span className="text-3xl font-bold text-primary">{stats.avg}</span>
            </div>
            <div className="space-y-2">
              <StarRating rating={Math.round(stats.avg)} size="h-5 w-5" />
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{stats.total} Avaliações reais</p>
            </div>
          </div>

          <div className="space-y-6 px-4">
            {['Qualidade do Tecido', 'Caimento no Corpo', 'Fidelidade à Cor'].map(label => (
              <div key={label} className="space-y-3">
                <div className="flex justify-between items-center"><span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{label}</span><span className="text-[10px] font-bold text-accent">EXCELENTE</span></div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden"><div className="h-full bg-accent rounded-full" style={{ width: '100%' }} /></div>
              </div>
            ))}
          </div>

          <button onClick={() => setIsDialogOpen(true)} className="w-full py-6 bg-primary text-white text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-accent transition-all duration-700 shadow-2xl flex items-center justify-center gap-4 group min-h-[54px]">
            <MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" /> Escrever Avaliação
          </button>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-8">
          {isLoading ? (
            <div className="py-32 flex flex-col items-center justify-center space-y-6 text-primary/20">
              <Loader2 className="h-12 w-12 animate-spin" /><p className="text-[10px] font-bold uppercase tracking-[0.5em]">Sincronizando experiências...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {allReviews?.map((review) => (
                <article key={review.id} className={cn("p-10 border border-primary/5 bg-white transition-all duration-700 shadow-sm rounded-sm relative group", review.isDemo && "hover:border-accent/30")}>
                  <div className="flex justify-between items-start mb-6">
                    <StarRating rating={review.rating} size="h-4 w-4" />
                    <div className="flex items-center gap-3">
                      {review.isDemo && <Badge className="bg-accent/10 text-accent border-none text-[8px] font-black tracking-tighter px-2 h-4">PREVIEW</Badge>}
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/30 px-3 py-1 rounded-full">
                        {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString('pt-BR') : review.createdAt ? new Date(review.createdAt).toLocaleDateString('pt-BR') : 'Verificado'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-primary uppercase tracking-tight leading-tight">{review.headline}</h4>
                    <p className="text-base text-primary/70 leading-relaxed italic font-light">"{review.comment}"</p>
                  </div>
                  <div className="mt-8 pt-8 border-t border-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-black text-primary">{review.user[0]}</div>
                       <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">{review.user}</p>
                    </div>
                    {review.recommended && (
                      <div className="flex items-center gap-3 text-[10px] text-emerald-600 font-bold uppercase tracking-[0.3em]">
                        <div className="h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100"><Check className="h-3 w-3" /></div> Recomendado
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 rounded-[2rem] border-none shadow-2xl bg-white flex flex-col max-h-[90vh] overflow-hidden [&>button]:text-white [&>button]:bg-white/10 [&>button]:hover:bg-white/20 [&>button]:rounded-full [&>button]:w-9 [&>button]:h-9 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:top-5 [&>button]:right-5 [&>button]:transition-all">
          <div className="bg-gradient-to-br from-primary to-[#5a2e37] p-7 text-white relative shrink-0">
            <div className="absolute top-4 right-12 p-4 opacity-10 pointer-events-none">
              <Sparkles className="h-16 w-16" />
            </div>
            <DialogHeader className="relative z-10 text-left space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-accent/80">Editorial Feedback</p>
              <DialogTitle className="text-2xl font-headline font-bold uppercase tracking-widest leading-none">Sua Experiência</DialogTitle>
              <DialogDescription className="text-white/60 italic text-sm mt-1">Compartilhe os detalhes que tornaram sua escolha especial.</DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-7 space-y-5 overflow-y-auto no-scrollbar flex-1">
            <div className="space-y-4">
              <div className="space-y-3 text-center">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Avalie sua peça</Label>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        aria-label={`${star} estrelas`}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                        className="transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star 
                          className={cn(
                            "h-8 w-8 transition-colors",
                            star <= currentRating ? "fill-current text-accent" : "text-gray-100 fill-current"
                          )} 
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold uppercase text-accent tracking-widest animate-in fade-in duration-300">
                    {ratingLabels[currentRating]}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-primary/60 ml-1">Seu Nome <span className="text-accent">*</span></Label>
                <Input 
                  value={newReview.user} 
                  onChange={e => setNewReview({...newReview, user: e.target.value.toUpperCase()})} 
                  placeholder="Como devemos te chamar?"
                  className="rounded-2xl bg-white border border-primary/10 h-12 px-5 focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent transition-all placeholder:text-primary/30" 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-primary/60 ml-1">Título</Label>
                <Input 
                  value={newReview.headline} 
                  maxLength={60}
                  onChange={e => setNewReview({...newReview, headline: e.target.value})} 
                  placeholder="Resuma em poucas palavras"
                  className="rounded-2xl bg-white border border-primary/10 h-12 px-5 focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent transition-all placeholder:text-primary/30" 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-primary/60 ml-1">Depoimento <span className="text-accent">*</span></Label>
                <div className="relative">
                  <Textarea 
                    value={newReview.comment} 
                    onChange={e => setNewReview({...newReview, comment: e.target.value})} 
                    maxLength={500}
                    placeholder="Conte como foi o caimento, o tecido, a cor..."
                    className="rounded-2xl bg-white border border-primary/10 min-h-[110px] p-4 text-sm focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent transition-all placeholder:text-primary/30 resize-none" 
                  />
                  <span className="absolute bottom-3 right-4 text-[9px] font-bold text-primary/20">
                    {newReview.comment.length}/500
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !newReview.user.trim() || !newReview.comment.trim()} 
                className="w-full rounded-full h-12 bg-primary text-white font-bold uppercase tracking-[0.3em] text-[10px] shadow-xl hover:bg-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Publicar minha experiência"}
              </Button>
              <p className="text-[9px] text-center text-primary/40 font-medium tracking-tight">
                Sua avaliação será publicada após moderação.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
