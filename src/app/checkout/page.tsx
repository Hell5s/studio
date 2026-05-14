
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
  CreditCard as CardIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import { LogoMark } from '@/components/store/LogoMark';
import { cn } from '@/lib/utils';

type Step = 'identificacao' | 'entrega' | 'pagamento';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  
  const orderId = searchParams.get('orderId');
  const preferenceId = searchParams.get('preferenceId');

  const [currentStep, setCurrentStep] = useState<Step>('identificacao');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_base64: string } | null>(null);
  const [shippingMethod, setShippingMethod] = useState<'pac' | 'sedex'>('pac');

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

  const [pagamento, setPagamento] = useState<'pix' | 'cartao' | 'boleto'>('pix');

  // Buscar detalhes do pedido
  const orderRef = useMemoFirebase(() => {
    return orderId ? doc(db, 'orders', orderId) : null;
  }, [db, orderId]);
  
  const { data: order, isLoading: isOrderLoading } = useDoc(orderRef);

  // Preencher e-mail automático
  useEffect(() => {
    if (user?.email) {
      setIdentificacao(prev => ({ ...prev, email: user.email || '' }));
    }
    if (order?.customer) {
      setIdentificacao(prev => ({ 
        ...prev, 
        nome: order.customer.name || '',
        telefone: order.customer.phone || ''
      }));
      setEntrega(prev => ({
        ...prev,
        cep: order.customer.zip || '',
        endereco: order.customer.address || '',
        cidade: order.customer.city || '',
        estado: order.customer.state || ''
      }));
    }
  }, [user, order]);

  // Busca CEP automático
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
        console.error("Erro ao buscar CEP");
      }
    }
  };

  const formatPrice = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const freteValor = shippingMethod === 'sedex' ? 25.90 : 0;
  const subtotal = order?.subtotal || 0;
  const totalGeral = Number((subtotal + freteValor).toFixed(2));

  const handleNextStep = async () => {
    if (currentStep === 'identificacao') {
      if (!identificacao.nome || !identificacao.cpf) {
        toast({ title: "Campos obrigatórios", description: "Por favor, preencha nome e CPF.", variant: "destructive" });
        return;
      }
      setCurrentStep('entrega');
    } else if (currentStep === 'entrega') {
      if (!entrega.cep || !entrega.numero) {
        toast({ title: "Dados de entrega", description: "Informe o CEP e o número da residência.", variant: "destructive" });
        return;
      }
      setCurrentStep('pagamento');
    }
  };

  const handleFinalizarCompra = async () => {
    if (!orderId) return;
    setIsProcessing(true);

    try {
      // Atualiza o pedido no Firestore com os dados finais
      await updateDoc(doc(db, 'orders', orderId), {
        customer: {
          ...order?.customer,
          name: identificacao.nome,
          cpf: identificacao.cpf,
          phone: identificacao.telefone,
          address: `${entrega.endereco}, ${entrega.numero} ${entrega.complemento}`,
          city: entrega.cidade,
          state: entrega.estado,
          zip: entrega.cep
        },
        total: totalGeral,
        shipping: {
          method: shippingMethod === 'sedex' ? 'SEDEX' : 'PAC',
          price: freteValor
        },
        updatedAt: serverTimestamp()
      });

      if (pagamento === 'pix') {
        // Sanitização rigorosa do valor para garantir ponto como decimal
        const amountToSend = Number(totalGeral.toString().replace(',', '.'));
        
        const pixPayload = { 
          formData: {
            transaction_amount: amountToSend,
            description: `Pedido #${order?.orderNumber} - Toda Bela`,
            external_reference: order?.orderNumber,
            payer: {
              email: identificacao.email,
              first_name: identificacao.nome.split(' ')[0],
              last_name: identificacao.nome.split(' ').slice(1).join(' ') || 'Cliente'
            }
          }
        };

        console.log('--- DEBUG PIX CHECKOUT ---');
        console.log('Enviando Objeto:', pixPayload);
        console.log('Valor Final (amountToSend):', amountToSend);
        console.log('Tipo do Valor:', typeof amountToSend);

        const response = await fetch('/api/checkout/pix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pixPayload),
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || data.message || 'Erro ao gerar PIX');
        setPixData(data);
      } else {
        // Redireciona para Checkout Pro para Cartão e Boleto
        window.location.href = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`;
      }
    } catch (error: any) {
      console.error('Erro no Checkout:', error);
      toast({ title: "Erro no checkout", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isOrderLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#FDFCFD] selection:bg-accent/30">
      {/* Header Minimalista */}
      <header className="bg-white border-b border-primary/5 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-24 flex items-center justify-between">
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

      <main className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
          
          {/* Coluna de Passos */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* ETAPA 1: IDENTIFICAÇÃO */}
            <Card className={cn(
              "rounded-[2.5rem] border-none shadow-sm transition-all duration-500 overflow-hidden",
              currentStep === 'identificacao' ? "bg-white p-8 md:p-12 opacity-100" : "bg-white/40 p-6 opacity-60 pointer-events-none"
            )}>
              <div className="flex items-center gap-4 mb-10">
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</div>
                <h2 className="text-xl font-headline font-bold text-primary uppercase tracking-tight">Dados de Identificação</h2>
              </div>

              {currentStep === 'identificacao' && (
                <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">Nome Completo</Label>
                    <Input value={identificacao.nome} onChange={e => setIdentificacao({...identificacao, nome: e.target.value})} className="h-14 rounded-xl bg-secondary/20 border-none" placeholder="Como impresso no cartão" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">E-mail</Label>
                    <Input value={identificacao.email} disabled className="h-14 rounded-xl bg-secondary/10 border-none opacity-60" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">CPF</Label>
                    <Input value={identificacao.cpf} onChange={e => setIdentificacao({...identificacao, cpf: e.target.value})} className="h-14 rounded-xl bg-secondary/20 border-none" placeholder="000.000.000-00" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">Telefone</Label>
                    <Input value={identificacao.telefone} onChange={e => setIdentificacao({...identificacao, telefone: e.target.value})} className="h-14 rounded-xl bg-secondary/20 border-none" placeholder="(00) 00000-0000" />
                  </div>
                  <div className="md:col-span-2 pt-6">
                    <Button onClick={handleNextStep} className="w-full h-16 rounded-full bg-primary text-white font-bold uppercase tracking-widest text-[11px] shadow-xl hover:scale-[1.02] transition-all">Ir para Entrega</Button>
                  </div>
                </div>
              )}
            </Card>

            {/* ETAPA 2: ENTREGA */}
            <Card className={cn(
              "rounded-[2.5rem] border-none shadow-sm transition-all duration-500 overflow-hidden",
              currentStep === 'entrega' ? "bg-white p-8 md:p-12 opacity-100" : "bg-white/40 p-6 opacity-60 pointer-events-none"
            )}>
              <div className="flex items-center gap-4 mb-10">
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</div>
                <h2 className="text-xl font-headline font-bold text-primary uppercase tracking-tight">Endereço de Entrega</h2>
              </div>

              {currentStep === 'entrega' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">CEP</Label>
                      <Input value={entrega.cep} onChange={e => handleCepSearch(e.target.value)} maxLength={9} className="h-14 rounded-xl bg-secondary/20 border-none" placeholder="00000-000" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">Endereço</Label>
                      <Input value={entrega.endereco} onChange={e => setEntrega({...entrega, endereco: e.target.value})} className="h-14 rounded-xl bg-secondary/20 border-none" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">Número</Label>
                      <Input value={entrega.numero} onChange={e => setEntrega({...entrega, numero: e.target.value})} className="h-14 rounded-xl bg-secondary/20 border-none" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">Complemento</Label>
                      <Input value={entrega.complemento} onChange={e => setEntrega({...entrega, complemento: e.target.value})} className="h-14 rounded-xl bg-secondary/20 border-none" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">Bairro</Label>
                      <Input value={entrega.bairro} onChange={e => setEntrega({...entrega, bairro: e.target.value})} className="h-14 rounded-xl bg-secondary/20 border-none" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">Cidade</Label>
                      <Input value={entrega.cidade} onChange={e => setEntrega({...entrega, cidade: e.target.value})} className="h-14 rounded-xl bg-secondary/20 border-none" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">Estado</Label>
                      <Input value={entrega.estado} onChange={e => setEntrega({...entrega, estado: e.target.value})} className="h-14 rounded-xl bg-secondary/20 border-none" />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <Label className="text-[10px] font-bold uppercase text-accent tracking-widest ml-1">Opções de Frete</Label>
                    <div className="grid gap-3">
                      <button 
                        onClick={() => setShippingMethod('pac')}
                        className={cn(
                          "flex items-center justify-between p-6 rounded-2xl border transition-all",
                          shippingMethod === 'pac' ? "border-primary bg-primary/5 shadow-md" : "border-primary/5 bg-white"
                        )}
                      >
                        <div className="flex items-center gap-4">
                           <Truck className="h-5 w-5 text-primary/40" />
                           <div className="text-left">
                              <p className="text-sm font-bold text-primary">PAC Econômico</p>
                              <p className="text-[10px] text-muted-foreground">15 a 20 dias úteis</p>
                           </div>
                        </div>
                        <span className="text-sm font-bold text-emerald-600">GRÁTIS</span>
                      </button>

                      <button 
                        onClick={() => setShippingMethod('sedex')}
                        className={cn(
                          "flex items-center justify-between p-6 rounded-2xl border transition-all",
                          shippingMethod === 'sedex' ? "border-primary bg-primary/5 shadow-md" : "border-primary/5 bg-white"
                        )}
                      >
                        <div className="flex items-center gap-4">
                           <Truck className="h-5 w-5 text-accent" />
                           <div className="text-left">
                              <p className="text-sm font-bold text-primary">SEDEX Express VIP</p>
                              <p className="text-[10px] text-muted-foreground">7 a 10 dias úteis</p>
                           </div>
                        </div>
                        <span className="text-sm font-bold text-primary">R$ 25,90</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button onClick={handleNextStep} className="w-full h-16 rounded-full bg-primary text-white font-bold uppercase tracking-widest text-[11px] shadow-xl">Ir para Pagamento</Button>
                  </div>
                </div>
              )}
            </Card>

            {/* ETAPA 3: PAGAMENTO */}
            <Card className={cn(
              "rounded-[2.5rem] border-none shadow-sm transition-all duration-500 overflow-hidden",
              currentStep === 'pagamento' ? "bg-white p-8 md:p-12 opacity-100" : "bg-white/40 p-6 opacity-60 pointer-events-none"
            )}>
              <div className="flex items-center gap-4 mb-10">
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</div>
                <h2 className="text-xl font-headline font-bold text-primary uppercase tracking-tight">Forma de Pagamento</h2>
              </div>

              {currentStep === 'pagamento' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2">
                  
                  {pixData ? (
                    <div className="text-center space-y-8 py-10 bg-secondary/10 rounded-[3rem] border border-primary/5">
                        <div className="space-y-4">
                           <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="h-6 w-6 text-emerald-500" /></div>
                           <h3 className="text-xl font-headline font-bold text-primary">Aguardando Pagamento PIX</h3>
                           <p className="text-xs text-muted-foreground italic font-light">Escaneie o código abaixo com seu banco.</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl inline-block shadow-lg border border-primary/5">
                           {pixData.qr_code_base64 && <img src={`data:image/png;base64,${pixData.qr_code_base64}`} className="w-56 h-56" />}
                        </div>
                        <div className="max-w-sm mx-auto space-y-4 px-6">
                           <div className="p-4 bg-gray-50 rounded-xl border border-dashed text-[9px] font-mono break-all">{pixData.qr_code}</div>
                           <Button onClick={() => { navigator.clipboard.writeText(pixData.qr_code); toast({ title: "Copiado!" }); }} className="w-full rounded-full h-14 bg-primary text-white font-bold uppercase tracking-widest text-[10px]">
                              <Copy className="h-4 w-4 mr-3" /> Copiar Código
                           </Button>
                        </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex bg-secondary/20 p-1.5 rounded-2xl">
                        {[
                          { id: 'pix', label: 'PIX', icon: <QrCode className="h-4 w-4" /> },
                          { id: 'cartao', label: 'Cartão', icon: <CardIcon className="h-4 w-4" /> },
                          { id: 'boleto', label: 'Boleto', icon: <FileText className="h-4 w-4" /> }
                        ].map(t => (
                          <button
                            key={t.id}
                            onClick={() => setPagamento(t.id as any)}
                            className={cn(
                              "flex-1 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3",
                              pagamento === t.id ? "bg-white text-primary shadow-sm" : "text-primary/40 hover:bg-white/50"
                            )}
                          >
                            {t.icon} {t.label}
                          </button>
                        ))}
                      </div>

                      <div className="min-h-[200px]">
                         {pagamento === 'pix' && (
                           <div className="space-y-6 text-center py-6">
                              <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-sm"><QrCode className="h-8 w-8" /></div>
                              <div className="space-y-2">
                                <p className="font-bold text-primary uppercase text-sm">Pagamento Instantâneo via PIX</p>
                                <p className="text-xs text-muted-foreground italic font-light">Liberação imediata do pedido. O QR Code será gerado após clicar em finalizar.</p>
                              </div>
                           </div>
                         )}

                         {pagamento === 'cartao' && (
                            <div className="grid md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
                               <div className="md:col-span-2 space-y-2">
                                 <Label className="text-[9px] font-bold uppercase text-primary/40 ml-1">Número do Cartão</Label>
                                 <Input className="h-14 rounded-xl bg-secondary/20 border-none" placeholder="0000 0000 0000 0000" />
                               </div>
                               <div className="space-y-2">
                                 <Label className="text-[9px] font-bold uppercase text-primary/40 ml-1">Validade</Label>
                                 <Input className="h-14 rounded-xl bg-secondary/20 border-none" placeholder="MM/AA" />
                               </div>
                               <div className="space-y-2">
                                 <Label className="text-[9px] font-bold uppercase text-primary/40 ml-1">CVV</Label>
                                 <Input className="h-14 rounded-xl bg-secondary/20 border-none" placeholder="123" />
                               </div>
                               <div className="md:col-span-2 space-y-2">
                                 <Label className="text-[9px] font-bold uppercase text-primary/40 ml-1">Nome no Cartão</Label>
                                 <Input className="h-14 rounded-xl bg-secondary/20 border-none uppercase" />
                               </div>
                            </div>
                         )}

                         {pagamento === 'boleto' && (
                            <div className="space-y-6 text-center py-6">
                               <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-primary/40 shadow-sm"><FileText className="h-8 w-8" /></div>
                               <div className="space-y-2">
                                 <p className="font-bold text-primary uppercase text-sm">Boleto Bancário</p>
                                 <p className="text-xs text-muted-foreground italic font-light">Compensação em até 48 horas úteis após o pagamento.</p>
                               </div>
                            </div>
                         )}
                      </div>

                      <Button 
                        onClick={handleFinalizarCompra} 
                        disabled={isProcessing}
                        className="w-full h-20 rounded-full bg-primary text-white font-bold uppercase tracking-[0.3em] text-[12px] shadow-2xl hover:scale-[1.02] transition-all"
                      >
                        {isProcessing ? <Loader2 className="animate-spin h-6 w-6" /> : 'Finalizar Escolha'}
                      </Button>
                    </>
                  )}

                  <div className="pt-8 border-t border-primary/5 flex items-center justify-center gap-3">
                    <Lock className="h-3 w-3 text-emerald-500" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary/30">Criptografia de 256 bits com segurança SSL</span>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Coluna Resumo - Sticky */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-36">
            <Card className="rounded-[2.5rem] border-none bg-white shadow-premium p-8 space-y-8">
               <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
                  <Package className="h-4 w-4" />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.4em]">Resumo do Pedido</h3>
               </div>

               <div className="space-y-6 max-h-[350px] overflow-y-auto no-scrollbar">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4 items-center">
                       <div className="h-20 w-16 rounded-xl bg-secondary/30 overflow-hidden shrink-0">
                          <img src={item.image} className="h-full w-full object-cover" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-primary uppercase truncate">{item.name}</p>
                          <p className="text-[9px] text-muted-foreground italic">{item.quantity}un • {formatPrice(item.price)}</p>
                          {(item.selectedSize || item.selectedColor) && (
                            <p className="text-[8px] font-black uppercase text-accent mt-1 tracking-tighter">
                              {item.selectedSize} | {item.selectedColor}
                            </p>
                          )}
                       </div>
                       <p className="text-[11px] font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
               </div>

               <div className="space-y-3 pt-6 border-t border-primary/5">
                  <div className="flex justify-between text-[11px] font-medium text-primary/40 uppercase">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-medium text-primary/40 uppercase">
                    <span>Frete</span>
                    <span className={cn(freteValor === 0 ? "text-emerald-600 font-bold" : "")}>{freteValor === 0 ? 'Grátis' : formatPrice(freteValor)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-4">
                    <span className="text-xs font-black uppercase tracking-widest text-primary">Total</span>
                    <span className="text-3xl font-headline font-bold text-primary leading-none">{formatPrice(totalGeral)}</span>
                  </div>
               </div>
            </Card>

            <div className="p-8 bg-secondary/20 rounded-[2.5rem] space-y-4">
               <div className="flex items-center gap-3 text-primary">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest">Entrega Toda Bela</h4>
               </div>
               <p className="text-[11px] text-muted-foreground leading-relaxed italic font-light">
                 Suas peças são selecionadas e embaladas com cuidado editorial. O código de rastreio será enviado via e-mail e WhatsApp em até 3 dias úteis após a confirmação.
               </p>
            </div>
          </aside>

        </div>
      </main>

      <footer className="py-12 border-t border-primary/5 text-center">
         <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-primary/20">© Toda Bela Boutique • Processamento Seguro via Mercado Pago</p>
      </footer>
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
