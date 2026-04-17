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
    <section id="newsletter" className="container mx-auto px-6 py-32">
      <div className="relative overflow-hidden rounded-[5rem] bg-[#6E3C47] p-12 md:p-32 text-center shadow-2xl isolate">
        {/* Decoração Artística */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C7A17A]/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
          <div className="space-y-6">
            <div className="flex justify-center mb-6">
              <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center text-[#C7A17A] backdrop-blur-md">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>
            <h3 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight">Receba novidades e <br /><span className="italic text-[#C7A17A] font-light">ofertas exclusivas</span></h3>
            <p className="text-xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
              Junte-se ao nosso clube e seja a primeira a acessar coleções limitadas e benefícios reservados para mulheres que valorizam a excelência.
            </p>
          </div>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-6 max-w-2xl mx-auto">
            <div className="relative flex-1 group">
              <Mail className="absolute left-7 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-[#C7A17A] transition-colors" />
              <Input
                type="email"
                placeholder="Seu melhor e-mail"
                className="h-20 flex-1 rounded-full border-white/10 bg-white/5 text-white pl-16 pr-8 focus:ring-1 focus:ring-[#C7A17A] focus:border-transparent placeholder:text-white/20 transition-all text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <Button 
              className="h-20 rounded-full px-12 text-[11px] font-bold uppercase tracking-[0.4em] bg-[#C7A17A] text-white hover:bg-white hover:text-[#6E3C47] shadow-2xl transition-all duration-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Cadastrando..." : "Quero Participar"}
            </Button>
          </form>
          
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.5em]">
            Respeitamos sua privacidade. Sem spam.
          </p>
        </div>
      </div>
    </section>
  );
}
