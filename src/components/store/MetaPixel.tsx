"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CONSENT_EVENT, hasConsent, trackEvent } from '@/lib/metaPixel';

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
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    const sync = () => setGranted(hasConsent());
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!PIXEL_ID || !granted) return;
    loadPixel(PIXEL_ID);
    trackEvent('PageView');
  }, [pathname, granted]);

  return null;
}
