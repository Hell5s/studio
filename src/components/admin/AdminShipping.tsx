"use client";

import React, { useState, useEffect } from 'react';
import { Truck, Plus, Trash2, Save, Loader2, Clock, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function AdminShipping() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<any>(null);

  const shippingRef = useMemoFirebase(() => doc(db, 'settings', 'shipping'), [db]);
  const { data: shippingSettings, isLoading } = useDoc(shippingRef);

  const [formData, setFormData] = useState({
    freeShippingThreshold: 250,
    options: [] as any[]
  });

  const [optionForm, setOptionForm] = useState({
    id: '',
    name: '',
    days: '',
    priceSoutheastSouth: 0,
    priceOtherRegions: 0
  });

  useEffect(() => {
    if (shippingSettings) {
      setFormData({
        freeShippingThreshold: shippingSettings.freeShippingThreshold ?? 250,
        options: shippingSettings.options ?? []
      });
    }
  }, [shippingSettings]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(shippingRef, formData, { merge: true });
      toast({ title: "Configurações de frete salvas!" });
    } catch (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOptionDialog = (option?: any) => {
    if (option) {
      setEditingOption(option);
      setOptionForm({ ...option });
    } else {
      setEditingOption(null);
      setOptionForm({
        id: `opt-${Date.now()}`,
        name: '',
        days: '',
        priceSoutheastSouth: 0,
        priceOtherRegions: 0
      });
    }
    setIsOptionDialogOpen(true);
  };

  const handleSaveOption = () => {
    if (!optionForm.name || !optionForm.days) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }

    const newOptions = [...formData.options];
    if (editingOption) {
      const idx = newOptions.findIndex(o => o.id === editingOption.id);
      newOptions[idx] = optionForm;
    } else {
      newOptions.push(optionForm);
    }

    setFormData({ ...formData, options: newOptions });
    setIsOptionDialogOpen(false);
  };

  const handleRemoveOption = (id: string) => {
    setFormData({ ...formData, options: formData.options.filter(o => o.id !== id) });
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h4 className="text-3xl font-headline font-bold text-primary">Logística e Frete</h4>
        <p className="text-sm text-muted-foreground italic font-light">Gerencie os valores de entrega e prazos da sua boutique.</p>
      </div>

      <Card className="p-8 border-none bg-white shadow-premium rounded-[2.5rem] space-y-6">
        <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
          <Globe className="h-5 w-5" />
          <h5 className="text-[11px] font-bold uppercase tracking-[0.4em]">Frete Grátis</h5>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-end">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-2">Valor Mínimo para Frete Grátis (R$)</Label>
            <Input 
              type="number" 
              value={formData.freeShippingThreshold} 
              onChange={e => setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })}
              className="h-14 rounded-2xl bg-secondary/10 border-none px-6 text-lg font-bold text-primary" 
            />
          </div>
          <div className="pb-1 text-xs text-muted-foreground italic leading-relaxed">
            * Acima deste valor, todas as opções de frete aparecerão como "GRÁTIS" para a cliente no checkout.
          </div>
        </div>
      </Card>

      <Card className="p-8 border-none bg-white shadow-premium rounded-[2.5rem] space-y-8">
        <div className="flex items-center justify-between border-b border-primary/5 pb-4">
          <div className="flex items-center gap-3 text-accent">
            <Truck className="h-5 w-5" />
            <h5 className="text-[11px] font-bold uppercase tracking-[0.4em]">Métodos de Entrega</h5>
          </div>
          <Button 
            variant="ghost" size="sm" 
            onClick={() => handleOpenOptionDialog()}
            className="h-8 text-accent text-[9px] font-bold uppercase border border-accent/20 px-4 rounded-full"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Nova Opção
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {formData.options.map((opt) => (
            <div key={opt.id} className="p-6 bg-secondary/10 rounded-[2rem] border border-primary/5 group relative hover:bg-white hover:shadow-lg transition-all duration-500">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenOptionDialog(opt)} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors"><Plus className="h-3 w-3" /></button>
                <button onClick={() => handleRemoveOption(opt.id)} className="p-2 bg-red-50 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-colors"><Trash2 className="h-3 w-3" /></button>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-accent shadow-sm">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h6 className="font-bold text-primary uppercase text-sm tracking-tight">{opt.name}</h6>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium"><Clock className="h-3 w-3" /> {opt.days}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/5">
                <div>
                  <p className="text-[8px] font-black uppercase text-accent tracking-widest mb-1">Sul / Sudeste</p>
                  <p className="text-lg font-bold text-primary">R$ {opt.priceSoutheastSouth.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-primary/40 tracking-widest mb-1">Outras Regiões</p>
                  <p className="text-lg font-bold text-primary">R$ {opt.priceOtherRegions.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
          {formData.options.length === 0 && (
            <div className="col-span-full py-12 text-center bg-secondary/5 rounded-[2rem] border-2 border-dashed border-primary/5">
               <Truck className="h-10 w-10 text-primary/10 mx-auto mb-4" />
               <p className="text-xs text-muted-foreground italic">Nenhuma opção de frete configurada.</p>
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-center pt-8">
        <Button 
          onClick={handleSave} 
          disabled={loading} 
          className="rounded-full bg-primary text-white font-bold h-16 px-20 text-[11px] uppercase tracking-[0.4em] shadow-2xl hover:scale-105 transition-all"
        >
          {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar Configurações de Frete
        </Button>
      </div>

      <Dialog open={isOptionDialogOpen} onOpenChange={setIsOptionDialogOpen}>
        <DialogContent className="rounded-[2.5rem] bg-white border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-primary p-8 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline font-bold">
                {editingOption ? 'Editar Opção de Frete' : 'Nova Opção de Frete'}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Nome da Entrega</Label>
                <Input value={optionForm.name} onChange={e => setOptionForm({ ...optionForm, name: e.target.value })} placeholder="Ex: Entrega Expressa" className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Prazo de Entrega</Label>
                <Input value={optionForm.days} onChange={e => setOptionForm({ ...optionForm, days: e.target.value })} placeholder="Ex: 3-5 dias úteis" className="rounded-xl h-12" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Preço Sul/Sudeste (R$)</Label>
                  <Input type="number" value={optionForm.priceSoutheastSouth} onChange={e => setOptionForm({ ...optionForm, priceSoutheastSouth: Number(e.target.value) })} className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Preço Outras Regiões (R$)</Label>
                  <Input type="number" value={optionForm.priceOtherRegions} onChange={e => setOptionForm({ ...optionForm, priceOtherRegions: Number(e.target.value) })} className="rounded-xl h-12" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-secondary/10 flex gap-3">
            <button onClick={() => setIsOptionDialogOpen(false)} className="rounded-full px-6 h-12 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors">Cancelar</button>
            <Button onClick={handleSaveOption} className="rounded-full px-8 bg-primary text-white h-12 text-[10px] font-bold uppercase tracking-widest shadow-lg">
              {editingOption ? 'Atualizar Opção' : 'Adicionar Opção'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}