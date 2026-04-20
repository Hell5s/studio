
"use client";

import React, { useState } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function AdminCoupons() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    code: '',
    value: '',
    type: 'percentage'
  });

  const q = useMemoFirebase(() => query(collection(db, 'coupons'), orderBy('code', 'asc')), [db]);
  const { data: coupons, isLoading } = useCollection(q);

  const handleAdd = () => {
    if (!formData.code || !formData.value) {
      toast({ title: "Preencha os campos", variant: "destructive" });
      return;
    }
    addDocumentNonBlocking(collection(db, 'coupons'), {
      ...formData,
      value: parseFloat(formData.value),
      active: true,
      usedCount: 0,
      createdAt: new Date().toISOString()
    });
    setFormData({ code: '', value: '', type: 'percentage' });
    toast({ title: "Cupom gerado!" });
  };

  const toggleStatus = (coupon: any) => {
    updateDocumentNonBlocking(doc(db, 'coupons', coupon.id), {
      active: !coupon.active
    });
    toast({ title: coupon.active ? "Cupom desativado" : "Cupom reativado" });
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Excluir o cupom ${code} permanentemente?`)) {
      deleteDocumentNonBlocking(doc(db, 'coupons', id));
      toast({ title: "Cupom removido" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h4 className="text-3xl font-headline font-bold text-primary">Cupons de Desconto</h4>
        <p className="text-sm text-muted-foreground italic font-light">Gerencie ofertas especiais para fidelizar suas clientes.</p>
      </div>

      <Card className="p-10 border-none shadow-2xl bg-white rounded-[3rem] grid md:grid-cols-4 gap-8 items-end relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03]"><Tag className="h-32 w-32" /></div>
        <div className="space-y-3 relative z-10">
          <label className="text-[10px] font-bold uppercase text-accent tracking-widest ml-2">Código</label>
          <Input 
            placeholder="EX: BELA10" 
            className="h-14 rounded-full px-6 bg-secondary/20 border-none uppercase font-bold"
            value={formData.code} 
            onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
          />
        </div>
        <div className="space-y-3 relative z-10">
          <label className="text-[10px] font-bold uppercase text-accent tracking-widest ml-2">Valor</label>
          <Input 
            type="number" 
            placeholder="10" 
            className="h-14 rounded-full px-6 bg-secondary/20 border-none"
            value={formData.value} 
            onChange={e => setFormData({...formData, value: e.target.value})} 
          />
        </div>
        <div className="space-y-3 relative z-10">
          <label className="text-[10px] font-bold uppercase text-accent tracking-widest ml-2">Tipo de Desconto</label>
          <select 
            value={formData.type} 
            onChange={e => setFormData({...formData, type: e.target.value})}
            className="w-full h-14 rounded-full border-none bg-secondary/20 px-6 text-sm font-bold text-primary outline-none"
          >
            <option value="percentage">% Porcentagem</option>
            <option value="fixed">R$ Fixo</option>
          </select>
        </div>
        <Button 
          onClick={handleAdd} 
          className="h-14 rounded-full bg-primary text-white shadow-xl hover:scale-105 transition-all font-bold uppercase tracking-widest text-[10px]"
        >
          <Plus className="mr-2 h-5 w-5" /> Ativar Cupom
        </Button>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-accent mx-auto" />
          </div>
        ) : coupons && coupons.length > 0 ? (
          coupons.map((c) => (
            <Card key={c.id} className="p-8 border-none shadow-lg bg-white relative overflow-hidden group rounded-[2.5rem] hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform"><Tag className="h-24 w-24" /></div>
              <div className="flex justify-between items-start mb-6">
                <Badge className="bg-accent text-primary border-none px-4 py-1 rounded-full font-bold tracking-widest">{c.code}</Badge>
                <button 
                  onClick={() => toggleStatus(c)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                    c.active ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-400 border border-red-100"
                  )}
                >
                  {c.active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {c.active ? 'Ativo' : 'Pausado'}
                </button>
              </div>
              <div className="space-y-2">
                 <h4 className="text-4xl font-headline font-bold text-primary">{c.type === 'percentage' ? `${c.value}%` : `R$ ${c.value}`}</h4>
                 <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Utilizado {c.usedCount || 0} vezes</p>
              </div>
              <div className="mt-8 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[9px] text-accent font-bold uppercase tracking-[0.2em] italic">Elegância com benefício</p>
                <button 
                  onClick={() => handleDelete(c.id, c.code)}
                  className="text-[10px] font-bold uppercase text-red-300 hover:text-red-500 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remover
                </button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-white/40 rounded-[4rem] border-2 border-dashed border-primary/10">
             <Tag className="h-10 w-10 text-primary/10 mx-auto mb-4" />
             <p className="text-xl font-headline font-bold text-primary/40 uppercase tracking-widest">Sem Cupons Ativos</p>
          </div>
        )}
      </div>
    </div>
  );
}
