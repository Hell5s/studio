
"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Loader2, 
  Filter, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  Package,
  ArrowUpDown
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where, deleteDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { EditProductDialog } from './EditProductDialog';
import { deleteDocumentNonBlocking } from '@/firebase';

export function ProductManagement() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const productsQuery = useMemoFirebase(() => {
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: products, isLoading } = useCollection(productsQuery);

  const filteredProducts = products?.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (productId: string, productName: string) => {
    if (confirm(`Deseja realmente excluir "${productName}" do catálogo?`)) {
      const docRef = doc(db, 'products', productId);
      deleteDocumentNonBlocking(docRef);
      toast({
        title: "Produto excluído",
        description: "O item foi removido permanentemente do catálogo.",
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-accent/40 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Pesquisar no catálogo..." 
            className="pl-14 h-16 rounded-full border-none bg-white shadow-sm focus:ring-2 focus:ring-primary/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <Button variant="outline" className="rounded-full h-16 px-8 border-none bg-white shadow-sm text-[10px] font-bold uppercase tracking-widest hover:bg-secondary">
            <Filter className="mr-3 h-4 w-4" /> Filtros
          </Button>
          <Button variant="outline" className="rounded-full h-16 px-8 border-none bg-white shadow-sm text-[10px] font-bold uppercase tracking-widest hover:bg-secondary">
            <ArrowUpDown className="mr-3 h-4 w-4" /> Ordenar
          </Button>
        </div>
      </div>

      <Card className="rounded-[3rem] border-none bg-white shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/20 border-b border-primary/5">
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Produto</th>
                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Categoria</th>
                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Preço</th>
                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-accent/40 mx-auto" />
                  </td>
                </tr>
              ) : filteredProducts?.map((product) => (
                <tr key={product.id} className="hover:bg-secondary/10 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-2xl overflow-hidden bg-muted shadow-sm shrink-0 border border-primary/5">
                        <img src={product.image || product.images?.[0]} className="object-cover h-full w-full" alt={product.name} />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="font-bold text-primary truncate max-w-[200px]">{product.name}</span>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">{product.source || 'Curadoria'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <Badge variant="outline" className="rounded-full border-primary/10 text-[9px] font-bold uppercase tracking-widest py-1.5 px-4">
                      {product.category || 'Geral'}
                    </Badge>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-primary">R$ {product.price?.toFixed(2)}</span>
                      {product.oldPrice && (
                        <span className="text-[10px] text-muted-foreground/50 line-through">R$ {product.oldPrice?.toFixed(2)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    {product.published !== false ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Publicado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-600">
                        <XCircle className="h-4 w-4" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Rascunho</span>
                      </div>
                    )}
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="rounded-full h-10 w-10 hover:bg-primary/5 text-primary"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="rounded-full h-10 w-10 hover:bg-destructive/10 text-destructive"
                        onClick={() => handleDelete(product.id, product.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {(!filteredProducts || filteredProducts.length === 0) && !isLoading && (
            <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
              <div className="h-24 w-24 rounded-full bg-secondary/50 flex items-center justify-center text-primary/20">
                <Package className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h5 className="text-xl font-headline font-bold text-primary/40 uppercase tracking-widest">Catálogo Vazio</h5>
                <p className="text-xs text-muted-foreground max-w-xs font-light italic">Não encontramos nenhum produto com estes critérios de busca.</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {editingProduct && (
        <EditProductDialog 
          product={editingProduct} 
          open={!!editingProduct} 
          onOpenChange={(open) => !open && setEditingProduct(null)} 
        />
      )}
    </div>
  );
}
