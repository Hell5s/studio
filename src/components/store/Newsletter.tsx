
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Mail, Send } from 'lucide-react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const db = useFirestore();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    const subscribersRef = collection(db, 'newsletter_subscribers');
    addDocumentNonBlocking(subscribersRef, {
      email,
      subscriptionDate: new Date().toISOString(),
    });

    toast({
      title: "Pronto!",
      description: "Agora você receberá nossas melhores ofertas.",
    });
    
    setEmail('');
    setIsSubmitting(false);
  };

  return (
    <section id="newsletter" className="container mx-auto px-6 py-20">
      <div className="relative overflow-hidden rounded-3xl bg-white border border-[#F7E8EA] p-10 md:p-20 text-center shadow-lg">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <h3 className="text-3xl md:text-4xl font-bold text-[#6E3C47] tracking-tight">Receba novidades e ofertas</h3>
            <p className="text-base text-[#2A1F22]/70 max-w-xl mx-auto">
              Cadastre seu melhor e-mail e seja a primeira a saber dos novos lançamentos e promoções exclusivas da Toda Bela.
            </p>
          </div>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2A1F22]/30" />
              <Input
                type="email"
                placeholder="Seu e-mail aqui"
                className="h-14 flex-1 rounded-full border-[#F7E8EA] bg-[#FFF9F7] text-[#2A1F22] px-14 focus:ring-[#6E3C47]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <Button 
              className="h-14 rounded-full px-10 text-xs font-bold uppercase tracking-widest bg-[#6E3C47] text-white hover:bg-[#6E3C47]/90 shadow-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Quero receber"} <Send className="ml-2 h-4 w-4" />
            </Button>
          </form>
          
          <p className="text-[10px] text-[#2A1F22]/40 font-bold uppercase tracking-widest">
            Sem spam. Apenas o melhor da moda.
          </p>
        </div>
      </div>
    </section>
  );
}
