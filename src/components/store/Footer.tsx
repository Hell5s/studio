
"use client";

import React, { useState } from 'react';
import { 
  Instagram, 
  Facebook, 
  Youtube, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  RefreshCcw, 
  HelpCircle,
  Mail,
  MapPin,
  Phone,
  X,
  Sparkles
} from 'lucide-react';
import { LogoMark } from './LogoMark';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { OrderTrackingDialog } from './OrderTrackingDialog';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const INFO_CONTENT: Record<string, { title: string; subtitle: string; content: React.ReactNode }> = {
  'nossa-historia': {
    title: 'Nossa História',
    subtitle: 'O movimento por trás da marca',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground italic font-light">
        <p>A Toda Bela nasceu do desejo de celebrar a potência da mulher brasileira através da moda. Iniciamos nossa jornada como uma pequena marca e hoje somos um destino para mulheres que buscam expressar sua confiança com sofisticação.</p>
        <p>Nossa essência reside no equilíbrio entre o clássico e o contemporâneo, criando peças que não apenas vestem, mas acompanham momentos de conquista e celebração.</p>
      </div>
    )
  },
  'universo': {
    title: 'Universo Toda Bela',
    subtitle: 'Manifesto de estilo e propósito',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground italic font-light">
        <p>Viver o Universo Toda Bela é entender que a moda é uma ferramenta de comunicação silenciosa. Valorizamos a produção ética, a qualidade impecável dos tecidos e o caimento que respeita as curvas femininas.</p>
        <p>Cada coleção é um capítulo de uma história que escrevemos juntas, focada em elegância, autenticidade e a busca constante pela melhor versão de si mesma.</p>
      </div>
    )
  },
  'privacidade': {
    title: 'Política de Privacidade',
    subtitle: 'Segurança e transparência com seus dados',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground italic font-light">
        <p>Sua privacidade é nossa prioridade máxima. Na Toda Bela, utilizamos as tecnologias mais avançadas de criptografia para garantir que seus dados pessoais e de pagamento estejam 100% protegidos.</p>
        <p>Coletamos apenas as informações necessárias para processar seus pedidos e oferecer uma experiência personalizada na boutique. Nunca compartilhamos seus dados com terceiros sem seu consentimento explícito.</p>
      </div>
    )
  },
  'termos': {
    title: 'Termos de Uso',
    subtitle: 'Condições gerais da boutique',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground italic font-light">
        <p>Ao navegar em nossa boutique, você concorda com os termos de excelência e respeito mútuo da nossa comunidade. Todos os preços e condições são válidos exclusivamente para compras realizadas no site.</p>
        <p>As imagens dos produtos são produzidas em estúdio profissional para representar as cores e detalhes com a maior fidelidade possível.</p>
      </div>
    )
  },
  'trocas': {
    title: 'Trocas e Devoluções',
    subtitle: 'Garantia de satisfação Toda Bela',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground italic font-light">
        <p>Queremos que você ame cada peça. Caso precise realizar uma troca, você tem até 30 dias corridos após o recebimento para solicitar através do nosso WhatsApp VIP.</p>
        <p>A primeira troca é por nossa conta, garantindo que sua experiência de compra seja livre de preocupações e totalmente focada no seu bem-estar.</p>
      </div>
    )
  },
  'reembolso': {
    title: 'Política de Reembolso',
    subtitle: 'Transparência em cada transação',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground italic font-light">
        <p>Em caso de desistência da compra, o reembolso será processado através do mesmo método de pagamento utilizado. Para PIX, o estorno ocorre em até 24h úteis.</p>
        <p>Para cartões de crédito, a devolução segue o prazo da sua operadora, geralmente aparecendo em até duas faturas subsequentes.</p>
      </div>
    )
  }
};

