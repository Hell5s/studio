
"use client";

import React, { useState } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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
    if (!formData.code || !formData.value) return;
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

  return (
    <div className="space-y-8">
      <Card className="p-8 border-none shadow-sm bg-white grid md:grid-cols-4 gap-6 items-end">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Código</label>
          <Input placeholder="EX: BOUTIQUE10" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Valor</label>
          <Input type="number" placeholder="10" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Tipo</label>
          <select 
            value={formData.type} 
            onChange={e => setFormData({...formData, type: e.target.value})}
            className="w-full h-10 rounded-md border border-input px-3 text-sm"
          >
            <option value="percentage">% Porcentagem</option>
            <option value="fixed">R$ Fixo</option>
          </select>
        </div>
        <Button onClick={handleAdd} className="bg-primary text-white h-10">Criar Cupom</Button>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons?.map((c) => (
          <Card key={c.id} className="p-6 border-none shadow-sm bg-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] rotate-12"><Tag className="h-20 w-20" /></div>
            <div className="flex justify-between items-start mb-4">
              <Badge className="bg-accent text-primary border-none">{c.code}</Badge>
              {c.active ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-red-300" />}
            </div>
            <div className="space-y-1">
               <h4 className="text-2xl font-bold text-primary">{c.type === 'percentage' ? `${c.value}%` : `R$ ${c.value}`}</h4>
               <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Usado {c.usedCount} vezes</p>
            </div>
            <button 
              onClick={() => deleteDocumentNonBlocking(doc(db, 'coupons', c.id))}
              className="mt-6 text-[10px] font-bold uppercase text-red-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              Remover Cupom
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
