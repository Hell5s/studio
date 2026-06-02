import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId obrigatório' }, { status: 400 });
    }

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/search?external_reference=${orderId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      }
    );

    const data = await response.json();
    const payment = data.results?.[0];

    if (!payment) {
      return NextResponse.json({ status: 'pending' });
    }

    return NextResponse.json({
      status: payment.status,
      paymentStatus: payment.status
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
