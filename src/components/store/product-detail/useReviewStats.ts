'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export type RatingStat = { avg: number; count: number };
type StatMap = Record<string, RatingStat>;

// Uma única leitura da coleção `reviews` (publicadas, sem demonstração) compartilhada por todos os cards.
let cache: Promise<StatMap> | null = null;

function load(db: any): Promise<StatMap> {
  cache ??= getDocs(query(collection(db, 'reviews'), where('status', '==', 'published')))
    .then(snap => {
      const sums: Record<string, { s: number; n: number }> = {};
      snap.forEach(d => {
        const r: any = d.data();
        if (r.isDemo || !r.productId || !(r.rating > 0)) return;
        const e = (sums[r.productId] ??= { s: 0, n: 0 });
        e.s += r.rating; e.n++;
      });
      return Object.fromEntries(Object.entries(sums).map(([id, e]) => [id, { avg: Number((e.s / e.n).toFixed(1)), count: e.n }]));
    })
    .catch(() => { cache = null; return {}; });
  return cache;
}

export function useRatingStat(productId: string | number | undefined): RatingStat | null {
  const db = useFirestore();
  const [stat, setStat] = useState<RatingStat | null>(null);
  useEffect(() => {
    if (!db || productId === undefined) return;
    let alive = true;
    load(db).then(m => alive && setStat(m[String(productId)] ?? null));
    return () => { alive = false; };
  }, [db, productId]);
  return stat;
}
