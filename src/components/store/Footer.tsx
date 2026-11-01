"use client";

import React, { useState } from 'react';
import { 
  Instagram, MessageCircle, Mail, ShieldCheck, Truck, RefreshCcw, 
  CreditCard, Sparkles, Facebook, Youtube, Gift, Heart, Package, 
  Clock, Star, Percent 
} from 'lucide-react';
import { LogoMark } from './LogoMark';
import { OrderTrackingDialog } from './OrderTrackingDialog';
import { useFirestore, useDoc, useMemoFirebase, useFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { FOOTER_LABEL_TO_SLUG } from '@/lib/institucional';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ICON_MAP: Record<string, any> = {
  Truck, RefreshCcw, CreditCard, ShieldCheck, Gift, Heart, Package, Clock, Star, Percent
};

// Base dos selos de bandeira do rodapé (fundo branco; Elo e Amex trocam a cor de fundo).
const paymentChip = "h-7 min-w-[44px] px-2 rounded-md bg-white flex items-center justify-center gap-1 shadow-sm";

interface FooterLink {
  label: string;
  type: 'page' | 'url' | 'track' | 'whatsapp';
  url?: string;
  pageTitle?: string;
  pageContent?: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterBenefit {
  icon: string;
  title: string;
  desc: string;
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  const db = useFirestore();
  const [activePage, setActivePage] = useState<{title: string, content: string} | null>(null);
  const [isTrackOpen, setIsTrackOpen] = useState(false);

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc(settingsRef);

  const footer = settings?.footer;

  // Defaults baseados no design original
  const bgColor = footer?.bgColor || '#6E3C47';
  const accentColor = footer?.accentColor || '#C7A17A';
  const showBenefitsBar = footer?.showBenefitsBar !== false;
  const benefits = footer?.benefits || [
    { icon: 'Truck', title: 'Frete Grátis', desc: 'Acima de R$ 250' },
    { icon: 'RefreshCcw', title: 'Troca Fácil', desc: 'Até 7 dias' },
    { icon: 'CreditCard', title: 'Até 10x', desc: 'No cartão' },
    { icon: 'ShieldCheck', title: 'Compra Segura', desc: 'SSL Certificado' },
  ];
  
  const columns: FooterColumn[] = footer?.columns || [
    {
      title: 'A Toda Bela',
      links: [
        { label: 'Sobre Nós', type: 'page' },
        { label: 'Nossa História', type: 'page' },
        { label: 'Trabalhe Conosco', type: 'page' }
      ]
    },
    {
      title: 'Atendimento',
      links: [
        { label: 'Rastrear Pedido', type: 'track' },
        { label: 'Trocas e Devoluções', type: 'page' },
        { label: 'Fale Conosco', type: 'page' },
        { label: 'Perguntas Frequentes', type: 'page' }
      ]
    },
    {
      title: 'Informações',
      links: [
        { label: 'Termos de Uso', type: 'page' },
        { label: 'Política de Privacidade', type: 'page' },
        { label: 'Política de Reembolso', type: 'page' }
      ]
    }
  ];

  // Sem WhatsApp cadastrado, "Fale Conosco" leva ao Instagram da loja (antes abria um número de exemplo).
  const handleOpenWhatsApp = () => {
    const phone = (settings?.whatsapp || '').replace(/\D/g, '');
    if (phone) {
      window.open(`https://wa.me/${phone}`, '_blank');
    } else if (settings?.instagram) {
      window.open(`https://instagram.com/${settings.instagram.replace('@', '')}`, '_blank');
    } else if (settings?.contactEmail) {
      window.location.href = `mailto:${settings.contactEmail}`;
    }
  };

  const handleLinkClick = (link: FooterLink) => {
    // Lógica para Páginas Institucionais Reais
    if (link.type !== 'track') {
      const normalizedLabel = link.label
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
        
      const slug = FOOTER_LABEL_TO_SLUG[normalizedLabel];
      if (slug) {
        window.location.href = `/institucional/${slug}`;
        return;
      }
    }

    if (link.type === 'page' && link.pageTitle) {
      setActivePage({ title: link.pageTitle || link.label, content: link.pageContent || '' });
    } else if (link.type === 'track') {
      setIsTrackOpen(true);
    } else if (link.type === 'whatsapp') {
      handleOpenWhatsApp();
    } else if (link.type === 'url' && link.url) {
      const u = link.url;
      if (u.startsWith('http') || u.startsWith('mailto:') || u.startsWith('tel:') || u.startsWith('/')) {
        if (u.startsWith('http')) window.open(u, '_blank', 'noopener noreferrer');
        else window.location.href = u;
      }
    }
  };

  return (
    <footer className="text-white overflow-hidden relative" style={{ backgroundColor: bgColor }}>
      {/* Faixa de benefícios */}
      {showBenefitsBar && (
        <div className="border-b border-white/5">
          <div className="container mx-auto px-6 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8">
              {benefits.map((item: FooterBenefit, i: number) => {
                const Icon = ICON_MAP[item.icon] || Star;
                return (
                  <div key={i} className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-3">
                    <div className="h-11 w-11 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0" style={{ color: accentColor }}>
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">{item.title}</p>
                      <p className="text-[10px] text-white/60 mt-1 uppercase font-medium">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="container mx-auto px-6 pt-16 pb-12">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 mb-16">
          {/* Logo e Redes Sociais */}
          <div className="lg:w-1/4 space-y-8">
            {footer?.logoUrl ? (
              <div className="h-16">
                <img src={footer.logoUrl} className="h-full object-contain" alt={settings?.storeName} />
              </div>
            ) : (
              <div className="brightness-0 invert">
                <LogoMark className="[&_#logo-ball]:opacity-0 [&_#logo-ball]:w-0" />
              </div>
            )}
            <p className="text-[12px] text-white/50 font-light italic leading-relaxed max-w-xs">
              {settings?.tagline || 'Celebrando a potência e a sofisticação da mulher moderna através de peças atemporais.'}
            </p>
            <div className="flex gap-4">
              {settings?.instagram && (
                <button onClick={() => window.open(`https://instagram.com/${settings.instagram.replace('@','')}`, '_blank')} className="h-10 w-10 rounded-full border border-white/25 bg-white/10 text-white flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-500">
                  <Instagram className="h-4 w-4" />
                </button>
              )}
              {settings?.instagram && (
                <span className="self-center text-[11px] font-bold text-white/70">{settings.instagram}</span>
              )}
              {footer?.socials?.facebook && (
                <button onClick={() => window.open(footer.socials.facebook, '_blank')} className="h-10 w-10 rounded-full border border-white/25 bg-white/10 text-white flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-500">
                  <Facebook className="h-4 w-4" />
                </button>
              )}
              {footer?.socials?.youtube && (
                <button onClick={() => window.open(footer.socials.youtube, '_blank')} className="h-10 w-10 rounded-full border border-white/25 bg-white/10 text-white flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-500">
                  <Youtube className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Colunas de Links */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
            {columns.map((col, idx) => (
              col.links.length > 0 && (
                <div key={idx} className="space-y-6">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: accentColor }}>{col.title}</h5>
                  <ul className="space-y-4">
                    {col.links.map((link, lIdx) => (
                      <li key={lIdx}>
                        <button 
                          onClick={() => handleLinkClick(link)} 
                          className="text-[11px] text-white/40 hover:text-white transition-all uppercase tracking-widest text-left"
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ))}

            {/* Coluna Contato */}
            {footer?.showContactColumn !== false && (
              <div className="space-y-6">
                <h5 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: accentColor }}>{footer?.contactTitle || 'Contato'}</h5>
                <div className="space-y-5">
                  {settings?.whatsapp && (
                    <button onClick={handleOpenWhatsApp} className="flex items-center gap-3 group text-left">
                      <div className="h-8 w-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center transition-all group-hover:bg-white" style={{ color: accentColor }}>
                        <MessageCircle className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-[8px] text-white/30 uppercase font-black tracking-widest">WhatsApp</p>
                        <p className="text-[10px] text-white/60 font-bold uppercase tracking-tight">{settings.whatsapp}</p>
                      </div>
                    </button>
                  )}
                  {settings?.contactEmail && (
                    <button onClick={() => window.location.href = `mailto:${settings.contactEmail}`} className="flex items-center gap-3 group text-left">
                      <div className="h-8 w-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center transition-all group-hover:bg-white" style={{ color: accentColor }}>
                        <Mail className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-[8px] text-white/30 uppercase font-black tracking-widest">E-mail</p>
                        <p className="text-[11px] text-white/70 font-bold whitespace-nowrap">{settings.contactEmail}</p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selos de Pagamento */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Bandeiras em "cartõezinhos" com as cores de cada marca, legíveis sobre o fundo escuro */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <p className="text-[8px] text-white/40 uppercase font-black tracking-[0.3em]">Formas de pagamento</p>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
              {footer?.payments?.pix !== false && (
                <span className={paymentChip} aria-label="Pix" title="Pix">
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
                    <rect x="3.2" y="3.2" width="9.6" height="9.6" rx="2" transform="rotate(45 8 8)" fill="none" stroke="#32BCAD" strokeWidth="2" />
                  </svg>
                  <span className="text-[11px] font-black lowercase text-[#32BCAD] leading-none">pix</span>
                </span>
              )}
              {footer?.payments?.visa !== false && (
                <span className={paymentChip} aria-label="Visa" title="Visa">
                  <span className="text-[12px] font-black italic tracking-tight text-[#1A1F71] leading-none">VISA</span>
                </span>
              )}
              {footer?.payments?.mastercard !== false && (
                <span className={paymentChip} aria-label="Mastercard" title="Mastercard">
                  <svg viewBox="0 0 32 20" className="h-4 w-auto" aria-hidden="true">
                    <circle cx="12" cy="10" r="8" fill="#EB001B" />
                    <circle cx="20" cy="10" r="8" fill="#F79E1B" />
                    <path d="M16 3.07a8 8 0 0 1 0 13.86 8 8 0 0 1 0-13.86z" fill="#FF5F00" />
                  </svg>
                </span>
              )}
              {footer?.payments?.elo !== false && (
                <span className={cn(paymentChip, "bg-black")} aria-label="Elo" title="Elo">
                  <span className="text-[12px] font-black lowercase text-white leading-none">elo</span>
                </span>
              )}
              {footer?.payments?.amex !== false && (
                <span className={cn(paymentChip, "bg-[#016FD0]")} aria-label="American Express" title="American Express">
                  <span className="text-[9px] font-black tracking-tight text-white leading-none">AMEX</span>
                </span>
              )}
              {footer?.payments?.securitySeal !== false && (
                <span className="flex items-center gap-1.5 ml-2 text-white/70">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[9px] uppercase font-bold tracking-widest">Compra segura</span>
                </span>
              )}
            </div>
          </div>
          
          <div className="text-center md:text-right">
             <p className="text-[9px] text-white/30 uppercase tracking-[0.4em]">© {currentYear} {settings?.storeName || 'Toda Bela'} • {footer?.copyrightSuffix || 'Moda Feminina'}</p>
             {settings?.cnpj && footer?.showCnpj !== false && <p className="text-[8px] text-white/40 uppercase tracking-widest mt-1">{settings.legalName ? `${settings.legalName} • ` : ''}CNPJ: {settings.cnpj}</p>}
          </div>
        </div>
      </div>

      <Dialog open={!!activePage} onOpenChange={(o) => !o && setActivePage(null)}>
        <DialogContent className="max-w-lg rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden bg-white">
          <div className="bg-primary p-10 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="h-20 w-20" />
            </div>
            <DialogHeader className="relative z-10 text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent mb-2">Institucional</p>
              <DialogTitle className="text-3xl font-headline font-bold">
                {activePage?.title}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-10">
            <div className="text-sm leading-relaxed text-muted-foreground italic font-light whitespace-pre-line">
              {activePage?.content}
            </div>
            <Button onClick={() => setActivePage(null)} className="mt-8 rounded-full h-12 px-8 bg-primary text-white text-[10px] font-bold uppercase tracking-widest">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <OrderTrackingDialog open={isTrackOpen} onOpenChange={setIsTrackOpen} />
    </footer>
  );
}
