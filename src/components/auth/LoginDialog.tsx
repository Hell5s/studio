
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, User, Copy, Check, ShieldCheck } from 'lucide-react';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const auth = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loggedInUser, setLoggedInUser] = useState<{ email: string | null, uid: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      setLoggedInUser({ email: result.user.email, uid: result.user.uid });
      toast({ 
        title: "Login realizado!", 
        description: "Agora você pode copiar seu UID para o cadastro administrativo." 
      });
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
    if (loggedInUser) {
      navigator.clipboard.writeText(loggedInUser.uid);
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
            {loggedInUser ? <ShieldCheck className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
          </div>
          <DialogTitle className="text-2xl font-headline font-bold">
            {loggedInUser ? "Perfil Identificado" : "Acesso Toda Bela"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {loggedInUser ? "Copie seu identificador abaixo para liberar o painel admin." : "Entre para gerenciar sua boutique ou acompanhar pedidos."}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {loggedInUser ? (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white border border-primary/10 shadow-sm">
                <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-2">Seu Identificador Único (UID):</p>
                <div className="flex items-center justify-between gap-3 bg-secondary/30 p-3 rounded-xl border border-primary/5">
                  <code className="text-xs break-all text-primary font-mono font-medium">{loggedInUser.uid}</code>
                  <Button size="icon" variant="ghost" className="h-10 w-10 shrink-0 hover:bg-white" onClick={copyUid}>
                    {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-primary" />}
                  </Button>
                </div>
              </div>
              
              <div className="rounded-2xl bg-primary/5 p-4 text-xs text-muted-foreground leading-relaxed border border-primary/10">
                <p className="font-semibold text-primary mb-1">Próximo Passo:</p>
                No console do Firebase, crie o documento <span className="font-mono bg-white px-1">roles_admin/{loggedInUser.uid}</span> para ativar o ícone de gestão.
              </div>

              <Button className="w-full rounded-full h-14 font-semibold shadow-lg shadow-primary/10" onClick={() => onOpenChange(false)}>
                Entendido
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
