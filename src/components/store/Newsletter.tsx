"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase';
import { Sparkles, Mail } from 'lucide-react';

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
    <section id="newsletter" className="container mx-auto px-4 py-48 md:px-12">
      <div className="relative overflow-hidden rounded-[7rem] bg-primary p-20 md:p-40 text-center shadow-premium">
        {/* Abstract Light Orbs */}
        <div className="absolute top-0 left-0 h-[500px] w-[500px] bg-accent/20 blur-[150px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] bg-white/5 blur-[150px] translate-x-1/2 translate-y-1/2" />
        
        <div className="relative max-w-5xl mx-auto space-y-16">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 bg-white/5 px-6 py-2 rounded-full border border-white/10">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-[11px] font-bold uppercase tracking-[0.8em] text-accent">L'Invitation Exclusive</span>
            </div>
            <h3 className="text-6xl md:text-[9rem] font-headline font-bold text-white text-editorial leading-[0.9] tracking-tighter">Sinta a Essência Toda Bela</h3>
            <p className="text-xl md:text-2xl text-white/70 leading-relaxed font-light italic max-w-2xl mx-auto">
              Inscreva-se para receber convites para pré-lançamentos, editoriais de moda inéditos e benefícios reservados ao nosso círculo mais íntimo.
            </p>
          </div>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-6 pt-12 max-w-3xl mx-auto relative group">
            <div className="relative flex-1">
              <Mail className="absolute left-10 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
              <Input
                type="email"
                placeholder="Seu endereço de e-mail exclusivo"
                className="h-24 flex-1 rounded-full border-white/10 bg-white/5 text-white placeholder:text-white/30 px-20 focus:ring-accent focus:border-accent text-xl backdrop-blur-2xl transition-all duration-500 focus:bg-white/10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <Button 
              className="h-24 rounded-full px-20 text-[12px] font-bold uppercase tracking-[0.5em] bg-accent text-white hover:bg-white hover:text-primary shadow-2xl transition-all duration-700 hover:scale-105 active:scale-95 whitespace-nowrap"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Fazer Parte"}
            </Button>
          </form>
          
          <div className="flex flex-col items-center gap-4 pt-12">
            <p className="text-[10px] text-white/30 uppercase tracking-[0.6em] font-bold">
              Privacidade absoluta. Maison Toda Bela.
            </p>
            <div className="h-px w-24 bg-white/10" />
          </div>
        </div>
      </div>
    </section>
  );
}