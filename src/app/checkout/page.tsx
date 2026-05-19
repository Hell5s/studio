"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  MapPin, 
  User, 
  Loader2, 
  Package,
  Truck,
  CreditCard,
  Lock,
  QrCode,
  Copy,
  CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useMemoFirebase, useAuth } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link';
import { LogoMark } from '@/components/store/LogoMark';
import { cn } from '@/lib/utils';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

type Step = 'identificacao' | 'entrega' | 'pagamento';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const auth = useAuth();
  
  const [currentStep, setCurrentStep] = useState<Step>('identificacao');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'pac' | 'sedex'>('pac');
  const [sessionItems, setSessionItems] = useState<any[]>([]);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isBrickReady, setIsBrickReady] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Auth States
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [authForm, setAuthForm] = useState({ email: '', password: '', nome: '' });
  const [authLoading, setAuthLoading] = useState(false);

  // Novos estados para o fluxo de pagamento personalizado
  const [paymentMethod, setPaymentMethod] = useState<'cartao' | 'pix' | 'boleto'>('cartao');
  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_base64: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Inicializa o SDK do Mercado Pago apenas quando necessário
  useEffect(() => {
    if (currentStep === 'pagamento') {
      initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || 'APP_USR-a7da70eb-433e-41a8-bd29-55ef74c24025', {
        locale: 'pt-BR',
      });
    }
  }, [currentStep]);

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
    
    const timer = setTimeout(() => {
        setIsCheckingSession(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Preencher dados automático
  useEffect(() => {
    if (user?.email) {
      setIdentificacao(prev => ({ 
        ...prev, 
        email: user.email || '',
        nome: user.displayName || prev.nome
      }));
    }
  }, [user]);

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "Bem-vinda!", description: "Conta verificada com sucesso." });
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível entrar com Google.", variant: "destructive" });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (authMode === 'register') {
        await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
        setIdentificacao(prev => ({ ...prev, email: authForm.email, nome: authForm.nome }));
        toast({ title: "Conta criada!", description: "Bem-vinda à Toda Bela." });
      } else {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
        toast({ title: "Olá novamente!" });
      }
    } catch (e: any) {
      toast({ title: "Erro", description: "Verifique suas credenciais.", variant: "destructive" });
    } finally {
      setAuthLoading(false);
    }
  };

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
    return sessionItems.reduce((acc, it) => acc + ((it.price || 0) * (it.quantity || 1)), 0);
  }, [sessionItems]);

  const freteValor = shippingMethod === 'sedex' ? 25.90 : 0;
  const totalGeral = Number((subtotal + freteValor).toFixed(2));

  // Memoização das configurações do Mercado Pago para evitar erros de inicialização
  const paymentInitialization = useMemo(() => {
    const cleanCpf = identificacao.cpf.replace(/\D/g, '');
    const names = identificacao.nome.trim().split(' ');
    
    return {
      amount: totalGeral,
      payer: {
        email: identificacao.email || user?.email || '',
        firstName: names[0] || 'Cliente',
        lastName: names.slice(1).join(' ') || 'Toda Bela',
        identification: { 
          type: 'CPF', 
          number: cleanCpf 
        },
      },
    };
  }, [totalGeral, identificacao, user?.email]);

  const handleNextStep = async () => {
    if (currentStep === 'identificacao') {
      const cleanCpf = identificacao.cpf.replace(/\D/g, '');
      const cleanTelefone = identificacao.telefone.replace(/\D/g, '');
      
      if (!identificacao.nome || !identificacao.email || cleanCpf.length < 11 || cleanTelefone.length < 10) {
        toast({ 
          title: "Campos obrigatórios", 
          description: "Preencha seu nome completo, e-mail, CPF e um telefone válido para continuar.", 
          variant: "destructive" 
        });
        return;
      }
      setCurrentStep('entrega');
    } else if (currentStep === 'entrega') {
      if (!entrega.cep || !entrega.numero || !entrega.endereco) {
        toast({ title: "Dados de entrega", description: "Informe o CEP, número e endereço completo.", variant: "destructive" });
        return;
      }
      
      setIsProcessing(true);
      try {
        const finalId = orderId || `PED-${Date.now().toString().slice(-6)}`;
        setOrderId(finalId);

        await setDoc(doc(db, 'orders', finalId), {
          orderNumber: finalId,
          userId: user?.uid || null,
          items: sessionItems,
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
          createdAt: serverTimestamp()
        }, { merge: true });

        setCurrentStep('pagamento');
      } catch (e) {
        toast({ title: "Erro ao processar", description: "Não foi possível salvar seu pedido. Tente novamente.", variant: "destructive" });
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
            transaction_amount: totalGeral,
            external_reference: orderId,
            description: `Pedido Toda Bela #${orderId}`,
            payer: {
              ...formData.payer,
              email: formData.payer?.email || identificacao.email || user?.email || '',
              first_name: formData.payer?.firstName || identificacao.nome.split(' ')[0],
              last_name: formData.payer?.lastName || identificacao.nome.split(' ').slice(1).join(' ') || 'Toda Bela',
              identification: formData.payer?.identification || { type: 'CPF', number: identificacao.cpf.replace(/\D/g, '') },
            },
          }
        }),
      });

      const paymentResult = await response.json();

      if (!response.ok) throw new Error(paymentResult.message || 'Erro ao processar pagamento');

      if (paymentResult.status === 'approved') {
        sessionStorage.removeItem('checkout_items');
        router.push('/pedido-confirmado');
      } else if (paymentResult.status === 'in_process' || paymentResult.status === 'pending') {
        sessionStorage.removeItem('checkout_items');
        if (paymentResult.payment_method_id === 'pix' && paymentResult.point_of_interaction?.transaction_data) {
          sessionStorage.setItem('pix_data', JSON.stringify({
            qr_code: paymentResult.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: paymentResult.point_of_interaction.transaction_data.qr_code_base64,
            ticket_url: paymentResult.point_of_interaction.transaction_data.ticket_url,
            orderId: paymentResult.external_reference,
            amount: paymentResult.transaction_amount,
          }));
          router.push('/pedido-pendente?metodo=pix');
        } else {
          router.push('/pedido-pendente');
        }
      } else {
        toast({ title: "Pagamento Recusado", description: "Verifique os dados do cartão ou escolha outro método.", variant: "destructive" });
      }
    } catch (error: any) {
      console.error('Payment Error:', error);
      toast({ title: "Erro no Checkout", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePixPayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: {
            payment_method_id: 'pix',
            transaction_amount: totalGeral,
            external_reference: orderId,
            description: `Pedido Toda Bela #${orderId}`,
            payer: {
              email: identificacao.email || user?.email || '',
              first_name: identificacao.nome.split(' ')[0],
              last_name: identificacao.nome.split(' ').slice(1).join(' ') || 'Toda Bela',
              identification: { type: 'CPF', number: identificacao.cpf.replace(/\D/g, '') },
            },
          }
        }),
      });
      const result = await response.json();
      
      console.log('Resposta completa MP:', JSON.stringify(result, null, 2));
      if (!response.ok) {
        throw new Error(
          result?.cause?.[0]?.description 
          || result?.detail?.[0]?.description 
          || result?.message 
          || 'Erro desconhecido'
        );
      }

      if (result.point_of_interaction?.transaction_data) {
        sessionStorage.removeItem('checkout_items');
        setPixData({
          qr_code: result.point_of_interaction.transaction_data.qr_code,
          qr_code_base64: result.point_of_interaction.transaction_data.qr_code_base64,
        });
      } else {
        throw new Error('QR Code não retornado pelo Mercado Pago');
      }
    } catch (error: any) {
      console.error('Payment Error completo:', error);
      let errorMsg = error.message;
      try {
        const errData = typeof error === 'object' ? error : JSON.parse(error);
        errorMsg = errData?.detail?.[0]?.description 
          || errData?.cause?.[0]?.description 
          || errData?.message 
          || error.message;
      } catch {}
      toast({ 
        title: "Erro ao gerar PIX", 
        description: errorMsg, 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPix = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const formatPrice = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  if (isCheckingSession) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40 animate-pulse text-center px-6">Sincronizando sua sacola...</p>
      </div>
    );
  }

  if (sessionItems.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white p-10 text-center space-y-8">
        <Package className="h-16 w-16 text-primary/10" />
        <div className="space-y-2">
            <h1 className="text-2xl font-headline font-bold text-primary">Sua sacola está vazia</h1>
            <p className="text-muted-foreground italic font-light">Selecione peças extraordinárias antes de finalizar sua compra.</p>
        </div>
        <Button onClick={() => router.push('/')} className="rounded-full h-14 px-10 bg-primary text-white w-full max-w-xs">Voltar para a Loja</Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFCFD] flex flex-col items-center justify-center px-4 py-12 w-full max-w-full overflow-x-hidden">
        <div className="w-full max-w-md space-y-8 px-2">
          <div className="text-center space-y-3 px-4">
            <div className="flex justify-center mb-4"><LogoMark /></div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40">Para finalizar sua compra</p>
            <h1 className="text-3xl font-headline font-bold text-primary">Acesse sua conta</h1>
            <p className="text-sm text-muted-foreground italic font-light">Entre ou crie sua conta Toda Bela para continuar</p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm space-y-6 w-full box-border">
            <button
              onClick={handleGoogleAuth}
              disabled={authLoading}
              className="w-full h-14 flex items-center justify-center gap-3 border border-primary/10 rounded-full hover:bg-secondary/30 transition-all box-border"
            >
              {authLoading ? <Loader2 className="animate-spin h-4 w-4" /> : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Continuar com Google</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-primary/5" />
              <span className="text-[9px] text-primary/30 uppercase font-bold">ou</span>
              <div className="h-px flex-1 bg-primary/5" />
            </div>

            {!authMode && (
              <div className="grid grid-cols-2 gap-3 w-full">
                <button onClick={() => setAuthMode('login')} className="h-12 rounded-full border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all box-border">
                  Entrar
                </button>
                <button onClick={() => setAuthMode('register')} className="h-12 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-all box-border">
                  Criar Conta
                </button>
              </div>
            )}

            {authMode && (
              <form onSubmit={handleEmailAuth} className="space-y-4 w-full box-border">
                {authMode === 'register' && (
                  <div className="space-y-1.5 w-full">
                    <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">Nome Completo</Label>
                    <Input value={authForm.nome} onChange={e => setAuthForm({...authForm, nome: e.target.value})} className="h-12 rounded-xl bg-secondary/20 border-none px-4 w-full box-border" required />
                  </div>
                )}
                <div className="space-y-1.5 w-full">
                  <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">E-mail</Label>
                  <Input type="email" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} className="h-12 rounded-xl bg-secondary/20 border-none px-4 w-full box-border" required />
                </div>
                <div className="space-y-1.5 w-full">
                  <Label className="text-[10px] font-bold uppercase text-primary/40 ml-1">Senha</Label>
                  <Input type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="h-12 rounded-xl bg-secondary/20 border-none px-4 w-full box-border" required />
                </div>
                <Button disabled={authLoading} className="w-full h-12 rounded-full bg-primary text-white font-bold uppercase tracking-widest text-[10px] shadow-lg box-border">
                  {authLoading ? <Loader2 className="animate-spin h-4 w-4" /> : authMode === 'register' ? 'Criar Minha Conta' : 'Entrar na Conta'}
                </Button>
                <button type="button" onClick={() => setAuthMode(null)} className="w-full text-center text-[9px] font-bold uppercase text-primary/30 hover:text-primary py-2">
                  Voltar para opções
                </button>
              </form>
            )}
          </div>

          <button onClick={() => router.back()} className="w-full text-center text-[9px] font-bold uppercase tracking-widest text-primary/30 hover:text-primary flex items-center justify-center gap-2 py-4">
            <ChevronLeft className="h-3 w-3" /> Voltar para a loja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFD] selection:bg-accent/30" style={{ width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <header className="bg-white border-b border-primary/5 sticky top-0 z-50 w-full max-w-full">
        <div className="w-full px-4 md:px-6 h-16 md:h-24 flex flex-wrap items-center justify-between gap-2">
          <div className="flex-1 flex items-center min-w-[80px]">
             <button onClick={() => router.back()} className="text-primary/40 hover:text-primary transition-colors flex items-center gap-1 md:gap-2 text-[8px] md:text-[10px] font-bold uppercase tracking-widest">
                <ChevronLeft className="h-4 w-4 shrink-0" /> <span className="hidden sm:inline">Voltar</span>
             </button>
          </div>
          
          <Link href="/" className="flex shrink-0"><LogoMark className="md:scale-100 max-w-[140px]" /></Link>
          
          <div className="flex-1 flex justify-end min-w-[80px]">
            <div className="flex items-center gap-1 md:gap-2 text-emerald-600">
                <ShieldCheck className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest hidden xs:inline">Seguro</span>
            </div>
          </div>
        </div>

        <div className="bg-secondary/10 py-2 md:py-3 w-full overflow-hidden">
            <div className="max-w-md mx-auto flex items-center justify-between px-4 md:px-6 w-full">
                {[
                    { id: 'identificacao', label: 'Dados' },
                    { id: 'entrega', label: 'Entrega' },
                    { id: 'pagamento', label: 'Pague' }
                ].map((s, idx) => (
                    <React.Fragment key={s.id}>
                        <div className={cn(
                            "flex items-center gap-1.5 md:gap-2 text-[7px] md:text-[9px] font-bold uppercase tracking-widest",
                            currentStep === s.id ? "text-primary" : "text-primary/30"
                        )}>
                            <span className={cn(
                                "h-4 w-4 md:h-5 md:w-5 rounded-full flex items-center justify-center text-[8px] md:text-[10px]",
                                currentStep === s.id ? "bg-primary text-white" : "bg-primary/5"
                            )}>{idx + 1}</span>
                            <span className="hidden sm:inline">{s.label === 'Pague' ? 'Pagamento' : s.label}</span>
                            <span className="sm:hidden">{s.label}</span>
                        </div>
                        {idx < 2 && <ChevronRight className="h-3 w-3 text-primary/10" />}
                    </React.Fragment>
                ))}
            </div>
        </div>
      </header>

      <main className="w-full px-4 md:px-6 py-6 md:py-16" style={{ boxSizing: 'border-box', maxWidth: '100%' }}>
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-6xl mx-auto w-full box-border">
          
          <div className="lg:col-span-8 space-y-4 md:space-y-6 w-full box-border overflow-hidden">
            
            {/* ETAPA 1: IDENTIFICAÇÃO */}
            <Card className={cn(
              "rounded-[1.5rem] md:rounded-[2.5rem] border-none shadow-sm transition-all duration-500 w-full box-border",
              currentStep === 'identificacao' ? "bg-white px-3 py-5 md:p-10 opacity-100" : "bg-white/40 px-3 py-5 opacity-60 pointer-events-none"
            )}>
              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <User className="h-5 w-5 text-accent" />
                <h2 className="text-base md:text-lg font-headline font-bold text-primary uppercase tracking-tight">Identificação</h2>
              </div>

              {currentStep === 'identificacao' && (
                <div className="grid md:grid-cols-2 gap-4 md:gap-5 animate-in fade-in slide-in-from-bottom-2 w-full box-border">
                  <div className="md:col-span-2 space-y-1.5 w-full">
                    <Label className="text-[9px] md:text-[10px] font-bold uppercase text-primary/40 ml-1">Nome Completo</Label>
                    <Input value={identificacao.nome} onChange={e => setIdentificacao({...identificacao, nome: e.target.value})} className="h-12 md:h-14 rounded-xl bg-secondary/20 border-none px-4 w-full box-border" required />
                  </div>
                  <div className="space-y-1.5 w-full">
                    <Label className="text-[9px] md:text-[10px] font-bold uppercase text-primary/40 ml-1">E-mail</Label>
                    <Input type="email" value={identificacao.email} onChange={e => setIdentificacao({...identificacao, email: e.target.value})} className="h-12 md:h-14 rounded-xl bg-secondary/20 border-none px-4 w-full box-border" required />
                  </div>
                  <div className="space-y-1.5 w-full">
                    <Label className="text-[9px] md:text-[10px] font-bold uppercase text-primary/40 ml-1">CPF</Label>
                    <Input value={identificacao.cpf} onChange={e => setIdentificacao({...identificacao, cpf: e.target.value})} className="h-12 md:h-14 rounded-xl bg-secondary/20 border-none px-4 w-full box-border" placeholder="000.000.000-00" required />
                  </div>
                  <div className="md:col-span-2 space-y-1.5 w-full">
                    <Label className="text-[9px] md:text-[10px] font-bold uppercase text-primary/40 ml-1">Telefone / WhatsApp</Label>
                    <Input value={identificacao.telefone} onChange={e => setIdentificacao({...identificacao, telefone: e.target.value})} className="h-12 md:h-14 rounded-xl bg-secondary/20 border-none px-4 w-full box-border" placeholder="(00) 00000-0000" required />
                  </div>
                  <div className="md:col-span-2 pt-2 md:pt-4 w-full">
                    <Button onClick={handleNextStep} className="w-full h-14 rounded-full bg-primary text-white font-bold uppercase whitespace-normal tracking-normal md:tracking-widest text-[10px] shadow-lg box-border">Continuar para Entrega</Button>
                  </div>
                </div>
              )}
            </Card>

            {/* ETAPA 2: ENTREGA */}
            <Card className={cn(
              "rounded-[1.5rem] md:rounded-[2.5rem] border-none shadow-sm transition-all duration-500 w-full box-border",
              currentStep === 'entrega' ? "bg-white px-3 py-5 md:p-10 opacity-100" : "bg-white/40 px-3 py-5 opacity-60 pointer-events-none"
            )}>
              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <MapPin className="h-5 w-5 text-accent" />
                <h2 className="text-base md:text-lg font-headline font-bold text-primary uppercase tracking-tight">Entrega</h2>
              </div>

              {currentStep === 'entrega' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 w-full box-border">
                  <div className="grid md:grid-cols-3 gap-4 md:gap-5 w-full box-border">
                    <div className="space-y-1.5 w-full">
                      <Label className="text-[9px] md:text-[10px] font-bold uppercase text-primary/40 ml-1">CEP</Label>
                      <Input value={entrega.cep} onChange={e => handleCepSearch(e.target.value)} maxLength={9} className="h-12 md:h-14 rounded-xl bg-secondary/20 border-none px-4 w-full box-border" />
                    </div>
                    <div className="md:col-span-2 space-y-1.5 w-full">
                      <Label className="text-[9px] md:text-[10px] font-bold uppercase text-primary/40 ml-1">Endereço</Label>
                      <Input value={entrega.endereco} onChange={e => setEntrega({...entrega, endereco: e.target.value})} className="h-12 md:h-14 rounded-xl bg-secondary/20 border-none px-4 w-full box-border" />
                    </div>
                    <div className="space-y-1.5 w-full">
                      <Label className="text-[9px] md:text-[10px] font-bold uppercase text-primary/40 ml-1">Número</Label>
                      <Input value={entrega.numero} onChange={e => setEntrega({...entrega, numero: e.target.value})} className="h-12 md:h-14 rounded-xl bg-secondary/20 border-none px-4 w-full box-border" />
                    </div>
                    <div className="space-y-1.5 w-full">
                      <Label className="text-[9px] md:text-[10px] font-bold uppercase text-primary/40 ml-1">Cidade</Label>
                      <Input value={entrega.cidade} onChange={e => setEntrega({...entrega, city: e.target.value})} className="h-12 md:h-14 rounded-xl bg-secondary/20 border-none px-4 w-full box-border" />
                    </div>
                    <div className="space-y-1.5 w-full">
                      <Label className="text-[9px] md:text-[10px] font-bold uppercase text-primary/40 ml-1">UF</Label>
                      <Input value={entrega.estado} onChange={e => setEntrega({...entrega, estado: e.target.value.toUpperCase()})} maxLength={2} className="h-12 md:h-14 rounded-xl bg-secondary/20 border-none px-4 w-full box-border" />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 w-full box-border">
                    <Label className="text-[10px] font-bold uppercase text-accent tracking-widest ml-1">Opção de Envio</Label>
                    <div className="grid gap-3 w-full">
                      <button onClick={() => setShippingMethod('pac')} className={cn("flex items-center justify-between p-4 rounded-xl border transition-all w-full box-border", shippingMethod === 'pac' ? "border-primary bg-primary/5 shadow-sm" : "border-primary/5 bg-white")}>
                        <div className="flex items-center gap-3"><Truck className="h-4 w-4 text-primary/40" /><div className="text-left"><p className="text-xs font-bold text-primary">PAC Econômico</p><p className="text-[9px] text-muted-foreground">15-20 dias úteis</p></div></div>
                        <span className="text-xs font-bold text-emerald-600">GRÁTIS</span>
                      </button>
                      <button onClick={() => setShippingMethod('sedex')} className={cn("flex items-center justify-between p-4 rounded-xl border transition-all w-full box-border", shippingMethod === 'sedex' ? "border-primary bg-primary/5 shadow-sm" : "border-primary/5 bg-white")}>
                        <div className="flex items-center gap-3"><Truck className="h-4 w-4 text-accent" /><div className="text-left"><p className="text-xs font-bold text-primary">SEDEX VIP</p><p className="text-[9px] text-muted-foreground">7-10 dias úteis</p></div></div>
                        <span className="text-xs font-bold text-primary">R$ 25,90</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 md:pt-4 flex flex-col sm:flex-row gap-3 w-full box-border">
                    <Button variant="outline" onClick={() => setCurrentStep('identificacao')} className="h-14 px-8 rounded-full border-primary/10 text-primary uppercase text-[10px] font-bold order-2 sm:order-1 w-full sm:w-auto box-border">Voltar</Button>
                    <Button onClick={handleNextStep} disabled={isProcessing} className="flex-1 h-14 rounded-full bg-primary text-white font-bold uppercase whitespace-normal tracking-normal md:tracking-widest text-[10px] order-1 sm:order-2 shadow-lg w-full box-border">
                      {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : 'Confirmar Entrega'}
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* ETAPA 3: PAGAMENTO (TRANSPARENTE) */}
            <Card className={cn(
              "rounded-[1.5rem] md:rounded-[2.5rem] border-none shadow-sm transition-all duration-500 w-full box-border",
              currentStep === 'pagamento' ? "bg-white px-3 py-5 md:p-10 opacity-100" : "bg-white/40 px-3 py-5 opacity-60 pointer-events-none"
            )}>
              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <CreditCard className="h-5 w-5 text-accent" />
                <h2 className="text-base md:text-lg font-headline font-bold text-primary uppercase tracking-tight">Pagamento Seguro</h2>
              </div>

              {currentStep === 'pagamento' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6 w-full box-border">

                  {!pixData && (
                    <>
                      {/* Seletor de método */}
                      <div className="grid grid-cols-3 gap-2 md:gap-3 px-1 w-full box-border">
                        <button
                          onClick={() => setPaymentMethod('cartao')}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 md:p-4 rounded-2xl border transition-all text-[8px] md:text-[10px] font-bold uppercase tracking-widest w-full box-border",
                            paymentMethod === 'cartao' ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-primary/10 text-primary/40"
                          )}
                        >
                          <CreditCard className="h-5 w-5" />
                          <span className="text-center">Cartão</span>
                        </button>
                        <button
                          onClick={() => setPaymentMethod('pix')}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 md:p-4 rounded-2xl border transition-all text-[8px] md:text-[10px] font-bold uppercase tracking-widest w-full box-border",
                            paymentMethod === 'pix' ? "border-accent bg-accent/5 text-accent shadow-sm" : "border-primary/10 text-primary/40"
                          )}
                        >
                          <QrCode className="h-5 w-5" />
                          <span className="text-center">PIX</span>
                        </button>
                        <button
                          onClick={() => setPaymentMethod('boleto')}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 md:p-4 rounded-2xl border transition-all text-[8px] md:text-[10px] font-bold uppercase tracking-widest w-full box-border",
                            paymentMethod === 'boleto' ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-primary/10 text-primary/40"
                          )}
                        >
                          <Package className="h-5 w-5" />
                          <span className="text-center">Boleto</span>
                        </button>
                      </div>

                      {/* PIX: botão direto */}
                      {paymentMethod === 'pix' && (
                        <div className="flex flex-col items-center gap-6 py-6 md:py-8 w-full box-border">
                          <div className="h-16 w-16 md:h-20 md:w-20 bg-accent/10 rounded-full flex items-center justify-center">
                            <QrCode className="h-8 w-8 md:h-10 md:w-10 text-accent" />
                          </div>
                          <div className="text-center space-y-2 px-4">
                            <p className="text-sm font-bold text-primary">Pague com PIX</p>
                            <p className="text-[11px] text-muted-foreground italic leading-relaxed">Clique abaixo para gerar o QR Code. O pagamento é confirmado em segundos e seu pedido entra em produção imediatamente.</p>
                          </div>
                          <Button
                            onClick={handlePixPayment}
                            disabled={isProcessing}
                            className="h-14 px-12 rounded-full bg-accent text-white font-bold uppercase tracking-widest text-[10px] shadow-lg w-full max-w-xs box-border"
                          >
                            {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : 'Gerar QR Code PIX'}
                          </Button>
                        </div>
                      )}

                      {/* Cartão e Boleto: usa o Brick normalmente */}
                      {(paymentMethod === 'cartao' || paymentMethod === 'boleto') && (
                        <div className="min-h-[400px] w-full box-border">
                          {!isBrickReady && (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4 w-full">
                              <Loader2 className="h-8 w-8 animate-spin text-accent/40" />
                              <p className="text-[9px] font-bold uppercase tracking-widest text-primary/20">Criptografando ambiente seguro...</p>
                            </div>
                          )}
                          <Payment
                            initialization={paymentInitialization}
                            customization={{
                              paymentMethods: {
                                creditCard: paymentMethod === 'cartao' ? 'all' : undefined,
                                debitCard: paymentMethod === 'cartao' ? 'all' : undefined,
                                ticket: paymentMethod === 'boleto' ? ['bolbradesco'] : undefined,
                              },
                              visual: {
                                style: {
                                  theme: 'default' as const,
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
                    </>
                  )}

                  {/* QR Code gerado */}
                  {pixData && (
                    <div className="flex flex-col items-center gap-6 py-4 animate-in zoom-in-95 w-full box-border overflow-hidden">
                      <div className="bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-primary/5 max-w-full">
                        <img
                          src={`data:image/png;base64,${pixData.qr_code_base64}`}
                          alt="QR Code PIX"
                          className="w-52 h-56 md:w-64 md:h-64 max-w-full"
                        />
                      </div>
                      <div className="w-full max-w-md space-y-4 px-4 box-border">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 text-center">PIX Copia e Cola</p>
                        <div className="flex flex-col sm:flex-row gap-3 w-full box-border">
                          <div className="flex-1 bg-secondary/20 rounded-xl px-4 py-3.5 text-[10px] text-primary/60 font-mono truncate border border-primary/5 w-full box-border">
                            {pixData.qr_code}
                          </div>
                          <button
                            onClick={handleCopyPix}
                            className="shrink-0 h-12 px-6 rounded-xl bg-primary text-white flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-all shadow-md w-full sm:w-auto box-border"
                          >
                            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copied ? 'Copiado!' : 'Copiar Código'}
                          </button>
                        </div>
                        <p className="text-[9px] text-center text-muted-foreground uppercase tracking-widest opacity-60">
                          QR Code válido por 30 minutos • Pagamento instantâneo
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-primary/5 w-full">
                    <button onClick={() => setCurrentStep('entrega')} className="text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-primary flex items-center gap-2 py-2">
                      <ChevronLeft className="h-3 w-3" /> Alterar Dados de Entrega
                    </button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* RESUMO LATERAL */}
          <aside className="lg:col-span-4 space-y-4 md:space-y-6 lg:sticky lg:top-24 w-full box-border">
            <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-none bg-white shadow-premium p-6 md:p-8 space-y-6 w-full box-border">
               <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
                  <Package className="h-4 w-4" />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.4em]">Sua Escolha</h3>
               </div>

               <div className="space-y-4 max-h-[250px] md:max-h-[300px] overflow-y-auto no-scrollbar pr-1 w-full box-border">
                  {sessionItems.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4 items-center w-full overflow-hidden">
                       <div className="h-16 w-12 rounded-lg bg-secondary/30 overflow-hidden shrink-0 border border-primary/5">
                          <img src={item.image} className="h-full w-full object-cover" alt={item.name} />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-primary uppercase truncate w-full">{item.name}</p>
                          <p className="text-[9px] text-muted-foreground italic truncate w-full">{item.quantity}un • {formatPrice(item.price)}</p>
                       </div>
                       <p className="text-[11px] font-bold text-primary whitespace-nowrap shrink-0">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
               </div>

               <div className="space-y-2.5 pt-4 border-t border-primary/5 w-full">
                  <div className="flex justify-between text-[11px] text-primary/40 uppercase font-bold tracking-tight"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between text-[11px] text-primary/40 uppercase font-bold tracking-tight"><span>Envio Especial</span><span>{freteValor === 0 ? 'Grátis' : formatPrice(freteValor)}</span></div>
                  <div className="flex justify-between items-end pt-4 w-full">
                    <span className="text-xs font-black uppercase text-primary tracking-tighter shrink-0">Total</span>
                    <div className="text-right min-w-0">
                       <span className="text-2xl md:text-3xl font-headline font-bold text-primary leading-none block truncate">{formatPrice(totalGeral)}</span>
                       <span className="text-[9px] text-accent uppercase font-bold tracking-widest mt-1">10x sem juros no cartão</span>
                    </div>
                  </div>
               </div>
            </Card>

            <div className="p-5 md:p-6 bg-secondary/20 rounded-[1.5rem] md:rounded-[2rem] space-y-3 border border-primary/5 w-full box-border">
               <div className="flex items-center gap-2 text-primary">
                  <Lock className="h-4 w-4 text-accent" />
                  <h4 className="text-[9px] font-bold uppercase tracking-widest">Tecnologia de Segurança</h4>
               </div>
               <p className="text-[10px] text-muted-foreground leading-relaxed italic font-light">
                 Sua compra é protegida por criptografia de nível bancário e processada com exclusividade pelo Mercado Pago.
               </p>
            </div>
          </aside>

        </div>
      </main>

      <footer className="py-12 border-t border-primary/5 bg-white/40 w-full">
        <div className="container mx-auto px-4 md:px-6 text-center space-y-4 w-full box-border">
           <div className="flex justify-center mb-6 opacity-30"><LogoMark className="max-w-[140px]" /></div>
           <p className="text-[9px] text-primary/30 uppercase tracking-[0.4em]">© {new Date().getFullYear()} Toda Bela • Checkout Protegido</p>
        </div>
      </footer>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="h-screen flex flex-col items-center justify-center bg-white space-y-4"><Loader2 className="animate-spin text-accent h-10 w-10" /><p className="text-[10px] font-bold uppercase tracking-widest text-primary/20">Preparando ambiente...</p></div>}>
      <CheckoutContent />
    </Suspense>
  );
}