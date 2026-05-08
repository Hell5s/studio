
"use client";

import React, { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Navbar } from '@/components/store/Navbar';
import { Footer } from '@/components/store/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, MapPin, Save, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PersonalDataPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  // Referência para o documento de perfil do usuário
  const profileRef = useMemoFirebase(() => {
    return user ? doc(db, 'users', user.uid, 'profile', 'data') : null;
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    birthDate: '',
    phone: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  // Popula o formulário quando os dados do Firestore carregam
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        cpf: profile.cpf || '',
        birthDate: profile.birthDate || '',
        phone: profile.phone || '',
        cep: profile.cep || '',
        address: profile.address || '',
        number: profile.number || '',
        complement: profile.complement || '',
        neighborhood: profile.neighborhood || '',
        city: profile.city || '',
        state: profile.state || ''
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profileRef) return;

    try {
      await setDoc(profileRef, {
        ...formData,
        email: user.email,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({
        title: "Dados atualizados!",
        description: "Suas informações foram salvas com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar seus dados.",
        variant: "destructive"
      });
    }
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FFF9F7]">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    );
  }

  // Redireciona se o usuário não estiver logado
  if (!user) {
    if (typeof window !== 'undefined') {
      router.replace('/');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FFF9F7] selection:bg-accent/30 selection:text-primary overflow-x-hidden">
      <Navbar 
        onOpenLogin={() => {}} 
        onOpenCart={() => {}}
        onOpenFavorites={() => {}}
        cartCount={0}
      />

      <main className="pt-32 pb-24">
        <header className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl space-y-6">
            <Link href="/" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-accent transition-colors group w-fit">
              <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Voltar para Início
            </Link>
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-accent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-accent">Minha Conta</span>
            </div>
            <h1 className="text-4xl md:text-8xl font-headline font-bold text-primary leading-[0.95] tracking-tighter">
              Dados <br />
              <span className="italic font-light text-accent">Pessoais</span>
            </h1>
          </div>
        </header>

        <section className="container mx-auto px-6">
          <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-12">
            
            {/* Seção Identificação */}
            <div className="space-y-8 bg-white p-8 md:p-12 rounded-[3rem] border border-primary/5 shadow-editorial">
              <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
                <User className="h-5 w-5" />
                <h3 className="text-[11px] font-bold uppercase tracking-[0.4em]">Identificação</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Nome Completo</Label>
                  <Input 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="h-14 rounded-full bg-[#FFF9F7] border-none px-6 focus:ring-2 focus:ring-accent/20 transition-all"
                    placeholder="Como deseja ser chamada"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">E-mail de Acesso</Label>
                  <Input 
                    value={user.email || ''}
                    disabled
                    className="h-14 rounded-full bg-secondary/20 border-none px-6 opacity-60 cursor-not-allowed font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">CPF</Label>
                  <Input 
                    value={formData.cpf}
                    onChange={e => setFormData({...formData, cpf: e.target.value})}
                    className="h-14 rounded-full bg-[#FFF9F7] border-none px-6 focus:ring-2 focus:ring-accent/20 transition-all"
                    placeholder="000.000.000-00"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Data de Nascimento</Label>
                  <Input 
                    type="date"
                    value={formData.birthDate}
                    onChange={e => setFormData({...formData, birthDate: e.target.value})}
                    className="h-14 rounded-full bg-[#FFF9F7] border-none px-6 focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Telefone / WhatsApp</Label>
                  <Input 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="h-14 rounded-full bg-[#FFF9F7] border-none px-6 focus:ring-2 focus:ring-accent/20 transition-all"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Seção Endereço */}
            <div className="space-y-8 bg-white p-8 md:p-12 rounded-[3rem] border border-primary/5 shadow-editorial">
              <div className="flex items-center gap-3 text-accent border-b border-primary/5 pb-4">
                <MapPin className="h-5 w-5" />
                <h3 className="text-[11px] font-bold uppercase tracking-[0.4em]">Endereço de Entrega</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">CEP</Label>
                  <Input 
                    value={formData.cep}
                    onChange={e => setFormData({...formData, cep: e.target.value})}
                    className="h-14 rounded-full bg-[#FFF9F7] border-none px-6 focus:ring-2 focus:ring-accent/20 transition-all"
                    placeholder="00000-000"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Logradouro (Rua, Avenida)</Label>
                  <Input 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="h-14 rounded-full bg-[#FFF9F7] border-none px-6 focus:ring-2 focus:ring-accent/20 transition-all"
                    placeholder="Ex: Rua das Flores"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Número</Label>
                  <Input 
                    value={formData.number}
                    onChange={e => setFormData({...formData, number: e.target.value})}
                    className="h-14 rounded-full bg-[#FFF9F7] border-none px-6 focus:ring-2 focus:ring-accent/20 transition-all"
                    placeholder="Ex: 123"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Complemento</Label>
                  <Input 
                    value={formData.complement}
                    onChange={e => setFormData({...formData, complement: e.target.value})}
                    className="h-14 rounded-full bg-[#FFF9F7] border-none px-6 focus:ring-2 focus:ring-accent/20 transition-all"
                    placeholder="Apto, Bloco, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Bairro</Label>
                  <Input 
                    value={formData.neighborhood}
                    onChange={e => setFormData({...formData, neighborhood: e.target.value})}
                    className="h-14 rounded-full bg-[#FFF9F7] border-none px-6 focus:ring-2 focus:ring-accent/20 transition-all"
                    placeholder="Seu bairro"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Cidade</Label>
                  <Input 
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                    className="h-14 rounded-full bg-[#FFF9F7] border-none px-6 focus:ring-2 focus:ring-accent/20 transition-all"
                    placeholder="Sua cidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="ml-4 text-[10px] font-bold uppercase text-muted-foreground">Estado</Label>
                  <Input 
                    value={formData.state}
                    onChange={e => setFormData({...formData, state: e.target.value.toUpperCase()})}
                    className="h-14 rounded-full bg-[#FFF9F7] border-none px-6 focus:ring-2 focus:ring-accent/20 transition-all"
                    placeholder="Ex: SP"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <Button 
                type="submit"
                className="rounded-full bg-primary text-white font-bold uppercase tracking-[0.3em] text-[12px] h-20 px-20 shadow-2xl hover:scale-105 hover:bg-accent transition-all duration-500 min-w-[300px]"
              >
                <Save className="mr-3 h-5 w-5" />
                Salvar Alterações
              </Button>
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}
