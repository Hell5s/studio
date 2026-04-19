
"use client";

import React, { useState } from 'react';
import { Settings, Save, Smartphone, Mail, Truck, ShieldCheck, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

export function AdminSettings() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    whatsapp: '(11) 99999-9999',
    email: 'contato@todobela.com.br',
    freeShipping: '249',
    deliveryTime: '15-20 dias',
    announcement: '🌟 NOVA COLEÇÃO DISPONÍVEL • FRETE GRÁTIS ACIMA DE R$ 249'
  });

  const handleSave = () => {
    setLoading(true);
    // Simulação de salvamento em config global
    setTimeout(() => {
      toast({ title: "Configurações atualizadas!" });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl space-y-10">
      <div className="flex justify-between items-center">
         <h4 className="text-2xl font-bold text-primary flex items-center gap-3">
           <Settings className="h-6 w-6 text-accent" /> Configurações da Boutique
         </h4>
         <Button onClick={handleSave} disabled={loading} className="bg-primary text-white rounded-full px-10">
           {loading ? 'Salvando...' : 'Salvar Alterações'}
         </Button>
      </div>

      <div className="grid gap-8">
        <Card className="p-8 border-none shadow-sm space-y-8 bg-white">
          <div className="flex items-center gap-3 text-accent border-b border-gray-100 pb-4">
             <Smartphone className="h-5 w-5" />
             <h5 className="text-[11px] font-bold uppercase tracking-widest">Atendimento e Contato</h5>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>WhatsApp VIP</Label>
              <Input value={settings.whatsapp} onChange={e => setSettings({...settings, whatsapp: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>E-mail Suporte</Label>
              <Input value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} />
            </div>
          </div>
        </Card>

        <Card className="p-8 border-none shadow-sm space-y-8 bg-white">
          <div className="flex items-center gap-3 text-accent border-b border-gray-100 pb-4">
             <Truck className="h-5 w-5" />
             <h5 className="text-[11px] font-bold uppercase tracking-widest">Logística e Frete</h5>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Frete Grátis acima de (R$)</Label>
              <Input value={settings.freeShipping} onChange={e => setSettings({...settings, freeShipping: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Prazo de Entrega Estimado</Label>
              <Input value={settings.deliveryTime} onChange={e => setSettings({...settings, deliveryTime: e.target.value})} />
            </div>
          </div>
        </Card>

        <Card className="p-8 border-none shadow-sm space-y-8 bg-white">
          <div className="flex items-center gap-3 text-accent border-b border-gray-100 pb-4">
             <Smartphone className="h-5 w-5" />
             <h5 className="text-[11px] font-bold uppercase tracking-widest">Anúncios de Topo</h5>
          </div>
          <div className="space-y-2">
            <Label>Frase Promocional (Aviso de Topo)</Label>
            <Input value={settings.announcement} onChange={e => setSettings({...settings, announcement: e.target.value})} />
          </div>
        </Card>

        <Card className="p-8 border-none shadow-sm space-y-8 bg-white">
          <div className="flex items-center gap-3 text-accent border-b border-gray-100 pb-4">
             <ShieldCheck className="h-5 w-5" />
             <h5 className="text-[11px] font-bold uppercase tracking-widest">Políticas Legais</h5>
          </div>
          <div className="space-y-6">
             <div className="space-y-2">
               <Label>Termos de Uso</Label>
               <Textarea className="min-h-[150px]" placeholder="Cole aqui os termos da sua boutique..." />
             </div>
             <div className="space-y-2">
               <Label>Política de Trocas</Label>
               <Textarea className="min-h-[150px]" placeholder="Descreva o processo de devolução..." />
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
