
"use client";

import React, { useState } from 'react';
import { Instagram, MessageCircle, Mail, ShieldCheck, Truck, RefreshCcw, CreditCard, Sparkles, ChevronRight } from 'lucide-react';
import { LogoMark } from './LogoMark';
import { OrderTrackingDialog } from './OrderTrackingDialog';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const INFO_CONTENT: Record<string, { title: string; content: React.ReactNode }> = {
  'sobre-nos': {
    title: 'Sobre Nós',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground italic font-light">
        <p>A Toda Bela é mais que uma loja, é um manifesto de estilo para a mulher que reconhece sua própria luz. Nossa curadoria foca em peças que unem o conforto do dia a dia à sofisticação de momentos especiais.</p>
      </div>
    )
  },
  'nossa-historia': {
    title: 'Nossa História',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground italic font-light">
        <p>Iniciamos nossa jornada com o propósito de democratizar a moda premium no Brasil. Hoje, celebramos milhares de clientes que encontraram na Toda Bela a expressão máxima de sua autenticidade.</p>
      </div>
    )
  },
  'trabalhe-conosco': {
    title: 'Trabalhe Conosco',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground italic font-light">
        <p>Quer fazer parte da equipe Toda Bela? Envie seu portfólio para nossa equipe de RH e venha construir o futuro da moda feminina conosco.</p>
      </div>
    )
  },
  'trocas': {
    title: 'Trocas e Devoluções',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground italic font-light">
        <p>Sua satisfação é nossa prioridade. Você tem até 30 dias após o recebimento para solicitar trocas através do nosso canal de atendimento VIP.</p>
      </div>
    )
  },
  'privacidade': {
    title: 'Política de Privacidade',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground italic font-light">
        <p>Seus dados estão seguros conosco. Utilizamos criptografia SSL de ponta a ponta para garantir que sua experiência de compra seja privada e protegida.</p>
      </div>
    )
  },
  'termos': {
    title: 'Termos de Uso',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground italic font-light">
        <p>Ao utilizar nosso site, você concorda com as diretrizes de navegação e comercialização da nossa plataforma, pautadas pela transparência e respeito ao consumidor.</p>
      </div>
    )
  },
  'faq': {
    title: 'Perguntas Frequentes',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground italic font-light">
        <p><strong>Qual o prazo de entrega?</strong> De 10 a 20 dias úteis.</p>
        <p><strong>Como rastreio meu pedido?</strong> Use a opção "Rastrear Pedido" no menu de Atendimento abaixo.</p>
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
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <Truck className="h-5 w-5" />, title: "Frete Grátis", desc: "Acima de R$ 250" },
              { icon: <RefreshCcw className="h-5 w-5" />, title: "Troca Fácil", desc: "Até 30 dias" },
              { icon: <CreditCard className="h-5 w-5" />, title: "10x Sem Juros", desc: "No cartão" },
              { icon: <ShieldCheck className="h-5 w-5" />, title: "Compra Segura", desc: "SSL Certificado" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-3">
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-accent shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">{item.title}</p>
                  <p className="text-[10px] text-white/40 mt-1 uppercase font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-6 pt-16 pb-12">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 mb-16">
          {/* Logo e Redes Sociais */}
          <div className="lg:w-1/4 space-y-8">
            <div className="brightness-0 invert">
              <LogoMark className="[&_#logo-ball]:opacity-0 [&_#logo-ball]:w-0" />
            </div>
            <p className="text-[12px] text-white/50 font-light italic leading-relaxed max-w-xs">
              {settings?.tagline || 'Celebrando a potência e a sofisticação da mulher moderna através de peças atemporais.'}
            </p>
            <div className="flex gap-4">
              <button onClick={handleOpenInstagram} className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-500">
                <Instagram className="h-4 w-4" />
              </button>
              <button onClick={handleOpenWhatsApp} className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-500">
                <MessageCircle className="h-4 w-4" />
              </button>
              <button onClick={() => window.location.href = `mailto:${settings?.contactEmail || 'contato@todabela.com.br'}`} className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-500">
                <Mail className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Colunas de Links */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-10">
            {/* Coluna 1: A Toda Bela */}
            <div className="space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">A Toda Bela</h5>
              <ul className="space-y-4">
                <li><button onClick={() => setActiveInfo('sobre-nos')} className="text-[11px] text-white/40 hover:text-accent transition-colors uppercase tracking-widest text-left">Sobre Nós</button></li>
                <li><button onClick={() => setActiveInfo('nossa-historia')} className="text-[11px] text-white/40 hover:text-accent transition-colors uppercase tracking-widest text-left">Nossa História</button></li>
                <li><button onClick={() => setActiveInfo('trabalhe-conosco')} className="text-[11px] text-white/40 hover:text-accent transition-colors uppercase tracking-widest text-left">Trabalhe Conosco</button></li>
              </ul>
            </div>

            {/* Coluna 2: Atendimento */}
            <div className="space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Atendimento</h5>
              <ul className="space-y-4">
                <li><button onClick={() => setIsTrackOpen(true)} className="text-[11px] text-white/40 hover:text-accent transition-colors uppercase tracking-widest text-left">Rastrear Pedido</button></li>
                <li><button onClick={() => setActiveInfo('trocas')} className="text-[11px] text-white/40 hover:text-accent transition-colors uppercase tracking-widest text-left">Trocas e Devoluções</button></li>
                <li><button onClick={handleOpenWhatsApp} className="text-[11px] text-white/40 hover:text-accent transition-colors uppercase tracking-widest text-left">Fale Conosco</button></li>
                <li><button onClick={() => setActiveInfo('faq')} className="text-[11px] text-white/40 hover:text-accent transition-colors uppercase tracking-widest text-left">Perguntas Frequentes</button></li>
              </ul>
            </div>

            {/* Coluna 3: Informações */}
            <div className="space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Informações</h5>
              <ul className="space-y-4">
                <li><button onClick={() => setActiveInfo('termos')} className="text-[11px] text-white/40 hover:text-accent transition-colors uppercase tracking-widest text-left">Termos de Uso</button></li>
                <li><button onClick={() => setActiveInfo('privacidade')} className="text-[11px] text-white/40 hover:text-accent transition-colors uppercase tracking-widest text-left">Política de Privacidade</button></li>
                <li><button onClick={() => setActiveInfo('trocas')} className="text-[11px] text-white/40 hover:text-accent transition-colors uppercase tracking-widest text-left">Política de Reembolso</button></li>
              </ul>
            </div>

            {/* Coluna 4: Contato */}
            <div className="space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Contato</h5>
              <div className="space-y-5">
                <button onClick={handleOpenWhatsApp} className="flex items-center gap-3 group text-left">
                  <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-accent/50 group-hover:bg-white group-hover:text-primary transition-all">
                    <MessageCircle className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-[8px] text-white/30 uppercase font-black tracking-widest">WhatsApp</p>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-tight">{settings?.whatsapp || '(11) 99999-9999'}</p>
                  </div>
                </button>
                <button onClick={() => window.location.href = `mailto:${settings?.contactEmail || 'contato@todabela.com.br'}`} className="flex items-center gap-3 group text-left">
                  <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-accent/50 group-hover:bg-white group-hover:text-primary transition-all">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-[8px] text-white/30 uppercase font-black tracking-widest">E-mail</p>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-tight truncate max-w-[150px]">{settings?.contactEmail || 'contato@todabela.com.br'}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Selos de Pagamento */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
             {/* Pix */}
             <svg viewBox="0 0 540 180" className="h-4 w-auto" fill="currentColor"><path d="M136.4 136.4c-4.1 4.1-10.7 4.1-14.8 0L62.5 77.3l59.1-59.1c4.1-4.1 10.7-4.1 14.8 0l25.8 25.8c4.1 4.1 4.1 10.7 0 14.8L129.1 92.1l33.3 33.3c4.1 4.1 4.1 10.7 0 14.8l-26 26.2zM12.7 77.3c-4.1 4.1-4.1 10.7 0 14.8l59.1 59.1c4.1 4.1 10.7 4.1 14.8 0l25.8-25.8c4.1-4.1 4.1-10.7 0-14.8L79.1 78.4 112.4 45c4.1-4.1 4.1-10.7 0-14.8l-26-26.2c-4.1-4.1-10.7-4.1-14.8 0L12.7 77.3zM228.6 136.3h-34.9V43.7h34.9v92.6zM228.6 30.1h-34.9V13.7h34.9v16.4zM327.9 43.7l-29.5 44.8 30.9 47.8h-39.7l-15.5-26.6-15.5 26.6h-39.7l30.9-47.8-29.5-44.8h39.7l14.1 23.6 14.1-23.6h39.7z"/></svg>
             
             {/* Visa */}
             <svg viewBox="0 0 128 40" className="h-3 w-auto" fill="currentColor"><path d="M50.2 2.6l-6.8 26.8h-6.7L43.5 2.6h6.7zM18.8 2.6l-10.7 18.5L3.8 2.6H0l9 26.8h6.5l14.5-26.8h-11.2zm64.8 0l-5.3 26.8h-6.4l5.3-26.8h6.4zm34.3 0h-5.2c-1.6 0-2.8.5-3.5 2.1l-10.1 24.7h6.7l2-5.5h8.2l.8 5.5h6.6L117.9 2.6zm-5.1 18.2l3.4-9.3 1.9 9.3h-5.3z" /></svg>

             {/* Mastercard */}
             <svg viewBox="0 0 32 24" className="h-6 w-auto" fill="currentColor"><circle cx="11" cy="12" r="11" fill="currentColor" opacity="0.8" /><circle cx="21" cy="12" r="11" fill="currentColor" opacity="0.8" /></svg>

             {/* Elo */}
             <div className="font-black text-[12px] italic tracking-tighter text-white">ELO</div>

             {/* Amex */}
             <div className="font-black text-[11px] border border-white/40 px-1.5 py-0.5 rounded-sm text-white">AMEX</div>

             <div className="h-5 w-px bg-white/20 mx-2 hidden md:block" />
             <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          
          <div className="text-center md:text-right">
             <p className="text-[9px] text-white/30 uppercase tracking-[0.4em]">© {currentYear} {settings?.storeName || 'Toda Bela'} • Moda Feminina</p>
             <p className="text-[8px] text-white/20 uppercase tracking-widest mt-1">CNPJ: {settings?.cnpj || '00.000.000/0001-00'}</p>
          </div>
        </div>
      </div>

      <Dialog open={!!activeInfo} onOpenChange={(o) => !o && setActiveInfo(null)}>
        <DialogContent className="max-w-lg rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden bg-white">
          <div className="bg-primary p-10 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="h-20 w-20" />
            </div>
            <DialogHeader className="relative z-10 text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent mb-2">Institucional</p>
              <DialogTitle className="text-3xl font-headline font-bold">
                {activeInfo && INFO_CONTENT[activeInfo]?.title}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-10">
            {activeInfo && INFO_CONTENT[activeInfo]?.content}
            <Button onClick={() => setActiveInfo(null)} className="mt-8 rounded-full h-12 px-8 bg-primary text-white text-[10px] font-bold uppercase tracking-widest">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <OrderTrackingDialog open={isTrackOpen} onOpenChange={setIsTrackOpen} />
    </footer>
  );
}
