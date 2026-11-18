"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CONSENT_EVENT, CONSENT_KEY } from '@/lib/metaPixel';

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      setOpen(!localStorage.getItem(CONSENT_KEY));
    } catch {}
  }, []);

  const choose = (value: 'granted' | 'denied') => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {}
    window.dispatchEvent(new Event(CONSENT_EVENT));
    setOpen(false);
  };

  if (!open) return null;
  // Portal + pointer-events-auto: Radix (Sheet/Dialog) deixa o body com pointer-events:none
  return createPortal(
    <div role="dialog" aria-label="Cookies" className="fixed bottom-24 sm:bottom-4 left-3 right-3 sm:right-auto sm:max-w-sm z-[200] pointer-events-auto rounded-xl bg-white border border-primary/10 shadow-2xl p-3">
      <p className="text-[11px] text-[#2A1F22]/80 leading-snug">
        Usamos cookies e o Meta Pixel para medir o uso do site e melhorar anúncios. Você pode recusar sem perder o acesso à loja.{' '}
        <Link href="/institucional/politica-de-privacidade" className="underline font-bold">Política de Privacidade</Link>
      </p>
      <div className="flex gap-2 mt-2">
        <Button onClick={() => choose('granted')} className="rounded-full h-8 px-4 text-[10px] font-bold uppercase tracking-widest">Aceitar</Button>
        <Button onClick={() => choose('denied')} variant="outline" className="rounded-full h-8 px-4 text-[10px] font-bold uppercase tracking-widest">Recusar</Button>
      </div>
    </div>,
    document.body
  );
}
