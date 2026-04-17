
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
    <section id="newsletter" className="container mx-auto px-4 py-32 md:px-12">
      <div className="relative overflow-hidden rounded-[5rem] bg-white border border-primary/5 p-16 md:p-24 text-center shadow-xl">
        <div className="absolute top-0 left-0 h-96 w-96 bg-accent/5 blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative max-w-4xl mx-auto space-y-12">
          <div className="space-y-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-accent">Clube Toda Bela</p>
            <h3 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tighter">Receba lançamentos e curadorias exclusivas</h3>
            <p className="text-lg text-muted-foreground leading-relaxed font-light italic max-w-2xl mx-auto">
              Capte o essencial da moda. Junte-se ao nosso círculo íntimo e receba convites antecipados para novas coleções e editoriais.
            </p>
          </div>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 pt-6 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30" />
              <Input
                type="email"
                placeholder="Seu melhor endereço de e-mail"
                className="h-16 flex-1 rounded-full border-primary/10 bg-secondary/20 text-primary placeholder:text-muted-foreground/40 px-14 focus:ring-accent focus:bg-white transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <Button 
              className="h-16 rounded-full px-12 text-[10px] font-bold uppercase tracking-[0.3em] bg-primary text-white hover:bg-accent shadow-xl transition-all duration-500 hover:scale-105 active:scale-95 whitespace-nowrap"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Quero Participar"}
            </Button>
          </form>
          
          <p className="text-[9px] text-muted-foreground/50 uppercase tracking-[0.4em] font-bold pt-8">
            Privacidade absoluta. Maison Toda Bela © 2024.
          </p>
        </div>
      </div>
    </section>
  );
}
