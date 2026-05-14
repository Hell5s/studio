
"use client";

import React from 'react';
import { Clock, Info, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/store/Navbar';
import { Footer } from '@/components/store/Footer';
import Link from 'next/link';

export default function OrderPendingPage() {
  return (
    <div className="min-h-screen bg-[#FFF9F7] selection:bg-accent/30 selection:text-primary overflow-x-hidden">
      <Navbar onOpenLogin={() => {}} onOpenCart={() => {}} onOpenFavorites={() => {}} cartCount={0} />

      <main className="pt-32 pb-24 md:pt-48 md:pb-40">
        <section className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-12">
            <div className="h-32 w-32 md:h-48 md:w-48 bg-secondary rounded-full flex items-center justify-center mx-auto shadow-editorial animate-pulse">
               <Clock className="h-16 w-16 md:h-24 md:w-24 text-accent" />
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-12 bg-accent/30" />
                <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-accent">Pagamento em Processamento</span>
                <div className="h-px w-12 bg-accent/30" />
              </div>
              <h1 className="text-4xl md:text-8xl font-headline font-bold text-primary leading-[0.95] tracking-tighter">
                Quase <br />
                <span className="italic font-light text-accent">Pronta.</span>
              </h1>
              <p className="text-base md:text-2xl text-muted-foreground font-light italic max-w-xl mx-auto leading-relaxed">
                Seu pedido foi reservado! Assim que o Mercado Pago confirmar a compensação do seu pagamento (Boleto ou Pix), sua peça entrará em produção.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6">
               <Link href="/meus-pedidos" className="w-full md:w-auto">
                 <Button className="w-full md:w-auto rounded-full bg-primary text-white font-bold uppercase tracking-widest text-[11px] h-16 px-12 shadow-2xl hover:scale-105 transition-all">
                    Ver Meus Pedidos
                 </Button>
               </Link>
               <Link href="/" className="w-full md:w-auto">
                 <Button variant="outline" className="w-full md:w-auto rounded-full border-primary text-primary font-bold uppercase tracking-widest text-[11px] h-16 px-12 hover:bg-primary hover:text-white transition-all">
                    Continuar Navegando <ArrowRight className="ml-3 h-4 w-4" />
                 </Button>
               </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
