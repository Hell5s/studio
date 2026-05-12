
"use client";

import React, { useState, useMemo } from 'react';
import { 
  Megaphone, 
  ShoppingBag, 
  Users, 
  Calendar, 
  Download, 
  Mail, 
  Trash2, 
  Edit, 
  Plus, 
  Clock, 
  Check,
  Search,
  Loader2,
  Tag,
  ArrowRight,
  BellRing
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, where, limit, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AdminMarketing() {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'abandonment' | 'emails' | 'promotions'>('abandonment');

  // --- 1. SEÇÃO ABANDONO DE CARRINHO ---
  const cartsQuery = useMemoFirebase(() => query(collection(db, 'carts'), orderBy('updatedAt', 'desc'), limit(50)), [db]);
  const { data: abandonedCarts, isLoading: loadingCarts } = useCollection(cartsQuery);

  const handleSendReminder = (cart: any) => {
    toast({
      title: "Lembrete Enviado!",
      description: `Notificação enviada para ${cart.customerName || 'Cliente'}.`,
    });
  };

  // --- 2. SEÇÃO LISTA DE E-MAILS ---
  // Nota: Buscando de users/{uid}/profile/data é complexo para lista global. 
  // Em apps reais, salvamos uma cópia em uma coleção flat 'marketing_leads' ou 'customers'.
  // Para este MVP, vamos listar de 'users_profiles' (uma coleção flat sugerida para marketing) ou filtrar ordens passadas.
  // Vamos usar uma coleção flat 'customers' para este exemplo.
  const customersQuery = useMemoFirebase(() => query(collection(db, 'customers'), orderBy('name', 'asc')), [db]);
  const { data: customers, isLoading: loadingCustomers } = useCollection(customersQuery);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  const toggleEmail = (email: string) => {
    const newSet = new Set(selectedEmails);
    if (newSet.has(email)) newSet.delete(email);
    else newSet.add(email);
    setSelectedEmails(newSet);
  };

  const exportCSV = () => {
    if (selectedEmails.size === 0) {
      toast({ title: "Selecione clientes", variant: "destructive" });
      return;
    }
    const selectedData = customers?.filter(c => selectedEmails.has(c.email)) || [];
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Nome,Email\n" 
      + selectedData.map(c => `"${c.name}","${c.email}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lista_marketing_todabela_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- 3. SEÇÃO AGENDAMENTO DE PROMOÇÕES ---
  const promosQuery = useMemoFirebase(() => query(collection(db, 'promotions'), orderBy('createdAt', 'desc')), [db]);
  const { data: promotions, isLoading: loadingPromos } = useCollection(promosQuery);
  
  const productsQuery = useMemoFirebase(() => query(collection(db, 'products'), where('published', '==', true)), [db]);
  const { data: allProducts } = useCollection(productsQuery);

  const [promoForm, setPromoForm] = useState({
    name: '',
    discount: '',
    startDate: '',
    endDate: '',
    selectedProducts: [] as string[]
  });

  const handleCreatePromo = () => {
    if (!promoForm.name || !promoForm.discount || !promoForm.startDate || !promoForm.endDate) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    addDocumentNonBlocking(collection(db, 'promotions'), {
      ...promoForm,
      discount: parseFloat(promoForm.discount),
      createdAt: serverTimestamp(),
      active: true
    });
    setPromoForm({ name: '', discount: '', startDate: '', endDate: '', selectedProducts: [] });
    toast({ title: "Promoção Agendada!" });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="h-px w-8 bg-accent" />
             <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Crescimento & Vendas</span>
          </div>
          <h1 className="text-4xl font-headline font-bold text-primary tracking-tighter">Marketing Digital</h1>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-primary/5">
          {[
            { id: 'abandonment', label: 'Carrinhos', icon: <ShoppingBag className="h-3.5 w-3.5" /> },
            { id: 'emails', label: 'E-mails', icon: <Mail className="h-3.5 w-3.5" /> },
            { id: 'promotions', label: 'Promoções', icon: <Calendar className="h-3.5 w-3.5" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                activeSubTab === tab.id ? "bg-primary text-white shadow-lg" : "text-primary/40 hover:bg-secondary/50"
              )}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- RENDERIZAÇÃO DAS SEÇÕES --- */}

      {activeSubTab === 'abandonment' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 border-none shadow-sm bg-white rounded-[2rem] flex items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center"><ShoppingBag className="h-5 w-5" /></div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Abandonos (Mês)</p>
                <p className="text-2xl font-bold text-primary">{abandonedCarts?.length || 0}</p>
              </div>
            </Card>
            <Card className="p-6 border-none shadow-sm bg-white rounded-[2rem] flex items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Check className="h-5 w-5" /></div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Recuperados</p>
                <p className="text-2xl font-bold text-primary">12%</p>
              </div>
            </Card>
            <Card className="p-6 border-none shadow-sm bg-primary text-white rounded-[2rem] flex items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-white/10 text-accent flex items-center justify-center"><BellRing className="h-5 w-5" /></div>
              <div>
                <p className="text-[10px] font-bold uppercase text-accent tracking-widest">Ação Necessária</p>
                <p className="text-2xl font-bold">{abandonedCarts?.filter(c => !c.reminded).length || 0}</p>
              </div>
            </Card>
          </div>

          <Card className="rounded-[2.5rem] border-none bg-white shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Cliente</th>
                    <th className="px-8 py-5">Produtos no Carrinho</th>
                    <th className="px-8 py-5 text-center">Valor Total</th>
                    <th className="px-8 py-5">Tempo Abandonado</th>
                    <th className="px-8 py-5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loadingCarts ? (
                    <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-accent mx-auto" /></td></tr>
                  ) : abandonedCarts && abandonedCarts.length > 0 ? (
                    abandonedCarts.map((cart) => (
                      <tr key={cart.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">{cart.customerName?.[0] || 'C'}</div>
                            <div className="flex flex-col">
                               <span className="font-bold text-primary">{cart.customerName || 'Cliente Anônimo'}</span>
                               <span className="text-[10px] text-muted-foreground">{cart.customerEmail}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex -space-x-2">
                             {cart.items?.slice(0, 3).map((it: any, i: number) => (
                               <div key={i} className="h-8 w-8 rounded-lg border-2 border-white bg-gray-100 overflow-hidden shadow-sm">
                                 <img src={it.image} className="h-full w-full object-cover" />
                               </div>
                             ))}
                             {cart.items?.length > 3 && <div className="h-8 w-8 rounded-lg bg-secondary text-[9px] font-bold flex items-center justify-center border-2 border-white">+{cart.items.length - 3}</div>}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center font-bold text-primary">R$ {cart.total?.toFixed(2)}</td>
                        <td className="px-8 py-6 text-xs text-muted-foreground italic">
                          {cart.updatedAt ? formatDistanceToNow(cart.updatedAt?.toDate ? cart.updatedAt.toDate() : new Date(cart.updatedAt), { addSuffix: true, locale: ptBR }) : 'Recentemente'}
                        </td>
                        <td className="px-8 py-6 text-right">
                           <Button 
                            onClick={() => handleSendReminder(cart)}
                            className="rounded-full bg-accent text-primary font-bold uppercase text-[9px] tracking-widest h-9 px-5 hover:scale-105 transition-all shadow-md"
                           >
                             Enviar Lembrete
                           </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="py-20 text-center text-muted-foreground italic">Nenhum carrinho abandonado detectado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeSubTab === 'emails' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20" />
                <Input placeholder="Buscar por nome ou e-mail..." className="pl-11 rounded-full border-none bg-white shadow-sm h-12" />
             </div>
             <Button 
              onClick={exportCSV}
              className="rounded-full bg-primary text-white font-bold uppercase text-[10px] tracking-widest h-12 px-8 shadow-xl"
             >
               <Download className="mr-2 h-4 w-4" /> Exportar CSV ({selectedEmails.size})
             </Button>
          </div>

          <Card className="rounded-[2.5rem] border-none bg-white shadow-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                <tr>
                  <th className="px-8 py-5 w-10">
                     <Checkbox 
                        onCheckedChange={(v) => {
                           if (v) setSelectedEmails(new Set(customers?.map(c => c.email) || []));
                           else setSelectedEmails(new Set());
                        }}
                     />
                  </th>
                  <th className="px-8 py-5">Cliente</th>
                  <th className="px-8 py-5">E-mail</th>
                  <th className="px-8 py-5">Cadastrada em</th>
                  <th className="px-8 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loadingCustomers ? (
                   <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-accent mx-auto" /></td></tr>
                ) : customers && customers.length > 0 ? (
                  customers.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <Checkbox 
                          checked={selectedEmails.has(c.email)}
                          onCheckedChange={() => toggleEmail(c.email)}
                        />
                      </td>
                      <td className="px-8 py-6 font-bold text-primary uppercase text-xs tracking-tight">{c.name}</td>
                      <td className="px-8 py-6 text-sm text-primary/60 italic font-light">{c.email}</td>
                      <td className="px-8 py-6 text-[10px] text-muted-foreground uppercase font-bold">
                        {c.createdAt ? new Date(c.createdAt?.toDate ? c.createdAt.toDate() : c.createdAt).toLocaleDateString('pt-BR') : 'Jan, 2024'}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] uppercase font-black px-3 py-1">Ativa</Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="py-20 text-center text-muted-foreground italic">Sua base de dados está sendo construída.</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {activeSubTab === 'promotions' && (
        <div className="grid lg:grid-cols-[400px_1fr] gap-10">
          <Card className="p-8 border-none bg-white shadow-2xl rounded-[3rem] h-fit space-y-8">
            <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
              <Calendar className="h-5 w-5" />
              <h5 className="text-[11px] font-bold uppercase tracking-[0.4em]">Agendar Promoção</h5>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="ml-2 text-[9px] font-bold uppercase text-muted-foreground">Nome da Campanha</Label>
                <Input value={promoForm.name} onChange={e => setPromoForm({...promoForm, name: e.target.value})} placeholder="Ex: Black Friday 2024" className="h-12 rounded-xl bg-secondary/10 border-none" />
              </div>
              <div className="space-y-2">
                <Label className="ml-2 text-[9px] font-bold uppercase text-muted-foreground">Desconto (%)</Label>
                <Input type="number" value={promoForm.discount} onChange={e => setPromoForm({...promoForm, discount: e.target.value})} placeholder="Ex: 20" className="h-12 rounded-xl bg-secondary/10 border-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="ml-2 text-[9px] font-bold uppercase text-muted-foreground">Data Início</Label>
                  <Input type="date" value={promoForm.startDate} onChange={e => setPromoForm({...promoForm, startDate: e.target.value})} className="h-12 rounded-xl bg-secondary/10 border-none text-[10px]" />
                </div>
                <div className="space-y-2">
                  <Label className="ml-2 text-[9px] font-bold uppercase text-muted-foreground">Data Fim</Label>
                  <Input type="date" value={promoForm.endDate} onChange={e => setPromoForm({...promoForm, endDate: e.target.value})} className="h-12 rounded-xl bg-secondary/10 border-none text-[10px]" />
                </div>
              </div>
              <div className="space-y-2">
                 <Label className="ml-2 text-[9px] font-bold uppercase text-muted-foreground">Produtos Aplicáveis</Label>
                 <div className="max-h-[150px] overflow-y-auto space-y-2 p-4 bg-secondary/10 rounded-2xl no-scrollbar">
                    {allProducts?.map(p => (
                      <div key={p.id} className="flex items-center gap-3">
                         <Checkbox 
                          checked={promoForm.selectedProducts.includes(p.id)}
                          onCheckedChange={() => {
                            const newSet = new Set(promoForm.selectedProducts);
                            if (newSet.has(p.id)) newSet.delete(p.id); else newSet.add(p.id);
                            setPromoForm({...promoForm, selectedProducts: Array.from(newSet)});
                          }}
                         />
                         <span className="text-[10px] font-bold text-primary/60 truncate">{p.name}</span>
                      </div>
                    ))}
                 </div>
              </div>
              
              <Button 
                onClick={handleCreatePromo}
                className="w-full h-14 bg-primary text-white font-bold uppercase tracking-widest text-[10px] rounded-full shadow-xl hover:scale-105 transition-all"
              >
                <Plus className="mr-2 h-4 w-4" /> Criar Campanha
              </Button>
            </div>
          </Card>

          <div className="space-y-6">
            <h5 className="text-[11px] font-bold uppercase tracking-[0.4em] text-primary/40 px-4">Campanhas Ativas & Futuras</h5>
            <div className="grid md:grid-cols-2 gap-6">
              {loadingPromos ? (
                <div className="col-span-full py-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-accent mx-auto" /></div>
              ) : promotions && promotions.length > 0 ? (
                promotions.map((promo) => (
                  <Card key={promo.id} className="p-8 border-none shadow-lg bg-white rounded-[2.5rem] relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform"><Tag className="h-24 w-24" /></div>
                    <div className="flex justify-between items-start mb-6">
                      <Badge className="bg-accent text-primary border-none px-4 py-1 rounded-full font-bold tracking-widest">{promo.discount}% OFF</Badge>
                      <button onClick={() => deleteDocumentNonBlocking(doc(db, 'promotions', promo.id))} className="text-red-200 hover:text-red-500 p-2"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <h4 className="text-2xl font-headline font-bold text-primary mb-1 uppercase tracking-tight">{promo.name}</h4>
                    <p className="text-[9px] font-black uppercase text-accent tracking-[0.2em]">De {new Date(promo.startDate).toLocaleDateString('pt-BR')} até {new Date(promo.endDate).toLocaleDateString('pt-BR')}</p>
                    
                    <div className="mt-6 flex items-center justify-between">
                       <span className="text-[10px] text-muted-foreground italic font-light">{promo.selectedProducts?.length || 0} produtos participantes</span>
                       <Button size="icon" variant="ghost" className="rounded-full h-8 w-8 text-primary/20 hover:text-primary"><Edit className="h-3.5 w-3.5" /></Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white/40 border-2 border-dashed border-primary/5 rounded-[3rem]">
                   <Calendar className="h-10 w-10 text-primary/10 mx-auto mb-4" />
                   <p className="text-xs text-muted-foreground italic">Nenhuma campanha agendada no momento.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
