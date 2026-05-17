"use client";

import React, { useEffect, useState } from 'react';
import { Clock, Copy, CheckCheck, ArrowRight, QrCode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/store/Navbar';
import { Footer } from '@/components/store/Footer';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function OrderPendingContent() {
  const searchParams = useSearchParams();
  const metodo = searchParams.get('metodo');
  const [pixData, setPixData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (metodo === 'pix') {
      const raw = sessionStorage.getItem('pix_data');
      if (raw) {
        try {
          setPixData(JSON.parse(raw));
          // Mantemos os dados na sessão caso a cliente dê refresh, limpamos apenas ao sair
        } catch (e) {
          console.error("Erro ao carregar dados do PIX");
        }
      }
    }
  }, [metodo]);

  const handleCopy = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <div className="min-h-screen bg-[#FFF9F7] selection:bg-accent/30 selection:text-primary overflow-x-hidden">
      <Navbar onOpenLogin={() => {}} onOpenCart={() => {}} onOpenFavorites={() => {}} cartCount={0} />

      <main className="pt-32 pb-24 md:pt-48 md:pb-40">
        <section className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-12">

            {pixData ? (
              <>
                <div className="h-32 w-32 md:h-48 md:w-48 bg-secondary rounded-full flex items-center justify-center mx-auto shadow-editorial">
                  <QrCode className="h-16 w-16 md:h-24 md:w-24 text-accent" />
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-px w-12 bg-accent/30" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-accent">Pague com PIX</span>
                    <div className="h-px w-12 bg-accent/30" />
                  </div>
                  <h1 className="text-4xl md:text-7xl font-headline font-bold text-primary leading-[0.95] tracking-tighter">
                    Escaneie o <br />
                    <span className="italic font-light text-accent">QR Code.</span>
                  </h1>
                  <p className="text-base text-muted-foreground font-light italic max-w-xl mx-auto leading-relaxed">
                    Use o app do seu banco para escanear o QR Code abaixo ou copie o código PIX. O pagamento é confirmado em segundos.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-8">
                  {pixData.qr_code_base64 && (
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary/5 inline-block">
                       <img 
                        src={`data:image/png;base64,${pixData.qr_code_base64}`} 
                        alt="QR Code PIX" 
                        className="h-48 w-48 md:h-64 md:w-64" 
                       />
                    </div>
                  )}

                  <div className="w-full max-w-md space-y-3">
                    <p className="text-[10px] font-bold uppercase text-primary/40 tracking-widest">Código PIX Copia e Cola</p>
                    <div className="flex gap-2">
                       <input 
                        readOnly 
                        value={pixData.qr_code} 
                        className="flex-1 h-14 bg-secondary/20 rounded-2xl px-6 text-[11px] outline-none truncate font-mono text-primary/60 border border-transparent focus:border-accent/20 transition-all" 
                       />
                       <Button 
                        onClick={handleCopy} 
                        className="h-14 px-8 rounded-2xl bg-primary text-white text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 shadow-lg hover:scale-105 transition-all"
                       >
                         {copied ? <CheckCheck className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                         {copied ? 'Copiado' : 'Copiar'}
                       </Button>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 max-w-sm mx-auto shadow-sm">
                  <p className="text-[12px] text-emerald-700 font-medium leading-relaxed">
                    ✓ Valor: <span className="font-bold">{formatCurrency(pixData.amount)}</span><br/>
                    ✓ Confirmação instantânea<br/>
                    ✓ Sua peça entra em produção hoje
                  </p>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-10">
               <Link href="/meus-pedidos" className="w-full md:w-auto" onClick={() => sessionStorage.removeItem('pix_data')}>
                 <Button className="w-full md:w-auto rounded-full bg-primary text-white font-bold uppercase tracking-widest text-[11px] h-16 px-12 shadow-2xl hover:scale-105 transition-all">
                    Acompanhar Pedidos
                 </Button>
               </Link>
               <Link href="/" className="w-full md:w-auto" onClick={() => sessionStorage.removeItem('pix_data')}>
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

export default function OrderPendingPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-accent h-12 w-12" /></div>}>
      <OrderPendingContent />
    </Suspense>
  );
}
