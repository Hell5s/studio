"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  PanelBottom, Save, Plus, Trash2, Image as ImageIcon, 
  Upload, Palette, Loader2, MousePointer2, ChevronUp, ChevronDown, 
  Type, Link as LinkIcon, RefreshCcw, Truck, CreditCard, ShieldCheck, 
  Gift, Heart, Package, Clock, Star, Percent, X, Sparkles, 
  Instagram, Facebook, Youtube 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc, useMemoFirebase, useFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ICON_MAP: Record<string, any> = {
  Truck, RefreshCcw, CreditCard, ShieldCheck, Gift, Heart, Package, Clock, Star, Percent
};

const DEFAULT_FOOTER = {
  bgColor: '#6E3C47',
  accentColor: '#C7A17A',
  logoUrl: '',
  showBenefitsBar: true,
  benefits: [
    { icon: 'Truck', title: 'Frete Grátis', desc: 'Acima de R$ 250' },
    { icon: 'RefreshCcw', title: 'Troca Fácil', desc: 'Até 30 dias' },
    { icon: 'CreditCard', title: '10x Sem Juros', desc: 'No cartão' },
    { icon: 'ShieldCheck', title: 'Compra Segura', desc: 'SSL Certificado' },
  ],
  columns: [
    {
      title: 'A Toda Bela',
      links: [
        { label: 'Sobre Nós', type: 'page', pageTitle: 'Sobre Nós', pageContent: 'A Toda Bela é mais que uma loja, é um manifesto de style para a mulher que reconhece sua própria luz. Nossa curadoria foca em peças que unem o conforto do dia a dia à sofisticação de momentos especiais.' },
        { label: 'Nossa História', type: 'page', pageTitle: 'Nossa História', pageContent: 'Iniciamos nossa jornada com o propósito de democratizar a moda premium no Brasil. Hoje, celebramos milhares de clientes que encontraram na Toda Bela a expressão máxima de sua autenticidade.' },
        { label: 'Trabalhe Conosco', type: 'page', pageTitle: 'Trabalhe Conosco', pageContent: 'Quer fazer parte da equipe Toda Bela? Envie seu portfólio para nossa equipe de RH e venha construir o futuro da moda feminina conosco.' }
      ]
    },
    {
      title: 'Atendimento',
      links: [
        { label: 'Rastrear Pedido', type: 'track' },
        { label: 'Trocas e Devoluções', type: 'page', pageTitle: 'Trocas e Devoluções', pageContent: 'Sua satisfação é nossa prioridade. Você tem até 30 dias após o recebimento para solicitar trocas através do nosso canal de atendimento VIP.' },
        { label: 'Fale Conosco', type: 'whatsapp' },
        { label: 'Perguntas Frequentes', type: 'page', pageTitle: 'Perguntas Frequentes', pageContent: 'Qual o prazo de entrega? De 10 a 20 dias úteis.\nComo rastreio meu pedido? Use a opção "Rastrear Pedido" no menu de Atendimento abaixo.' }
      ]
    },
    {
      title: 'Informações',
      links: [
        { label: 'Termos de Uso', type: 'page', pageTitle: 'Termos de Uso', pageContent: 'Ao utilizar nosso site, você concorda com as diretrizes de navegação e comercialização da nossa plataforma, pautadas pela transparência e respeito ao consumidor.' },
        { label: 'Política de Privacidade', type: 'page', pageTitle: 'Política de Privacidade', pageContent: 'Seus dados estão seguros conosco. Utilizamos criptografia SSL de ponta a ponta para garantir que sua experiência de compra seja privada e protegida.' },
        { label: 'Política de Reembolso', type: 'page', pageTitle: 'Política de Reembolso', pageContent: 'Nossa política de reembolso é transparente e segue rigorosamente o Código de Defesa do Consumidor brasileiro.' }
      ]
    }
  ],
  showContactColumn: true,
  contactTitle: 'Contato',
  socials: { facebook: '', youtube: '' },
  payments: { pix: true, visa: true, mastercard: true, elo: true, amex: true, securitySeal: true },
  copyrightSuffix: 'Moda Feminina',
  showCnpj: true
};

