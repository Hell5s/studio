"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
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
      title: "Bienvenue, Chérie!",
      description: "Você agora faz parte do nosso círculo exclusivo.",
    });
    
    setEmail('');
    setIsSubmitting(false);
  };

  return (
    <section id="newsletter" className="container mx-auto px-4 py-32 md:px-8">
      <div className="relative overflow-hidden rounded-[4rem] bg-primary p-12 md:p-24 text-center shadow-2xl">
        <div className="absolute top-0 left-0 h-64 w-64 bg-accent/20 blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 h-64 w-64 bg-white/5 blur-[100px] translate-x-1/2 translate-y-1/2" />
        
        <div className="relative max-w-3xl mx-auto space-y-10">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-accent">Clube Exclusivo</span>
            <h3 className="text-4xl md:text-6xl font-headline font-bold text-white leading-[1.1]">Sinta a Essência Toda Bela</h3>
            <p className="text-lg text-white/70 leading-relaxed font-light italic">
              Inscreva-se para receber convites para pré-lançamentos, editoriais de moda e benefícios exclusivos Maison.
            </p>
          </div>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 pt-6">
            <Input
              type="email"
              placeholder="Seu melhor e-mail"
              className="h-16 flex-1 rounded-full border-white/10 bg-white/10 text-white placeholder:text-white/40 px-10 focus:ring-accent focus:border-accent text-base backdrop-blur-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <Button 
              className="h-16 rounded-full px-12 text-sm font-bold uppercase tracking-widest bg-accent text-white hover:bg-white hover:text-primary shadow-2xl shadow-black/20 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Inscrevendo..." : "Fazer Parte"}
            </Button>
          </form>
          
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold pt-4">
            Respeitamos sua privacidade. Cancele quando desejar.
          </p>
        </div>
      </div>
    </section>
  );
}