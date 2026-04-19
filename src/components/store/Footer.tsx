
"use client";

import React from 'react';
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
  Phone
} from 'lucide-react';
import { LogoMark } from './LogoMark';
import { cn } from '@/lib/utils';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white pt-32 pb-12 overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Top Grid: Brand Identity & Links */}
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
                  { icon: <Instagram className="h-5 w-5" />, label: "Instagram" },
                  { icon: <Facebook className="h-5 w-5" />, label: "Facebook" },
                  { icon: <Youtube className="h-5 w-5" />, label: "YouTube" }
                ].map((social) => (
                  <button 
                    key={social.label}
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
                <li className="hover:text-accent cursor-pointer transition-colors">Nossa História</li>
                <li className="hover:text-accent cursor-pointer transition-colors">Universo Toda Bela</li>
                <li className="hover:text-accent cursor-pointer transition-colors">Blog Editorial</li>
                <li className="hover:text-accent cursor-pointer transition-colors">Trabalhe Conosco</li>
                <li className="hover:text-accent cursor-pointer transition-colors">Seja uma Revendedora</li>
              </ul>
            </div>
            
            <div className="space-y-8">
              <h5 className="font-headline text-xl font-bold text-accent tracking-tight">Experiência</h5>
              <ul className="space-y-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
                <li className="hover:text-accent cursor-pointer transition-colors">Acompanhar Pedido</li>
                <li className="hover:text-accent cursor-pointer transition-colors">Trocas e Devoluções</li>
                <li className="hover:text-accent cursor-pointer transition-colors">Guia de Medidas</li>
                <li className="hover:text-accent cursor-pointer transition-colors">Cuidados com a Peça</li>
                <li className="hover:text-accent cursor-pointer transition-colors">Perguntas Frequentes</li>
              </ul>
            </div>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-3 space-y-8">
            <h5 className="font-headline text-xl font-bold text-accent tracking-tight">Atendimento</h5>
            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                 <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-accent/30 transition-colors">
                    <Phone className="h-4 w-4 text-accent" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">WhatsApp VIP</p>
                    <p className="text-sm font-medium">(11) 99999-9999</p>
                 </div>
              </div>
              <div className="flex items-start gap-4 group">
                 <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-accent/30 transition-colors">
                    <Mail className="h-4 w-4 text-accent" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">E-mail Editorial</p>
                    <p className="text-sm font-medium">contato@todobela.com.br</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
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
              <span className="hover:text-accent cursor-pointer transition-colors">Termos de Uso</span>
              <span className="hover:text-accent cursor-pointer transition-colors">Política de Privacidade</span>
              <span className="hover:text-accent cursor-pointer transition-colors">Política de Reembolso</span>
              <span className="hover:text-accent cursor-pointer transition-colors">Defesa do Consumidor</span>
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
    </footer>
  );
}
