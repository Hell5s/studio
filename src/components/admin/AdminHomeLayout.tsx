"use client";

import React, { useState, useEffect } from 'react';
import { 
  AlignJustify, 
  Save, 
  Loader2, 
  ChevronUp, 
  ChevronDown, 
  Layout, 
  Presentation, 
  Move,
  ImageIcon,
  Layers,
  Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, setDoc, collection, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type BlockType = 'banner' | 'categories' | 'movement' | 'showcase';

interface HomeBlock {
  type: BlockType;
  refId?: string;
  label?: string;
}

export function AdminHomeLayout() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState<HomeBlock[]>([]);

  const layoutRef = useMemoFirebase(() => doc(db, 'settings', 'homeLayout'), [db]);
  const { data: layoutData, isLoading: loadingLayout } = useDoc(layoutRef);

  const showcasesQuery = useMemoFirebase(() => query(collection(db, 'homeShowcaseSections'), where('active', '==', true)), [db]);
  const { data: activeShowcases } = useCollection(showcasesQuery);

  useEffect(() => {
    if (layoutData?.blocks) {
      setBlocks(layoutData.blocks);
    } else if (activeShowcases) {
      // Default order: Banner -> Showcases -> Categories -> Movement
      const initial: HomeBlock[] = [
        { type: 'banner', label: 'Banner Principal' },
        ...activeShowcases.map(s => ({ type: 'showcase' as const, refId: s.id, label: s.title })),
        { type: 'categories', label: 'Grid de Categorias' },
        { type: 'movement', label: 'Movimento Toda Bela (Manifesto)' }
      ];
      setBlocks(initial);
    }
  }, [layoutData, activeShowcases]);

  // Sincroniza labels se novas vitrines forem ativadas mas não estiverem no layout
  useEffect(() => {
    if (!activeShowcases || blocks.length === 0) return;

    const currentShowcaseIds = new Set(blocks.filter(b => b.type === 'showcase').map(b => b.refId));
    const newShowcases = activeShowcases.filter(s => !currentShowcaseIds.has(s.id));

    if (newShowcases.length > 0) {
      const updated = [...blocks, ...newShowcases.map(s => ({ type: 'showcase' as const, refId: s.id, label: s.title }))];
      setBlocks(updated);
    }
  }, [activeShowcases]);

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = blocks.map((b, i) => ({ ...b, order: i + 1 }));
      await setDoc(layoutRef, { blocks: payload }, { merge: true });
      toast({ title: "Layout atualizado com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao salvar layout", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getBlockIcon = (type: BlockType) => {
    switch (type) {
      case 'banner': return <ImageIcon className="h-5 w-5 text-accent" />;
      case 'categories': return <Layers className="h-5 w-5 text-accent" />;
      case 'movement': return <Move className="h-5 w-5 text-accent" />;
      case 'showcase': return <Presentation className="h-5 w-5 text-accent" />;
      default: return <Layout className="h-5 w-5 text-accent" />;
    }
  };

  if (loadingLayout) return <div className="py-20 text-center"><Loader2 className="animate-spin h-10 w-10 text-accent mx-auto" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h4 className="text-3xl font-headline font-bold text-primary">Arquitetura da Home</h4>
        <p className="text-sm text-muted-foreground italic font-light">Defina a jornada visual da sua cliente intercalando vitrines e manifestos.</p>
      </div>

      <div className="space-y-4">
        {blocks.map((block, idx) => {
          // Tenta encontrar o label atualizado para vitrines
          let displayLabel = block.label;
          if (block.type === 'showcase' && activeShowcases) {
            const sc = activeShowcases.find(s => s.id === block.refId);
            if (sc) displayLabel = sc.title;
          }

          return (
            <Card key={`${block.type}-${block.refId || idx}`} className="p-6 border-none bg-white shadow-sm flex items-center justify-between group hover:shadow-md transition-all rounded-3xl">
              <div className="flex items-center gap-6">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                  {getBlockIcon(block.type)}
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-accent tracking-[0.2em] mb-0.5">{block.type === 'showcase' ? 'Vitrine Dinâmica' : 'Bloco Fixo'}</p>
                  <h5 className="text-sm font-bold text-primary uppercase tracking-tight">{displayLabel}</h5>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => moveBlock(idx, 'up')}
                    disabled={idx === 0}
                    className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center text-primary/40 hover:bg-primary hover:text-white disabled:opacity-20 transition-all"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => moveBlock(idx, 'down')}
                    disabled={idx === blocks.length - 1}
                    className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center text-primary/40 hover:bg-primary hover:text-white disabled:opacity-20 transition-all"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="h-10 w-10 flex items-center justify-center text-primary/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AlignJustify className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center pt-8">
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="rounded-full bg-primary text-white font-bold h-16 px-16 text-[11px] uppercase tracking-[0.4em] shadow-2xl hover:scale-105 transition-all"
        >
          {loading ? <Loader2 className="animate-spin mr-3 h-4 w-4" /> : <Save className="mr-3 h-4 w-4" />}
          Salvar Ordem do Layout
        </Button>
      </div>

      <div className="p-8 rounded-[2.5rem] bg-accent/5 border border-accent/10 flex items-start gap-5">
         <Sparkles className="h-6 w-6 text-accent shrink-0 mt-1" />
         <div className="space-y-1">
            <h6 className="text-sm font-bold text-primary uppercase tracking-tight">Dica de Conversão</h6>
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              Intercale o bloco **"Movimento Toda Bela"** após a primeira vitrine para quebrar a frieza do catálogo e humanizar a sua marca logo no início da navegação.
            </p>
         </div>
      </div>
    </div>
  );
}