export function AdminFooterSettings() {
  const db = useFirestore();
  const { storage } = useFirebase();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings, isLoading } = useDoc(settingsRef);

  const [formData, setFormData] = useState({
    storeName: 'Toda Bela',
    tagline: 'Celebrando a potência e a sofisticação da mulher moderna através de peças atemporais.',
    whatsapp: '',
    instagram: '',
    contactEmail: '',
    cnpj: '',
    footer: DEFAULT_FOOTER
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName || 'Toda Bela',
        tagline: settings.tagline || 'Celebrando a potência e a sofisticação da mulher moderna através de peças atemporais.',
        whatsapp: settings.whatsapp || '',
        instagram: settings.instagram || '',
        contactEmail: settings.contactEmail || '',
        cnpj: settings.cnpj || '',
        footer: settings.footer || DEFAULT_FOOTER
      });
    }
  }, [settings]);

  const handleSave = async (section: string, payload: any) => {
    setLoading(true);
    try {
      await setDoc(settingsRef, payload, { merge: true });
      toast({ title: `Seção ${section} salva!` });
    } catch (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage!, `branding/footer-logo-${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ 
        ...prev, 
        footer: { ...prev.footer, logoUrl: url } 
      }));
      toast({ title: "Logo do rodapé carregada!" });
    } catch (error) {
      toast({ title: "Erro no upload", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleRestoreDefaults = async () => {
    setLoading(true);
    try {
      await setDoc(settingsRef, { footer: DEFAULT_FOOTER }, { merge: true });
      toast({ title: "Rodapé restaurado ao padrão!" });
    } catch (e) {
      toast({ title: "Erro ao restaurar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <div className="space-y-12 pb-20 max-w-5xl mx-auto animate-in fade-in duration-700">
      
      {/* 1. MARCA E CONTATO */}
      <Card className="p-8 border-none bg-white shadow-premium rounded-[2.5rem] space-y-8">
        <div className="flex items-center justify-between border-b border-primary/5 pb-4">
          <div className="flex items-center gap-3 text-accent">
            <PanelBottom className="h-5 w-5" />
            <h5 className="text-[11px] font-bold uppercase tracking-[0.4em]">Marca e Institucional</h5>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Nome da Loja</Label>
              <Input value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})} className="h-12 bg-secondary/10 border-none rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Tagline (abaixo do logo)</Label>
              <Input value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} className="h-12 bg-secondary/10 border-none rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Sufixo de Copyright (ex: Moda Feminina)</Label>
              <Input value={formData.footer.copyrightSuffix} onChange={e => setFormData({...formData, footer: {...formData.footer, copyrightSuffix: e.target.value}})} className="h-12 bg-secondary/10 border-none rounded-xl" />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Logo do Rodapé (Vazio = Logo padrão)</Label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video rounded-3xl bg-secondary/20 border-2 border-dashed border-primary/10 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/30 transition-all overflow-hidden relative group"
            >
              {formData.footer.logoUrl ? (
                <img src={formData.footer.logoUrl} className="w-full h-full object-contain p-4" alt="Logo Rodapé" />
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="h-6 w-6 text-accent/30 mx-auto" />
                  <span className="text-[8px] font-bold uppercase mt-2 block text-primary/40">Upload Logo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 {uploading ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white h-5 w-5" />}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pt-4">
           <div className="space-y-1.5">
             <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">WhatsApp</Label>
             <Input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="h-12 bg-secondary/10 border-none rounded-xl" />
           </div>
           <div className="space-y-1.5">
             <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Instagram (@...)</Label>
             <Input value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="h-12 bg-secondary/10 border-none rounded-xl" />
           </div>
           <div className="space-y-1.5">
             <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">E-mail de Contato</Label>
             <Input value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="h-12 bg-secondary/10 border-none rounded-xl" />
           </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 pt-4">
           <div className="space-y-3">
             <div className="flex items-center justify-between">
                <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">CNPJ</Label>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black text-primary/40 uppercase">Exibir</span>
                  <Switch checked={formData.footer.showCnpj} onCheckedChange={v => setFormData({...formData, footer: {...formData.footer, showCnpj: v}})} />
                </div>
             </div>
             <Input value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} className="h-12 bg-secondary/10 border-none rounded-xl" />
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Facebook (URL)</Label>
               <Input value={formData.footer.socials?.facebook} onChange={e => setFormData({...formData, footer: {...formData.footer, socials: {...formData.footer.socials, facebook: e.target.value}}})} className="h-12 bg-secondary/10 border-none rounded-xl" />
             </div>
             <div className="space-y-1.5">
               <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">YouTube (URL)</Label>
               <Input value={formData.footer.socials?.youtube} onChange={e => setFormData({...formData, footer: {...formData.footer, socials: {...formData.footer.socials, youtube: e.target.value}}})} className="h-12 bg-secondary/10 border-none rounded-xl" />
             </div>
           </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => handleSave('Identidade e Contato', { 
            storeName: formData.storeName, 
            tagline: formData.tagline,
            whatsapp: formData.whatsapp,
            instagram: formData.instagram,
            contactEmail: formData.contactEmail,
            cnpj: formData.cnpj,
            footer: formData.footer
          })} disabled={loading} className="rounded-full bg-primary text-white font-bold h-11 px-8 text-[10px] uppercase tracking-widest shadow-lg">Salvar Marca e Contatos</Button>
        </div>
      </Card>

      {/* 2. CORES */}
      <Card className="p-8 border-none bg-white shadow-premium rounded-[2.5rem] space-y-8">
        <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
          <Palette className="h-5 w-5" />
          <h5 className="text-[11px] font-bold uppercase tracking-[0.4em]">Paleta do Rodapé</h5>
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-2">Fundo do Rodapé</Label>
            <div className="flex gap-4 items-center">
              <Input type="color" value={formData.footer.bgColor} onChange={e => setFormData({...formData, footer: {...formData.footer, bgColor: e.target.value}})} className="h-14 w-20 p-1 bg-secondary/10 border-none rounded-2xl cursor-pointer" />
              <Input value={formData.footer.bgColor} onChange={e => setFormData({...formData, footer: {...formData.footer, bgColor: e.target.value}})} className="h-14 bg-secondary/10 border-none rounded-2xl font-mono text-xs flex-1" />
            </div>
          </div>
          <div className="space-y-4">
            <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-2">Cor de Destaque (Accent)</Label>
            <div className="flex gap-4 items-center">
              <Input type="color" value={formData.footer.accentColor} onChange={e => setFormData({...formData, footer: {...formData.footer, accentColor: e.target.value}})} className="h-14 w-20 p-1 bg-secondary/10 border-none rounded-2xl cursor-pointer" />
              <Input value={formData.footer.accentColor} onChange={e => setFormData({...formData, footer: {...formData.footer, accentColor: e.target.value}})} className="h-14 bg-secondary/10 border-none rounded-2xl font-mono text-xs flex-1" />
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={() => handleSave('Cores', { footer: formData.footer })} disabled={loading} className="rounded-full bg-primary text-white font-bold h-11 px-8 text-[10px] uppercase tracking-widest shadow-lg">Salvar Cores</Button>
        </div>
      </Card>

      {/* 3. FAIXA DE BENEFÍCIOS */}
      <Card className="p-8 border-none bg-white shadow-premium rounded-[2.5rem] space-y-8">
        <div className="flex items-center justify-between border-b border-primary/5 pb-4">
          <div className="flex items-center gap-3 text-accent">
            <Truck className="h-5 w-5" />
            <h5 className="text-[11px] font-bold uppercase tracking-[0.4em]">Faixa de Benefícios</h5>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Label className="text-[9px] font-bold uppercase text-primary/40">Exibir Faixa</Label>
              <Switch checked={formData.footer.showBenefitsBar} onCheckedChange={v => setFormData({...formData, footer: {...formData.footer, showBenefitsBar: v}})} />
            </div>
            <Button 
              variant="ghost" size="sm" 
              onClick={() => {
                if (formData.footer.benefits.length >= 6) return;
                setFormData({...formData, footer: {...formData.footer, benefits: [...formData.footer.benefits, { icon: 'Star', title: '', desc: '' }]}})
              }}
              className="h-8 text-accent text-[9px] font-bold uppercase border border-accent/20 px-4 rounded-full"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Novo Benefício
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {formData.footer.benefits.map((benefit, idx) => (
            <div key={idx} className="flex gap-4 p-5 bg-secondary/10 rounded-2xl items-center border border-primary/5">
              <div className="w-32">
                <Select value={benefit.icon} onValueChange={v => {
                  const newB = [...formData.footer.benefits];
                  newB[idx].icon = v;
                  setFormData({...formData, footer: {...formData.footer, benefits: newB}});
                }}>
                  <SelectTrigger className="h-10 border-none bg-white">
                    <SelectValue placeholder="Ícone" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(ICON_MAP).map(iconName => (
                      <SelectItem key={iconName} value={iconName}>{iconName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input 
                placeholder="Título" 
                value={benefit.title} 
                onChange={e => {
                  const newB = [...formData.footer.benefits];
                  newB[idx].title = e.target.value;
                  setFormData({...formData, footer: {...formData.footer, benefits: newB}});
                }} 
                className="flex-1 h-10 border-none bg-white"
              />
              <Input 
                placeholder="Descrição" 
                value={benefit.desc} 
                onChange={e => {
                  const newB = [...formData.footer.benefits];
                  newB[idx].desc = e.target.value;
                  setFormData({...formData, footer: {...formData.footer, benefits: newB}});
                }} 
                className="flex-[2] h-10 border-none bg-white"
              />
              <div className="flex gap-1">
                <button onClick={() => {
                  if (idx === 0) return;
                  const newB = [...formData.footer.benefits];
                  [newB[idx], newB[idx-1]] = [newB[idx-1], newB[idx]];
                  setFormData({...formData, footer: {...formData.footer, benefits: newB}});
                }} className="p-2 text-primary/20 hover:text-primary"><ChevronUp className="h-4 w-4" /></button>
                <button onClick={() => {
                  if (idx === formData.footer.benefits.length - 1) return;
                  const newB = [...formData.footer.benefits];
                  [newB[idx], newB[idx+1]] = [newB[idx+1], newB[idx]];
                  setFormData({...formData, footer: {...formData.footer, benefits: newB}});
                }} className="p-2 text-primary/20 hover:text-primary"><ChevronDown className="h-4 w-4" /></button>
                <button onClick={() => setFormData({...formData, footer: {...formData.footer, benefits: formData.footer.benefits.filter((_, i) => i !== idx)}})} className="p-2 text-red-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={() => handleSave('Benefícios', { footer: formData.footer })} disabled={loading} className="rounded-full bg-primary text-white font-bold h-11 px-8 text-[10px] uppercase tracking-widest shadow-lg">Salvar Benefícios</Button>
        </div>
      </Card>

      {/* 4. COLUNAS DE LINKS */}
      <Card className="p-8 border-none bg-white shadow-premium rounded-[3rem] space-y-8">
        <div className="flex items-center justify-between border-b border-primary/5 pb-4">
          <div className="flex items-center gap-3 text-accent">
            <LinkIcon className="h-5 w-5" />
            <h5 className="text-[11px] font-bold uppercase tracking-[0.4em]">Colunas de Links</h5>
          </div>
          <Button 
            variant="ghost" size="sm" 
            onClick={() => {
              if (formData.footer.columns.length >= 5) return;
              setFormData({...formData, footer: {...formData.footer, columns: [...formData.footer.columns, { title: 'Nova Coluna', links: [] }]}})
            }}
            className="h-8 text-accent text-[9px] font-bold uppercase border border-accent/20 px-4 rounded-full"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Nova Coluna
          </Button>
        </div>

        <div className="space-y-12">
          {formData.footer.columns.map((column, cIdx) => (
            <div key={cIdx} className="p-8 bg-secondary/10 rounded-[2.5rem] border border-primary/5 space-y-6">
              <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                <div className="flex-1 max-w-sm">
                  <Label className="text-[8px] font-bold uppercase text-primary/40 ml-1">Título da Coluna</Label>
                  <Input value={column.title} onChange={e => {
                    const newC = [...formData.footer.columns];
                    newC[cIdx].title = e.target.value;
                    setFormData({...formData, footer: {...formData.footer, columns: newC}});
                  }} className="h-10 bg-white border-none font-bold text-sm" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => {
                    if (cIdx === 0) return;
                    const newC = [...formData.footer.columns];
                    [newC[cIdx], newC[cIdx-1]] = [newC[cIdx-1], newC[cIdx]];
                    setFormData({...formData, footer: {...formData.footer, columns: newC}});
                  }} className="p-2 bg-white rounded-lg shadow-sm text-primary/40 hover:text-primary"><ChevronUp className="h-4 w-4" /></button>
                  <button onClick={() => {
                    if (cIdx === formData.footer.columns.length - 1) return;
                    const newC = [...formData.footer.columns];
                    [newC[cIdx], newC[cIdx+1]] = [newC[cIdx+1], newC[cIdx]];
                    setFormData({...formData, footer: {...formData.footer, columns: newC}});
                  }} className="p-2 bg-white rounded-lg shadow-sm text-primary/40 hover:text-primary"><ChevronDown className="h-4 w-4" /></button>
                  <button onClick={() => setFormData({...formData, footer: {...formData.footer, columns: formData.footer.columns.filter((_, i) => i !== cIdx)}})} className="p-2 bg-white rounded-lg shadow-sm text-red-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="space-y-4">
                {column.links.map((link, lIdx) => (
                  <div key={lIdx} className="bg-white p-6 rounded-2xl space-y-4 shadow-sm">
                    <div className="grid md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
                      <div className="space-y-1.5">
                        <Label className="text-[8px] font-bold uppercase text-muted-foreground ml-1">Rótulo</Label>
                        <Input value={link.label} onChange={e => {
                          const newC = [...formData.footer.columns];
                          newC[cIdx].links[lIdx].label = e.target.value;
                          setFormData({...formData, footer: {...formData.footer, columns: newC}});
                        }} className="h-9 text-xs" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[8px] font-bold uppercase text-muted-foreground ml-1">Tipo de Link</Label>
                        <Select value={link.type} onValueChange={v => {
                          const newC = [...formData.footer.columns];
                          newC[cIdx].links[lIdx].type = v as any;
                          setFormData({...formData, footer: {...formData.footer, columns: newC}});
                        }}>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="page">Página Institucional (Modal)</SelectItem>
                            <SelectItem value="url">Link Externo / URL</SelectItem>
                            <SelectItem value="track">Rastrear Pedido</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp da Loja</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => {
                          if (lIdx === 0) return;
                          const newC = [...formData.footer.columns];
                          [newC[cIdx].links[lIdx], newC[cIdx].links[lIdx-1]] = [newC[cIdx].links[lIdx-1], newC[cIdx].links[lIdx]];
                          setFormData({...formData, footer: {...formData.footer, columns: newC}});
                        }} className="p-1.5 text-primary/20 hover:text-primary"><ChevronUp className="h-3.5 w-3.5" /></button>
                        <button onClick={() => {
                          if (lIdx === column.links.length - 1) return;
                          const newC = [...formData.footer.columns];
                          [newC[cIdx].links[lIdx], newC[cIdx].links[lIdx+1]] = [newC[cIdx].links[lIdx+1], newC[cIdx].links[lIdx]];
                          setFormData({...formData, footer: {...formData.footer, columns: newC}});
                        }} className="p-1.5 text-primary/20 hover:text-primary"><ChevronDown className="h-3.5 w-3.5" /></button>
                        <button onClick={() => {
                          const newC = [...formData.footer.columns];
                          newC[cIdx].links = newC[cIdx].links.filter((_, i) => i !== lIdx);
                          setFormData({...formData, footer: {...formData.footer, columns: newC}});
                        }} className="p-1.5 text-red-200 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>

                    {link.type === 'page' && (
                      <div className="grid gap-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="space-y-1">
                           <Label className="text-[8px] font-bold uppercase text-primary/40 ml-1">Título da Página</Label>
                           <Input value={link.pageTitle} onChange={e => {
                             const newC = [...formData.footer.columns];
                             newC[cIdx].links[lIdx].pageTitle = e.target.value;
                             setFormData({...formData, footer: {...formData.footer, columns: newC}});
                           }} className="h-9 text-xs" />
                        </div>
                        <div className="space-y-1">
                           <Label className="text-[8px] font-bold uppercase text-primary/40 ml-1">Conteúdo da Página</Label>
                           <Textarea value={link.pageContent} onChange={e => {
                             const newC = [...formData.footer.columns];
                             newC[cIdx].links[lIdx].pageContent = e.target.value;
                             setFormData({...formData, footer: {...formData.footer, columns: newC}});
                           }} className="min-h-[120px] text-xs p-4 leading-relaxed" />
                        </div>
                      </div>
                    )}

                    {link.type === 'url' && (
                      <div className="space-y-1 animate-in fade-in zoom-in-95 duration-200">
                        <Label className="text-[8px] font-bold uppercase text-primary/40 ml-1">URL de Destino</Label>
                        <Input value={link.url} onChange={e => {
                          const newC = [...formData.footer.columns];
                          newC[cIdx].links[lIdx].url = e.target.value;
                          setFormData({...formData, footer: {...formData.footer, columns: newC}});
                        }} placeholder="https://... ou /link-interno" className="h-9 text-xs" />
                      </div>
                    )}
                  </div>
                ))}
                <Button 
                  variant="outline" size="sm" 
                  onClick={() => {
                    const newC = [...formData.footer.columns];
                    newC[cIdx].links.push({ label: 'Novo Link', type: 'page', pageTitle: 'Nova Página', pageContent: '' });
                    setFormData({...formData, footer: {...formData.footer, columns: newC}});
                  }}
                  className="w-full h-10 border-dashed border-primary/10 text-primary/40 hover:text-primary hover:bg-white"
                >
                  <Plus className="h-3.5 w-3.5 mr-2" /> Adicionar Link na Coluna
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={() => handleSave('Colunas de Links', { footer: formData.footer })} disabled={loading} className="rounded-full bg-primary text-white font-bold h-11 px-8 text-[10px] uppercase tracking-widest shadow-lg">Salvar Colunas</Button>
        </div>
      </Card>

      {/* 5. COLUNA DE CONTATO E PAGAMENTOS */}
      <div className="grid md:grid-cols-2 gap-10">
         <Card className="p-8 border-none bg-white shadow-premium rounded-[2.5rem] space-y-8">
            <div className="flex items-center justify-between border-b border-primary/5 pb-4">
              <div className="flex items-center gap-3 text-accent">
                <Type className="h-5 w-5" />
                <h5 className="text-[11px] font-bold uppercase tracking-[0.4em]">Coluna Contato</h5>
              </div>
              <Switch checked={formData.footer.showContactColumn} onCheckedChange={v => setFormData({...formData, footer: {...formData.footer, showContactColumn: v}})} />
            </div>
            <div className="space-y-4">
              <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-2">Título da Coluna Contato</Label>
              <Input value={formData.footer.contactTitle} onChange={e => setFormData({...formData, footer: {...formData.footer, contactTitle: e.target.value}})} className="h-12 bg-secondary/10 border-none rounded-xl" />
            </div>
            <div className="flex justify-end pt-4">
               <Button onClick={() => handleSave('Coluna Contato', { footer: formData.footer })} disabled={loading} className="rounded-full bg-primary text-white font-bold h-11 px-8 text-[10px] uppercase tracking-widest shadow-lg">Salvar Contato</Button>
            </div>
         </Card>

         <Card className="p-8 border-none bg-white shadow-premium rounded-[2.5rem] space-y-8">
            <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
              <CreditCard className="h-5 w-5" />
              <h5 className="text-[11px] font-bold uppercase tracking-[0.4em]">Selos de Pagamento</h5>
            </div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
               {Object.keys(formData.footer.payments).map(pKey => (
                 <div key={pKey} className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase tracking-tight text-primary/60">{pKey === 'securitySeal' ? 'Selo de Segurança' : pKey.toUpperCase()}</Label>
                    <Switch 
                      checked={(formData.footer.payments as any)[pKey]} 
                      onCheckedChange={v => setFormData({...formData, footer: {...formData.footer, payments: {...formData.footer.payments, [pKey]: v}}})} 
                    />
                 </div>
               ))}
            </div>
            <div className="flex justify-end pt-4">
               <Button onClick={() => handleSave('Pagamentos', { footer: formData.footer })} disabled={loading} className="rounded-full bg-primary text-white font-bold h-11 px-8 text-[10px] uppercase tracking-widest shadow-lg">Salvar Selos</Button>
            </div>
         </Card>
      </div>

      <div className="flex flex-col items-center gap-6 pt-10 border-t border-primary/5">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="text-red-300 hover:text-red-500 font-bold uppercase text-[9px] tracking-widest">
              <RefreshCcw className="h-3.5 w-3.5 mr-2" /> Restaurar padrão do rodapé
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-headline font-bold text-primary">Restaurar Padrão?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground italic font-light">
                Isso apagará todas as suas edições e voltará ao visual original da Toda Bela. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8 gap-3">
              <AlertDialogCancel className="rounded-full h-12 px-8 text-[10px] font-bold uppercase tracking-widest">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleRestoreDefaults} className="rounded-full h-12 px-8 bg-red-600 text-white font-bold uppercase tracking-widest text-[10px] border-none">Sim, Restaurar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <p className="text-[10px] text-primary/30 uppercase tracking-[0.4em] text-center max-w-sm italic">
          As configurações são salvas individualmente por seção para garantir a segurança dos seus dados.
        </p>
      </div>
    </div>
  );
}
