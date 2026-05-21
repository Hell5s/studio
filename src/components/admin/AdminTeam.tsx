
"use client";

import React, { useState } from 'react';
import { ShieldCheck, Plus, Trash2, Loader2, UserPlus, Fingerprint } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function AdminTeam() {
  const db = useFirestore();
  const { toast } = useToast();
  const [newUid, setNewUid] = useState('');

  const q = useMemoFirebase(() => query(collection(db, 'roles_admin')), [db]);
  const { data: admins, isLoading } = useCollection(q);

  const handleAddAdmin = () => {
    if (!newUid.trim()) {
      toast({ title: "UID obrigatório", variant: "destructive" });
      return;
    }
    
    // O UID é o ID do documento na coleção roles_admin
    const adminRef = doc(db, 'roles_admin', newUid.trim());
    
    setDocumentNonBlocking(adminRef, {
      role: 'admin',
      addedAt: serverTimestamp()
    }, { merge: true });
    
    setNewUid('');
    toast({ title: "Admin adicionado!", description: "O acesso foi liberado para este UID." });
  };

  const handleRemoveAdmin = (uid: string) => {
    if (!uid) return;
    if (confirm("Remover este usuário da equipe administrativa?")) {
      deleteDocumentNonBlocking(doc(db, 'roles_admin', uid));
      toast({ title: "Admin removido" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h4 className="text-3xl font-headline font-bold text-primary">Equipe & Acessos</h4>
        <p className="text-sm text-muted-foreground italic font-light">Gerencie quem tem permissão para administrar a Toda Bela.</p>
      </div>

      <Card className="p-10 border-none shadow-2xl bg-white rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03]"><ShieldCheck className="h-40 w-40" /></div>
        
        <div className="relative z-10 space-y-6">
          <div className="max-w-2xl space-y-4">
             <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent ml-2">UID do Novo Administrador</label>
             <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                   <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-accent/40" />
                   <Input 
                    placeholder="Cole aqui o UID do usuário" 
                    className="h-16 rounded-full pl-14 bg-secondary/20 border-none text-primary"
                    value={newUid}
                    onChange={e => setNewUid(e.target.value)}
                   />
                </div>
                <Button 
                  onClick={handleAddAdmin}
                  disabled={!newUid.trim()}
                  className="h-16 rounded-full px-10 bg-primary text-white font-bold uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all"
                >
                  <UserPlus className="mr-2 h-5 w-5" /> Adicionar Admin
                </Button>
             </div>
             <p className="text-[10px] text-muted-foreground italic px-6 leading-relaxed">
               * O UID pode ser encontrado na aba "Authentication" do console do Firebase. 
             </p>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin h-10 w-10 text-accent mx-auto" /></div>
        ) : admins && admins.length > 0 ? (
          admins.map((admin) => (
            <Card key={admin.id} className="p-8 border-none shadow-lg bg-white rounded-[2.5rem] group hover:shadow-2xl transition-all duration-500">
               <div className="flex justify-between items-start mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-primary">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <button 
                    onClick={() => handleRemoveAdmin(admin.id)}
                    className="text-red-200 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
               </div>
               <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase text-accent tracking-widest">UID do Admin</p>
                  <p className="text-xs font-mono text-primary bg-secondary/30 p-3 rounded-xl break-all">
                    {admin.id}
                  </p>
               </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white/40 border-2 border-dashed border-primary/10 rounded-[3rem]">
             <p className="text-sm text-muted-foreground italic">Nenhum administrador extra cadastrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
