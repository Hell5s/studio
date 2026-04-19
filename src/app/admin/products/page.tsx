
"use client";

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Loader2, 
  ArrowUpDown,
  TrendingUp,
  LayoutDashboard,
  Eye
} from 'lucide-react';
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';

export default function AdminProductsPage() {
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Verificação de Admin
  const adminDocRef = useMemoFirebase(() => {
    return user ? doc(db, 'roles_admin', user.uid) : null;
  }, [db, user]);
  const { data: adminRole, isLoading: isAdminLoading } = useDoc(adminDocRef);
  const isAdmin = !!adminRole;

  // Consulta de Produtos
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  }, [db]);
  const { data: products, isLoading } = useCollection(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const s = searchTerm.toLowerCase().trim();
    if (!s) return products;
    return products.filter(p => 
      p.name?.toLowerCase().includes(s) || 
      p.sku?.toLowerCase().includes(s) || 
      p.category?.toLowerCase().includes(s)
    );
  }, [products, searchTerm]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja remover permanentemente "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: "Produto removido" });
    } catch (e) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  if (isAdminLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FFF9F7]">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FFF9F7] text-center p-10">
        <LayoutDashboard className="h-16 w-16 text-destructive/20 mb-6" />
        <h1 className="text-2xl font-headline font-bold text-primary">Acesso Restrito</h1>
        <p className="text-muted-foreground italic font-light max-w-xs mt-2">Esta área é exclusiva para administradores da Toda Bela.</p>
        <Button onClick={() => router.push('/')} className="mt-8 rounded-full h-14 px-10 bg-primary text-white">Voltar para Loja</Button>
      </div>
    );
  }

  if (isFormOpen) {
    return (
      <div className="min-h-screen bg-[#FFF9F7] p-10">
        <ProductForm 
          initialData={editingProduct} 
          onSuccess={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F7] p-6 md:p-10 space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="h-px w-8 bg-accent" />
             <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Gestão Editorial</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary tracking-tighter">Boutique Catalog</h1>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="rounded-full h-16 px-10 bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 transition-all uppercase text-[10px] font-bold tracking-widest"
        >
          <Plus className="mr-2 h-5 w-5" />
          Adicionar Peça
        </Button>
      </header>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Produtos", val: products?.length || 0, icon: <Package className="h-4 w-4" />, color: "bg-white" },
          { label: "Ativos na Vitrine", val: products?.filter(p => p.status === 'active').length || 0, icon: <Eye className="h-4 w-4" />, color: "bg-green-50" },
          { label: "Em Rascunho", val: products?.filter(p => p.status === 'draft').length || 0, icon: <Edit className="h-4 w-4" />, color: "bg-orange-50" },
          { label: "Margem Média", val: "54%", icon: <TrendingUp className="h-4 w-4" />, color: "bg-accent/10" },
        ].map((stat, i) => (
          <Card key={i} className={cn("p-6 rounded-[2rem] border-none shadow-sm flex items-center gap-6", stat.color)}>
            <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">{stat.icon}</div>
            <div>
              <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-primary">{stat.val}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-accent/30 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Buscar por nome, SKU ou categoria..." 
            className="pl-14 rounded-full h-16 bg-white border-none shadow-sm focus:ring-2 focus:ring-primary/10 text-primary"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="rounded-full h-16 px-8 border-none bg-white shadow-sm font-bold uppercase text-[10px] tracking-widest">
          <Filter className="mr-3 h-4 w-4 text-accent" /> Filtros
        </Button>
        <Button variant="outline" className="rounded-full h-16 px-8 border-none bg-white shadow-sm font-bold uppercase text-[10px] tracking-widest">
          <ArrowUpDown className="mr-3 h-4 w-4 text-accent" /> Ordenar
        </Button>
      </div>

      {/* Main Table */}
      <Card className="rounded-[3rem] border-none bg-white shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/20 border-b border-primary/5">
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Produto</th>
                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Preço / Lucro</th>
                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Estoque</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto" />
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/10 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-6">
                        <div className="h-20 w-16 rounded-2xl overflow-hidden bg-muted shadow-sm shrink-0">
                          <img src={p.image} className="h-full w-full object-cover" alt={p.name} />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="font-bold text-primary truncate max-w-[250px]">{p.name}</span>
                          <div className="flex items-center gap-2">
                             <Badge variant="outline" className="text-[8px] font-black uppercase py-0.5 border-accent/20 text-accent">{p.category}</Badge>
                             <span className="text-[9px] text-muted-foreground font-mono">SKU: {p.sku || p.id.slice(-6).toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          p.status === 'active' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : 
                          p.status === 'draft' ? "bg-orange-400" : "bg-red-400"
                        )} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                          {p.status === 'active' ? 'Ativo' : p.status === 'draft' ? 'Rascunho' : 'Inativo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">R$ {p.price?.toFixed(2)}</span>
                        <span className="text-[10px] text-green-600 font-bold uppercase italic">+{((p.price - (p.cost || 0))).toFixed(2)} Lucro</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-secondary text-[11px] font-bold text-primary border border-primary/5">
                        {p.stock}
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         {p.sourceUrl && (
                            <Button 
                              size="icon" variant="ghost" 
                              className="rounded-full h-10 w-10 text-accent hover:bg-accent/10"
                              onClick={() => window.open(p.sourceUrl, '_blank')}
                              title="Ver Fornecedor"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                         )}
                         <Button 
                            size="icon" variant="ghost" 
                            className="rounded-full h-10 w-10 text-primary hover:bg-primary/5"
                            onClick={() => {
                              setEditingProduct(p);
                              setIsFormOpen(true);
                            }}
                         >
                            <Edit className="h-4 w-4" />
                         </Button>
                         <Button 
                            size="icon" variant="ghost" 
                            className="rounded-full h-10 w-10 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(p.id, p.name)}
                         >
                            <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-32 text-center space-y-6">
                    <Package className="h-16 w-16 text-primary/10 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xl font-headline font-bold text-primary/40 uppercase tracking-widest">Catálogo Vazio</p>
                      <p className="text-sm text-muted-foreground italic font-light">Inicie a curadoria da sua boutique adicionando peças exclusivas.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
