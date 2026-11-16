import { toNumber } from '@/lib/pricing';

export const MAX_INSTALLMENTS = 10;
export const DEFAULT_LOW_STOCK = 5;

export const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

// "10x de R$ X sem juros" (parcelas arredondadas para cima, a última absorve a diferença).
export function installmentText(price: number, max = MAX_INSTALLMENTS): string {
  if (!(price > 0)) return '';
  return `${max}x de ${formatBRL(Math.ceil(Math.round(price * 100) / max) / 100)} sem juros`;
}

const SIZE_ALIASES: Record<string, string> = {
  PP: 'PP', P: 'P', M: 'M', G: 'G', GG: 'GG', XG: 'XG', XGG: 'XGG', EG: 'EG', EGG: 'EGG',
  PEQUENO: 'P', MEDIO: 'M', MÉDIO: 'M', GRANDE: 'G', 'EXTRA GRANDE': 'GG', UNICO: 'Único', ÚNICO: 'Único', U: 'Único',
};

// Só para exibição: o valor salvo no carrinho continua sendo o original do cadastro.
export function sizeLabel(size: string): string {
  const key = String(size).trim().toUpperCase().replace(/\s+/g, ' ');
  return SIZE_ALIASES[key] ?? String(size).trim();
}

export function lowStockCount(product: any): number | null {
  if (product?.stock === undefined || product?.stock === null || product?.stock === '') return null;
  const stock = toNumber(product.stock);
  const limit = product.lowStockThreshold !== undefined ? toNumber(product.lowStockThreshold) : DEFAULT_LOW_STOCK;
  return stock > 0 && stock <= limit ? stock : null;
}

export function toDate(v: any): Date | null {
  const d = v?.toDate ? v.toDate() : typeof v?.seconds === 'number' ? new Date(v.seconds * 1000) : v ? new Date(v) : null;
  return d && !isNaN(d.getTime()) ? d : null;
}

// Fim da promoção (campo opcional do produto); só devolve se ainda não passou.
export function promoEnd(product: any): Date | null {
  const d = toDate(product?.promoEndsAt ?? product?.saleEndsAt ?? product?.promoEnd);
  return d && d.getTime() > Date.now() ? d : null;
}

// Soma dias úteis (sáb/dom não contam; feriados ignorados).
export function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  while (days > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) days--;
  }
  return d;
}

// "3-5 dias úteis" -> [3, 5]; "até 10 dias" -> [10, 10]
export function parseDays(text: string | undefined): [number, number] | null {
  const nums = (text || '').match(/\d+/g)?.map(Number);
  if (!nums?.length) return null;
  return [Math.min(...nums), Math.max(...nums)];
}

export const fmtDate = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
