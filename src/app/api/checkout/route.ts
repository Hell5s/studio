
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { items, orderId, customer } = await request.json();

    const mpItems = items.map((item: any) => ({
      id: item.productId || item.id,
      title: item.name,
      unit_price: Number(item.price),
      quantity: Number(item.quantity),
      currency_id: 'BRL',
      picture_url: item.image,
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
        success: 'https://studio-mocha-sigma-26.vercel.app/pedido-confirmado',
        failure: 'https://studio-mocha-sigma-26.vercel.app/',
        pending: 'https://studio-mocha-sigma-26.vercel.app/pedido-pendente',
      },
      auto_return: 'approved',
      external_reference: orderId,
      notification_url: 'https://studio-mocha-sigma-26.vercel.app/api/webhook/mercadopago',
      statement_descriptor: 'TODA BELA',
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
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
