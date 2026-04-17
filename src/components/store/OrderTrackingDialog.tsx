
"use client";

import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface OrderTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderTrackingDialog({ open, onOpenChange }: OrderTrackingDialogProps) {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !email) return;

    setLoading(true);
    setError(null);
    setTrackingData(null);

    // Simulação de busca de pedido
    setTimeout(() => {
      if (orderId.toLowerCase().includes('erro')) {
        setError("Pedido não encontrado. Verifique os dados e tente novamente.");
      } else {
        setTrackingData({
          id: orderId.toUpperCase().startsWith('#') ? orderId.toUpperCase() : `#${orderId}`,
          status: "Em Trânsito",
          lastUpdate: "Hoje, às 14:20",
          estimatedDelivery: "25 de Outubro",
          steps: [
            { title: "Pedido Realizado", date: "18 Out, 09:00", completed: true, icon: <Clock className="h-4 w-4" /> },
            { title: "Pagamento Confirmado", date: "18 Out, 09:15", completed: true, icon: <CheckCircle2 className="h-4 w-4" /> },
            { title: "Em Separação", date: "19 Out, 11:30", completed: true, icon: <Package className="h-4 w-4" /> },
            { title: "Enviado à Transportadora", date: "20 Out, 14:20", current: true, icon: <Truck className="h-4 w-4" /> },
            { title: "Saiu para Entrega", date: "Previsão: 24 Out", icon: <MapPin className="h-4 w-4" /> },
          ]
        });
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-brand-wine p-8 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Truck className="h-24 w-24" />
          </div>
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-2xl font-headline font-bold uppercase tracking-widest">
              Rastrear Pedido
            </DialogTitle>
            <DialogDescription className="text-brand-rose/60 font-light italic">
              Acompanhe cada passo da sua nova conquista Toda Bela.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-8">
          {!trackingData ? (
            <form onSubmit={handleTrack} className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="orderId" className="text-[10px] font-bold uppercase tracking-widest text-brand-wine/40 ml-4">
                    Número do Pedido
                  </Label>
                  <Input 
                    id="orderId" 
                    placeholder="Ex: #12345" 
                    className="rounded-full h-14 bg-brand-blush/20 border-none px-6 focus:ring-2 focus:ring-brand-wine/10 transition-all"
                    value={orderId}
                    onChange={e => setOrderId(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="track-email" className="text-[10px] font-bold uppercase tracking-widest text-brand-wine/40 ml-4">
                    E-mail da Compra
                  </Label>
                  <Input 
                    id="track-email" 
                    type="email"
                    placeholder="seu@email.com" 
                    className="rounded-full h-14 bg-brand-blush/20 border-none px-6 focus:ring-2 focus:ring-brand-wine/10 transition-all"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/5 text-destructive text-xs font-medium border border-destructive/10 animate-in fade-in zoom-in-95">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full rounded-full h-14 bg-brand-wine text-white font-bold uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Localizar Pedido
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-wine/40">Pedido {trackingData.id}</p>
                  <h4 className="text-xl font-headline font-bold text-brand-wine">{trackingData.status}</h4>
                </div>
                <Badge className="bg-brand-gold text-white border-none px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[9px]">
                  {trackingData.estimatedDelivery}
                </Badge>
              </div>

              <div className="space-y-6 relative">
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-brand-blush" />
                
                {trackingData.steps.map((step: any, i: number) => (
                  <div key={i} className="flex gap-6 relative group">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-500 ${
                      step.completed ? "bg-brand-wine text-white shadow-lg" : 
                      step.current ? "bg-brand-gold text-white shadow-lg animate-pulse" : 
                      "bg-white border-2 border-brand-blush text-brand-wine/20"
                    }`}>
                      {step.icon}
                    </div>
                    <div className="flex-1 pt-1">
                      <h5 className={`text-sm font-bold uppercase tracking-widest ${
                        step.completed || step.current ? "text-brand-wine" : "text-brand-wine/30"
                      }`}>
                        {step.title}
                      </h5>
                      <p className="text-[10px] text-muted-foreground font-medium italic mt-0.5">
                        {step.date}
                      </p>
                    </div>
                    {step.current && (
                      <div className="absolute -left-2 top-0 h-10 w-10 bg-brand-gold/20 rounded-full blur-xl animate-pulse" />
                    )}
                  </div>
                ))}
              </div>

              <Separator className="bg-brand-wine/5" />

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => setTrackingData(null)}
                  variant="ghost" 
                  className="rounded-full text-brand-wine/60 hover:text-brand-wine font-bold uppercase tracking-widest text-[10px]"
                >
                  Nova Consulta
                </Button>
                <Button 
                  className="rounded-full h-14 border border-brand-wine/10 text-brand-wine bg-white hover:bg-brand-blush/20 font-bold uppercase tracking-widest text-[10px] transition-all"
                >
                  Precisa de Ajuda? Fale Conosco
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
