
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth, useUser, useDoc, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, User, Copy, Check, ShieldCheck, UserPlus, LogIn } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);

  // Verificação de Admin para fechar automaticamente se já for admin
  const adminDocRef = React.useMemo(() => {
    return user ? doc(db, 'roles_admin', user.uid) : null;
  }, [db, user]);
  const { data: adminRole } = useDoc(adminDocRef);
  const isAdmin = !!adminRole;

  // Fecha o login automaticamente se o usuário logado já for reconhecido como Admin
  useEffect(() => {
    if (open && user && isAdmin) {
      onOpenChange(false);
      onAdminLogin?.();
      toast({
        title: "Bem-vinda de volta!",
        description: "Acesso administrativo liberado.",
      });
    }
  }, [user, isAdmin, open, onOpenChange, onAdminLogin, toast]);

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
        toast({
          title: "Conta criada com sucesso!",
          description: "Bem-vinda à Toda Bela Boutique.",
        });
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

  const copyUid = () => {
    if (user) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "UID Copiado!", description: "Cole este ID na coleção roles_admin do Firestore." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0">
        <DialogHeader className="items-center text-center p-8 bg-secondary/30">
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-primary mb-4 shadow-sm">
            {user ? <ShieldCheck className="h-8 w-8" /> : isRegistering ? <UserPlus className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
          </div>
          <DialogTitle className="text-2xl font-headline font-bold text-primary">
            {user ? "Perfil Identificado" : isRegistering ? "Criar Minha Conta" : "Acesso Toda Bela"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            {user ? "Identificamos sua conta na boutique." : isRegistering ? "Junte-se ao nosso clube exclusivo de moda." : "Entre para gerenciar sua boutique ou acompanhar pedidos."}
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-6">
          {user ? (
            <div className="space-y-6">
              {!isAdmin ? (
                <>
                  <div className="p-4 rounded-2xl bg-white border border-primary/10 shadow-sm">
                    <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-2">Seu Identificador (UID):</p>
                    <div className="flex items-center justify-between gap-3 bg-secondary/30 p-3 rounded-xl border border-primary/5">
                      <code className="text-xs break-all text-primary font-mono font-medium">{user.uid}</code>
                      <Button size="icon" variant="ghost" className="h-10 w-10 shrink-0 hover:bg-white" onClick={copyUid}>
                        {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-primary" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-2xl bg-amber-50 p-4 text-xs text-amber-800 leading-relaxed border border-amber-200 shadow-sm">
                    <p className="font-semibold mb-1">Aguardando Permissão:</p>
                    Seu acesso administrativo ainda não foi ativado. Solicite a inclusão do UID acima na coleção <span className="font-mono bg-amber-100 px-1 rounded">roles_admin</span> para gerenciar a loja.
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm font-medium text-primary">Você já possui permissão de administrador e acesso total ao painel.</p>
                </div>
              )}
              
              <Button className="w-full rounded-full h-14 font-semibold shadow-lg shadow-primary/10 bg-primary hover:bg-primary/90 text-white" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </div>
          ) : (
            <>
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
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em]"><span className="bg-white px-4 text-muted-foreground">Ou</span></div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button 
                  variant="outline" 
                  className="w-full rounded-full h-14 font-semibold text-primary border-primary/20 hover:bg-primary/5 transition-all" 
                  onClick={() => signInAnonymously(auth)} 
                  disabled={loading}
                >
                  <User className="mr-2 h-5 w-5" />
                  Acessar como Visitante
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
