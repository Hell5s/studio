
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Mail, Send, Sparkles } from 'lucide-react';

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
    <section id="newsletter" className="container mx-auto px-6 py-16 md:py-40">
      <div className="relative overflow-hidden rounded-[3rem] md:rounded-[6rem] bg-primary p-8 md:p-32 text-center shadow-editorial isolate">
        {/* Arte de Fundo */}
        <div className="absolute top-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[80px] md:blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-accent/10 rounded-full translate-x-1/3 translate-y-1/3 blur-[100px] md:blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-10 relative z-10">
          <div className="space-y-4 md:space-y-6">
            <div className="flex justify-center mb-4 md:mb-8">
              <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-white/10 flex items-center justify-center text-accent backdrop-blur-lg border border-white/5">
                <Sparkles className="h-5 w-5 md:h-7 md:w-7" />
              </div>
            </div>
            <h3 className="text-3xl md:text-7xl font-serif font-bold text-white leading-tight">
              Receba novidades e <br className="hidden sm:block" />
              <span className="italic text-accent font-light">ofertas exclusivas</span>
            </h3>
            <p className="text-sm md:text-xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
              Junte-se ao nosso círculo e seja a primeira a acessar coleções limitadas e benefícios reservados para mulheres que valorizam a excelência.
            </p>
          </div>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 md:gap-6 max-w-2xl mx-auto">
            <div className="relative flex-1 group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-accent transition-colors" />
              <Input
                type="email"
                placeholder="Seu melhor e-mail"
                className="h-14 md:h-20 flex-1 rounded-full border-white/10 bg-white/5 text-white pl-16 pr-8 focus:ring-1 focus:ring-accent focus:border-transparent placeholder:text-white/20 transition-all text-sm md:text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <Button 
              className="h-14 md:h-20 rounded-full px-8 md:px-12 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] bg-accent text-white hover:bg-white hover:text-primary shadow-2xl transition-all duration-700 transform hover:scale-105"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Cadastrando..." : "Quero Participar"}
            </Button>
          </form>
          
          <p className="text-[9px] md:text-[10px] text-white/30 font-bold uppercase tracking-[0.4em] md:tracking-[0.5em]">
            Respeitamos sua privacidade. Sem envios indesejados.
          </p>
        </div>
      </div>
    </section>
  );
}
