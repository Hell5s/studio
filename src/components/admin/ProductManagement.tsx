
"use client";

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  Filter, 
  CheckCircle2,
  XCircle,
  Package,
  ArrowUpDown,
  ExternalLink,
  Star,
  X,
  Copy,
  Plus
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { EditProductDialog } from './EditProductDialog';

export function ProductManagement() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const productsQuery = useMemoFirebase(() => query(collection(db, 'products'), orderBy('createdAt', 'desc')), [db]);
  const { data: products, isLoading } = useCollection(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const s = searchTerm.toLowerCase().trim();
    if (!s) return products;
    return products.filter(p => p.name?.toLowerCase().includes(s) || p.category?.toLowerCase().includes(s));
  }, [products, searchTerm]);

  const handleDuplicate = async (p: any) => {
    const newProduct = { 
      ...p, 
      id: `prod-${Date.now()}`,
      name: `${p.name} (Cópia)`, 
      createdAt: new Date().toISOString() 
    };
    addDocumentNonBlocking(collection(db, 'products'), newProduct);
    toast({ title: "Produto duplicado!" });
  };

  const handleDelete = (id: string, name: string) => {
    if (!id) return;
    if (window.confirm(`Deseja remover permanentemente "${name}" do catálogo?`)) {
      deleteDocumentNonBlocking(doc(db, 'products', id));
      toast({ title: "Produto removido com sucesso" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar por nome ou categoria..." 
            className="pl-11 rounded-full border-none shadow-sm bg-white h-12"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full bg-white border-none shadow-sm h-12 px-6 text-[10px] font-bold uppercase tracking-widest"><Filter className="mr-2 h-4 w-4" /> Filtros</Button>
          <Button variant="outline" className="rounded-full bg-white border-none shadow-sm h-12 px-6 text-[10px] font-bold uppercase tracking-widest"><ArrowUpDown className="mr-2 h-4 w-4" /> Ordenar</Button>
        </div>
      </div>

      <Card className="rounded-[1.5rem] border-none shadow-sm bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
              <tr>
                <th className="px-8 py-5">Produto</th>
                <th className="px-8 py-5">Categoria</th>
                <th className="px-8 py-5">Preço / Lucro</th>
                <th className="px-8 py-5">Estoque</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={6} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-accent" /></td></tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-11 rounded-lg overflow-hidden bg-gray-100 shadow-sm border border-gray-50">
                          <img src={p.image} className="h-full w-full object-cover" alt={p.name} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-primary line-clamp-1 max-w-[200px]">{p.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tight">SKU: {p.sku || p.id?.slice(-6).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge className="bg-secondary text-primary border-none text-[9px] font-bold uppercase px-3">
                        {p.category}
                      </Badge>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">R$ {p.price?.toFixed(2)}</span>
                        {p.cost && (
                          <span className="text-[10px] text-emerald-600 font-bold uppercase italic">
                            Lucro: R$ {(p.price - p.cost).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium">{p.stock} un</span>
                    </td>
                    <td className="px-8 py-6">
                      {p.published !== false ? (
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase">
                          <CheckCircle2 className="h-4 w-4" /> Ativo
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-500 font-bold text-[10px] uppercase">
                          <XCircle className="h-4 w-4" /> Inativo
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleDuplicate(p)} className="p-2 text-muted-foreground hover:text-accent" title="Duplicar">
                          <Copy className="h-4 w-4" />
                        </button>
                        <button onClick={() => setEditingProduct(p)} className="p-2 text-muted-foreground hover:text-primary" title="Editar">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="p-2 text-red-200 hover:text-red-500" title="Excluir">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-muted-foreground italic text-sm">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editingProduct && (
        <EditProductDialog 
          product={editingProduct} 
          open={!!editingProduct} 
          onOpenChange={o => !o && setEditingProduct(null)} 
        />
      )}
    </div>
  );
}
