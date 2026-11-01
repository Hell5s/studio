import {
  calcCouponDiscount,
  calcOrderTotal,
  calcShippingPrice,
  findShippingOption,
  roundMoney,
  toNumber,
} from '@/lib/pricing';

export type OrderTotal = {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  problems: string[];
};

// Recalcula o valor do pedido só com dados do banco (preço do produto, frete e cupom),
// ignorando qualquer valor que tenha vindo do navegador.
export async function computeOrderTotal(db: any, order: any): Promise<OrderTotal> {
  const problems: string[] = [];
  const items: any[] = Array.isArray(order?.items) ? order.items : [];
  if (!items.length) problems.push('Pedido sem itens.');

  let subtotal = 0;
  const productCache = new Map<string, any>();

  for (const item of items) {
    const productId = String(item.productId || item.id || '');
    const quantity = Math.floor(Number(item.quantity));
    if (!productId || !Number.isFinite(quantity) || quantity < 1 || quantity > 99) {
      problems.push(`Item inválido: ${item.name || productId || 'sem id'}.`);
      continue;
    }

    if (!productCache.has(productId)) {
      const snap = await db.collection('products').doc(productId).get();
      productCache.set(productId, snap.exists ? snap.data() : null);
    }
    const product = productCache.get(productId);
    if (!product || product.published === false) {
      problems.push(`Produto indisponível: ${item.name || productId}.`);
      continue;
    }

    const price = toNumber(product.price);
    if (price <= 0) {
      problems.push(`Produto sem preço: ${product.name || productId}.`);
      continue;
    }
    subtotal += price * quantity;
  }
  subtotal = roundMoney(subtotal);

  const settingsSnap = await db.collection('settings').doc('shipping').get();
  const settings = settingsSnap.exists ? settingsSnap.data() : null;
  const option = findShippingOption(settings, order?.shipping?.optionId, order?.shipping?.method);
  const shipping = calcShippingPrice(settings, option, order?.customer?.state || '', subtotal);
  if (shipping === null) problems.push('Frete não pôde ser calculado (UF ou opção de envio inválida).');

  let discount = 0;
  if (order?.couponCode) {
    const couponSnap = await db.collection('coupons')
      .where('code', '==', String(order.couponCode).trim().toUpperCase())
      .where('active', '==', true)
      .limit(1)
      .get();
    const result = calcCouponDiscount(couponSnap.empty ? null : couponSnap.docs[0].data(), subtotal);
    if (result.valid) discount = result.discount;
  }

  return {
    subtotal,
    discount,
    shipping: shipping ?? 0,
    total: calcOrderTotal(subtotal, discount, shipping ?? 0),
    problems,
  };
}
