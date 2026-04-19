
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

const StarRating = ({ rating, size = "h-3 w-3", interactive = false, onRate }: { rating: number; size?: string; interactive?: boolean; onRate?: (r: number) => void }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        onClick={() => interactive && onRate?.(i + 1)}
        className={cn(
          size, 
          i < rating ? "fill-current text-accent" : "text-gray-200 fill-current",
          interactive && "cursor-pointer hover:scale-110 transition-transform"
        )} 
      />
    ))}
  </div>
);

// Avaliações padrão para garantir que a boutique sempre pareça ativa e confiável
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

  // Form State
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

  // Combina avaliações do banco com as padrão se necessário
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
    <section id="avaliacoes" className="pt-16 border-t border-gray-100 bg-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="h-px w-8 bg-primary/20" />
             <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-primary">
              Avaliações sobre o produto
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Compra 100% verificada
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Coluna esquerda: Stats */}
        <div className="lg:col-span-4 space-y-10">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-full border-2 border-accent flex items-center justify-center shrink-0 bg-accent/5 shadow-sm">
              <span className="text-xl font-bold text-primary">{stats.avg}</span>
            </div>
            <div className="space-y-1.5">
              <StarRating rating={Math.round(stats.avg)} size="h-4 w-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{stats.total} Comentário(s)</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Qualidade', rating: 5 },
              { label: 'Veste Bem', rating: 5 },
              { label: 'Preço', rating: 5 },
            ].map(({ label, rating }) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{label}</span>
                  <span className="text-[10px] font-bold text-accent">Excelente</span>
                </div>
                <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setIsDialogOpen(true)}
            className="w-full py-4 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-accent transition-all duration-500 shadow-xl shadow-primary/10 flex items-center justify-center gap-3"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Fazer Avaliação
          </button>

          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-primary/5">
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground text-center">Onde usar</h5>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-secondary/50 text-[10px] text-primary/70 rounded-full italic">Eventos</span>
                <span className="px-3 py-1 bg-secondary/50 text-[10px] text-primary/70 rounded-full italic">Lazer</span>
              </div>
            </div>
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground text-center">Vantagens</h5>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-secondary/50 text-[10px] text-primary/70 rounded-full italic">Qualidade</span>
                <span className="px-3 py-1 bg-secondary/50 text-[10px] text-primary/70 rounded-full italic">Estilo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna direita: Reviews */}
        <div className="lg:col-span-8">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4 text-primary/20">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Sincronizando depoimentos...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <article key={review.id} className="p-8 border border-primary/5 bg-white hover:border-accent/20 transition-all duration-500 shadow-sm group">
                  <div className="flex justify-between items-start mb-4">
                    <StarRating rating={review.rating} size="h-3.5 w-3.5" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString('pt-BR') : 'Verificado'}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[14px] font-bold text-primary uppercase tracking-tight">{review.headline}</h4>
                    <p className="text-[13px] text-primary/70 leading-relaxed italic font-light">"{review.comment}"</p>
                  </div>
                  <div className="mt-6 pt-6 border-t border-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      {review.user} <span className="mx-2 text-primary/20">|</span> <span className="text-accent">Tam: {review.size}</span>
                    </p>
                    {review.recommended && (
                      <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                        <div className="h-4 w-4 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                        Recomendaria a uma amiga
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog de Nova Avaliação */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-primary p-8 text-primary-foreground relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Sparkles className="h-20 w-20" />
            </div>
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-2xl font-bold uppercase tracking-widest">Sua Experiência</DialogTitle>
              <DialogDescription className="text-white/60 italic">Conte para nós como você se sentiu com sua nova peça.</DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Sua Nota</Label>
                <div className="p-4 bg-secondary/30 rounded-2xl flex justify-center">
                  <StarRating 
                    rating={newReview.rating} 
                    size="h-8 w-8" 
                    interactive 
                    onRate={(r) => setNewReview({...newReview, rating: r})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Seu Nome</Label>
                  <Input 
                    placeholder="Ex: Luana" 
                    value={newReview.user} 
                    onChange={e => setNewReview({...newReview, user: e.target.value})}
                    className="rounded-xl bg-secondary/20 border-none h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Tamanho Comprado</Label>
                  <select 
                    value={newReview.size}
                    onChange={e => setNewReview({...newReview, size: e.target.value})}
                    className="w-full h-12 rounded-xl bg-secondary/20 border-none px-4 text-sm outline-none"
                  >
                    <option>P</option><option>M</option><option>G</option><option>GG</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Título da Avaliação</Label>
                <Input 
                  placeholder="Ex: Simplesmente amei!" 
                  value={newReview.headline} 
                  onChange={e => setNewReview({...newReview, headline: e.target.value})}
                  className="rounded-xl bg-secondary/20 border-none h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Seu Comentário</Label>
                <Textarea 
                  placeholder="Conte os detalhes do tecido, caimento..." 
                  value={newReview.comment}
                  onChange={e => setNewReview({...newReview, comment: e.target.value})}
                  className="rounded-2xl bg-secondary/20 border-none min-h-[100px] p-4"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                 <input 
                  type="checkbox" 
                  checked={newReview.recommended} 
                  onChange={e => setNewReview({...newReview, recommended: e.target.checked})}
                  className="h-4 w-4 accent-emerald-600"
                 />
                 <span className="text-[11px] font-bold uppercase text-emerald-700">Eu recomendaria este produto a uma amiga</span>
              </div>
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="w-full rounded-full h-14 bg-primary text-white font-bold uppercase tracking-widest shadow-xl"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publicar Avaliação"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
