
"use client";

import React, { useState } from 'react';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
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
  Heart, 
  ChevronRight, 
  LogOut, 
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isTransparent?: boolean;
  onOpenFavorites?: () => void;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
}

export function LoginDialog({ 
  open, 
  onOpenChange, 
  isTransparent, 
  onOpenFavorites,
  isAdmin,
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        toast({ title: "Bem-vinda!", description: "Sua conta Toda Bela foi criada." });
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        toast({ title: "Olá novamente!", description: "Acesso realizado com sucesso." });
      }
      setShowLoginForm(false);
      onOpenChange(false);
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
    { label: 'Dados Pessoais', icon: <User className="h-4 w-4" />, href: '#' },
    { label: 'Meus Pedidos', icon: <Package className="h-4 w-4" />, href: '/meus-pedidos' },
    { label: 'Wishlist', icon: <Heart className="h-4 w-4" />, onClick: onOpenFavorites },
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
            <Button 
              onClick={() => setShowLoginForm(true)}
              className="w-full h-12 bg-primary text-white font-bold uppercase text-[10px] tracking-[0.2em] rounded-md hover:brightness-110 transition-all"
            >
              ENTRAR
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
