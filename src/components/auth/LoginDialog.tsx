
"use client";

import React, { useState } from 'react';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, User } from 'lucide-react';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
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
        toast({ title: "Olá novamente!", description: "Você acessou sua boutique." });
      }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="items-center text-center p-10 bg-secondary/30">
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-primary mb-4 shadow-sm">
            <Lock className="h-8 w-8" />
          </div>
          <DialogTitle className="text-2xl font-headline font-bold text-primary">Acesso Toda Bela</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            Entre para acompanhar seus pedidos ou gerenciar a loja.
          </DialogDescription>
        </DialogHeader>

        <div className="p-10 space-y-6 bg-white">
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-accent ml-4">E-mail</Label>
              <Input 
                type="email" 
                placeholder="seu@email.com" 
                className="rounded-full h-14 bg-secondary/20 border-none px-6 focus:ring-2 focus:ring-primary/10"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-accent ml-4">Senha</Label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="rounded-full h-14 bg-secondary/20 border-none px-6 focus:ring-2 focus:ring-primary/10"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <Button className="w-full rounded-full h-16 font-bold uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] transition-all mt-4 bg-primary text-white" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-6 w-6" /> : isRegistering ? "Criar Conta" : "Acessar"}
            </Button>
          </form>

          <div className="text-center">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-primary transition-colors">
              {isRegistering ? "Já tenho conta" : "Não tenho conta ainda"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
