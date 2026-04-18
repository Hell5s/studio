"use client";

import React from 'react';
import { Instagram, Facebook, Youtube, ShieldCheck, Mail, Phone, Clock, MapPin } from 'lucide-react';
import { LogoMark } from './LogoMark';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function Footer() {
  const paymentMethods = [
    { name: 'Visa', color: 'bg-white/10' },
    { name: 'Master', color: 'bg-white/10' },
    { name: 'Elo', color: 'bg-white/10' },
    { name: 'Pix', color: 'bg-accent/20' },
    { name: 'Boleto', color: 'bg-white/10' },
    { name: 'Hiper', color: 'bg-white/10' },
  ];

  const institutionalLinks = [
    { label: 'Acompanhar Pedido', href: '#' },
    { label: 'Termos de Uso', href: '#' },
    { label: 'Privacidade', href: '#' },
    { label: 'Trocas e Devoluções', href: '#' },
    { label: 'Sobre a Toda Bela', href: '#' },
    { label: 'Trabalhe Conosco', href: '#' },
  ];

  const categoryLinks = [
    { label: 'Vestidos', href: '#vitrine' },
    { label: 'Conjuntos', href: '#vitrine' },
    { label: 'Moda Praia', href: '#colecoes' },
    { label: 'Moda Fitness', href: '#colecoes' },
    { label: 'Acessórios', href: '#vitrine' },
  ];

  return (
    <footer className="bg-[#1A1516] text-white pt-24 pb-12 border-t border-white/5 selection:bg-accent/30 selection:text-white">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Brand Column */}
          <div className="space-y-10">
            <LogoMark className="scale-90 origin-left invert brightness-200" />
            <p className="text-white/50 font-light italic text-sm leading-relaxed max-w-xs">
              Inspirando presença, propósito e estilo. O movimento da mulher moderna que valoriza sua essência e autenticidade em cada detalhe.
            </p>
            <div className="flex gap-5">
              {[Instagram, Facebook, Youtube].map((Icon, idx) => (
                <button 
                  key={idx} 
                  className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-white transition-all duration-500 border border-white/5 hover:border-accent"
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>
          
          {/* Links Columns */}
          <div className="space-y-8">
            <h5 className="text-accent text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-2">
              <div className="h-px w-4 bg-accent/30" /> Atendimento
            </h5>
            <ul className="space-y-6 text-xs md:text-[13px] text-white/70 font-light">
              <li className="flex flex-col gap-1.5 group">
                <span className="text-white/30 uppercase text-[9px] font-bold tracking-widest flex items-center gap-2 group-hover:text-accent transition-colors">
                  <Phone className="h-3 w-3" /> WhatsApp
                </span>
                <span className="group-hover:text-white transition-colors">(11) 99999-9999</span>
              </li>
              <li className="flex flex-col gap-1.5 group">
                <span className="text-white/30 uppercase text-[9px] font-bold tracking-widest flex items-center gap-2 group-hover:text-accent transition-colors">
                  <Mail className="h-3 w-3" /> E-mail
                </span>
                <span className="group-hover:text-white transition-colors">contato@todobela.com.br</span>
              </li>
              <li className="flex flex-col gap-1.5">
                <span className="text-white/30 uppercase text-[9px] font-bold tracking-widest flex items-center gap-2">
                  <Clock className="h-3 w-3" /> Horário
                </span>
                <span>Seg a Sex | 08h às 18h</span>
              </li>
            </ul>
          </div>

          <div className="space-y-8">
            <h5 className="text-accent text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-2">
              <div className="h-px w-4 bg-accent/30" /> Institucional
            </h5>
            <ul className="space-y-4 text-xs md:text-[13px] text-white/70 font-light">
              {institutionalLinks.map((item) => (
                <li key={item.label} className="cursor-pointer hover:text-accent transition-colors flex items-center gap-3 group">
                  <div className="h-px w-0 bg-accent transition-all group-hover:w-4" />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-10">
            <div className="space-y-5">
              <h5 className="text-accent text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-2">
                <div className="h-px w-4 bg-accent/30" /> Pagamento Seguro
              </h5>
              <div className="grid grid-cols-3 gap-3">
                {paymentMethods.map((card) => (
                  <div 
                    key={card.name} 
                    className={cn(
                      "h-10 rounded-xl flex items-center justify-center text-[8px] font-bold uppercase tracking-widest border border-white/5 transition-all hover:border-white/20",
                      card.color
                    )}
                  >
                    {card.name}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-5">
              <h5 className="text-accent text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-2">
                <div className="h-px w-4 bg-accent/30" /> Segurança
              </h5>
              <div className="flex gap-4">
                <div className="flex items-center gap-3 px-5 py-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors w-full group">
                  <ShieldCheck className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-widest">SSL Secure</span>
                    <span className="text-[7px] text-white/40 uppercase">Ambiente Criptografado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center lg:items-start gap-2 text-center lg:text-left">
            <p className="text-[9px] uppercase tracking-[0.5em] text-white/30 font-bold">© 2024 Toda Bela Boutique de Luxo</p>
            <p className="text-[8px] uppercase tracking-[0.2em] text-white/15">CNPJ: 00.000.000/0001-00 • Todos os direitos reservados.</p>
          </div>
          <div className="flex items-center gap-10 opacity-30 hover:opacity-100 transition-opacity duration-700 grayscale hover:grayscale-0">
             <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-green-500/20 flex items-center justify-center">
                  <ShieldCheck className="h-3 w-3 text-green-500" />
                </div>
                <span className="text-[10px] font-bold tracking-tighter italic text-white/60">Google Safe Browsing</span>
             </div>
             <div className="h-4 w-px bg-white/10" />
             <span className="text-[8px] font-bold tracking-[0.3em] text-white/40 uppercase">E-commerce Experience</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
