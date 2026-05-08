
"use client";

import React, { useState, useEffect } from 'react';
import { Settings, Save, Smartphone, Mail, Truck, Layout, Info, Instagram, Loader2, Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

export function AdminSettings() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: storeSettings, isLoading } = useDoc(settingsRef);

  const [formData, setFormData] = useState({
    storeName: 'Toda Bela',
    tagline: 'Moda Feminina Moderna',
    contactEmail: 'contato@todabela.com.br',
    whatsapp: '(11) 99999-9999',
    instagram: '@todabela',
    featuredTitle: 'Novas Peças',
    featuredSubtitle: 'Editorial de Estilo',
    heroCta: 'Conferir Looks',
    purposeTitle: 'Moda com Propósito',
    purposeText: 'Cada peça em nossa boutique é selecionada pela nossa equipe para elevar sua confiança e refletir sua autenticidade em cada movimento.',
    freeShippingMin: '249',
    freeShippingOthers: '499',
    navLinks: [
      { label: 'COLEÇÕES', href: '/#colecoes', highlight: false },
      { label: 'PRODUTOS', href: '/#vitrine', highlight: false },
      { label: 'MAIS VENDIDOS', href: '/#mais-vendidos', highlight: false },
      { label: 'SALE', href: '/economize', highlight: true },
    ]
  });

  useEffect(() => {
    if (storeSettings) {
      setFormData(prev => ({ 
        ...prev, 
        ...storeSettings,
        navLinks: storeSettings.navLinks || prev.navLinks
      }));
    }
  }, [storeSettings]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(settingsRef, formData, { merge: true });
      toast({ title: "Configurações atualizadas!", description: "Sua boutique já está com as novas informações." });
    } catch (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-primary/5 sticky top-0 z-30">
         <div>
            <h4 className="text-2xl font-headline font-bold text-primary flex items-center gap-3">
              <Settings className="h-6 w-6 text-accent" /> Configurações da Boutique
            </h4>
            <p className="text-xs text-muted-foreground italic">Gerencie a identidade visual e operacional da Toda Bela.</p>
         </div>
         <Button 
          onClick={handleSave} 
          disabled={loading} 
          className="bg-primary text-white rounded-full px-12 h-14 font-bold uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all"
         >
           {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
           Salvar Alterações
         </Button>
      </div>

      <div className="grid gap-10">
        {/* 1. INFORMAÇÕES DA LOJA */}
        <Card className="p-10 border-none shadow-premium bg-white space-y-10 rounded-[3rem]">
          <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
             <Info className="h-5 w-5" />
             <h5 className="text-[11px] font-bold uppercase tracking-[0.4em]">Informações da Boutique</h5>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Nome da Loja</Label>
              <Input value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})} className="h-14 rounded-2xl bg-secondary/10 border-none" />
            </div>
            <div className="space-y-2">
              <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Slogan / Tagline</Label>
              <Input value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} className="h-14 rounded-2xl bg-secondary/10 border-none" />
            </div>
            <div className="space-y-2">
              <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">E-mail de Contato</Label>
              <Input value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="h-14 rounded-2xl bg-secondary/10 border-none" />
            </div>
            <div className="space-y-2">
              <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">WhatsApp VIP</Label>
              <Input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="h-14 rounded-2xl bg-secondary/10 border-none" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Instagram (Link ou @)</Label>
              <div className="relative">
                <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                <Input value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="h-14 pl-12 rounded-2xl bg-secondary/10 border-none" />
              </div>
            </div>
          </div>
        </Card>

        {/* 2. TEXTOS DA HOME */}
        <Card className="p-10 border-none shadow-premium bg-white space-y-10 rounded-[3rem]">
          <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
             <Layout className="h-5 w-5" />
             <h5 className="text-[11px] font-bold uppercase tracking-[0.4em]">Experiência Editorial (Textos da Home)</h5>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Título Seção "Novas Peças"</Label>
              <Input value={formData.featuredTitle} onChange={e => setFormData({...formData, featuredTitle: e.target.value})} className="h-14 rounded-2xl bg-secondary/10 border-none" />
            </div>
            <div className="space-y-2">
              <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Subtítulo Seção</Label>
              <Input value={formData.featuredSubtitle} onChange={e => setFormData({...formData, featuredSubtitle: e.target.value})} className="h-14 rounded-2xl bg-secondary/10 border-none" />
            </div>
            <div className="space-y-2">
              <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Texto Botão Hero (Padrão)</Label>
              <Input value={formData.heroCta} onChange={e => setFormData({...formData, heroCta: e.target.value})} className="h-14 rounded-2xl bg-secondary/10 border-none" />
            </div>
            <div className="space-y-2">
              <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Título "Moda com Propósito"</Label>
              <Input value={formData.purposeTitle} onChange={e => setFormData({...formData, purposeTitle: e.target.value})} className="h-14 rounded-2xl bg-secondary/10 border-none" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Texto manifesto (Seção Propósito)</Label>
              <Textarea value={formData.purposeText} onChange={e => setFormData({...formData, purposeText: e.target.value})} className="rounded-[2rem] bg-secondary/10 border-none p-6 italic min-h-[120px]" />
            </div>
          </div>
        </Card>

        {/* 3. GESTÃO DO MENU (NAVBAR) */}
        <Card className="p-10 border-none shadow-premium bg-white space-y-10 rounded-[3rem]">
          <div className="flex items-center justify-between border-b border-primary/5 pb-4">
             <div className="flex items-center gap-3 text-accent">
                <Layout className="h-5 w-5" />
                <h5 className="text-[11px] font-bold uppercase tracking-[0.4em]">Menu de Navegação (Navbar)</h5>
             </div>
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFormData({...formData, navLinks: [...formData.navLinks, { label: '', href: '', highlight: false }]})}
                className="h-8 text-accent text-[9px] font-bold uppercase border border-accent/20 px-4 rounded-full"
             >
                <Plus className="h-3 w-3 mr-1" /> Novo Link
             </Button>
          </div>
          
          <div className="space-y-4">
            {formData.navLinks.map((link, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-4 p-6 bg-secondary/10 rounded-2xl items-end md:items-center">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Rótulo (Ex: COLEÇÕES)</Label>
                    <Input 
                      value={link.label} 
                      onChange={e => {
                        const newLinks = [...formData.navLinks];
                        newLinks[idx].label = e.target.value.toUpperCase();
                        setFormData({...formData, navLinks: newLinks});
                      }} 
                      className="bg-white border-none h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Link (Ex: /#colecoes)</Label>
                    <Input 
                      value={link.href} 
                      onChange={e => {
                        const newLinks = [...formData.navLinks];
                        newLinks[idx].href = e.target.value;
                        setFormData({...formData, navLinks: newLinks});
                      }} 
                      className="bg-white border-none h-11"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-6 pl-4">
                   <div className="flex items-center gap-2">
                     <Label className="text-[9px] font-bold uppercase text-primary/40">Destaque</Label>
                     <Switch 
                        checked={link.highlight} 
                        onCheckedChange={v => {
                          const newLinks = [...formData.navLinks];
                          newLinks[idx].highlight = v;
                          setFormData({...formData, navLinks: newLinks});
                        }} 
                      />
                   </div>
                   <button 
                    onClick={() => {
                      const newLinks = formData.navLinks.filter((_, i) => i !== idx);
                      setFormData({...formData, navLinks: newLinks});
                    }}
                    className="text-red-300 hover:text-red-500 transition-colors p-2"
                   >
                     <Trash2 className="h-5 w-5" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 4. CONFIGURAÇÕES DE FRETE */}
        <Card className="p-10 border-none shadow-premium bg-white space-y-10 rounded-[3rem]">
          <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
             <Truck className="h-5 w-5" />
             <h5 className="text-[11px] font-bold uppercase tracking-[0.4em]">Logística e Frete</h5>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Frete Grátis Sul/Sudeste (Min R$)</Label>
              <Input type="number" value={formData.freeShippingMin} onChange={e => setFormData({...formData, freeShippingMin: e.target.value})} className="h-14 rounded-2xl bg-secondary/10 border-none px-6" />
            </div>
            <div className="space-y-2">
              <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Frete Grátis Demais Regiões (Min R$)</Label>
              <Input type="number" value={formData.freeShippingOthers} onChange={e => setFormData({...formData, freeShippingOthers: e.target.value})} className="h-14 rounded-2xl bg-secondary/10 border-none px-6" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
