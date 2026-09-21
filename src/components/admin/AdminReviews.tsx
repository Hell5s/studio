
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
  ExternalLink,
  Plus
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, limit, getDocs, where, writeBatch, setDoc, Timestamp } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TEST_REVIEWS_DATA = [
  { user: "MARIANA S.", rating: 5, headline: "Perfeito, amei!", comment: "Chegou antes do prazo e a peça é ainda mais bonita pessoalmente. O tecido é encorpado, não marca e o caimento ficou lindo. Já quero em outra cor!", recommended: true, metrics: [5,5,5], daysAgo: 2, photos: 2 },
  { user: "JULIANA R.", rating: 5, headline: "Qualidade surpreendente", comment: "Comprei meio desconfiada porque foi online, mas o acabamento é de loja física de primeira. Os botões dourados dão um charme a mais.", recommended: true, metrics: [5,5,4], daysAgo: 5, photos: 0 },
  { user: "CAMILA F.", rating: 4, headline: "Lindo, mas pedi um tamanho acima", comment: "A modelagem é bem ajustada, então para quem gosta de mais folga vale pedir um número acima. O tecido é ótimo e a cor veio igualzinha à foto.", recommended: true, metrics: [5,3,5], daysAgo: 9, photos: 1 },
  { user: "PATRÍCIA L.", rating: 5, headline: "Já é o meu conjunto favorito", comment: "Usei num jantar e recebi vários elogios. Confortável, não amassa e a cor é exatamente a das fotos. O atendimento também foi ótimo.", recommended: true, metrics: [5,5,5], daysAgo: 14, photos: 3 },
  { user: "BEATRIZ M.", rating: 5, headline: "Entrega rápida e embalagem linda", comment: "Veio tudo muito bem embalado, com carinho nos detalhes. A peça é linda e valoriza o corpo. Recomendo de olhos fechados.", recommended: true, metrics: [5,4,5], daysAgo: 18, photos: 0 },
  { user: "FERNANDA C.", rating: 3, headline: "Bonito, mas a cor ficou um pouco diferente", comment: "A peça é bem feita e confortável, mas o tom veio mais escuro do que aparece nas fotos. Nada grave, só fica o aviso.", recommended: false, metrics: [4,4,2], daysAgo: 25, photos: 0 },
  { user: "LUANA P.", rating: 5, headline: "Caimento incrível", comment: "Sou alta e muitas vezes as peças ficam curtas, mas essa ficou na medida certa. O tecido é fresquinho e ótimo para o calor.", recommended: true, metrics: [5,5,5], daysAgo: 31, photos: 1 },
  { user: "ROSANGELA T.", rating: 4, headline: "Muito boa, chegou certinho", comment: "Gostei bastante da qualidade e do preço. Só acho que poderia ter mais opções de cores, porque amei o modelo.", recommended: true, metrics: [4,4,5], daysAgo: 40, photos: 0 },
  { user: "THAÍS B.", rating: 5, headline: "", comment: "Amei!", recommended: true, metrics: [5,5,5], daysAgo: 3, photos: 0 },
];

