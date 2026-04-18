
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth, useUser, useDoc, useFirestore } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, User, ShieldCheck, UserPlus, LogIn } from 'lucide-react';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdminLogin?: () => void;
}

export function LoginDialog({ open, onOpenChange, onAdminLogin }: LoginDialogProps) {
  const auth = useAuth();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });

  // Verificação de Admin
  const adminDocRef = React.useMemo(() => {
    return (db && user) ? doc(db, 'roles_admin', user.uid) : null;
  }, [db, user]);
  const { data: adminRole, isLoading: isAdminLoading } = useDoc(adminDocRef);
  const isAdmin = !!adminRole;

  // Efeito para fechar o diálogo quando o login for bem-sucedido
  useEffect(() => {
    if (open && user && !isAdminLoading) {
      onOpenChange(false);
      
      if (isAdmin) {
        onAdminLogin?.();
        toast({
          title: "Bem-vinda de volta!",
          description: "Acesso administrativo liberado.",
        });
      } else {
        toast({
          title: "Login realizado!",
          description: "Bem-vinda à Toda Bela.",
        });
      }
    }
  }, [user, isAdmin, isAdminLoading, open, onOpenChange, onAdminLogin, toast]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    if (isRegistering && formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro no cadastro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      }
    } catch (error: any) {
      let errorMessage = "Erro na autenticação. Verifique seus dados.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este e-mail já está em uso.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        errorMessage = "Credenciais inválidas. Verifique seu e-mail e senha.";
      }

      toast({ 
        title: isRegistering ? "Erro ao criar conta" : "Erro no login", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({
          title: "Erro no acesso",
          description: "Não foi possível acessar com Google.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (error) {
      toast({
        title: "Erro no acesso",
        description: "Não foi possível acessar como visitante.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0">
        <DialogHeader className="items-center text-center p-8 bg-secondary/30">
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-primary mb-4 shadow-sm">
            {isRegistering ? <UserPlus className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
          </div>
          <DialogTitle className="text-2xl font-headline font-bold text-primary">
            {isRegistering ? "Criar Minha Conta" : "Acesso Toda Bela"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            {isRegistering ? "Junte-se ao nosso clube exclusivo de moda." : "Entre para acompanhar seus pedidos ou gerenciar a loja."}
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="exemplo@email.com" 
                className="rounded-full h-12 border-primary/10 bg-secondary/20 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all px-6"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" size="sm" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                className="rounded-full h-12 border-primary/10 bg-secondary/20 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all px-6"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" size="sm" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Confirmar Senha</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••••"
                  className="rounded-full h-12 border-primary/10 bg-secondary/20 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all px-6"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            )}
            <Button type="submit" className="w-full rounded-full h-14 font-semibold text-lg shadow-xl shadow-primary/20 mt-4 bg-primary text-white hover:bg-primary/90 transition-all" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-6 w-6" /> : isRegistering ? "Criar Minha Conta" : "Entrar"}
            </Button>
          </form>

          <div className="text-center">
            <button 
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm font-medium text-primary hover:underline underline-offset-4"
            >
              {isRegistering ? "Já tem uma conta? Entre aqui" : "Ainda não tem conta? Cadastre-se agora"}
            </button>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-primary/10" /></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em]"><span className="bg-white px-4 text-muted-foreground">Ou entre com</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="w-full rounded-full h-14 font-semibold text-primary border-primary/20 hover:bg-primary/5 transition-all flex items-center justify-center gap-2" 
              onClick={handleGoogleSignIn} 
              disabled={loading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button 
              variant="outline" 
              className="w-full rounded-full h-14 font-semibold text-primary border-primary/20 hover:bg-primary/5 transition-all" 
              onClick={handleAnonymousSignIn} 
              disabled={loading}
            >
              <User className="mr-2 h-4 w-4" />
              Visitante
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
