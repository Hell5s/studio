
"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/store/Navbar';
import { Footer } from '@/components/store/Footer';
import { Loader2, ArrowLeft, ShieldCheck, Lock, Copy, CheckCircle2, QrCode, CreditCard, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Link from 'next/link';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  
  const preferenceId = searchParams.get('preferenceId');
  const orderId = searchParams.get('orderId');

  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_base64: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Buscar detalhes do pedido no Firestore para ter certeza do valor e dados do cliente
  const orderRef = useMemoFirebase(() => {
    return orderId ? doc(db, 'orders', orderId) : null;
  }, [db, orderId]);
  
  const { data: order, isLoading: isOrderLoading } = useDoc(orderRef);

  const handlePixPayment = async () => {
    if (!order) return;
    setIsProcessing(true);
    try {
      const response = await fetch('/api/checkout/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          formData: {
            transaction_amount: order.total,
            description: `Pedido #${order.orderNumber} - Toda Bela`,
            external_reference: order.orderNumber,
            payer: {
              email: order.customer.email,
              first_name: order.customer.name.split(' ')[0],
              last_name: order.customer.name.split(' ').slice(1).join(' ') || 'Cliente'
            }
          }
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Erro ao gerar PIX');
      
      setPixData(data);
      toast({ title: "PIX Gerado!", description: "Escaneie o código para pagar." });
    } catch (error: any) {
      console.error("Erro no PIX:", error);
      toast({ title: "Erro no PIX", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRedirectPayment = () => {
    if (!preferenceId) return;
    // Redireciona para o Checkout Pro oficial, que aceita cartões e boletos sem erros de Bricks
    window.location.href = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`;
  };

  const copyPixCode = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      toast({ title: "Copiado!", description: "Código PIX pronto para colar." });
    }
  };

  if (isOrderLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Carregando Detalhes...</p>
        </div>
      </div>
    );
  }

  if (!preferenceId || !order) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 bg-white p-10 text-center">
        <p className="text-primary font-headline text-xl">Ops! Não encontramos seu checkout.</p>
        <p className="text-muted-foreground italic font-light max-w-xs">Parece que os dados do seu pedido expiraram ou são inválidos.</p>
        <Button onClick={() => router.replace('/')} className="rounded-full px-10 h-14 bg-primary text-white">Voltar para a Loja</Button>
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
                {pixData ? 'Aguardando' : 'Finalizar'} <span className="italic font-light text-accent">{pixData ? 'Pagamento' : 'Reserva'}</span>
              </h1>
            </header>

            <div className="grid lg:grid-cols-12 gap-12 items-start">
              {/* Coluna Principal */}
              <div className="lg:col-span-8 bg-white border border-primary/5 rounded-[2rem] p-6 md:p-10 shadow-editorial">
                {isProcessing ? (
                  <div className="py-32 flex flex-col items-center gap-6">
                    <Loader2 className="h-12 w-12 animate-spin text-accent" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Iniciando Transação...</p>
                  </div>
                ) : pixData ? (
                  <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500 text-center">
                    <div className="space-y-4">
                      <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                      </div>
                      <h3 className="text-xl font-headline font-bold text-primary">Pedido Reservado!</h3>
                      <p className="text-sm text-muted-foreground italic font-light">Escaneie o QR Code abaixo para concluir sua compra instantaneamente.</p>
                    </div>

                    <div className="bg-secondary/20 p-8 rounded-[2rem] inline-block mx-auto border border-primary/5 shadow-inner">
                      {pixData.qr_code_base64 && (
                        <img 
                          src={`data:image/png;base64,${pixData.qr_code_base64}`} 
                          alt="QR Code PIX" 
                          className="w-64 h-64 mx-auto rounded-xl"
                        />
                      )}
                    </div>

                    <div className="space-y-6 max-w-sm mx-auto">
                      <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-primary/10 overflow-hidden">
                        <p className="text-[9px] font-mono text-primary/60 break-all select-all">
                          {pixData.qr_code}
                        </p>
                      </div>
                      <Button 
                        onClick={copyPixCode}
                        className="w-full h-16 rounded-full bg-primary text-white font-bold uppercase tracking-widest text-[11px] shadow-xl hover:scale-105 transition-all"
                      >
                        <Copy className="mr-3 h-4 w-4" /> Copiar código PIX
                      </Button>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-[0.2em]">O código expira em 30 minutos</p>
                    </div>

                    <div className="pt-10 border-t border-primary/5">
                       <Link href="/meus-pedidos">
                         <button className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-primary transition-colors underline underline-offset-8">Acompanhar meu pedido</button>
                       </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <h3 className="text-xl font-headline font-bold text-primary">Escolha como pagar</h3>
                      <p className="text-sm text-muted-foreground italic font-light">Selecione o método de sua preferência para concluir sua compra na Toda Bela.</p>
                    </div>

                    <div className="grid gap-4">
                      <button 
                        onClick={handlePixPayment}
                        className="group w-full flex items-center justify-between p-6 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-all text-left"
                      >
                        <div className="flex items-center gap-6">
                           <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                              <QrCode className="h-6 w-6" />
                           </div>
                           <div>
                              <p className="font-bold text-primary uppercase text-sm tracking-tight">Pagar com PIX</p>
                              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Aprovação Instantânea</p>
                           </div>
                        </div>
                        <ArrowLeft className="h-4 w-4 rotate-180 text-emerald-300 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button 
                        onClick={handleRedirectPayment}
                        className="group w-full flex items-center justify-between p-6 rounded-2xl bg-secondary/30 border border-primary/5 hover:bg-white hover:shadow-lg transition-all text-left"
                      >
                        <div className="flex items-center gap-6">
                           <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                              <CreditCard className="h-6 w-6" />
                           </div>
                           <div>
                              <p className="font-bold text-primary uppercase text-sm tracking-tight">Pagar com Cartão</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Até 10x sem juros</p>
                           </div>
                        </div>
                        <ArrowLeft className="h-4 w-4 rotate-180 text-primary/10 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button 
                        onClick={handleRedirectPayment}
                        className="group w-full flex items-center justify-between p-6 rounded-2xl bg-secondary/30 border border-primary/5 hover:bg-white hover:shadow-lg transition-all text-left"
                      >
                        <div className="flex items-center gap-6">
                           <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                              <FileText className="h-6 w-6" />
                           </div>
                           <div>
                              <p className="font-bold text-primary uppercase text-sm tracking-tight">Pagar com Boleto</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Processamento em até 2 dias</p>
                           </div>
                        </div>
                        <ArrowLeft className="h-4 w-4 rotate-180 text-primary/10 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    <div className="pt-8 border-t border-primary/5 flex items-center justify-center gap-3">
                       <ShieldCheck className="h-4 w-4 text-emerald-500" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Pagamento 100% Blindado</span>
                    </div>
                  </div>
                )}
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
