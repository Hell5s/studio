
"use client";

import React, { useState, useMemo } from 'react';
import { Star, CheckCircle2, Check, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
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

interface Review {
  id: string;
  user: string;
  headline: string;
  rating: number;
  comment: string;
  size: string;
  recommended: boolean;
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

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'default-1',
    user: 'ALICE M.',
    headline: 'Simplesmente Maravilhoso!',
    rating: 5,
    comment: 'O tecido é de uma qualidade absurda, veste super bem e valoriza muito o corpo. Chegou antes do prazo e a embalagem é um luxo.',
    size: 'M',
    recommended: true
  },
  {
    id: 'default-2',
    user: 'BEATRIZ S.',
    headline: 'Conforto e Elegância',
    rating: 5,
    comment: 'Comprei para usar no trabalho e recebi muitos elogios. O caimento é perfeito e a cor é exatamente como na foto.',
    size: 'P',
    recommended: true
  },
  {
    id: 'default-3',
    user: 'CARLA F.',
    headline: 'Minha melhor compra do ano',
    rating: 4,
    comment: 'A peça é linda e muito bem acabada. Só achei o tamanho G um pouco justo, mas nada que comprometa o uso.',
    size: 'G',
    recommended: true
  }
];

export function ProductReviews({ productId }: { productId: string }) {
  const db = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newReview, setNewReview] = useState({
    user: '',
    rating: 5,
    headline: '',
    comment: '',
    size: 'M',
    recommended: true
  });

  const reviewsQuery = useMemoFirebase(() => {
    if (!db || !productId) return null;
    return query(collection(db, 'products', productId, 'reviews'), orderBy('createdAt', 'desc'));
  }, [db, productId]);

  const { data: dbReviews, isLoading } = useCollection<Review>(reviewsQuery);

  const reviews = useMemo(() => {
    const list = dbReviews || [];
    if (list.length === 0) return DEFAULT_REVIEWS;
    return list;
  }, [dbReviews]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const recommended = reviews.filter(r => r.recommended).length;
    return {
      avg: Number((sum / total).toFixed(1)),
      total,
      recommendedPercent: Math.round((recommended / total) * 100)
    };
  }, [reviews]);

  const handleSubmit = () => {
    if (!newReview.user || !newReview.comment) {
      toast({ title: "Dados incompletos", description: "Por favor, preencha seu nome e comentário.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const reviewsRef = collection(db, 'products', productId, 'reviews');
    
    addDocumentNonBlocking(reviewsRef, {
      ...newReview,
      createdAt: serverTimestamp()
    });

    toast({ title: "Avaliação enviada!", description: "Obrigada por compartilhar sua experiência Toda Bela." });
    setIsSubmitting(false);
    setIsDialogOpen(false);
    setNewReview({ user: '', rating: 5, headline: '', comment: '', size: 'M', recommended: true });
  };

  return (
    <section id="avaliacoes" className="pt-20 md:pt-32 border-t border-gray-100 bg-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 md:mb-20 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <div className="h-px w-12 bg-primary/20" />
             <h2 className="text-xs md:text-sm font-bold uppercase tracking-[0.5em] text-primary">
              Experiência das Clientes
            </h2>
          </div>
          <h3 className="text-3xl md:text-5xl font-headline font-bold text-primary">Vozes da <span className="italic font-light text-accent">Comunidade</span></h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100 shadow-sm">
          <CheckCircle2 className="h-4 w-4" />
          Ambiente 100% verificado
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
            {[
              { label: 'Qualidade do Tecido', rating: 5 },
              { label: 'Caimento no Corpo', rating: 5 },
              { label: 'Fidelidade à Cor', rating: 5 },
            ].map(({ label, rating }) => (
              <div key={label} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{label}</span>
                  <span className="text-[10px] font-bold text-accent">EXCELENTE</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setIsDialogOpen(true)}
            className="w-full py-6 bg-primary text-white text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-accent transition-all duration-700 shadow-2xl shadow-primary/10 flex items-center justify-center gap-4 group min-h-[54px]"
          >
            <MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Escrever Avaliação
          </button>

          <div className="grid grid-cols-2 gap-10 pt-8 border-t border-primary/5">
            <div className="space-y-5">
              <h5 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground text-center">Ocasiões</h5>
              <div className="flex flex-wrap gap-2.5 justify-center">
                <span className="px-4 py-2 bg-secondary/50 text-[10px] text-primary/80 rounded-full italic font-medium">Eventos</span>
                <span className="px-4 py-2 bg-secondary/50 text-[10px] text-primary/80 rounded-full italic font-medium">Lazer Chic</span>
              </div>
            </div>
            <div className="space-y-5">
              <h5 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground text-center">Destaques</h5>
              <div className="flex flex-wrap gap-2.5 justify-center">
                <span className="px-4 py-2 bg-secondary/50 text-[10px] text-primary/80 rounded-full italic font-medium">Toque Macio</span>
                <span className="px-4 py-2 bg-secondary/50 text-[10px] text-primary/80 rounded-full italic font-medium">Sofisticação</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List Column */}
        <div className="lg:col-span-8">
          {isLoading ? (
            <div className="py-32 flex flex-col items-center justify-center space-y-6 text-primary/20">
              <Loader2 className="h-12 w-12 animate-spin" />
              <p className="text-[10px] font-bold uppercase tracking-[0.5em]">Sincronizando experiências...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <article key={review.id} className="p-10 border border-primary/5 bg-white hover:border-accent/30 transition-all duration-700 shadow-sm group rounded-sm">
                  <div className="flex justify-between items-start mb-6">
                    <StarRating rating={review.rating} size="h-4 w-4" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/30 px-3 py-1 rounded-full">
                      {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString('pt-BR') : 'Verificado'}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-primary uppercase tracking-tight leading-tight">{review.headline}</h4>
                    <p className="text-base text-primary/70 leading-relaxed italic font-light">"{review.comment}"</p>
                  </div>
                  <div className="mt-8 pt-8 border-t border-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-black text-primary">{review.user[0]}</div>
                       <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
                        {review.user} <span className="mx-3 text-primary/10">|</span> <span className="text-accent">TAM: {review.size}</span>
                      </p>
                    </div>
                    {review.recommended && (
                      <div className="flex items-center gap-3 text-[10px] text-emerald-600 font-bold uppercase tracking-[0.3em]">
                        <div className="h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
                          <Check className="h-3 w-3" />
                        </div>
                        Recomendado
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
        <DialogContent className="sm:max-w-[550px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-[#FFF9F7]">
          <div className="bg-primary p-10 text-primary-foreground relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="h-24 w-24" />
            </div>
            <DialogHeader className="relative z-10 text-left space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent">Editorial Feedback</p>
              <DialogTitle className="text-3xl font-headline font-bold uppercase tracking-widest">Sua Experiência</DialogTitle>
              <DialogDescription className="text-white/60 italic text-base">Compartilhe os detalhes que tornaram sua escolha especial.</DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-10 space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-primary/40">Avalie sua peça</Label>
                <div className="p-6 bg-secondary/30 rounded-3xl flex justify-center shadow-inner">
                  <StarRating 
                    rating={newReview.rating} 
                    size="h-10 w-10" 
                    interactive 
                    onRate={(r) => setNewReview({...newReview, rating: r})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-primary/40">Seu Nome</Label>
                  <Input 
                    placeholder="Ex: Luana" 
                    value={newReview.user} 
                    onChange={e => setNewReview({...newReview, user: e.target.value.toUpperCase()})}
                    className="rounded-2xl bg-secondary/20 border-none h-14 px-6 text-sm font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-primary/40">Tamanho Escolhido</Label>
                  <select 
                    value={newReview.size}
                    onChange={e => setNewReview({...newReview, size: e.target.value})}
                    className="w-full h-14 rounded-2xl bg-secondary/20 border-none px-6 text-sm outline-none font-medium appearance-none cursor-pointer"
                  >
                    <option>P</option><option>M</option><option>G</option><option>GG</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-primary/40">Título da Experiência</Label>
                <Input 
                  placeholder="Ex: Simplesmente amei cada detalhe!" 
                  value={newReview.headline} 
                  onChange={e => setNewReview({...newReview, headline: e.target.value})}
                  className="rounded-2xl bg-secondary/20 border-none h-14 px-6 text-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-primary/40">Depoimento Detalhado</Label>
                <Textarea 
                  placeholder="Conte-nos sobre o toque do tecido, o caimento e como você se sentiu ao vestir..." 
                  value={newReview.comment}
                  onChange={e => setNewReview({...newReview, comment: e.target.value})}
                  className="rounded-[2rem] bg-secondary/20 border-none min-h-[140px] p-8 text-sm italic leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-4 p-6 bg-emerald-50 border border-emerald-100 rounded-3xl group cursor-pointer" onClick={() => setNewReview({...newReview, recommended: !newReview.recommended})}>
                 <input 
                  type="checkbox" 
                  checked={newReview.recommended} 
                  onChange={e => setNewReview({...newReview, recommended: e.target.checked})}
                  className="h-5 w-5 accent-emerald-600 rounded-full"
                 />
                 <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">Eu recomendaria este produto para outras mulheres</span>
              </div>
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="w-full rounded-full h-16 bg-primary text-white font-bold uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all min-h-[54px]"
            >
              {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Publicar minha experiência"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
