
"use client";

import React, { useState } from 'react';
import { Truck, Search, Package, CheckCircle2, Clock } from 'lucide-react';
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

interface OrderTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderTrackingDialog({ open, onOpenChange }: OrderTrackingDialogProps) {
  const [orderId, setOrderId] = useState('');

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
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 ml-4">Número do Pedido</Label>
              <div className="flex gap-4">
                <Input 
                  placeholder="Ex: #PED-12345" 
                  className="rounded-full h-14 bg-secondary/30 border-none px-6 focus:ring-2 focus:ring-primary/10"
                  value={orderId}
                  onChange={e => setOrderId(e.target.value)}
                />
                <Button className="rounded-full h-14 w-14 bg-primary text-white shrink-0 shadow-lg">
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-8 py-4 opacity-30">
            {[
              { icon: <Clock className="h-4 w-4" />, label: "Pedido Recebido", done: true },
              { icon: <Package className="h-4 w-4" />, label: "Em Separação", done: false },
              { icon: <Truck className="h-4 w-4" />, label: "Enviado", done: false },
            ].map((step, idx) => (
              <div key={idx} className="flex items-center gap-6">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${step.done ? 'bg-primary text-white' : 'bg-secondary text-primary/20'}`}>
                  {step.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
