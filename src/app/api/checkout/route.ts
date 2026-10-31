import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.todabelaoficial.com.br';

export async function POST(request: Request) {
  try {
    const { items, orderId, customer } = await request.json();

    const mpItems = items.map((item: any) => ({
      id: item.productId || item.id,
      title: item.name,
      unit_price: Number(item.price),
      quantity: Number(item.quantity),
      currency_id: 'BRL',
      picture_url: (typeof item.image === 'string' ? item.image : item.image?.url) || undefined,
    }));

    const preference = {
      items: mpItems,
      payer: {
        name: customer.name,
        email: customer.email,
        phone: {
          area_code: customer.phone.substring(0, 2),
          number: customer.phone.substring(2),
        },
        address: {
          zip_code: customer.zip,
          street_name: customer.address,
        }
      },
      back_urls: {
        success: `${SITE_URL}/pedido-confirmado`,
        failure: `${SITE_URL}/`,
        pending: `${SITE_URL}/pedido-pendente`,
      },
      auto_return: 'approved',
      external_reference: orderId,
      notification_url: `${SITE_URL}/api/webhook/mercadopago`,
      statement_descriptor: 'TODA BELA',
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mercado Pago Error: ${error}`);
    }

    const data = await response.json();
    return NextResponse.json({ preferenceId: data.id, init_point: data.init_point });
  } catch (error: any) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