export function AdminReviews() {
  const db = useFirestore();
  const { toast } = useToast();
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'published'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCleaning, setIsCleaning] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);

  // States para Ferramenta de Teste
  const [testProductId, setTestProductId] = useState<string>('');
  const [testQty, setTestQty] = useState(9);
  const [testInStats, setTestInStats] = useState('no');

  // Consulta de Produtos para Seletor de Teste
  const productsQuery = useMemoFirebase(() => query(collection(db, 'products'), orderBy('name', 'asc')), [db]);
  const { data: products } = useCollection(productsQuery);

  // Configurações de Demo
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'reviews'), [db]);
  const { data: settings } = useDoc(settingsRef);

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

  const { data: reviews, isLoading } = useCollection<Review>(reviewsQuery);

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
    const realReviews = reviews?.filter(r => !r.isDemo && !r.isTest) || [];
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
    if (!confirm("Isso removerá PERMANENTEMENTE todas as avaliações marcadas como demonstrativas ou de teste. As avaliações reais de clientes não serão afetadas. Continuar?")) return;
    
    setIsCleaning(true);
    try {
      const qDemo = query(collection(db, 'reviews'), where('isDemo', '==', true));
      const qTest = query(collection(db, 'reviews'), where('isTest', '==', true));
      
      const [snapDemo, snapTest] = await Promise.all([getDocs(qDemo), getDocs(qTest)]);
      const batch = writeBatch(db);
      
      snapDemo.docs.forEach((d) => batch.delete(d.ref));
      snapTest.docs.forEach((d) => batch.delete(d.ref));
      
      await batch.commit();
      
      const totalRemoved = snapDemo.size + snapTest.size;
      toast({ title: "Limpeza concluída!", description: `${totalRemoved} avaliações removidas.` });
    } catch (e) {
      toast({ title: "Erro na limpeza", variant: "destructive" });
    } finally {
      setIsCleaning(false);
    }
  };

  const handleGenerateTestReviews = async () => {
    if (!testProductId) return;
    const product = products?.find(p => p.id === testProductId);
    if (!product) return;

    setIsGeneratingTest(true);
    const batch = writeBatch(db);
    const now = new Date();

    try {
      for (let i = 0; i < testQty; i++) {
        const data = TEST_REVIEWS_DATA[i % TEST_REVIEWS_DATA.length];
        const reviewRef = doc(collection(db, 'reviews'));
        
        const images: string[] = [];
        for (let n = 1; n <= data.photos; n++) {
          images.push(`https://picsum.photos/seed/tobabela-${i}-${n}/600/800`);
        }

        const createdAtDate = new Date(now);
        createdAtDate.setDate(now.getDate() - data.daysAgo);

        const payload = {
          productId: product.id,
          productName: product.name,
          productImage: typeof product.image === 'string' ? product.image : product.image?.url,
          userId: 'demo',
          user: data.user,
          rating: data.rating,
          headline: data.headline,
          comment: data.comment,
          recommended: data.recommended,
          qualityRating: data.metrics[0],
          fitRating: data.metrics[1],
          colorRating: data.metrics[2],
          images: images,
          status: 'published',
          isDemo: testInStats === 'no',
          isTest: testInStats === 'yes',
          createdAt: Timestamp.fromDate(createdAtDate)
        };

        batch.set(reviewRef, payload);
      }

      await batch.commit();
      toast({ title: `${testQty} avaliações de teste criadas!` });
    } catch (e) {
      toast({ title: "Erro ao gerar testes", variant: "destructive" });
    } finally {
      setIsGeneratingTest(false);
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
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Demo Settings Panel */}
        <Card className="p-8 border-none bg-primary text-white rounded-[2.5rem] shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <Sparkles className="h-32 w-32" />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <Settings className="h-5 w-5 text-accent" />
              <h4 className="text-xl font-headline font-bold">Automação de Vitrine</h4>
            </div>
            
            <div className="grid gap-6">
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

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="bg-accent text-primary font-bold uppercase text-[9px] tracking-widest rounded-full h-11 shadow-lg hover:brightness-110"
                >
                  {isSavingSettings ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Salvar
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleClearDemos}
                  disabled={isCleaning}
                  className="border-white/20 text-white hover:bg-white/10 font-bold uppercase text-[9px] tracking-widest rounded-full h-11"
                >
                  {isCleaning ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  Limpar Demos
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Ferramenta de Avaliações de Teste */}
        <Card className="p-8 border-none bg-white shadow-xl rounded-[2.5rem] space-y-6">
          <div className="flex items-center gap-3 border-b border-primary/5 pb-4">
            <RefreshCw className="h-5 w-5 text-accent" />
            <h4 className="text-xl font-headline font-bold text-primary">Avaliações de Teste</h4>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 ml-2">Produto Alvo</Label>
              <Select value={testProductId} onValueChange={setTestProductId}>
                <SelectTrigger className="h-12 rounded-xl border-primary/10 bg-secondary/10 px-4">
                  <SelectValue placeholder="Selecione um produto..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {products?.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 ml-2">Quantidade (1-9)</Label>
                <Input 
                  type="number" 
                  min={1} 
                  max={9} 
                  value={testQty} 
                  onChange={e => setTestQty(Math.min(9, Math.max(1, Number(e.target.value))))}
                  className="h-12 rounded-xl border-primary/10 bg-secondary/10 px-4"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 ml-2">Contar estatísticas?</Label>
                <Select value={testInStats} onValueChange={setTestInStats}>
                  <SelectTrigger className="h-12 rounded-xl border-primary/10 bg-secondary/10 px-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">Não (Demonstrativa)</SelectItem>
                    <SelectItem value="yes">Sim (Teste)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleGenerateTestReviews}
              disabled={isGeneratingTest || !testProductId}
              className="w-full h-14 bg-primary text-white font-bold uppercase tracking-widest text-[10px] rounded-full shadow-lg hover:bg-accent transition-all"
            >
              {isGeneratingTest ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Gerar Avaliações de Teste
            </Button>
          </div>
        </Card>
      </div>

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
              <p className="text-[11px] font-bold uppercase text-accent tracking-widest">Demos/Testes Ativas</p>
              <p className="text-3xl font-bold">{reviews?.filter(r => r.isDemo || r.isTest).length || 0}</p>
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
            <Card key={review.id} className={cn("p-8 border-none shadow-sm bg-white rounded-[2.5rem] group hover:shadow-premium transition-all duration-500", (review.isDemo || review.isTest) && "opacity-80 grayscale-[0.5]")}>
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
                           {review.isDemo && <Badge className="bg-accent/10 text-accent border-none text-[7px] font-black px-1.5 h-3.5">DEMO</Badge>}
                           {review.isTest && <Badge className="bg-blue-50 text-blue-600 border-none text-[7px] font-black px-1.5 h-3.5">TESTE</Badge>}
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
                    {review.headline && <h4 className="text-lg font-bold text-primary uppercase tracking-tight">{review.headline}</h4>}
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
                    
                    <div className="flex gap-4 p-3 bg-secondary/10 rounded-xl w-fit">
                       {review.qualityRating && <span className="text-[8px] font-black uppercase tracking-tighter opacity-40">Qualidade: {review.qualityRating}</span>}
                       {review.fitRating && <span className="text-[8px] font-black uppercase tracking-tighter opacity-40">Caimento: {review.fitRating}</span>}
                       {review.colorRating && <span className="text-[8px] font-black uppercase tracking-tighter opacity-40">Cor: {review.colorRating}</span>}
                    </div>
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
  isTest?: boolean;
  createdAt?: any;
}
