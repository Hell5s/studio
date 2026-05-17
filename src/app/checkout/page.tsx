
"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Lock, 
  ChevronRight, 
  MapPin, 
  User, 
  CreditCard, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  Package,
  QrCode,
  FileText,
  Copy,
  Info,
  Truck,
  CreditCard as CardIcon,
  AlertTriangle,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import { LogoMark } from '@/components/store/LogoMark';
import { cn } from '@/lib/utils';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

// Inicializa o SDK do Mercado Pago
// Substitua pela sua Chave Pública (Public Key)
initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || 'APP_USR-63259836-3982-4665-9854-850f8f902677');

type Step = 'identificacao' | 'entrega' | 'pagamento';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  
  const orderIdParam = searchParams.get('orderId');
  const [generatedOrderId, setGeneratedOrderId] = useState<string | null>(null);
  const activeOrderId = orderIdParam || generatedOrderId;

  const [currentStep, setCurrentStep] = useState<Step>('identificacao');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'pac' | 'sedex'>('pac');
  const [sessionItems, setSessionItems] = useState<any[]>([]);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isBrickReady, setIsBrickReady] = useState(false);

  // Form States
  const [identificacao, setIdentificacao] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: ''
  });

  const [entrega, setEntrega] = useState({
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  });

  // Buscar detalhes do pedido no Firestore (se houver ID)
  const orderRef = useMemoFirebase(() => {
    return activeOrderId ? doc(db, 'orders', activeOrderId) : null;
  }, [db, activeOrderId]);
  
  const { data: order, isLoading: isOrderLoading } = useDoc(orderRef);

  // Carregar itens do sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem('checkout_items');
    if (raw) {
      try {
        const items = JSON.parse(raw);
        if (Array.isArray(items) && items.length > 0) {
          setSessionItems(items);
        }
      } catch (e) {
        console.error("Erro ao processar itens da sessão:", e);
      }
    }
    setIsCheckingSession(false);
  }, []);

  // Preencher dados automático
  useEffect(() => {
    if (user?.email) {
      setIdentificacao(prev => ({ ...prev, email: user.email || '' }));
    }
    if (order?.customer) {
      setIdentificacao(prev => ({ 
        ...prev, 
        nome: order.customer.name || prev.nome,
        cpf: order.customer.cpf || prev.cpf,
        telefone: order.customer.phone || prev.telefone
      }));
      setEntrega(prev => ({
        ...prev,
        cep: order.customer.zip || prev.cep,
        endereco: order.customer.address?.split(',')[0] || prev.endereco,
        cidade: order.customer.city || prev.cidade,
        estado: order.customer.state || prev.estado
      }));
    }
  }, [user, order]);

  const handleCepSearch = async (val: string) => {
    const cep = val.replace(/\D/g, '');
    setEntrega(prev => ({ ...prev, cep }));
    
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setEntrega(prev => ({
            ...prev,
            endereco: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf
          }));
        }
      } catch (e) {
        console.error("Erro ao buscar CEP:", e);
      }
    }
  };

  const subtotal = useMemo(() => {
    const items = sessionItems.length > 0 ? sessionItems : (order?.items || []);
    return items.reduce((acc: number, it: any) => acc + ((it.price || 0) * (it.quantity || 1)), 0);
  }, [sessionItems, order]);

  const freteValor = shippingMethod === 'sedex' ? 25.90 : 0;
  const totalGeral = Number((subtotal + freteValor).toFixed(2));

  const handleNextStep = async () => {
    if (currentStep === 'identificacao') {
      if (!identificacao.nome || !identificacao.cpf) {
        toast({ title: "Campos obrigatórios", description: "Preencha nome e CPF.", variant: "destructive" });
        return;
      }
      setCurrentStep('entrega');
    } else if (currentStep === 'entrega') {
      if (!entrega.cep || !entrega.numero) {
        toast({ title: "Dados de entrega", description: "Informe o CEP e o número.", variant: "destructive" });
        return;
      }
      
      // Antes de ir para o pagamento, garantimos que o pedido existe no Firestore
      setIsProcessing(true);
      try {
        const finalId = activeOrderId || `TB-${Date.now().toString().slice(-6)}`;
        if (!activeOrderId) setGeneratedOrderId(finalId);

        await setDoc(doc(db, 'orders', finalId), {
          orderNumber: finalId,
          userId: user?.uid || null,
          items: sessionItems.length > 0 ? sessionItems : (order?.items || []),
          customer: {
            name: identificacao.nome,
            email: identificacao.email,
            cpf: identificacao.cpf,
            phone: identificacao.telefone,
            address: `${entrega.endereco}, ${entrega.numero} ${entrega.complemento}`,
            city: entrega.cidade,
            state: entrega.estado,
            zip: entrega.cep
          },
          subtotal: subtotal,
          total: totalGeral,
          status: 'pending',
          shipping: {
            method: shippingMethod === 'sedex' ? 'SEDEX' : 'PAC',
            price: freteValor
          },
          updatedAt: serverTimestamp(),
          createdAt: order?.createdAt || serverTimestamp()
        }, { merge: true });

        setCurrentStep('pagamento');
      } catch (e) {
        toast({ title: "Erro ao salvar", description: "Tente novamente.", variant: "destructive" });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handlePaymentSubmit = async ({ formData }: any) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: {
            ...formData,
            external_reference: activeOrderId,
            description: `Pedido #${activeOrderId} - Toda Bela`,
          }
        }),
      });

      const paymentResult = await response.json();

      if (!response.ok) throw new Error(paymentResult.message || 'Erro ao processar pagamento');

      // Se for aprovado ou pendente (PIX/Boleto)
      if (paymentResult.status === 'approved') {
        router.push('/pedido-confirmado');
      } else if (paymentResult.status === 'in_process') {
        router.push('/pedido-pendente');
      } else if (paymentResult.status === 'rejected') {
        toast({ title: "Pagamento Recusado", description: "Verifique os dados do cartão.", variant: "destructive" });
      }
    } catch (error: any) {
      console.error('Payment Error:', error);
      toast({ title: "Erro no Checkout", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  if (isCheckingSession || (isOrderLoading && activeOrderId)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40 animate-pulse">Preparando Checkout Seguro...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFD] selection:bg-accent/30">
      <header className="bg-white border-b border-primary/5 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
          <Link href="/"><LogoMark className="scale-90 md:scale-100" /></Link>
          
          <div className="hidden md:flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-primary/30">
            <span className={cn(currentStep === 'identificacao' ? "text-primary" : "text-emerald-500")}>Identificação</span>
            <ChevronRight className="h-3 w-3" />
            <span className={cn(currentStep === 'entrega' ? "text-primary" : currentStep === 'pagamento' ? "text-emerald-500" : "")}>Entrega</span>
            <ChevronRight className="h-3 w-3" />
            <span className={cn(currentStep === 'pagamento' ? "text-primary" : "")}>Pagamento</span>
          </div>

          <div className="flex items-center gap-2 text-emerald-600">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Ambiente Seguro</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
          
          <div className="lg:col-span-8 space-y-6">
            
            {/* ETAPA 1: IDENTIFICAÇÃO */}
            <Card className={cn(
              "rounded-[2.5rem] border-none shadow-sm transition-all duration-500 overflow-hidden",
              currentStep === 'identificacao' ? "bg-white p-6 md:p-10 opacity-100" : "bg-white/40 p-6 opacity-60 pointer-events-none"
            )}>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">1</div>
                <h2 className="text-lg font-headline font-bold text-primary uppercase tracking-tight">Identificação</h2>
              </div>

              {currentStep === 'identificacao' && (
                <div className="grid md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-bottom-2">
                  <div className="md:col-span-2 space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">Nome Completo</Label>
                    <Input value={identificacao.nome} onChange={e => setIdentificacao({...identificacao, nome: e.target.value})} className="h-12 rounded-xl bg-secondary/20 border-none" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">E-mail</Label>
                    <Input value={identificacao.email} disabled className="h-12 rounded-xl bg-secondary/10 border-none opacity-60" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">CPF</Label>
                    <Input value={identificacao.cpf} onChange={e => setIdentificacao({...identificacao, cpf: e.target.value})} className="h-12 rounded-xl bg-secondary/20 border-none" placeholder="000.000.000-00" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">Telefone</Label>
                    <Input value={identificacao.telefone} onChange={e => setIdentificacao({...identificacao, telefone: e.target.value})} className="h-12 rounded-xl bg-secondary/20 border-none" placeholder="(00) 00000-0000" />
                  </div>
                  <div className="md:col-span-2 pt-4">
                    <Button onClick={handleNextStep} className="w-full h-14 rounded-full bg-primary text-white font-bold uppercase tracking-widest text-[10px] shadow-lg">Ir para Entrega</Button>
                  </div>
                </div>
              )}
            </Card>

            {/* ETAPA 2: ENTREGA */}
            <Card className={cn(
              "rounded-[2.5rem] border-none shadow-sm transition-all duration-500 overflow-hidden",
              currentStep === 'entrega' ? "bg-white p-6 md:p-10 opacity-100" : "bg-white/40 p-6 opacity-60 pointer-events-none"
            )}>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">2</div>
                <h2 className="text-lg font-headline font-bold text-primary uppercase tracking-tight">Entrega</h2>
              </div>

              {currentStep === 'entrega' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="grid md:grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">CEP</Label>
                      <Input value={entrega.cep} onChange={e => handleCepSearch(e.target.value)} maxLength={9} className="h-12 rounded-xl bg-secondary/20 border-none" />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">Endereço</Label>
                      <Input value={entrega.endereco} onChange={e => setEntrega({...entrega, endereco: e.target.value})} className="h-12 rounded-xl bg-secondary/20 border-none" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">Número</Label>
                      <Input value={entrega.numero} onChange={e => setEntrega({...entrega, numero: e.target.value})} className="h-12 rounded-xl bg-secondary/20 border-none" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">Bairro</Label>
                      <Input value={entrega.bairro} onChange={e => setEntrega({...entrega, bairro: e.target.value})} className="h-12 rounded-xl bg-secondary/20 border-none" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">Cidade</Label>
                      <Input value={entrega.cidade} onChange={e => setEntrega({...entrega, cidade: e.target.value})} className="h-12 rounded-xl bg-secondary/20 border-none" />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label className="text-[10px] font-bold uppercase text-accent tracking-widest ml-1">Método de Envio</Label>
                    <div className="grid gap-3">
                      <button onClick={() => setShippingMethod('pac')} className={cn("flex items-center justify-between p-4 rounded-xl border transition-all", shippingMethod === 'pac' ? "border-primary bg-primary/5 shadow-sm" : "border-primary/5 bg-white")}>
                        <div className="flex items-center gap-3"><Truck className="h-4 w-4 text-primary/40" /><div className="text-left"><p className="text-xs font-bold text-primary">PAC Econômico</p><p className="text-[9px] text-muted-foreground">15-20 dias úteis</p></div></div>
                        <span className="text-xs font-bold text-emerald-600">GRÁTIS</span>
                      </button>
                      <button onClick={() => setShippingMethod('sedex')} className={cn("flex items-center justify-between p-4 rounded-xl border transition-all", shippingMethod === 'sedex' ? "border-primary bg-primary/5 shadow-sm" : "border-primary/5 bg-white")}>
                        <div className="flex items-center gap-3"><Truck className="h-4 w-4 text-accent" /><div className="text-left"><p className="text-xs font-bold text-primary">SEDEX VIP</p><p className="text-[9px] text-muted-foreground">7-10 dias úteis</p></div></div>
                        <span className="text-xs font-bold text-primary">R$ 25,90</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleNextStep} disabled={isProcessing} className="w-full h-14 rounded-full bg-primary text-white font-bold uppercase tracking-widest text-[10px]">
                      {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : 'Ir para Pagamento'}
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* ETAPA 3: PAGAMENTO (TRANSPARENTE) */}
            <Card className={cn(
              "rounded-[2.5rem] border-none shadow-sm transition-all duration-500 overflow-hidden",
              currentStep === 'pagamento' ? "bg-white p-6 md:p-10 opacity-100" : "bg-white/40 p-6 opacity-60 pointer-events-none"
            )}>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">3</div>
                <h2 className="text-lg font-headline font-bold text-primary uppercase tracking-tight">Pagamento Transparente</h2>
              </div>

              {currentStep === 'pagamento' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 min-h-[400px]">
                   {!isBrickReady && (
                     <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-accent/40" />
                        <p className="text-[9px] font-bold uppercase tracking-widest text-primary/20">Criptografando ambiente...</p>
                     </div>
                   )}
                   <Payment
                      initialization={{
                        amount: totalGeral,
                        payer: {
                          email: identificacao.email || user?.email || '',
                          firstName: identificacao.nome.split(' ')[0],
                          lastName: identificacao.nome.split(' ').slice(1).join(' '),
                          identification: { type: 'CPF', number: identificacao.cpf.replace(/\D/g, '') },
                        },
                      }}
                      customization={{
                        paymentMethods: {
                          creditCard: 'all',
                          debitCard: 'all',
                          bankTransfer: ['pix'],
                          ticket: ['bolbradesco'],
                        },
                        visual: {
                          style: {
                            theme: 'default',
                            customVariables: {
                              formBackgroundColor: '#ffffff',
                              baseColor: '#6E3C47',
                              buttonBackgroundColor: '#6E3C47',
                              buttonTextColor: '#ffffff',
                              borderRadiusLarge: '24px',
                            }
                          }
                        }
                      }}
                      onSubmit={handlePaymentSubmit}
                      onReady={() => setIsBrickReady(true)}
                    />
                </div>
              )}
            </Card>
          </div>

          {/* RESUMO LATERAL */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <Card className="rounded-[2.5rem] border-none bg-white shadow-premium p-8 space-y-6">
               <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
                  <Package className="h-4 w-4" />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.4em]">Resumo</h3>
               </div>

               <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                  {(sessionItems.length > 0 ? sessionItems : (order?.items || [])).map((item: any, i: number) => (
                    <div key={i} className="flex gap-4 items-center">
                       <div className="h-16 w-12 rounded-lg bg-secondary/30 overflow-hidden shrink-0">
                          <img src={item.image} className="h-full w-full object-cover" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-primary uppercase truncate">{item.name}</p>
                          <p className="text-[9px] text-muted-foreground italic">{item.quantity}un • {formatPrice(item.price)}</p>
                       </div>
                       <p className="text-[11px] font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
               </div>

               <div className="space-y-2 pt-4 border-t border-primary/5">
                  <div className="flex justify-between text-[11px] text-primary/40 uppercase"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between text-[11px] text-primary/40 uppercase"><span>Frete</span><span>{freteValor === 0 ? 'Grátis' : formatPrice(freteValor)}</span></div>
                  <div className="flex justify-between items-end pt-4">
                    <span className="text-xs font-black uppercase text-primary">Total</span>
                    <span className="text-2xl font-headline font-bold text-primary">{formatPrice(totalGeral)}</span>
                  </div>
               </div>
            </Card>

            <div className="p-6 bg-secondary/20 rounded-[2rem] space-y-3">
               <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  <h4 className="text-[9px] font-bold uppercase tracking-widest">Entrega Toda Bela</h4>
               </div>
               <p className="text-[10px] text-muted-foreground leading-relaxed italic font-light">
                 Sua seleção será preparada com cuidado editorial e enviada com seguro total.
               </p>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
