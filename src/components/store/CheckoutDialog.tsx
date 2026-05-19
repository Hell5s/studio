"use client";

import React, { useMemo, useState } from 'react';
import { ShoppingBag, X, ArrowRight, Loader2, Mail, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: any[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  total: number;
  onSuccess: () => void;
}

export function CheckoutDialog({ open, onOpenChange, cartItems, onUpdateQuantity, onRemoveItem, total }: CheckoutDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const auth = useAuth();

  const [view, setView] = useState<'cart' | 'auth'>('cart');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleFinalize = () => {
    if (cartItems.length === 0) {
      toast({ title: "Sacola vazia", description: "Adicione peças antes de finalizar.", variant: "destructive" });
      return;
    }

    if (user) {
      goToCheckout();
    } else {
      setView('auth');
    }
  };

  const goToCheckout = () => {
    sessionStorage.setItem('checkout_items', JSON.stringify(cartItems));
    onOpenChange(false);
    // Reset view for next time
    setTimeout(() => setView('cart'), 500);
    router.push('/checkout');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "Bem-vinda!", description: "Acesso realizado com sucesso." });
      goToCheckout();
    } catch (error: any) {
      toast({ title: "Erro no acesso", description: "Não foi possível entrar com Google.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === 'register') {
        await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
        toast({ title: "Bem-vinda!", description: "Sua conta Toda Bela foi criada." });
      } else {
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
        toast({ title: "Olá novamente!", description: "Acesso realizado com sucesso." });
      }
      goToCheckout();
    } catch (error: any) {
      toast({ 
        title: "Erro no acesso", 
        description: "Verifique suas credenciais e tente novamente.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => {
      onOpenChange(o);
      if (!o) setTimeout(() => setView('cart'), 500);
    }}>
      <SheetContent
        side="right"
        style={{ width: '100vw', maxWidth: '100vw' }}
        className="md:w-[420px] md:max-w-[420px] p-0 flex flex-col bg-white border-l border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 shrink-0">
          <SheetHeader className="p-0 space-y-0">
            {view === 'auth' && (
              <button 
                onClick={() => setView('cart')}
                className="flex items-center gap-2 text-[9px] font-bold text-primary/40 uppercase tracking-widest hover:text-primary transition-colors mb-1"
              >
                <ChevronLeft className="h-3 w-3" /> Voltar para sacola
              </button>
            )}
            <SheetTitle className="text-xs font-bold text-primary uppercase tracking-[0.3em]">
              {view === 'cart' ? 'MINHA SELEÇÃO' : 'ACESSO EXCLUSIVO'}
            </SheetTitle>
          </SheetHeader>
          <button onClick={() => onOpenChange(false)} className="text-primary/20 hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar w-full max-w-full">
          {view === 'cart' ? (
            cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-32 px-10 text-center space-y-6">
                <div className="h-20 w-20 bg-secondary/30 rounded-full flex items-center justify-center text-primary/10">
                  <ShoppingBag className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Sua bolsa está vazia</h3>
                  <p className="text-[12px] text-muted-foreground italic font-light">Inicie sua jornada editorial escolhendo peças exclusivas.</p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-8 animate-in fade-in duration-500 w-full max-w-full">
                <div className="space-y-0 w-full">
                  {cartItems.map((item, idx) => (
                    <div key={item.id} className="w-full">
                      <div className="flex gap-4 md:gap-6 py-6 group w-full overflow-hidden">
                        <div className="h-24 w-18 md:h-32 md:w-24 bg-secondary/20 overflow-hidden shrink-0 rounded-sm">
                          <img src={item.image} className="h-full w-full object-cover" alt={item.name} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <p className="text-[11px] font-bold text-primary leading-tight uppercase tracking-tight truncate w-full">{item.name}</p>
                          <div className="flex flex-wrap gap-4 text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                            {item.selectedSize && <span>TAM: {item.selectedSize}</span>}
                            {item.selectedColor && <span className="text-accent">COR: {item.selectedColor}</span>}
                          </div>
                          <div className="flex items-center gap-3 pt-3">
                              <button onClick={() => onUpdateQuantity(item.id, -1)} className="h-7 w-7 border border-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-xs">−</button>
                              <span className="text-[11px] font-bold w-4 text-center">{item.quantity}</span>
                              <button onClick={() => onUpdateQuantity(item.id, 1)} className="h-7 w-7 border border-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-xs">+</button>
                          </div>
                        </div>
                        <button onClick={() => onRemoveItem(item.id)} className="text-primary/10 hover:text-destructive self-start p-2 shrink-0"><X className="h-4 w-4" /></button>
                      </div>
                      {idx < cartItems.length - 1 && <div className="h-px bg-primary/5" />}
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500 w-full max-w-full">
              <div className="space-y-2">
                <h4 className="text-xl font-headline font-bold text-primary">Bem-vinda de volta</h4>
                <p className="text-xs text-muted-foreground italic font-light leading-relaxed">
                  Para garantir sua reserva e segurança, acesse sua conta antes de finalizar.
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full h-14 flex items-center justify-center gap-3 border border-primary/10 rounded-full hover:bg-secondary/30 transition-all"
                >
                  {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (
                    <>
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Continuar com Google</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-4 py-2">
                  <div className="h-px flex-1 bg-primary/5" />
                  <span className="text-[9px] text-primary/30 uppercase font-black">OU</span>
                  <div className="h-px flex-1 bg-primary/5" />
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-primary/40 ml-1">E-mail</Label>
                    <Input 
                      type="email" 
                      required
                      value={authForm.email}
                      onChange={e => setAuthForm({...authForm, email: e.target.value})}
                      className="h-12 bg-secondary/10 border-none rounded-xl text-xs w-full" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-primary/40 ml-1">Senha</Label>
                    <Input 
                      type="password" 
                      required
                      value={authForm.password}
                      onChange={e => setAuthForm({...authForm, password: e.target.value})}
                      className="h-12 bg-secondary/10 border-none rounded-xl text-xs w-full" 
                    />
                  </div>
                  <Button 
                    disabled={loading}
                    className="w-full h-14 bg-primary text-white font-bold uppercase tracking-[0.3em] text-[10px] rounded-full shadow-lg"
                  >
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (authMode === 'login' ? 'ENTRAR AGORA' : 'CRIAR MINHA CONTA')}
                  </Button>
                </form>

                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="w-full text-center text-[9px] font-bold uppercase text-accent tracking-widest hover:underline"
                >
                  {authMode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça Login'}
                </button>
              </div>
            </div>
          )}
        </div>

        {cartItems.length > 0 && view === 'cart' && (
          <div className="shrink-0 border-t border-primary/5 bg-white p-6 w-full">
            <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">SUBTOTAL</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
            </div>
            <button
              onClick={handleFinalize}
              className="w-full h-16 bg-primary text-white text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-accent transition-all duration-700 flex items-center justify-center gap-4 shadow-2xl"
            >
              FINALIZAR COMPRA
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-[8px] text-center text-muted-foreground uppercase mt-4 tracking-widest opacity-60">Frete e descontos calculados no checkout</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}