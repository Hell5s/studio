
"use client";

import React, { useState, useMemo } from 'react';
import { 
  Star, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  Filter, 
  MessageSquare,
  Package,
  Calendar,
  XCircle,
  ThumbsUp,
  Search
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, limit } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function AdminReviews() {
  const db = useFirestore();
  const { toast } = useToast();
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'published'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const reviewsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(200));
  }, [db]);

  const { data: reviews, isLoading } = useCollection(reviewsQuery);

  const filteredReviews = useMemo(() => {
    if (!reviews) return [];
    return reviews.filter(r => {
      const matchRating = filterRating === 'all' || r.rating === filterRating;
      const matchStatus = filterStatus === 'all' || r.status === filterStatus;
      const matchSearch = !searchTerm || 
        r.user?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.comment?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchRating && matchStatus && matchSearch;
    });
  }, [reviews, filterRating, filterStatus, searchTerm]);

  const stats = useMemo(() => {
    if (!reviews || reviews.length === 0) return { avg: 0, total: 0, pending: 0 };
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const pending = reviews.filter(r => r.status === 'pending').length;
    return {
      avg: (sum / total).toFixed(1),
      total,
      pending
    };
  }, [reviews]);

  const handleApprove = (id: string) => {
    updateDocumentNonBlocking(doc(db, 'reviews', id), { status: 'published' });
    toast({ title: "Avaliação aprovada!", description: "O depoimento já está visível na loja." });
  };

  const handleDelete = (id: string) => {
    deleteDocumentNonBlocking(doc(db, 'reviews', id));
    toast({ title: "Avaliação removida." });
  };

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={cn("h-3 w-3", i < rating ? "fill-current text-accent" : "text-gray-200 fill-current")} />
      ))}
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header & Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-8 border-none shadow-sm bg-white rounded-[2rem] flex items-center gap-6">
           <div className="h-14 w-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
             <Star className="h-7 w-7 fill-current" />
           </div>
           <div>
              <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">Média Geral</p>
              <p className="text-3xl font-bold text-primary">{stats.avg} / 5.0</p>
           </div>
        </Card>
        <Card className="p-8 border-none shadow-sm bg-white rounded-[2rem] flex items-center gap-6">
           <div className="h-14 w-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
             <MessageSquare className="h-7 w-7" />
           </div>
           <div>
              <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">Total Reviews</p>
              <p className="text-3xl font-bold text-primary">{stats.total}</p>
           </div>
        </Card>
        <Card className="p-8 border-none shadow-sm bg-primary text-white rounded-[2rem] flex items-center gap-6">
           <div className="h-14 w-14 rounded-2xl bg-white/10 text-accent flex items-center justify-center">
             <CheckCircle2 className="h-7 w-7" />
           </div>
           <div>
              <p className="text-[11px] font-bold uppercase text-accent tracking-widest">Pendentes</p>
              <p className="text-3xl font-bold">{stats.pending}</p>
           </div>
        </Card>
      </div>

      {/* Control Bar */}
      <Card className="p-6 border-none shadow-sm bg-white rounded-[2rem] flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20" />
          <Input 
            placeholder="Buscar por cliente, produto ou comentário..." 
            className="pl-11 rounded-full border-none bg-secondary/20 h-12"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="h-12 px-6 rounded-full bg-secondary/20 border-none text-[11px] font-bold uppercase tracking-widest text-primary outline-none cursor-pointer"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
          >
            <option value="all">Status: Todos</option>
            <option value="pending">Pendentes</option>
            <option value="published">Publicados</option>
          </select>
          <select 
            className="h-12 px-6 rounded-full bg-secondary/20 border-none text-[11px] font-bold uppercase tracking-widest text-primary outline-none cursor-pointer"
            value={filterRating}
            onChange={e => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">Nota: Todas</option>
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Estrelas</option>)}
          </select>
        </div>
      </Card>

      {/* List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="py-40 text-center"><Loader2 className="h-10 w-10 animate-spin text-accent mx-auto" /></div>
        ) : filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <Card key={review.id} className="p-8 border-none shadow-sm bg-white rounded-[2.5rem] group hover:shadow-premium transition-all duration-500">
              <div className="grid md:grid-cols-[auto_1fr_auto] gap-8 items-start">
                {/* Product Info */}
                <div className="w-24 space-y-3 shrink-0">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-secondary shadow-sm relative">
                    <img src={review.productImage} className="h-full w-full object-cover" alt={review.productName} />
                    <div className="absolute inset-0 bg-black/10" />
                  </div>
                  <Badge variant="outline" className="w-full justify-center text-[8px] font-black uppercase border-primary/5 py-1 text-primary/40 truncate">
                    {review.productName}
                  </Badge>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-[10px] font-black text-primary border border-primary/5">
                        {review.user?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary uppercase tracking-tight">{review.user}</p>
                        <div className="flex items-center gap-2">
                           <StarRating rating={review.rating} />
                        </div>
                      </div>
                    </div>
                    <Badge className={cn(
                      "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                      review.status === 'published' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                    )}>
                      {review.status === 'published' ? 'Publicada' : 'Aguardando Moderação'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-bold text-primary italic leading-tight">"{review.headline}"</h5>
                    <p className="text-sm text-primary/60 leading-relaxed font-light italic">{review.comment}</p>
                  </div>

                  <div className="flex items-center gap-6 text-[9px] text-primary/30 font-bold uppercase tracking-[0.2em]">
                     <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {new Date(review.createdAt?.toDate ? review.createdAt.toDate() : review.createdAt).toLocaleDateString('pt-BR')}</span>
                     {review.recommended && <span className="flex items-center gap-1.5 text-emerald-600/60"><ThumbsUp className="h-3 w-3" /> Recomendado</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col gap-2 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
                   {review.status === 'pending' && (
                     <Button 
                      onClick={() => handleApprove(review.id)}
                      className="h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                      size="icon"
                      title="Aprovar"
                     >
                       <CheckCircle2 className="h-5 w-5" />
                     </Button>
                   )}
                   <Button 
                    onClick={() => handleDelete(review.id)}
                    variant="ghost"
                    className="h-10 rounded-xl text-red-300 hover:text-red-500 hover:bg-red-50"
                    size="icon"
                    title="Excluir"
                   >
                     <Trash2 className="h-5 w-5" />
                   </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-40 text-center space-y-6 bg-white/40 rounded-[4rem] border-2 border-dashed border-primary/10">
             <Star className="h-12 w-12 text-primary/10 mx-auto" />
             <div className="space-y-2">
                <h5 className="text-xl font-headline font-bold text-primary/40 uppercase tracking-widest">Nenhuma Avaliação</h5>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto font-light italic">Os depoimentos das suas clientes aparecerão aqui para moderação.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
