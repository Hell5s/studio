
"use client";

import React, { useState, useMemo } from 'react';
import { Star, CheckCircle2, Check, Loader2, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  user: string;
  headline: string;
  rating: number;
  comment: string;
  size: string;
  recommended: boolean;
  createdAt: any;
}

export function ProductReviews({ productId }: { productId: string }) {
  const db = useFirestore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Consulta de avaliações reais
  const reviewsQuery = useMemoFirebase(() => {
    if (!db || !productId) return null;
    return query(collection(db, 'products', productId, 'reviews'), orderBy('createdAt', 'desc'));
  }, [db, productId]);

  const { data: reviews, isLoading } = useCollection<Review>(reviewsQuery);

  // Cálculos de Resumo
  const stats = useMemo(() => {
    if (!reviews || reviews.length === 0) return { avg: 5, total: 0, recommended: 100 };
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const recCount = reviews.filter(r => r.recommended).length;
    return {
      avg: Math.round((sum / reviews.length) * 10) / 10,
      total: reviews.length,
      recommended: Math.round((recCount / reviews.length) * 100)
    };
  }, [reviews]);

  // Estado do Formulário
  const [formData, setFormData] = useState({
    user: '',
    rating: 5,
    headline: '',
    comment: '',
    size: 'M',
    recommended: true
  });

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user || !formData.comment) {
      toast({ title: "Campos obrigatórios", description: "Por favor, preencha seu nome e comentário.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewsRef = collection(db, 'products', productId, 'reviews');
      addDocumentNonBlocking(reviewsRef, {
        ...formData,
        createdAt: serverTimestamp()
      });

      toast({ title: "Obrigada!", description: "Sua avaliação foi enviada com sucesso." });
      setIsFormOpen(false);
      setFormData({ user: '', rating: 5, headline: '', comment: '', size: 'M', recommended: true });
    } catch (e) {
      toast({ title: "Erro ao enviar", description: "Tente novamente em instantes.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, size = "h-2.5 w-2.5", onRate }: { rating: number, size?: string, onRate?: (n: number) => void }) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          onClick={() => onRate?.(i + 1)}
          className={cn(
            size, 
            i < rating ? "fill-current text-black" : "text-gray-200",
            onRate && "cursor-pointer hover:scale-110 transition-transform"
          )} 
        />
      ))}
    </div>
  );

  return (
    <section id="avaliacoes" className="pt-20 border-t border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <h2 className="text-[14px] font-bold uppercase tracking-widest text-[#444]">Avaliações sobre o produto</h2>
        <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full">
          <CheckCircle2 className="h-4 w-4" />
          Compra 100% verificada
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-16">
        {/* Coluna de Resumo */}
        <div className="lg:col-span-4 space-y-12">
          <div className="flex items-center gap-8">
            <div className="h-20 w-20 rounded-full border-4 border-black flex items-center justify-center">
              <span className="text-2xl font-bold">{stats.avg}</span>
            </div>
            <div className="space-y-1">
              <StarRating rating={Math.round(stats.avg)} size="h-4 w-4" />
              <p className="text-[12px] font-bold uppercase text-gray-400 tracking-widest">
                {isLoading ? '...' : `${stats.total} avaliações`}
              </p>
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-gray-50">
            {[
              { label: 'Qualidade', rating: 5 },
              { label: 'Preço', rating: 5 },
              { label: 'Veste Bem', rating: 5 }
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{item.label}</span>
                <StarRating rating={item.rating} />
              </div>
            ))}
          </div>

          <button 
            onClick={() => setIsFormOpen(true)}
            className="w-full py-5 bg-black text-white text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-gray-800"
          >
            FAZER AVALIAÇÃO
          </button>

          <div className="grid grid-cols-2 gap-8 pt-6">
            <div className="space-y-4">
              <h5 className="text-[11px] font-bold uppercase tracking-widest text-gray-300 text-center">Onde usar</h5>
              <ul className="text-center space-y-2 text-[12px] font-medium text-gray-500 italic">
                <li>Dia a dia</li>
                <li>Lazer & Eventos</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="text-[11px] font-bold uppercase tracking-widest text-gray-300 text-center">Vantagens</h5>
              <ul className="text-center space-y-2 text-[12px] font-medium text-gray-500 italic">
                <li>Conforto</li>
                <li>Design Premium</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Listagem de Comentários */}
        <div className="lg:col-span-8 space-y-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-300">
               <Loader2 className="h-8 w-8 animate-spin" />
               <p className="text-[10px] font-bold uppercase tracking-widest">Sincronizando experiências...</p>
            </div>
          ) : reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <article key={review.id} className="p-10 bg-white border border-gray-100 space-y-6 animate-in fade-in duration-500">
                <StarRating rating={review.rating} size="h-3 w-3" />
                <div className="space-y-3">
                  <h4 className="text-[13px] font-bold text-[#444] uppercase">{review.headline || 'Excelente'}</h4>
                  <p className="text-[13px] text-gray-500 leading-relaxed font-light italic">"{review.comment}"</p>
                </div>
                {review.recommended && (
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 italic">
                    <div className="h-5 w-5 rounded-full border border-emerald-100 flex items-center justify-center bg-emerald-50">
                      <Check className="h-3 w-3 text-emerald-500" />
                    </div>
                    Sim, recomendaria a uma amiga.
                  </div>
                )}
                <div className="pt-4 border-t border-gray-50">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    {review.user} | TAMANHO: {review.size}
                  </p>
                </div>
              </article>
            ))
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-gray-50 rounded-xl space-y-6">
               <Sparkles className="h-10 w-10 text-gray-100 mx-auto" />
               <div className="space-y-1">
                 <p className="text-[12px] font-bold uppercase text-gray-300 tracking-widest">Seja a primeira a avaliar</p>
                 <p className="text-xs text-gray-400 font-light italic">Sua opinião ajuda outras mulheres Toda Bela.</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Diálogo de Avaliação */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-xl rounded-none p-0 border-none bg-white shadow-2xl">
          <div className="bg-black p-8 text-white flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-1">Feedback Boutique</p>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold uppercase tracking-tight">Avaliar sua Peça</DialogTitle>
              </DialogHeader>
            </div>
            <button onClick={() => setIsFormOpen(false)} className="h-10 w-10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleReviewSubmit} className="p-8 space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase text-gray-400">Sua Nota</Label>
                <div className="flex gap-2 items-center">
                   <StarRating rating={formData.rating} size="h-6 w-6" onRate={(n) => setFormData({...formData, rating: n})} />
                   <span className="text-xs font-bold text-gray-300 ml-2">{formData.rating}/5</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase text-gray-400">Nome ou Apelido</Label>
                  <Input 
                    placeholder="Ex: Luana M." 
                    value={formData.user} 
                    onChange={e => setFormData({...formData, user: e.target.value})}
                    className="rounded-none border-gray-100 h-12 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase text-gray-400">Tamanho Adquirido</Label>
                  <select 
                    value={formData.size} 
                    onChange={e => setFormData({...formData, size: e.target.value})}
                    className="w-full h-12 border border-gray-100 px-4 text-sm outline-none"
                  >
                    <option>P</option>
                    <option>M</option>
                    <option>G</option>
                    <option>GG</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase text-gray-400">Título da Avaliação</Label>
                <Input 
                  placeholder="Ex: Caimento impecável" 
                  value={formData.headline} 
                  onChange={e => setFormData({...formData, headline: e.target.value})}
                  className="rounded-none border-gray-100 h-12 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase text-gray-400">O que achou do produto?</Label>
                <Textarea 
                  placeholder="Conte os detalhes: tecido, conforto, cor..." 
                  value={formData.comment} 
                  onChange={e => setFormData({...formData, comment: e.target.value})}
                  className="rounded-none border-gray-100 min-h-[100px] text-sm italic"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="rec"
                  checked={formData.recommended}
                  onChange={e => setFormData({...formData, recommended: e.target.checked})}
                  className="h-4 w-4 accent-black" 
                />
                <label htmlFor="rec" className="text-xs text-gray-500 font-medium italic">Recomendo este produto para outras clientes.</label>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-16 bg-black text-white font-bold uppercase tracking-[0.2em] text-[11px] rounded-none hover:bg-gray-800 transition-all"
            >
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : "Publicar Avaliação"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
