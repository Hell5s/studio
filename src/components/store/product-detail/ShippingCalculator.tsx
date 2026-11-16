'use client';

import React, { useState } from 'react';
import { Truck, Loader2 } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { calcShippingPrice, freeShippingThreshold, isValidUf, toNumber } from '@/lib/pricing';
import { addBusinessDays, fmtDate, formatBRL, parseDays } from './utils';

// Regra de frete grátis exatamente como o checkout aplica (0 = sem frete grátis na região).
export function freeShippingRule(settings: any): string {
  const opts: any[] = settings?.options || [];
  // Frete grátis via preço 0 em todas as opções e regiões, sem depender de limite.
  if (opts.length > 0 && opts.every(o => toNumber(o.priceSoutheastSouth) === 0 && toNumber(o.priceOtherRegions) === 0)) {
    return 'Frete grátis para todo o Brasil.';
  }
  const se = toNumber(settings?.freeShippingThreshold);
  const others = toNumber(settings?.freeShippingThresholdOthers);
  if (!se && !others) return 'Frete calculado pelo seu CEP, sem frete grátis no momento.';
  if (se && others && se === others) return `Frete grátis em compras a partir de ${formatBRL(se)} para todo o Brasil.`;
  const parts = [];
  if (se) parts.push(`${formatBRL(se)} no Sul e Sudeste`);
  if (others) parts.push(`${formatBRL(others)} nas demais regiões`);
  return `Frete grátis a partir de ${parts.join(' e ')}.`;
}

export function ShippingCalculator({ subtotal }: { subtotal: number }) {
  const db = useFirestore();
  const ref = useMemoFirebase(() => (db ? doc(db, 'settings', 'shipping') : null), [db]);
  const { data: settings } = useDoc(ref);
  const [cep, setCep] = useState('');
  const [uf, setUf] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onCep = async (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    setCep(digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits);
    setError(''); setUf(null);
    if (digits.length !== 8) return;
    setLoading(true);
    try {
      const data = await (await fetch(`https://viacep.com.br/ws/${digits}/json/`)).json();
      if (data.erro || !isValidUf(data.uf)) setError('CEP não encontrado. Confira os números.');
      else { setUf(data.uf); setCity(`${data.localidade}/${data.uf}`); }
    } catch {
      setError('Não foi possível consultar o CEP agora. Tente de novo.');
    } finally {
      setLoading(false);
    }
  };

  const options: any[] = settings?.options || [];
  const threshold = uf ? freeShippingThreshold(settings, uf) : 0;

  return (
    <div className="space-y-3 rounded-lg border border-primary/10 p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
        <Truck className="h-4 w-4" /> Calcular frete e prazo
      </p>
      <div className="relative">
        <input
          value={cep}
          onChange={(e) => onCep(e.target.value)}
          inputMode="numeric"
          placeholder="Digite seu CEP"
          aria-label="CEP"
          className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-primary placeholder:text-gray-500 focus:border-primary focus:outline-none"
        />
        {loading && <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-gray-500" />}
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}

      {uf && options.length > 0 && (
        <ul className="space-y-2">
          <li className="text-xs text-gray-600">Entrega para {city}</li>
          {options.map((opt, i) => {
            const price = calcShippingPrice(settings, opt, uf, subtotal);
            const range = parseDays(opt.days);
            return (
              <li key={opt.id || i} className="flex items-start justify-between gap-3 text-sm">
                <span>
                  <b className="text-primary">{opt.name}</b>
                  <span className="block text-xs text-gray-600">
                    {range
                      ? `${opt.days} · chega entre ${fmtDate(addBusinessDays(new Date(), range[0]))} e ${fmtDate(addBusinessDays(new Date(), range[1]))}`
                      : opt.days}
                  </span>
                </span>
                <b className={price === 0 ? 'text-emerald-700' : 'text-primary'}>{price === 0 ? 'Grátis' : formatBRL(price ?? 0)}</b>
              </li>
            );
          })}
          {threshold > 0 && subtotal < threshold && (
            <li className="text-xs text-emerald-800">Faltam {formatBRL(threshold - subtotal)} para o frete grátis na sua região.</li>
          )}
        </ul>
      )}
      {uf && !options.length && <p className="text-xs text-gray-600">Opções de entrega indisponíveis no momento. O frete é calculado no carrinho.</p>}

      <p className="text-xs text-gray-600">{freeShippingRule(settings)}</p>
    </div>
  );
}
