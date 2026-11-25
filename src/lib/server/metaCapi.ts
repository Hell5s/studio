import { createHash } from 'crypto';

const sha = (v: string) => createHash('sha256').update(v).digest('hex');
const norm = (v: unknown) => (typeof v === 'string' ? v.trim().toLowerCase() : '');

// Envia o Purchase de um pedido pago direto do servidor para a API de Conversões.
// event_id = id do pedido: a Meta junta com o Purchase do navegador (mesmo id) e não conta em dobro.
export async function sendPurchaseCapi(orderId: string, order: any): Promise<boolean> {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) return false;

  const items: any[] = Array.isArray(order.items) ? order.items : [];
  const c = order.customer || {};
  const ud: Record<string, unknown> = { country: [sha('br')], external_id: [sha(orderId)] };
  const email = norm(c.email);
  if (email) ud.em = [sha(email)];
  const phone = String(c.phone || '').replace(/\D/g, '');
  if (phone) ud.ph = [sha(phone.length <= 11 ? `55${phone}` : phone)];
  const [fn, ...rest] = norm(c.name).split(/\s+/).filter(Boolean);
  if (fn) ud.fn = [sha(fn)];
  if (rest.length) ud.ln = [sha(rest[rest.length - 1])];
  if (c.city) ud.ct = [sha(norm(c.city).replace(/\s+/g, ''))];
  if (c.state) ud.st = [sha(norm(c.state))];
  const zip = String(c.zip || '').replace(/\D/g, '');
  if (zip) ud.zp = [sha(zip)];

  const payload = {
    data: [{
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: orderId,
      event_source_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.todabelaoficial.com.br'}/pedido-confirmado`,
      action_source: 'website',
      user_data: ud,
      custom_data: {
        value: Number(order.total) || 0,
        currency: 'BRL',
        content_type: 'product',
        content_ids: items.map(i => String(i.productId || i.id)),
        contents: items.map(i => ({ id: String(i.productId || i.id), quantity: i.quantity || 1, item_price: Number(i.price) || 0 })),
        num_items: items.reduce((n, i) => n + (i.quantity || 1), 0),
        order_id: orderId,
      },
    }],
  };

  const r = await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) console.error('CAPI Purchase falhou:', r.status, await r.text().catch(() => ''));
  return r.ok;
}
