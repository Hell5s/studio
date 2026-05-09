
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, Save, Plus, Trash2, Image as ImageIcon, 
  Upload, Search, Package, Heart, ShoppingBag, User, 
  Palette, MousePointer2, Loader2, Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc, useMemoFirebase, useFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export function AdminHeaderSettings() {
  const db = useFirestore();
  const { storage } = useFirebase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings, isLoading } = useDoc(settingsRef);

  const [formData, setFormData] = useState({
    navLinks: [] as any[],
    brandName: 'Toda Bela',
    brandSubtitle: 'Moda Feminina',
    headerLogoUrl: '',
    shippingMessage: 'Frete Grátis • Sul e Sudeste acima de R$ 249',
    shippingBgColor: '#6E3C47',
    showShippingBar: true,
    visibleIcons: {
      search: true,
      orders: true,
      favorites: true,
      cart: true,
      account: true
    },
    headerBgColor: '#ffffff',
    headerLinkColor: '#2A1F22',
    headerIconColor: '#6E3C47'
  });

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        ...settings,
        navLinks: settings.navLinks || prev.navLinks,
        visibleIcons: settings.visibleIcons || prev.visibleIcons
      }));
    }
  }, [settings]);

  const handleSave = async (section: string) => {
    setLoading(true);
    try {
      await setDoc(settingsRef, formData, { merge: true });
      toast({ title: `Configurações de ${section} salvas!` });
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
      const storageRef = ref(storage!, `branding/logo-${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ ...prev, headerLogoUrl: url }));
      toast({ title: "Logo carregada!" });
    } catch (error) {
      toast({ title: "Erro no upload", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <div className="space-y-12 pb-20 max-w-5xl mx-auto animate-in fade-in duration-700">
      {/* 1. LINKS DE NAVEGAÇÃO */}
      <Card className="p-8 border-none bg-white shadow-premium rounded-[2.5rem] space-y-8">
        <div className="flex items-center justify-between border-b border-primary/5 pb-4">
          <div className="flex items-center gap-3 text-accent">
            <MousePointer2 className="h-5 w-5" />
            <h5 className="text-[11px] font-bold uppercase tracking-[0.4em]">Links de Navegação</h5>
          </div>
          <Button 
            variant="ghost" size="sm" 
            onClick={() => setFormData({...formData, navLinks: [...formData.navLinks, { label: '', href: '', highlight: false }]})}
            className="h-8 text-accent text-[9px] font-bold uppercase border border-accent/20 px-4 rounded-full"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Novo Link
          </Button>
        </div>
        
        <div className="space-y-4">
          {formData.navLinks.map((link, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-4 p-5 bg-secondary/10 rounded-2xl items-end md:items-center border border-primary/5">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="space-y-1.5">
                  <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Rótulo</Label>
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
                  <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Link (URL)</Label>
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
                  onClick={() => setFormData({...formData, navLinks: formData.navLinks.filter((_, i) => i !== idx)})}
                  className="text-red-300 hover:text-red-500 p-2"
                 >
                   <Trash2 className="h-4 w-4" />
                 </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={() => handleSave('Links')} disabled={loading} className="rounded-full bg-primary text-white font-bold h-11 px-8 text-[10px] uppercase tracking-widest shadow-lg">Salvar Links</Button>
        </div>
      </Card>

      {/* 2. LOGO */}
      <Card className="p-8 border-none bg-white shadow-premium rounded-[2.5rem] space-y-8">
        <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
          <Sparkles className="h-5 w-5" />
          <h5 className="text-[11px] font-bold uppercase tracking-[0.4em]">Identidade Visual (Logo)</h5>
        </div>
        <div className="grid md:grid-cols-[180px_1fr] gap-10">
          <div className="space-y-4">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-2">Logo Personalizada</Label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-3xl bg-secondary/20 border-2 border-dashed border-primary/10 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/30 transition-all overflow-hidden relative group"
            >
              {formData.headerLogoUrl ? (
                <img src={formData.headerLogoUrl} className="w-full h-full object-contain p-4" alt="Logo" />
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="h-6 w-6 text-accent/30 mx-auto" />
                  <span className="text-[8px] font-bold uppercase mt-2 block text-primary/40">Upload Logo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 {uploading ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white h-5 w-5" />}
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
          </div>
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Nome da Marca</Label>
                <Input value={formData.brandName} onChange={e => setFormData({...formData, brandName: e.target.value})} className="h-12 bg-secondary/10 border-none rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Slogan / Subtítulo</Label>
                <Input value={formData.brandSubtitle} onChange={e => setFormData({...formData, brandSubtitle: e.target.value})} className="h-12 bg-secondary/10 border-none rounded-xl" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => handleSave('Identidade')} disabled={loading} className="rounded-full bg-primary text-white font-bold h-11 px-8 text-[10px] uppercase tracking-widest shadow-lg">Salvar Logo</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. BARRA DE FRETE */}
      <Card className="p-8 border-none bg-white shadow-premium rounded-[2.5rem] space-y-8">
        <div className="flex items-center justify-between border-b border-primary/5 pb-4">
          <div className="flex items-center gap-3 text-accent">
            <Package className="h-5 w-5" />
            <h5 className="text-[11px] font-bold uppercase tracking-[0.4em]">Barra de Frete Grátis</h5>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-[9px] font-bold uppercase text-primary/40">Exibir Barra</Label>
            <Switch checked={formData.showShippingBar} onCheckedChange={v => setFormData({...formData, showShippingBar: v})} />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-1.5">
            <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Mensagem da Barra</Label>
            <Input value={formData.shippingMessage} onChange={e => setFormData({...formData, shippingMessage: e.target.value})} className="h-12 bg-secondary/10 border-none rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Cor de Fundo (Barra)</Label>
            <div className="flex gap-4">
              <Input type="color" value={formData.shippingBgColor} onChange={e => setFormData({...formData, shippingBgColor: e.target.value})} className="h-12 w-24 p-1 bg-secondary/10 border-none rounded-xl cursor-pointer" />
              <Input value={formData.shippingBgColor} onChange={e => setFormData({...formData, shippingBgColor: e.target.value})} className="h-12 bg-secondary/10 border-none rounded-xl font-mono text-xs" />
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={() => handleSave('Barra de Frete')} disabled={loading} className="rounded-full bg-primary text-white font-bold h-11 px-8 text-[10px] uppercase tracking-widest shadow-lg">Salvar Frete</Button>
        </div>
      </Card>

      {/* 4. ÍCONES VISÍVEIS */}
      <Card className="p-8 border-none bg-white shadow-premium rounded-[2.5rem] space-y-8">
        <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
          <Layout className="h-5 w-5" />
          <h5 className="text-[11px] font-bold uppercase tracking-[0.4em]">Visibilidade de Ícones</h5>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {[
            { id: 'search', label: 'Busca', icon: <Search className="h-4 w-4" /> },
            { id: 'orders', label: 'Pedidos', icon: <Package className="h-4 w-4" /> },
            { id: 'favorites', label: 'Desejos', icon: <Heart className="h-4 w-4" /> },
            { id: 'cart', label: 'Sacola', icon: <ShoppingBag className="h-4 w-4" /> },
            { id: 'account', label: 'Conta', icon: <User className="h-4 w-4" /> },
          ].map(item => (
            <div key={item.id} className="flex flex-col items-center gap-3 p-4 bg-secondary/10 rounded-2xl border border-primary/5">
              <span className="text-primary/40">{item.icon}</span>
              <Label className="text-[9px] font-bold uppercase tracking-tight">{item.label}</Label>
              <Switch 
                checked={(formData.visibleIcons as any)[item.id]} 
                onCheckedChange={v => setFormData({...formData, visibleIcons: {...formData.visibleIcons, [item.id]: v}})} 
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={() => handleSave('Ícones')} disabled={loading} className="rounded-full bg-primary text-white font-bold h-11 px-8 text-[10px] uppercase tracking-widest shadow-lg">Salvar Visibilidade</Button>
        </div>
      </Card>

      {/* 5. CORES DO CABEÇALHO */}
      <Card className="p-8 border-none bg-white shadow-premium rounded-[2.5rem] space-y-8">
        <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
          <Palette className="h-5 w-5" />
          <h5 className="text-[11px] font-bold uppercase tracking-[0.4em]">Cores do Cabeçalho (Sólido)</h5>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-2">Fundo (Sólido)</Label>
            <div className="flex gap-2">
              <Input type="color" value={formData.headerBgColor} onChange={e => setFormData({...formData, headerBgColor: e.target.value})} className="h-11 w-14 p-1 bg-secondary/10 border-none rounded-xl cursor-pointer" />
              <Input value={formData.headerBgColor} onChange={e => setFormData({...formData, headerBgColor: e.target.value})} className="h-11 bg-secondary/10 border-none rounded-xl text-xs font-mono flex-1" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-2">Links</Label>
            <div className="flex gap-2">
              <Input type="color" value={formData.headerLinkColor} onChange={e => setFormData({...formData, headerLinkColor: e.target.value})} className="h-11 w-14 p-1 bg-secondary/10 border-none rounded-xl cursor-pointer" />
              <Input value={formData.headerLinkColor} onChange={e => setFormData({...formData, headerLinkColor: e.target.value})} className="h-11 bg-secondary/10 border-none rounded-xl text-xs font-mono flex-1" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-2">Ícones</Label>
            <div className="flex gap-2">
              <Input type="color" value={formData.headerIconColor} onChange={e => setFormData({...formData, headerIconColor: e.target.value})} className="h-11 w-14 p-1 bg-secondary/10 border-none rounded-xl cursor-pointer" />
              <Input value={formData.headerIconColor} onChange={e => setFormData({...formData, headerIconColor: e.target.value})} className="h-11 bg-secondary/10 border-none rounded-xl text-xs font-mono flex-1" />
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={() => handleSave('Cores')} disabled={loading} className="rounded-full bg-primary text-white font-bold h-11 px-8 text-[10px] uppercase tracking-widest shadow-lg">Salvar Cores</Button>
        </div>
      </Card>
    </div>
  );
}
