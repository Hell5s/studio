"use client";

import React, { useState } from 'react';
import { Instagram, MessageCircle, Mail, ShieldCheck, Truck, RefreshCcw, CreditCard, Sparkles } from 'lucide-react';
import { LogoMark } from './LogoMark';
import { OrderTrackingDialog } from './OrderTrackingDialog';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const INFO_CONTENT: Record<string, { title: string; content: React.ReactNode }> = {
  'nossa-historia': {
    title: 'Nossa História',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground italic font-light">
        <p>A Toda Bela nasceu do desejo de celebrar a potência da mulher brasileira através da moda. Iniciamos nossa jornada como uma pequena marca e hoje somos um destino para mulheres que buscam expressar sua confiança com sofisticação.</p>
        <p>Nossa essência reside no equilíbrio entre o clássico e o contemporâneo, criando peças que não apenas vestem, mas acompanham momentos de conquista e celebração.</p>
      </div>
    )
  },
  'trocas': {
    title: 'Trocas e Devoluções',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground italic font-light">
        <p>Queremos que você ame cada peça. Caso precise realizar uma troca, você tem até 30 dias corridos após o recebimento para solicitar através do nosso WhatsApp VIP.</p>
        <p>A primeira troca é por nossa conta, garantindo que sua experiência de compra seja livre de preocupações e totalmente focada no seu bem-estar.</p>
      </div>
    )
  },
  'privacidade': {
    title: 'Política de Privacidade',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground italic font-light">
        <p>Sua privacidade é nossa prioridade máxima. Na Toda Bela, utilizamos as tecnologias mais avançadas de criptografia para garantir que seus dados pessoais e de pagamento estejam 100% protegidos.</p>
        <p>Coletamos apenas as informações necessárias para processar seus pedidos e oferecer uma experiência personalizada na boutique.</p>
      </div>
    )
  },
  'termos': {
    title: 'Termos de Uso',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground italic font-light">
        <p>Ao navegar em nossa boutique, você concorda com os termos de excelência e respeito mútuo da nossa comunidade. Todos os preços e condições são válidos exclusivamente para compras realizadas no site.</p>
        <p>As imagens dos produtos são produzidas em estúdio profissional para representar as cores e detalhes com a maior fidelidade possível.</p>
      </div>
    )
  },
};

