
"use client";

import React from 'react';
import { CheckCircle2, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/store/Navbar';
import { Footer } from '@/components/store/Footer';
import Link from 'next/link';

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FFF9F7] selection:bg-accent/30 selection:text-primary overflow-x-hidden">
      <Navbar onOpenLogin={() => {}} onOpenCart={() => {}} onOpenFavorites={() => {}} cartCount={0} />

      <main className="pt-32 pb-24 md:pt-48 md:pb-40">
        <section className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-12">
            <div className="relative inline-block">
               <div className="h-32 w-32 md:h-48 md:w-48 bg-primary rounded-full flex items-center justify-center mx-auto shadow-[0_30px_100px_-12px_rgba(110,60,71,0.3)] animate-float-editorial">
                  <CheckCircle2 className="h-16 w-16 md:h-24 md:w-24 text-white" />
               </div>
               <div className="absolute -top-4 -right-4 h-12 w-12 bg-accent rounded-full flex items-center justify-center shadow-xl animate-bounce">
                  <Sparkles className="h-6 w-6 text-white" />
               </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-12 bg-accent" />
                <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-accent">Reserva Confirmada</span>
                <div className="h-px w-12 bg-accent" />
              </div>
              <h1 className="text-4xl md:text-8xl font-headline font-bold text-primary leading-[0.95] tracking-tighter">
                Uma escolha <br />
                <span className="italic font-light text-accent">Extraordinária.</span>
              </h1>
              <p className="text-base md:text-2xl text-muted-foreground font-light italic max-w-xl mx-auto leading-relaxed">
                Seu pagamento foi aprovado com sucesso. Estamos preparando sua seleção Toda Bela com todo o cuidado e sofisticação que você merece.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6">
               <Link href="/meus-pedidos" className="w-full md:w-auto">
                 <Button className="w-full md:w-auto rounded-full bg-primary text-white font-bold uppercase tracking-widest text-[11px] h-16 px-12 shadow-2xl hover:scale-105 transition-all">
                    Acompanhar Pedido
                 </Button>
               </Link>
               <Link href="/" className="w-full md:w-auto">
                 <Button variant="outline" className="w-full md:w-auto rounded-full border-primary text-primary font-bold uppercase tracking-widest text-[11px] h-16 px-12 hover:bg-primary hover:text-white transition-all">
                    Voltar para a Loja <ArrowRight className="ml-3 h-4 w-4" />
                 </Button>
               </Link>
            </div>

            <div className="pt-12 border-t border-primary/5">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">
                Você receberá atualizações via WhatsApp e E-mail.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
