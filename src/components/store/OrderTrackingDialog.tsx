
"use client";

import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
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
import { useFirestore } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface OrderTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderTrackingDialog({ open, onOpenChange }: OrderTrackingDialogProps) {
  const db = useFirestore();
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

    try {
      const cleanId = orderId.trim().replace('#', '');
      const cleanEmail = email.trim().toLowerCase();

      // Primeiro tentamos por ID exato (mais eficiente)
      const docRef = doc(db, 'orders', cleanId);
      const docSnap = await getDoc(docRef);

      let orderData = null;
      let finalId = cleanId;

      if (docSnap.exists()) {
        orderData = docSnap.data();
      } else {
        // Se não achar por ID longo, buscamos todos os pedidos do email e filtramos pelo sufixo
        const q = query(collection(db, 'orders'), where('customerEmail', '==', cleanEmail));
        const querySnapshot = await getDocs(q);
        
        const matchingOrder = querySnapshot.docs.find(d => 
          d.id.toLowerCase().endsWith(cleanId.toLowerCase())
        );

        if (matchingOrder) {
          orderData = matchingOrder.data();
          finalId = matchingOrder.id;
        }
      }

      if (orderData) {
        if (orderData.customerEmail?.toLowerCase() !== cleanEmail) {
          setError("E-mail não corresponde ao pedido informado.");
          setLoading(false);
          return;
        }

        const status = orderData.status || "Pendente";
        
        setTrackingData({
          id: `#${finalId.slice(-6).toUpperCase()}`,
          status: status,
          lastUpdate: orderData.updatedAt?.toDate ? orderData.updatedAt.toDate().toLocaleString('pt-BR') : "Recentemente",
          estimatedDelivery: status === 'Entregue' ? "Entregue" : "Em processamento",
          steps: [
            { title: "Pedido Realizado", date: orderData.createdAt?.toDate ? orderData.createdAt.toDate().toLocaleDateString('pt-BR') : '-', completed: true, icon: <Clock className="h-4 w-4" /> },
            { title: "Pagamento Confirmado", date: orderData.updatedAt?.toDate ? orderData.updatedAt.toDate().toLocaleDateString('pt-BR') : '-', completed: status !== 'Pendente', icon: <CheckCircle2 className="h-4 w-4" /> },
            { title: "Em Separação", date: 'Aguardando', completed: ['Enviado', 'Entregue'].includes(status), icon: <Package className="h-4 w-4" /> },
            { title: "Enviado à Transportadora", date: 'Em breve', current: status === 'Enviado', completed: status === 'Entregue', icon: <Truck className="h-4 w-4" /> },
            { title: "Saiu para Entrega", date: 'A definir', icon: <MapPin className="h-4 w-4" /> },
          ]
        });
      } else {
        setError("Pedido não localizado. Verifique o ID e o e-mail.");
      }
    } catch (err) {
      setError("Falha na conexão. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-background">
        <div className="bg-primary p-10 text-primary-foreground relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Truck className="h-24 w-24" />
          </div>
          <DialogHeader className="relative z-10 space-y-2">
            <DialogTitle className="text-2xl font-headline font-bold uppercase tracking-widest">
              Rastrear Pedido
            </DialogTitle>
            <DialogDescription className="text-secondary/60 font-light italic">
              Acompanhe cada passo da sua nova conquista Toda Bela.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-10 space-y-8">
          {!trackingData ? (
            <form onSubmit={handleTrack} className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="orderId" className="text-[10px] font-bold uppercase tracking-widest text-primary/40 ml-4">
                    Número do Pedido (ID)
                  </Label>
                  <Input 
                    id="orderId" 
                    placeholder="Ex: #ABC123" 
                    className="rounded-full h-14 bg-secondary/30 border-none px-6 focus:ring-2 focus:ring-primary/10 transition-all text-primary"
                    value={orderId}
                    onChange={e => setOrderId(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="track-email" className="text-[10px] font-bold uppercase tracking-widest text-primary/40 ml-4">
                    E-mail da Compra
                  </Label>
                  <Input 
                    id="track-email" 
                    type="email"
                    placeholder="seu@email.com" 
                    className="rounded-full h-14 bg-secondary/30 border-none px-6 focus:ring-2 focus:ring-primary/10 transition-all text-primary"
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
                className="w-full rounded-full h-16 bg-primary text-primary-foreground font-bold uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] transition-all text-[10px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="mr-3 h-4 w-4" />
                    Localizar Pedido
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Pedido {trackingData.id}</p>
                  <h4 className="text-xl font-headline font-bold text-primary mt-1">{trackingData.status}</h4>
                </div>
                <Badge className="bg-accent text-accent-foreground border-none px-5 py-2 rounded-full font-bold uppercase tracking-widest text-[9px] shadow-sm">
                  {trackingData.estimatedDelivery}
                </Badge>
              </div>

              <div className="space-y-8 relative">
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-secondary" />
                
                {trackingData.steps.map((step: any, i: number) => (
                  <div key={i} className="flex gap-8 relative group">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-500 ${
                      step.completed ? "bg-primary text-primary-foreground shadow-lg" : 
                      step.current ? "bg-accent text-accent-foreground shadow-lg scale-110" : 
                      "bg-white border-2 border-secondary text-primary/20"
                    }`}>
                      {step.icon}
                    </div>
                    <div className="flex-1 pt-1">
                      <h5 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                        step.completed || step.current ? "text-primary" : "text-primary/30"
                      }`}>
                        {step.title}
                      </h5>
                      <p className="text-[10px] text-muted-foreground/70 font-medium italic mt-1">
                        {step.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="bg-primary/5" />

              <div className="flex flex-col gap-4">
                <Button 
                  onClick={() => setTrackingData(null)}
                  variant="ghost" 
                  className="rounded-full text-primary/60 hover:text-primary font-bold uppercase tracking-widest text-[9px] h-12"
                >
                  Nova Consulta
                </Button>
                <Button 
                  variant="outline"
                  className="rounded-full h-14 border-primary/10 text-primary bg-white hover:bg-secondary/50 font-bold uppercase tracking-widest text-[9px] transition-all"
                  onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
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