export function Footer() {
  const currentYear = new Date().getFullYear();
  const db = useFirestore();
  const [activeInfo, setActiveInfo] = useState<string | null>(null);
  const [isTrackOpen, setIsTrackOpen] = useState(false);

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc(settingsRef);

  const handleOpenWhatsApp = () => {
    const phone = (settings?.whatsapp || '5511999999999').replace(/\D/g, '');
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  const handleOpenInstagram = () => {
    const ig = settings?.instagram?.replace('@', '') || 'todabela';
    window.open(`https://instagram.com/${ig}`, '_blank');
  };

  return (
    <footer className="bg-primary text-white overflow-hidden relative">

      {/* Faixa de benefícios */}
      <div className="border-b border-white/5">
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Truck className="h-4 w-4" />, title: "Frete Grátis", desc: "Acima de R$ 249" },
              { icon: <RefreshCcw className="h-4 w-4" />, title: "Troca Fácil", desc: "Até 30 dias" },
              { icon: <CreditCard className="h-4 w-4" />, title: "10x Sem Juros", desc: "No cartão" },
              { icon: <ShieldCheck className="h-4 w-4" />, title: "Compra Segura", desc: "SSL Certificado" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full border border-accent/30 flex items-center justify-center text-accent shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white">{item.title}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Logo e redes sociais */}
          <div className="space-y-6">
            <div className="brightness-0 invert origin-left">
              <LogoMark />
            </div>
            <p className="text-[12px] text-white/50 font-light italic leading-relaxed">
              {settings?.tagline || 'Moda feminina com propósito, sofisticação e autenticidade.'}
            </p>
            <div className="flex gap-3">
              <button onClick={handleOpenInstagram} className="h-9 w-9 rounded-full border border-white/10 flex items-center justify-center hover:border-accent hover:text-accent transition-all">
                <Instagram className="h-4 w-4" />
              </button>
              <button onClick={handleOpenWhatsApp} className="h-9 w-9 rounded-full border border-white/10 flex items-center justify-center hover:border-accent hover:text-accent transition-all">
                <MessageCircle className="h-4 w-4" />
              </button>
              <button onClick={() => window.location.href = `mailto:${settings?.contactEmail || 'contato@todabela.com.br'}`} className="h-9 w-9 rounded-full border border-white/10 flex items-center justify-center hover:border-accent hover:text-accent transition-all">
                <Mail className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Links rápidos */}
          <div className="space-y-4">
            <h5 className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent">Navegação</h5>
            <ul className="space-y-3">
              {[
                { label: 'Início', href: '/' },
                { label: 'Coleções', href: '/#colecoes' },
                { label: 'Produtos', href: '/#vitrine' },
                { label: 'Mais Vendidos', href: '/#mais-vendidos' },
                { label: 'Economize', href: '/economize' },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-[11px] text-white/50 hover:text-white transition-colors uppercase tracking-wider">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Atendimento */}
          <div className="space-y-4">
            <h5 className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent">Atendimento</h5>
            <ul className="space-y-3">
              <li><button onClick={() => setIsTrackOpen(true)} className="text-[11px] text-white/50 hover:text-white transition-colors uppercase tracking-wider text-left">Rastrear Pedido</button></li>
              <li><button onClick={() => setActiveInfo('trocas')} className="text-[11px] text-white/50 hover:text-white transition-colors uppercase tracking-wider text-left">Trocas e Devoluções</button></li>
              <li><button onClick={handleOpenWhatsApp} className="text-[11px] text-white/50 hover:text-white transition-colors uppercase tracking-wider text-left">Fale Conosco</button></li>
              <li><button onClick={() => setActiveInfo('nossa-historia')} className="text-[11px] text-white/50 hover:text-white transition-colors uppercase tracking-wider text-left">Nossa História</button></li>
            </ul>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h5 className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent">Contato</h5>
            <div className="space-y-4">
              <button onClick={handleOpenWhatsApp} className="flex items-center gap-3 group text-left">
                <MessageCircle className="h-4 w-4 text-accent shrink-0" />
                <div>
                  <p className="text-[9px] text-white/30 uppercase tracking-wider">WhatsApp</p>
                  <p className="text-[12px] text-white/70 group-hover:text-white transition-colors">{settings?.whatsapp || '(11) 99999-9999'}</p>
                </div>
              </button>
              <button onClick={() => window.location.href = `mailto:${settings?.contactEmail || 'contato@todabela.com.br'}`} className="flex items-center gap-3 group text-left">
                <Mail className="h-4 w-4 text-accent shrink-0" />
                <div>
                  <p className="text-[9px] text-white/30 uppercase tracking-wider">E-mail</p>
                  <p className="text-[12px] text-white/70 group-hover:text-white transition-colors">{settings?.contactEmail || 'contato@todabela.com.br'}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé inferior */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">
            © {currentYear} {settings?.storeName || 'Toda Bela'} • Todos os direitos reservados
          </p>
          <div className="flex gap-6">
            <button onClick={() => setActiveInfo('termos')} className="text-[10px] text-white/30 hover:text-white/60 uppercase tracking-widest transition-colors">Termos</button>
            <button onClick={() => setActiveInfo('privacidade')} className="text-[10px] text-white/30 hover:text-white/60 uppercase tracking-widest transition-colors">Privacidade</button>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-accent/5 blur-[80px] pointer-events-none" />
      <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-accent/5 blur-[80px] pointer-events-none" />

      <Dialog open={!!activeInfo} onOpenChange={(o) => !o && setActiveInfo(null)}>
        <DialogContent className="max-w-lg rounded-[2rem] p-0 border-none shadow-2xl overflow-hidden bg-white">
          <div className="bg-primary p-8 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="h-20 w-20" />
            </div>
            <DialogHeader className="relative z-10 text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent mb-2">Toda Bela</p>
              <DialogTitle className="text-2xl font-headline font-bold">
                {activeInfo && INFO_CONTENT[activeInfo]?.title}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-8">
            {activeInfo && INFO_CONTENT[activeInfo]?.content}
            <button onClick={() => setActiveInfo(null)} className="mt-8 text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-primary transition-colors">
              Fechar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <OrderTrackingDialog open={isTrackOpen} onOpenChange={setIsTrackOpen} />
    </footer>
  );
}