// Cálculo de valores do pedido, compartilhado entre o checkout (navegador) e as rotas
// de pagamento (servidor). O servidor sempre recalcula com estas mesmas funções,
// então o que a cliente vê é o que ela paga.

export const SOUTH_SOUTHEAST_UFS = ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS'];

export const VALID_UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

// Os valores salvos no painel às vezes chegam como texto ("12,50"), então normaliza tudo.
export function toNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const n = parseFloat(value.replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function isValidUf(state: string | undefined | null): boolean {
  return !!state && VALID_UFS.includes(state.trim().toUpperCase());
}

export function isSouthSoutheast(state: string | undefined | null): boolean {
  return !!state && SOUTH_SOUTHEAST_UFS.includes(state.trim().toUpperCase());
}

export function findShippingOption(settings: any, optionId?: string | null, optionName?: string | null) {
  const options: any[] = settings?.options || [];
  return (
    options.find(o => optionId && o.id === optionId) ||
    options.find(o => optionName && o.name?.trim() === optionName.trim()) ||
    options[0] ||
    null
  );
}

// Limite de frete grátis da região. 0 ou vazio = sem frete grátis naquela região.
export function freeShippingThreshold(settings: any, state: string): number {
  return isSouthSoutheast(state)
    ? toNumber(settings?.freeShippingThreshold)
    : toNumber(settings?.freeShippingThresholdOthers);
}

// Preço do frete de uma opção para o estado informado. Retorna null sem UF válida,
// para o checkout nunca tratar "estado desconhecido" como frete grátis.
export function calcShippingPrice(settings: any, option: any, state: string, subtotal: number): number | null {
  if (!option || !isValidUf(state)) return null;
  const threshold = freeShippingThreshold(settings, state);
  if (threshold > 0 && subtotal >= threshold) return 0;
  const base = isSouthSoutheast(state) ? option.priceSoutheastSouth : option.priceOtherRegions;
  return roundMoney(toNumber(base));
}

// Data de hoje no fuso de Brasília como AAAAMMDD, para comparar com a validade do cupom.
function todayNumberBR(): number {
  const [d, m, y] = new Date()
    .toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    .split('/')
    .map(Number);
  return y * 10000 + m * 100 + d;
}

export type CouponResult =
  | { valid: true; discount: number }
  | { valid: false; message: string };

export function calcCouponDiscount(coupon: any, subtotal: number): CouponResult {
  if (!coupon || coupon.active !== true) {
    return { valid: false, message: 'Cupom inválido ou inativo.' };
  }

  if (coupon.expiresAt) {
    const [expY, expM, expD] = String(coupon.expiresAt).split('-').map(Number);
    if (todayNumberBR() > expY * 10000 + expM * 100 + expD) {
      return { valid: false, message: 'Este cupom expirou.' };
    }
  }

  const minOrder = toNumber(coupon.minOrder);
  if (minOrder && subtotal < minOrder) {
    return { valid: false, message: `Este cupom exige pedido mínimo de R$ ${minOrder.toFixed(2)}.` };
  }

  const value = toNumber(coupon.value);
  const raw = coupon.type === 'percentage' ? subtotal * (value / 100) : value;
  return { valid: true, discount: Math.min(subtotal, roundMoney(raw)) };
}

export function calcOrderTotal(subtotal: number, discount: number, shipping: number): number {
  return Math.max(0, roundMoney(subtotal - discount + shipping));
}

// Número do pedido aleatório (antes era o fim do horário, fácil de adivinhar).
export function generateOrderId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return 'PED-' + Array.from(bytes, b => alphabet[b % alphabet.length]).join('');
}
