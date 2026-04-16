
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const db = useFirestore();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    // Save to newsletter_subscribers collection
    const subscribersRef = collection(db, 'newsletter_subscribers');
    addDocumentNonBlocking(subscribersRef, {
      email,
      subscriptionDate: new Date().toISOString(),
    });

    toast({
      title: "Bem-vinda ao Clube!",
      description: "Você receberá nossas novidades em breve.",
    });
    
    setEmail('');
    setIsSubmitting(false);
  };

  return (
    <section id="newsletter" className="container mx-auto px-4 py-24 md:px-8">
      <div className="relative overflow-hidden rounded-[3rem] border border-primary/10 bg-white p-12 md:p-20 text-center shadow-sm">
        <div className="absolute top-0 left-0 h-40 w-40 bg-brand-blush/40 blur-[80px]" />
        <div className="absolute bottom-0 right-0 h-40 w-40 bg-brand-plum/10 blur-[80px]" />
        
        <div className="relative max-w-3xl mx-auto space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/60">Clube Toda Bela</span>
            <h3 className="mt-4 text-4xl md:text-5xl font-headline font-semibold text-foreground">Receba lançamentos e ofertas exclusivas</h3>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Junte-se à nossa comunidade e seja a primeira a saber das novas coleções e mimos especiais que preparamos para você.
            </p>
          </div>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 pt-4">
            <Input
              type="email"
              placeholder="Seu melhor e-mail"
              className="h-14 flex-1 rounded-full border-primary/20 px-8 focus:ring-primary focus:border-primary text-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <Button 
              className="h-14 rounded-full px-10 text-base font-semibold shadow-lg shadow-primary/10 transition-transform active:scale-95"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Quero participar"}
            </Button>
          </form>
          
          <p className="text-xs text-muted-foreground pt-4 italic">
            Prometemos não enviar spam. Você pode cancelar a qualquer momento.
          </p>
        </div>
      </div>
    </section>
  );
}
