
"use client";

import React, { useState } from 'react';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { adminGenerateProductDescription } from '@/ai/flows/admin-generate-product-description-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export function AIProductGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    productName: '',
    category: 'Vestidos',
    price: '',
    keyFeatures: ''
  });

  const handleGenerate = async () => {
    if (!formData.productName || !formData.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome e o preço do produto.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const output = await adminGenerateProductDescription({
        productName: formData.productName,
        category: formData.category,
        price: formData.price,
        keyFeatures: formData.keyFeatures.split(',').map(f => f.trim()).filter(f => f !== '')
      });
      setResult(output.description);
    } catch (error) {
      toast({
        title: "Erro na geração",
        description: "Não foi possível gerar a descrição no momento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="fixed bottom-6 right-6 rounded-full shadow-2xl bg-white border-primary/20 text-primary hover:bg-secondary z-50 py-6 px-6">
          <Sparkles className="mr-2 h-4 w-4" />
          Gerador de Descrições AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-plum" />
            Gerador Toda Bela AI
          </DialogTitle>
          <DialogDescription>
            Crie descrições sofisticadas e envolventes em segundos.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome do Produto</Label>
            <Input 
              id="name" 
              placeholder="Ex: Vestido Midi Satin" 
              value={formData.productName}
              onChange={e => setFormData({...formData, productName: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Input 
                id="category" 
                placeholder="Ex: Vestidos" 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Preço</Label>
              <Input 
                id="price" 
                placeholder="R$ 199,90" 
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="features">Destaques (separados por vírgula)</Label>
            <Input 
              id="features" 
              placeholder="Seda, Manga bufante, Corte evasê" 
              value={formData.keyFeatures}
              onChange={e => setFormData({...formData, keyFeatures: e.target.value})}
            />
          </div>
          
          <Button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full rounded-full py-6 font-semibold"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Gerar Descrição
          </Button>

          {result && (
            <div className="mt-4 p-4 rounded-2xl bg-secondary/50 border border-primary/10 relative">
              <p className="text-sm leading-relaxed text-foreground/90">{result}</p>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8 text-primary hover:bg-white"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
