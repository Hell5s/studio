
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { Navbar } from '@/components/store/Navbar';
import { Footer } from '@/components/store/Footer';
import { Loader2, ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preferenceId = searchParams.get('preferenceId');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Inicialização do SDK com a Public Key de produção fornecida
    initMercadoPago('APP_USR-1a33d506-6ac5-447d-942f-bdcd287f3a84', { 
      locale: 'pt-BR' 
    });

    if (!preferenceId) {
      // Pequeno atraso para evitar falsos positivos durante a navegação
      const timeout = setTimeout(() => {
        if (!preferenceId) router.replace('/');
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      setIsReady(true);
    }
  }, [preferenceId, router]);

  const customization = {
    visual: {
      style: {
        theme: 'default' as const,
      },
    },
    paymentMethods: {
      creditCard: 'all' as const,
      debitCard: 'all' as const,
      ticket: 'all' as const,
      bankTransfer: ['pix'] as const,
      maxInstallments: 10,
    },
  };

  const initialization = {
    amount: 1, // O valor final é controlado pelo preferenceId gerado no backend
    preferenceId: preferenceId || '',
  };

  const onSubmit = async ({ selectedPaymentMethod, formData }: any) => {
    // O Bricks gerencia a submissão via preferenceId automaticamente
    console.log("Processando pagamento via:", selectedPaymentMethod);
  };

  const onError = (error: any) => {
    console.error("Erro no Mercado Pago Bricks:", error);
  };

  const onReady = () => {
    console.log("Formulário de pagamento pronto");
  };

  if (!isReady || !preferenceId) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Iniciando Checkout Seguro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white selection:bg-accent/30 selection:text-primary overflow-x-hidden">
      <Navbar onOpenLogin={() => {}} onOpenCart={() => {}} onOpenFavorites={() => {}} cartCount={0} />

      <main className="pt-32 pb-24 md:pt-48 md:pb-40">
        <section className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            
            <header className="space-y-6 text-center">
              <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-accent transition-colors group">
                <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Continuar comprando
              </Link>
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-12 bg-accent" />
                <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-accent">Pagamento Seguro</span>
                <div className="h-px w-12 bg-accent" />
              </div>
              <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary leading-[0.95] tracking-tighter">
                Finalizar <span className="italic font-light text-accent">Reserva</span>
              </h1>
            </header>

            <div className="grid lg:grid-cols-12 gap-12 items-start">
              {/* Coluna do Pagamento */}
              <div className="lg:col-span-8 bg-white border border-primary/5 rounded-[2rem] p-6 md:p-10 shadow-editorial">
                <div id="paymentBrick_container" className="min-h-[400px]">
                  <Payment
                    initialization={initialization}
                    customization={customization}
                    onSubmit={onSubmit}
                    onReady={onReady}
                    onError={onError}
                  />
                </div>
              </div>

              {/* Coluna de Segurança */}
              <div className="lg:col-span-4 space-y-8">
                <div className="p-8 bg-secondary/20 rounded-[2rem] space-y-6 border border-primary/5">
                   <div className="flex items-center gap-4 text-primary">
                      <Lock className="h-5 w-5 text-accent" />
                      <h4 className="text-[11px] font-bold uppercase tracking-widest">Criptografia Total</h4>
                   </div>
                   <p className="text-xs text-muted-foreground leading-relaxed italic font-light">
                     Seus dados financeiros são processados em ambiente blindado pelo Mercado Pago. A Toda Bela não armazena dados sensíveis de cartões.
                   </p>
                </div>

                <div className="p-8 bg-primary text-white rounded-[2rem] space-y-6 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10">
                      <ShieldCheck className="h-20 w-20" />
                   </div>
                   <div className="flex items-center gap-4 relative z-10">
                      <ShieldCheck className="h-6 w-6 text-accent" />
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-accent">Garantia de Entrega</h4>
                   </div>
                   <ul className="space-y-4 relative z-10">
                     {[
                       "Processamento prioritário",
                       "Código de rastreio VIP",
                       "Seguro total contra extravios",
                       "Suporte 24h via WhatsApp"
                     ].map((item, i) => (
                       <li key={i} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight">
                         <div className="h-1 w-1 rounded-full bg-accent" />
                         {item}
                       </li>
                     ))}
                   </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx global>{`
        #paymentBrick_container .mp-bricks-wrapper {
          font-family: inherit !important;
        }
        #paymentBrick_container button {
          border-radius: 9999px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.2em !important;
          background-color: #6E3C47 !important;
          height: 56px !important;
        }
        #paymentBrick_container .mp-bricks-subtitle {
          color: #C7A17A !important;
          font-size: 10px !important;
          text-transform: uppercase !important;
          font-weight: 700 !important;
          letter-spacing: 0.1em !important;
        }
        #paymentBrick_container .mp-bricks-title {
          font-family: 'Playfair Display', serif !important;
          color: #2A1F22 !important;
        }
      `}</style>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
