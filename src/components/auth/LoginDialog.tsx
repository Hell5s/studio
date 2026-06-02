
"use client";

import React, { useState } from 'react';
import { useAuth, useUser } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  User, 
  Package, 
  ChevronRight, 
  LogOut, 
  LayoutDashboard,
  KeyRound
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isTransparent?: boolean;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
}

export function LoginDialog({ 
  open, 
  onOpenChange, 
  isTransparent, 
  isAdmin: isAdminProp,
  onOpenAdmin
}: LoginDialogProps) {
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const isAdmin = isAdminProp || user?.uid === 'LXaJZDm6tNUQLh3ooghcg6EQgJ43';

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      toast({ title: "Bem-vinda!", description: "Acesso realizado com sucesso." });
      setShowLoginForm(false);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Google Login Error:", error);
      let errorMsg = `Falha: ${error.code}`;
      
      if (error.code === 'auth/unauthorized-domain') {
        errorMsg = "Este domínio não está autorizado no Console do Firebase.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMsg = "A janela de login foi fechada antes de concluir.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMsg = "Pop-up bloqueado pelo navegador. Por favor, autorize pop-ups.";
      }

      toast({ 
        title: "Erro no Login Google", 
        description: errorMsg, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = formData.email.trim();
    if (!email || !formData.password) return;

    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, formData.password);
        toast({ title: "Bem-vinda!", description: "Sua conta Toda Bela foi criada." });
      } else {
        await signInWithEmailAndPassword(auth, email, formData.password);
        toast({ title: "Olá novamente!", description: "Acesso realizado com sucesso." });
      }
      setShowLoginForm(false);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Auth Error:", error.code, error.message);
      let errorMsg = "Verifique suas credenciais e tente novamente.";
      
      if (error.code === 'auth/wrong-password') errorMsg = "Senha incorreta.";
      if (error.code === 'auth/user-not-found') errorMsg = "E-mail não cadastrado.";
      if (error.code === 'auth/invalid-email') errorMsg = "Formato de e-mail inválido.";
      if (error.code === 'auth/too-many-requests') errorMsg = "Muitas tentativas falhas. Tente novamente mais tarde.";
      if (error.code === 'auth/invalid-credential') errorMsg = "E-mail ou senha incorretos.";
      if (error.code === 'auth/email-already-in-use') errorMsg = "Este e-mail já está em uso.";

      toast({ 
        title: "Erro no acesso", 
        description: errorMsg, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = formData.email.trim();
    if (!email) {
      toast({
        title: "E-mail necessário",
        description: "Por favor, preencha o campo de e-mail para receber o link de redefinição.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "E-mail enviado!",
        description: "Enviamos um link para você redefinir sua senha. Verifique sua caixa de entrada e spam."
      });
    } catch (error: any) {
      let errorMsg = "Não foi possível enviar o e-mail de recuperação.";
      if (error.code === 'auth/user-not-found') {
        errorMsg = "Não encontramos uma conta com este e-mail.";
      }
      toast({
        title: "Erro na redefinição",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onOpenChange(false);
      toast({ title: "Sessão encerrada" });
    } catch (e) {
      toast({ title: "Erro ao sair", variant: "destructive" });
    }
  };

  const menuOptions = [
    { label: 'Dados Pessoais', icon: <User className="h-4 w-4" />, href: '/dados-pessoais' },
    { label: 'Meus Pedidos', icon: <Package className="h-4 w-4" />, href: '/meus-pedidos' },
  ];

  const handleMenuClick = (opt: any) => {
    if (opt.onClick) {
      opt.onClick();
    } else if (opt.href && opt.href !== '#') {
      router.push(opt.href);
    }
    onOpenChange(false);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "p-2.5 transition-colors flex items-center gap-0.5 focus:outline-none",
            isTransparent ? "text-white" : "text-primary/50 hover:text-primary"
          )}
        >
          <User className="h-[18px] w-[18px]" />
          <span className="text-[8px] font-bold uppercase tracking-widest hidden xl:block">Conta</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[280px] rounded-[12px] shadow-xl p-0 border-none bg-white overflow-hidden z-[70] animate-in fade-in zoom-in-95 duration-200">
        {!user && !showLoginForm ? (
          <div className="p-6 space-y-6">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-primary">Já possui uma conta?</h4>
              <p className="text-[11px] text-muted-foreground">Faça login ou cadastre-se</p>
            </div>
            
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-3 border border-primary/10 rounded-md hover:bg-secondary/30 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Continuar com Google</span>
                </>
              )}
            </button>

            <Button 
              onClick={() => setShowLoginForm(true)}
              className="w-full h-12 bg-primary text-white font-bold uppercase text-[10px] tracking-[0.2em] rounded-md hover:brightness-110 transition-all"
            >
              ENTRAR COM E-MAIL
            </Button>
            
            <div className="pt-2 border-t border-gray-50">
              {menuOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleMenuClick(opt)}
                  className="w-full flex items-center justify-between py-3.5 group transition-colors text-primary/80 hover:text-accent"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-primary/30 group-hover:text-accent transition-colors">{opt.icon}</span>
                    <span className="text-[11px] font-bold uppercase tracking-wider">{opt.label}</span>
                  </div>
                  <ChevronRight className="h-3 w-3 text-primary/20 group-hover:text-accent" />
                </button>
              ))}
            </div>
          </div>
        ) : !user && showLoginForm ? (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">{isRegistering ? 'Nova Conta' : 'Acesso'}</h4>
              <button onClick={() => setShowLoginForm(false)} className="text-[9px] text-accent font-bold uppercase underline underline-offset-4">Voltar</button>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-3 border border-primary/10 rounded-md hover:bg-secondary/30 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Continuar com Google</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-primary/5" />
              <span className="text-[9px] text-primary/30 uppercase font-bold">ou</span>
              <div className="h-px flex-1 bg-primary/5" />
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">E-mail</Label>
                <Input 
                  type="email" 
                  className="h-10 text-xs rounded-lg border-gray-100 bg-secondary/20"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              {!isRegistering && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Senha</Label>
                    <button 
                      type="button" 
                      onClick={handleForgotPassword}
                      className="text-[9px] font-bold uppercase text-accent hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <Input 
                    type="password" 
                    className="h-10 text-xs rounded-lg border-gray-100 bg-secondary/20"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              )}
              {isRegistering && (
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Senha</Label>
                  <Input 
                    type="password" 
                    className="h-10 text-xs rounded-lg border-gray-100 bg-secondary/20"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              )}
              <Button className="w-full h-11 font-bold uppercase tracking-widest bg-primary text-white text-[10px]" disabled={loading}>
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : isRegistering ? "Cadastrar" : "Entrar"}
              </Button>
            </form>
            <button onClick={() => setIsRegistering(!isRegistering)} className="w-full text-center text-[9px] font-bold uppercase text-primary/40 hover:text-primary">
              {isRegistering ? "Já tenho conta" : "Não tenho conta ainda"}
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-3 pb-6 border-b border-gray-50 mb-2">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">{user?.email?.[0].toUpperCase()}</div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-primary truncate">{user?.email}</p>
                <p className="text-[9px] text-accent font-bold uppercase">Cliente Toda Bela</p>
              </div>
            </div>
            
            <div className="space-y-0.5">
              {isAdmin && (
                <button
                  onClick={() => {
                    onOpenAdmin?.();
                    onOpenChange(false);
                  }}
                  className="w-full flex items-center justify-between py-3.5 group transition-colors text-accent hover:text-primary"
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Painel Admin</span>
                  </div>
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}

              {menuOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleMenuClick(opt)}
                  className="w-full flex items-center justify-between py-3.5 group transition-colors text-primary/80 hover:text-accent"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-primary/30 group-hover:text-accent transition-colors">{opt.icon}</span>
                    <span className="text-[11px] font-bold uppercase tracking-wider">{opt.label}</span>
                  </div>
                  <ChevronRight className="h-3 w-3 text-primary/20 group-hover:text-accent" />
                </button>
              ))}
              
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 py-4 group text-red-300 hover:text-red-500 transition-colors mt-2 pt-4 border-t border-gray-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Sair</span>
              </button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
