"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CONSENT_EVENT, isDenied, trackEvent } from '@/lib/metaPixel';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

function loadPixel(id: string) {
  const w = window as any;
  if (w.fbq) return;
  const n: any = (w.fbq = function (...args: unknown[]) {
    n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
  });
  if (!w._fbq) w._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);
  w.fbq('init', id);
}

export function MetaPixel() {
  const pathname = usePathname();

  // PageView por navegação (não depende do consent, então não duplica ao aceitar)
  useEffect(() => {
    if (!PIXEL_ID || isDenied()) return;
    loadPixel(PIXEL_ID);
    trackEvent('PageView');
  }, [pathname]);

  useEffect(() => {
    const sync = () => {
      const w = window as any;
      if (isDenied()) {
        if (typeof w.fbq === 'function') w.fbq('consent', 'revoke');
      } else if (typeof w.fbq === 'function') {
        w.fbq('consent', 'grant');
      } else if (PIXEL_ID) {
        loadPixel(PIXEL_ID);
        trackEvent('PageView');
      }
    };
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  return null;
}
