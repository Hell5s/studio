// Fluxo pós-venda: cada peça do pedido passa por etapas e o status geral do pedido
// é calculado a partir delas. As chaves de etapa são as mesmas que a cliente já vê
// em "Meus pedidos" (aguardando / comprado / transito / entregue).

export type ItemStage = 'aguardando' | 'comprado' | 'transito' | 'entregue';
export type OrderStatus = 'pending' | 'paid' | 'ordered' | 'shipped' | 'delivered' | 'canceled' | 'refunded';

const STAGE_ORDER: ItemStage[] = ['aguardando', 'comprado', 'transito', 'entregue'];

export function itemStage(item: any): ItemStage {
  return STAGE_ORDER.includes(item?.status) ? item.status : 'aguardando';
}

export function stageIndex(stage: ItemStage): number {
  return STAGE_ORDER.indexOf(stage);
}

// Próxima ação de uma peça; null quando já foi entregue.
export function nextItemStage(item: any): ItemStage | null {
  const i = stageIndex(itemStage(item));
  return i < STAGE_ORDER.length - 1 ? STAGE_ORDER[i + 1] : null;
}

// Status em que o pedido segue o andamento das peças. Pendente, cancelado e
// reembolsado são definidos pelo pagamento e não mudam sozinhos.
const FULFILLMENT_STATUSES: OrderStatus[] = ['paid', 'ordered', 'shipped', 'delivered'];

export function isFulfillmentStatus(status: string | undefined): boolean {
  return FULFILLMENT_STATUSES.includes(status as OrderStatus);
}

// Status geral pela etapa mais atrasada entre as peças.
export function deriveOrderStatus(currentStatus: string | undefined, items: any[]): string | undefined {
  if (!isFulfillmentStatus(currentStatus) || !items?.length) return currentStatus;
  const slowest = Math.min(...items.map(it => stageIndex(itemStage(it))));
  return (['paid', 'ordered', 'shipped', 'delivered'] as const)[slowest];
}

export function trackingUrl(code: string): string {
  return `https://rastreamento.correios.com.br/app/index.php?objetos=${encodeURIComponent(code.trim())}`;
}

export function toDate(value: any): Date | null {
  if (!value) return null;
  const d = value?.toDate ? value.toDate() : new Date(value);
  return isNaN(d.getTime()) ? null : d;
}
