
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, User, Copy, Check } from 'lucide-react';

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
        description: "Agora você pode copiar seu UID para cadastro admin." 
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
      <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] border-none shadow-2xl">
        <DialogHeader className="items-center text-center">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <DialogTitle className="text-2xl font-headline font-bold">Acesso Toda Bela</DialogTitle>
          <DialogDescription>
            {loggedInUser ? "Copie seu identificador para o administrador." : "Entre com suas credenciais para gerenciar a loja."}
          </DialogDescription>
        </DialogHeader>

        {loggedInUser ? (
          <div className="space-y-6 py-4">
            <div className="p-4 rounded-2xl bg-secondary/50 border border-primary/10">
              <p className="text-xs font-bold text-primary uppercase mb-2">Seu Identificador (UID):</p>
              <div className="flex items-center justify-between gap-2 bg-white p-3 rounded-xl border border-primary/5">
                <code className="text-xs break-all text-muted-foreground">{loggedInUser.uid}</code>
                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={copyUid}>
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Cadastre este ID na coleção <span className="font-mono font-bold">roles_admin</span> do seu Firestore para liberar o painel.
            </p>
            <Button className="w-full rounded-full h-14" onClick={() => onOpenChange(false)}>
              Concluído
            </Button>
          </div>
        ) : (
          <>
            <form onSubmit={handleLogin} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  className="rounded-full h-12"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password" 
                  type="password" 
                  className="rounded-full h-12"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full rounded-full h-14 font-semibold text-lg" disabled={loading}>
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Entrar"}
              </Button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Ou</span></div>
            </div>

            <Button variant="outline" className="w-full rounded-full h-14 font-semibold text-primary border-primary/20" onClick={() => signInAnonymously(auth)} disabled={loading}>
              <User className="mr-2 h-4 w-4" />
              Visitante
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
