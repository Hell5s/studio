"use client";

import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';

const MESSAGE = 'Olá! Vim pelo site da Toda Bela e gostaria de ajuda.';

export function WhatsAppFloat() {
  const pathname = usePathname();
  const db = useFirestore();
  const ref = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings } = useDoc(ref);
  const phone = ((settings as any)?.whatsapp || '').replace(/\D/g, '');

  if (!phone || pathname?.startsWith('/admin')) return null;
  return (
    <a
      href={`https://wa.me/${phone}?text=${encodeURIComponent(MESSAGE)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className={`fixed ${pathname?.startsWith("/products/") ? "bottom-24 lg:bottom-4" : "bottom-4"} right-4 z-50 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-xl flex items-center justify-center hover:scale-105 transition-transform`}
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
