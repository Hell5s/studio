
"use client";

import React, { useState } from 'react';
import { Layers, Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function AdminCategories() {
  const db = useFirestore();
  const { toast } = useToast();
  const [newCat, setNewCat] = useState('');

  const q = useMemoFirebase(() => query(collection(db, 'categories'), orderBy('order', 'asc')), [db]);
  const { data: categories, isLoading } = useCollection(q);

  const handleAdd = () => {
    if (!newCat) return;
    addDocumentNonBlocking(collection(db, 'categories'), {
      name: newCat,
      order: (categories?.length || 0) + 1,
      createdAt: new Date().toISOString()
    });
    setNewCat('');
    toast({ title: "Categoria criada!" });
  };

  const handleDelete = (id: string) => {
    if (confirm("Excluir esta categoria?")) {
      deleteDocumentNonBlocking(doc(db, 'categories', id));
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-8 border-none shadow-sm bg-white">
        <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
          <Layers className="h-5 w-5 text-accent" />
          Gerenciar Categorias
        </h3>
        <div className="flex gap-4">
          <Input 
            placeholder="Ex: Moda Fitness, Vestidos, Plus Size..." 
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAdd} className="bg-primary text-white px-8">
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </Button>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-accent" /></div>
        ) : categories?.map((cat) => (
          <Card key={cat.id} className="p-6 border-none shadow-sm flex justify-between items-center bg-white group">
            <div>
              <p className="text-[10px] font-bold uppercase text-accent tracking-widest mb-1">Ordem #{cat.order}</p>
              <h5 className="font-bold text-primary">{cat.name}</h5>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-primary"><Edit className="h-4 w-4" /></Button>
              <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
