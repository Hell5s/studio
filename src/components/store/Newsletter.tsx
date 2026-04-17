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
    <section id="newsletter" className="container mx-auto px-4 py-40 md:px-8">
      <div className="relative overflow-hidden rounded-[5rem] bg-primary p-16 md:p-32 text-center shadow-[0_50px_100px_-20px_rgba(110,60,71,0.3)]">
        <div className="absolute top-0 left-0 h-96 w-96 bg-accent/20 blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 h-96 w-96 bg-white/5 blur-[120px] translate-x-1/2 translate-y-1/2" />
        
        <div className="relative max-w-4xl mx-auto space-y-12">
          <div className="space-y-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.8em] text-accent">Clube Exclusivo Maison</span>
            <h3 className="text-5xl md:text-8xl font-headline font-black text-white text-editorial leading-[1.1]">Sinta a Essência Toda Bela</h3>
            <p className="text-xl text-white/70 leading-relaxed font-light italic max-w-2xl mx-auto">
              Inscreva-se para receber convites para pré-lançamentos, editoriais de moda inéditos e benefícios reservados.
            </p>
          </div>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-6 pt-8 max-w-2xl mx-auto">
            <Input
              type="email"
              placeholder="Seu melhor e-mail"
              className="h-20 flex-1 rounded-full border-white/20 bg-white/10 text-white placeholder:text-white/40 px-12 focus:ring-accent focus:border-accent text-lg backdrop-blur-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <Button 
              className="h-20 rounded-full px-16 text-[12px] font-bold uppercase tracking-[0.4em] bg-accent text-white hover:bg-white hover:text-primary shadow-2xl transition-all hover:scale-105 active:scale-95"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Fazer Parte"}
            </Button>
          </form>
          
          <p className="text-[10px] text-white/40 uppercase tracking-[0.5em] font-bold pt-8">
            Privacidade absoluta. Maison Toda Bela.
          </p>
        </div>
      </div>
    </section>
  );
}