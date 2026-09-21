
"use client";

import React, { useState, useMemo, useEffect } from 'react';
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
  Search,
  Sparkles,
  Settings,
  RefreshCw,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, limit, getDocs, where, writeBatch, setDoc } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function AdminReviews() {
  const db = useFirestore();
  const { toast } = useToast();
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'published'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCleaning, setIsCleaning] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Configurações de Demo
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'reviews'), [db]);
  const { data: settings, isLoading: loadingSettings } = useDoc(settingsRef);

  const [demoConfig, setDemoConfig] = useState({
    demoEnabled: true,
    minQty: 4,
    maxQty: 12
  });

  useEffect(() => {
    if (settings) {
      setDemoConfig({
        demoEnabled: settings.demoEnabled ?? true,
        minQty: settings.minQty ?? 4,
        maxQty: settings.maxQty ?? 12
      });
    }
  }, [settings]);

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
    // Apenas reviews reais entram na estatística do admin para não poluir o faturamento moral
    const realReviews = reviews?.filter(r => !r.isDemo) || [];
    if (realReviews.length === 0) return { avg: 0, total: 0, pending: 0 };
    const total = realReviews.length;
    const sum = realReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const pending = realReviews.filter(r => r.status === 'pending').length;
    return {
      avg: (sum / total).toFixed(1),
      total,
      pending
    };
  }, [reviews]);

  const handleApprove = (id: string) => {
    updateDocumentNonBlocking(doc(db, 'reviews', id), { status: 'published' });
    toast({ title: "Avaliação aprovada!" });
  };

  const handleDelete = (id: string) => {
    deleteDocumentNonBlocking(doc(db, 'reviews', id));
    toast({ title: "Avaliação removida." });
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await setDoc(settingsRef, demoConfig, { merge: true });
      toast({ title: "Configurações salvas!" });
    } catch (e) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleClearDemos = async () => {
    if (!confirm("Isso removerá PERMANENTEMENTE todas as avaliações marcadas como demonstrativas. As avaliações reais não serão afetadas. Continuar?")) return;
    
    setIsCleaning(true);
    try {
      const q = query(collection(db, 'reviews'), where('isDemo', '==', true));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      
      toast({ title: "Limpeza concluída!", description: `${snap.size} avaliações demonstrativas removidas.` });
    } catch (e) {
      toast({ title: "Erro na limpeza", variant: "destructive" });
    } finally {
      setIsCleaning(false);
    }
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
      {/* Demo Settings Panel */}
      <Card className="p-8 border-none bg-primary text-white rounded-[2.5rem] shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
          <Sparkles className="h-32 w-32" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
             <Settings className="h-5 w-5 text-accent" />
             <h4 className="text-xl font-headline font-bold">Laboratório de Avaliações</h4>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Modo Demonstrativo</p>
                <p className="text-[9px] opacity-60 italic">Gerar auto para novos produtos</p>
              </div>
              <Switch 
                checked={demoConfig.demoEnabled} 
                onCheckedChange={(v) => setDemoConfig({...demoConfig, demoEnabled: v})}
              />
            </div>

            <div className="flex flex-col gap-2 p-4 bg-white/5 rounded-2xl border border-white/10">
               <Label className="text-[10px] font-bold uppercase tracking-widest text-accent">Faixa de Quantidade</Label>
               <div className="flex items-center gap-3">
                  <Input 
                    type="number" 
                    value={demoConfig.minQty} 
                    onChange={e => setDemoConfig({...demoConfig, minQty: Number(e.target.value)})}
                    className="h-9 bg-white/10 border-none text-white text-center font-bold"
                  />
                  <span className="text-xs opacity-40">até</span>
                  <Input 
                    type="number" 
                    value={demoConfig.maxQty} 
                    onChange={e => setDemoConfig({...demoConfig, maxQty: Number(e.target.value)})}
                    className="h-9 bg-white/10 border-none text-white text-center font-bold"
                  />
               </div>
            </div>

            <div className="flex flex-col gap-2">
               <Button 
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="bg-accent text-primary font-bold uppercase text-[9px] tracking-widest rounded-full h-11 shadow-lg hover:brightness-110"
               >
                 {isSavingSettings ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                 Salvar Parâmetros
               </Button>
               <Button 
                variant="outline"
                onClick={handleClearDemos}
                disabled={isCleaning}
                className="border-white/20 text-white hover:bg-white/10 font-bold uppercase text-[9px] tracking-widest rounded-full h-11"
               >
                 {isCleaning ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 className="h-4 w-4 mr-2" />}
                 Limpar Dados Demo
               </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Header & Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-8 border-none shadow-sm bg-white rounded-[2rem] flex items-center gap-6">
           <div className="h-14 w-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
             <Star className="h-7 w-7 fill-current" />
           </div>
           <div>
              <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">Média Real</p>
              <p className="text-3xl font-bold text-primary">{stats.avg} / 5.0</p>
           </div>
        </Card>
        <Card className="p-8 border-none shadow-sm bg-white rounded-[2rem] flex items-center gap-6">
           <div className="h-14 w-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
             <MessageSquare className="h-7 w-7" />
           </div>
           <div>
              <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">Reviews Clientes</p>
              <p className="text-3xl font-bold text-primary">{stats.total}</p>
           </div>
        </Card>
        <Card className="p-8 border-none shadow-sm bg-primary text-white rounded-[2rem] flex items-center gap-6">
           <div className="h-14 w-14 rounded-2xl bg-white/10 text-accent flex items-center justify-center">
             <AlertTriangle className="h-7 w-7" />
           </div>
           <div>
              <p className="text-[11px] font-bold uppercase text-accent tracking-widest">Demos Ativas</p>
              <p className="text-3xl font-bold">{reviews?.filter(r => r.isDemo).length || 0}</p>
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
            <Card key={review.id} className={cn("p-8 border-none shadow-sm bg-white rounded-[2.5rem] group hover:shadow-premium transition-all duration-500", review.isDemo && "opacity-80 grayscale-[0.5]")}>
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
                        <div className="flex items-center gap-2">
                           <p className="text-sm font-bold text-primary uppercase tracking-tight">{review.user}</p>
                           {review.isDemo && <Badge className="bg-accent/20 text-accent border-none text-[7px] font-black tracking-tighter px-1.5 h-3.5">DEMO</Badge>}
                        </div>
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

                  {/* Images & Metrics */}
                  <div className="flex flex-col gap-6">
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-3">
                        {review.images.map((img, i) => (
                          <a 
                            key={i} 
                            href={img} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="h-20 w-16 rounded-lg overflow-hidden border border-primary/5 hover:scale-105 transition-transform group/img"
                          >
                             <img src={img} className="h-full w-full object-cover" />
                             <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                <ExternalLink className="h-3 w-3 text-white" />
                             </div>
                          </a>
                        ))}
                      </div>
                    )}
                    
                    {(review.qualityRating || review.fitRating || review.colorRating) && (
                      <div className="flex gap-4 p-3 bg-secondary/10 rounded-xl w-fit">
                         {review.qualityRating && <span className="text-[8px] font-black uppercase tracking-tighter opacity-40">Qualidade: {review.qualityRating}</span>}
                         {review.fitRating && <span className="text-[8px] font-black uppercase tracking-tighter opacity-40">Caimento: {review.fitRating}</span>}
                         {review.colorRating && <span className="text-[8px] font-black uppercase tracking-tighter opacity-40">Cor: {review.colorRating}</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-[9px] text-primary/30 font-bold uppercase tracking-[0.2em]">
                     <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {new Date(review.createdAt?.toDate ? review.createdAt.toDate() : review.createdAt).toLocaleDateString('pt-BR')}</span>
                     {review.recommended && <span className="flex items-center gap-1.5 text-emerald-600/60"><ThumbsUp className="h-3 w-3" /> Recomendado</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col gap-2 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
                   {review.status === 'pending' && (
                     <button 
                      onClick={() => handleApprove(review.id)}
                      className="h-10 w-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg flex items-center justify-center"
                      title="Aprovar"
                     >
                       <CheckCircle2 className="h-5 w-5" />
                     </button>
                   )}
                   <button 
                    onClick={() => handleDelete(review.id)}
                    className="h-10 w-10 rounded-xl bg-red-50 text-red-300 hover:text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                    title="Excluir"
                   >
                     <Trash2 className="h-5 w-5" />
                   </button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-40 text-center space-y-6 bg-white/40 rounded-[4rem] border-2 border-dashed border-primary/10">
             <MessageSquare className="h-12 w-12 text-primary/10 mx-auto" />
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
