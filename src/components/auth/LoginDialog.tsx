
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth, useUser, useDoc, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, User, Copy, Check, ShieldCheck, ArrowRight } from 'lucide-react';

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
  const [formData, setFormData] = useState({ email: '', password: '' });
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
    } catch (error: any) {
      toast({ 
        title: "Erro no login", 
        description: "Credenciais inválidas ou acesso negado.", 
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
      <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
        <DialogHeader className="items-center text-center p-6 bg-secondary/20">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            {user ? <ShieldCheck className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
          </div>
          <DialogTitle className="text-2xl font-headline font-bold">
            {user ? "Perfil Identificado" : "Acesso Toda Bela"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {user ? "Identificamos sua conta na boutique." : "Entre para gerenciar sua boutique ou acompanhar pedidos."}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
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
                  
                  <div className="rounded-2xl bg-amber-50 p-4 text-xs text-amber-800 leading-relaxed border border-amber-200">
                    <p className="font-semibold mb-1">Aguardando Permissão:</p>
                    Seu acesso administrativo ainda não foi ativado. Solicite a inclusão do UID acima na coleção <span className="font-mono">roles_admin</span>.
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Você já possui permissão de administrador.</p>
                </div>
              )}
              
              <Button className="w-full rounded-full h-14 font-semibold shadow-lg shadow-primary/10" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold ml-1">E-mail</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="exemplo@email.com" 
                    className="rounded-full h-12 border-primary/10 bg-secondary/20 focus:bg-white transition-all"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" size="sm" className="text-xs font-semibold ml-1">Senha</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    className="rounded-full h-12 border-primary/10 bg-secondary/20 focus:bg-white transition-all"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full rounded-full h-14 font-semibold text-lg shadow-xl shadow-primary/20 mt-2" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Entrar"}
                </Button>
              </form>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-primary/5" /></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-white px-3 text-muted-foreground">Ou</span></div>
              </div>

              <Button variant="outline" className="w-full rounded-full h-14 font-semibold text-primary border-primary/20 hover:bg-primary/5" onClick={() => signInAnonymously(auth)} disabled={loading}>
                <User className="mr-2 h-5 w-5" />
                Acessar como Visitante
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
