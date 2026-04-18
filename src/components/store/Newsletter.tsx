
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

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
      title: "Assinatura Confirmada",
      description: "Bem-vinda ao círculo de exclusividades da Toda Bela.",
    });
    
    setEmail('');
    setIsSubmitting(false);
  };

  return (
    <section className="container mx-auto px-6 py-32">
      <div className="relative overflow-hidden rounded-[4rem] bg-primary p-12 md:p-32 text-center shadow-editorial">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="space-y-6">
            <h3 className="text-4xl md:text-7xl font-headline font-bold text-white leading-tight">
              Receba novidades e <br />
              <span className="italic text-accent font-light">ofertas exclusivas</span>
            </h3>
            <p className="text-xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
              Junte-se ao nosso círculo e seja a primeira a acessar coleções limitadas e benefícios reservados.
            </p>
          </div>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-6 max-w-2xl mx-auto">
            <Input
              type="email"
              placeholder="Seu melhor e-mail"
              className="h-20 flex-1 rounded-full border-white/10 bg-white/5 text-white px-10 focus:ring-accent placeholder:text-white/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <Button 
              className="h-20 rounded-full px-12 text-[11px] font-bold uppercase tracking-[0.4em] bg-accent text-white hover:bg-white hover:text-primary transition-all duration-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Cadastrando..." : "Quero Participar"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
