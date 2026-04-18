
"use client";

import React from 'react';
import { Instagram, Facebook, Youtube, ShieldCheck } from 'lucide-react';
import { LogoMark } from './LogoMark';

export function Footer() {
  return (
    <footer className="bg-primary text-white pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="space-y-8">
            <LogoMark className="invert brightness-200" />
            <p className="text-white/50 font-light italic text-sm leading-relaxed max-w-xs">
              Inspirando presença, propósito e estilo. O movimento da mulher moderna que valoriza sua essência.
            </p>
            <div className="flex gap-4">
              <button className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent transition-colors"><Instagram className="h-5 w-5" /></button>
              <button className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent transition-colors"><Facebook className="h-5 w-5" /></button>
              <button className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent transition-colors"><Youtube className="h-5 w-5" /></button>
            </div>
          </div>
          
          <div className="space-y-6">
            <h5 className="text-accent text-[10px] font-bold uppercase tracking-[0.4em]">Atendimento</h5>
            <ul className="space-y-4 text-xs text-white/70 font-light">
              <li>Seg a Sex | 08h às 18h</li>
              <li>WhatsApp: (11) 99999-9999</li>
              <li>contato@todobela.com.br</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h5 className="text-accent text-[10px] font-bold uppercase tracking-[0.4em]">Institucional</h5>
            <ul className="space-y-4 text-xs text-white/70 font-light">
              <li className="cursor-pointer hover:text-accent transition-colors">Acompanhar Pedido</li>
              <li className="cursor-pointer hover:text-accent transition-colors">Trocas e Devoluções</li>
              <li className="cursor-pointer hover:text-accent transition-colors">Trabalhe Conosco</li>
              <li className="cursor-pointer hover:text-accent transition-colors">Privacidade</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h5 className="text-accent text-[10px] font-bold uppercase tracking-[0.4em]">Segurança</h5>
            <div className="flex gap-4">
              <div className="flex items-center gap-3 px-5 py-4 bg-white/5 rounded-2xl border border-white/5">
                <ShieldCheck className="h-6 w-6 text-accent" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest">SSL Secure</span>
                  <span className="text-[8px] text-white/40 uppercase">Ambiente Criptografado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] uppercase tracking-[0.5em] text-white/30 font-bold">© 2024 Toda Bela Boutique • Todos os direitos reservados.</p>
          <div className="flex items-center gap-8 opacity-20 hover:opacity-50 transition-opacity grayscale">
             <span className="text-[10px] font-bold tracking-tighter italic">Google Safe Browsing</span>
             <span className="text-[8px] font-bold tracking-[0.3em]">E-commerce Experience</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
