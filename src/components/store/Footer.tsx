
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

const INFO_CONTENT: Record<string, { title: string; subtitle: string; content: React.ReactNode }> = {
  'nossa-historia': {
    title: 'Nossa História',
    subtitle: 'O movimento por trás da marca',
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground italic font-light">
        <p>A Toda Bela nasceu do desejo de celebrar a potência da mulher brasileira através da moda. Iniciamos nossa jornada como uma pequena curadoria e hoje somos um destino para mulheres que buscam expressar sua confiança com sofisticação.</p>
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
  const [activeInfo, setActiveInfo] = useState<string | null>(null);
  const [isTrackOpen, setIsTrackOpen] = useState(false);

  const handleOpenInfo = (id: string) => setActiveInfo(id);
  const handleOpenWhatsApp = () => window.open('https://wa.me/5511999999999', '_blank');
  const handleOpenMail = () => window.location.href = 'mailto:contato@todobela.com.br';

  return (
    <footer className="bg-primary text-white pt-32 pb-12 overflow-hidden relative">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-24 mb-32">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-10">
            <LogoMark className="invert brightness-200 scale-110 origin-left" />
            <div className="space-y-6">
              <p className="text-white/60 font-light italic text-base leading-relaxed max-w-sm">
                Inspirando presença, propósito e estilo. Na Toda Bela, acreditamos que cada peça é uma extensão da sua essência e um movimento em direção à sua melhor versão.
              </p>
              <div className="flex gap-5">
                {[
                  { icon: <Instagram className="h-5 w-5" />, label: "Instagram", url: 'https://instagram.com/todabela' },
                  { icon: <Facebook className="h-5 w-5" />, label: "Facebook", url: 'https://facebook.com/todabela' },
                  { icon: <Youtube className="h-5 w-5" />, label: "YouTube", url: 'https://youtube.com/todabela' }
                ].map((social) => (
                  <button 
                    key={social.label}
                    onClick={() => window.open(social.url, '_blank')}
                    className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-accent hover:border-accent transition-all duration-500 group"
                  >
                    <span className="group-hover:scale-110 transition-transform">{social.icon}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links Group */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-12">
            <div className="space-y-8">
              <h5 className="font-headline text-xl font-bold text-accent tracking-tight">Institucional</h5>
              <ul className="space-y-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
                <li className="hover:text-accent cursor-pointer transition-colors" onClick={() => handleOpenInfo('nossa-historia')}>Nossa História</li>
                <li className="hover:text-accent cursor-pointer transition-colors" onClick={() => handleOpenInfo('universo')}>Universo Toda Bela</li>
                <li className="hover:text-accent cursor-pointer transition-colors" onClick={() => window.location.href = '/'}>Blog Editorial</li>
                <li className="hover:text-accent cursor-pointer transition-colors" onClick={handleOpenMail}>Trabalhe Conosco</li>
                <li className="hover:text-accent cursor-pointer transition-colors" onClick={handleOpenWhatsApp}>Seja uma Revendedora</li>
              </ul>
            </div>
            
            <div className="space-y-8">
              <h5 className="font-headline text-xl font-bold text-accent tracking-tight">Experiência</h5>
              <ul className="space-y-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
                <li className="hover:text-accent cursor-pointer transition-colors" onClick={() => setIsTrackOpen(true)}>Acompanhar Pedido</li>
                <li className="hover:text-accent cursor-pointer transition-colors" onClick={() => handleOpenInfo('trocas')}>Trocas e Devoluções</li>
                <li className="hover:text-accent cursor-pointer transition-colors" onClick={handleOpenWhatsApp}>Guia de Medidas</li>
                <li className="hover:text-accent cursor-pointer transition-colors" onClick={handleOpenWhatsApp}>Cuidados com a Peça</li>
                <li className="hover:text-accent cursor-pointer transition-colors" onClick={handleOpenWhatsApp}>Perguntas Frequentes</li>
              </ul>
            </div>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-3 space-y-8">
            <h5 className="font-headline text-xl font-bold text-accent tracking-tight">Atendimento</h5>
            <div className="space-y-6">
              <button onClick={handleOpenWhatsApp} className="flex items-start gap-4 group text-left w-full">
                 <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-accent/30 transition-colors shrink-0">
                    <Phone className="h-4 w-4 text-accent" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">WhatsApp VIP</p>
                    <p className="text-sm font-medium">(11) 99999-9999</p>
                 </div>
              </button>
              <button onClick={handleOpenMail} className="flex items-start gap-4 group text-left w-full">
                 <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-accent/30 transition-colors shrink-0">
                    <Mail className="h-4 w-4 text-accent" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">E-mail Editorial</p>
                    <p className="text-sm font-medium">contato@todobela.com.br</p>
                 </div>
              </button>
              <div className="flex items-start gap-4">
                 <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                    <MapPin className="h-4 w-4 text-accent" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Boutique Office</p>
                    <p className="text-sm font-medium leading-relaxed">São Paulo, Brasil</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Bar */}
        <div className="grid md:grid-cols-4 gap-8 py-12 border-y border-white/5 mb-12">
          {[
            { icon: <Truck className="h-5 w-5" />, title: "Entrega VIP", desc: "Embalagem premium" },
            { icon: <RefreshCcw className="h-5 w-5" />, title: "Troca Fácil", desc: "Até 30 dias" },
            { icon: <CreditCard className="h-5 w-5" />, title: "Parcele seu Look", desc: "Em até 10x sem juros" },
            { icon: <HelpCircle className="h-5 w-5" />, title: "Personal Stylist", desc: "Suporte via WhatsApp" }
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-5 group">
              <div className="h-12 w-12 rounded-full border border-accent/20 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-primary transition-all duration-500">
                {benefit.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest">{benefit.title}</p>
                <p className="text-[10px] text-white/40 italic font-light">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar: Legal & Payment */}
        <div className="pt-12 flex flex-col lg:flex-row justify-between items-center gap-12">
          <div className="space-y-4 text-center lg:text-left">
            <p className="text-[9px] uppercase tracking-[0.5em] text-white/30 font-bold">
              © {currentYear} Toda Bela Boutique • Todos os direitos reservados.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-[8px] font-bold uppercase tracking-[0.3em] text-white/20">
              <span className="hover:text-accent cursor-pointer transition-colors" onClick={() => handleOpenInfo('termos')}>Termos de Uso</span>
              <span className="hover:text-accent cursor-pointer transition-colors" onClick={() => handleOpenInfo('privacidade')}>Política de Privacidade</span>
              <span className="hover:text-accent cursor-pointer transition-colors" onClick={() => handleOpenInfo('reembolso')}>Política de Reembolso</span>
              <span className="hover:text-accent cursor-pointer transition-colors" onClick={() => window.open('http://www.planalto.gov.br/ccivil_03/leis/l8078.htm', '_blank')}>Defesa do Consumidor</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Payment Methods */}
            <div className="flex items-center gap-4 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
               <div className="h-6 w-10 bg-white/10 rounded border border-white/5 flex items-center justify-center"><CreditCard className="h-4 w-4" /></div>
               <div className="h-6 w-10 bg-white/10 rounded border border-white/5 flex items-center justify-center font-bold text-[8px]">PIX</div>
               <div className="h-6 w-10 bg-white/10 rounded border border-white/5 flex items-center justify-center font-bold text-[8px]">VISA</div>
            </div>

            {/* Security Seals */}
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3 px-5 py-3 bg-white/5 rounded-2xl border border-white/5 group hover:border-accent/20 transition-all">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold uppercase tracking-widest">SSL Secure</span>
                    <span className="text-[7px] text-white/30 uppercase">Ambiente Criptografado</span>
                  </div>
               </div>
               <div className="opacity-20 hover:opacity-50 transition-opacity grayscale flex items-center gap-2">
                  <span className="text-[8px] font-bold tracking-[0.3em] uppercase">E-commerce Premium Experience</span>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Decorative Element */}
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      {/* Info Dialog */}
      <Dialog open={!!activeInfo} onOpenChange={(o) => !o && setActiveInfo(null)}>
        <DialogContent className="max-w-xl rounded-[3rem] p-0 border-none shadow-2xl overflow-hidden bg-[#FFF9F7]">
          {activeInfo && INFO_CONTENT[activeInfo] && (
            <>
              <div className="bg-primary p-10 text-primary-foreground relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles className="h-24 w-24" />
                </div>
                <DialogHeader className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent mb-2">Editorial</p>
                  <DialogTitle className="text-3xl font-headline font-bold">{INFO_CONTENT[activeInfo].title}</DialogTitle>
                  <DialogDescription className="text-white/60 italic mt-1">{INFO_CONTENT[activeInfo].subtitle}</DialogDescription>
                </DialogHeader>
              </div>
              <div className="p-10">
                {INFO_CONTENT[activeInfo].content}
                <div className="mt-10 pt-8 border-t border-primary/5 text-center">
                  <button 
                    onClick={() => setActiveInfo(null)}
                    className="text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-primary transition-colors"
                  >
                    Fechar Janela
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