export function Footer() {
  const currentYear = new Date().getFullYear();
  const db = useFirestore();
  const [activeInfo, setActiveInfo] = useState<string | null>(null);
  const [isTrackOpen, setIsTrackOpen] = useState(false);

  // Configurações Globais
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc(settingsRef);

  const handleOpenInfo = (id: string) => setActiveInfo(id);
  const handleOpenWhatsApp = () => {
    const phone = (settings?.whatsapp || '5511999999999').replace(/\D/g, '');
    window.open(`https://wa.me/${phone}`, '_blank');
  };
  const handleOpenMail = () => window.location.href = `mailto:${settings?.contactEmail || 'contato@todobela.com.br'}`;

  return (
    <footer className="bg-primary text-white pt-16 md:pt-24 pb-10 md:pb-16 overflow-hidden relative">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-16 mb-12 md:mb-16">
          
          <div className="lg:col-span-4 space-y-10 pb-10 md:pb-0 border-b md:border-b-0 border-white/5">
            <div className="brightness-0 invert scale-100 md:scale-125 origin-left">
              <LogoMark />
            </div>
            <div className="space-y-8">
              <p className="text-white/60 font-light italic text-base md:text-lg leading-relaxed max-w-sm">
                {settings?.tagline || 'Inspirando presença, propósito e estilo. Na Toda Bela, acreditamos que cada peça é uma extensão da sua essência e um movimento em direção à sua melhor versão.'}
              </p>
              <div className="flex gap-5">
                {[
                  { icon: <Instagram className="h-6 w-6" />, label: "Instagram", url: settings?.instagram?.startsWith('http') ? settings.instagram : `https://instagram.com/${settings?.instagram?.replace('@', '') || 'todabela'}` },
                  { icon: <Facebook className="h-6 w-6" />, label: "Facebook", url: 'https://facebook.com/todabela' },
                  { icon: <Youtube className="h-6 w-6" />, label: "YouTube", url: 'https://youtube.com/todabela' }
                ].map((social) => (
                  <button 
                    key={social.label}
                    onClick={() => window.open(social.url, '_blank')}
                    className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-accent hover:border-accent transition-all duration-500 group min-h-[44px] min-w-[44px]"
                  >
                    <span className="group-hover:scale-110 transition-transform">{social.icon}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-12 md:gap-20">
            <div className="space-y-8">
              <h5 className="font-headline text-xl md:text-2xl font-bold text-accent tracking-tight">Institucional</h5>
              <ul className="space-y-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
                <li className="hover:text-accent cursor-pointer transition-colors" onClick={() => handleOpenInfo('nossa-historia')}>Nossa História</li>
                <li className="hover:text-accent cursor-pointer transition-colors" onClick={() => handleOpenInfo('universo')}>Universo Toda Bela</li>
                <li className="hover:text-accent cursor-pointer transition-colors" onClick={() => window.location.href = '/'}>Blog Editorial</li>
                <li className="hover:text-accent cursor-pointer transition-colors" onClick={handleOpenMail}>Trabalhe Conosco</li>
              </ul>
            </div>
            
            <div className="space-y-8">
              <h5 className="font-headline text-xl md:text-2xl font-bold text-accent tracking-tight">Experiência</h5>
              <ul className="space-y-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
                <li className="hover:text-accent cursor-pointer transition-colors" onClick={() => setIsTrackOpen(true)}>Acompanhar Pedido</li>
                <li className="hover:text-accent cursor-pointer transition-colors" onClick={() => handleOpenInfo('trocas')}>Trocas e Devoluções</li>
                <li className="hover:text-accent cursor-pointer transition-colors" onClick={handleOpenWhatsApp}>Guia de Medidas</li>
                <li className="hover:text-accent cursor-pointer transition-colors" onClick={handleOpenWhatsApp}>Suporte Personalizado</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-10">
            <h5 className="font-headline text-xl md:text-2xl font-bold text-accent tracking-tight">Atendimento</h5>
            <div className="space-y-8">
              <button onClick={handleOpenWhatsApp} className="flex items-start gap-5 group text-left w-full min-h-[44px]">
                 <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-accent/30 transition-colors shrink-0">
                    <Phone className="h-5 w-5 text-accent" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">WhatsApp VIP</p>
                    <p className="text-sm md:text-base font-medium">{settings?.whatsapp || '(11) 99999-9999'}</p>
                 </div>
              </button>
              <button onClick={handleOpenMail} className="flex items-start gap-5 group text-left w-full min-h-[44px]">
                 <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-accent/30 transition-colors shrink-0">
                    <Mail className="h-5 w-5 text-accent" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">E-mail Editorial</p>
                    <p className="text-sm md:text-base font-medium">{settings?.contactEmail || 'contato@todobela.com.br'}</p>
                 </div>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-16 py-12 md:py-20 border-y border-white/5 mb-12 md:mb-20">
          {[
            { icon: <Truck className="h-6 w-6" />, title: "Entrega VIP", desc: "Envio Premium" },
            { icon: <RefreshCcw className="h-6 w-6" />, title: "Troca Fácil", desc: "Até 30 dias" },
            { icon: <CreditCard className="h-6 w-6" />, title: "Pagamento", desc: "Até 10x s/ juros" },
            { icon: <HelpCircle className="h-6 w-6" />, title: "Stylist", desc: "Suporte VIP" }
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-4 md:gap-6 group">
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-full border border-accent/20 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-primary transition-all duration-500 shrink-0">
                {benefit.icon}
              </div>
              <div>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest leading-tight">{benefit.title}</p>
                <p className="text-[10px] text-white/40 italic font-light hidden sm:block mt-1">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-10 flex flex-col lg:flex-row justify-between items-center gap-12">
          <div className="space-y-4 text-center lg:text-left">
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/30 font-bold">
              © {currentYear} {settings?.storeName || 'Toda Bela'} Boutique • São Paulo, Brasil
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">
              <span className="hover:text-accent cursor-pointer transition-colors" onClick={() => handleOpenInfo('termos')}>Termos</span>
              <span className="hover:text-accent cursor-pointer transition-colors" onClick={() => handleOpenInfo('privacidade')}>Privacidade</span>
              <span className="hover:text-accent cursor-pointer transition-colors" onClick={() => handleOpenInfo('reembolso')}>Reembolso</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex items-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
               <div className="h-7 w-12 bg-white/10 rounded border border-white/5 flex items-center justify-center"><CreditCard className="h-4 w-4" /></div>
               <div className="h-7 w-12 bg-white/10 rounded border border-white/5 flex items-center justify-center font-bold text-[9px]">PIX</div>
               <div className="h-7 w-12 bg-white/10 rounded border border-white/5 flex items-center justify-center font-bold text-[9px]">VISA</div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-3xl border border-white/5 group hover:border-accent/20 transition-all">
               <ShieldCheck className="h-6 w-6 text-accent" />
               <div className="flex flex-col">
                 <span className="text-[9px] font-bold uppercase tracking-widest">SSL Secure</span>
                 <span className="text-[7px] text-white/30 uppercase">Ambiente Seguro</span>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      <Dialog open={!!activeInfo} onOpenChange={(o) => !o && setActiveInfo(null)}>
        <DialogContent className="max-w-2xl rounded-[3rem] p-0 border-none shadow-2xl overflow-hidden bg-[#FFF9F7]">
          {activeInfo && INFO_CONTENT[activeInfo] && (
            <>
              <div className="bg-primary p-12 text-primary-foreground relative">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Sparkles className="h-24 w-24" />
                </div>
                <DialogHeader className="relative z-10 text-left space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent">Editorial Toda Bela</p>
                  <DialogTitle className="text-3xl md:text-4xl font-headline font-bold leading-tight">{INFO_CONTENT[activeInfo].title}</DialogTitle>
                </DialogHeader>
              </div>
              <div className="p-12">
                {INFO_CONTENT[activeInfo].content}
                <div className="mt-12 pt-8 border-t border-primary/5 text-center">
                  <button 
                    onClick={() => setActiveInfo(null)}
                    className="text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-primary transition-colors min-h-[44px]"
                  >
                    Fechar Editorial
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <OrderTrackingDialog open={isTrackOpen} onOpenChange={setIsTrackOpen} />
    </footer>
  );
}
