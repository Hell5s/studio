
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { payment_id } = await request.json();
    if (!payment_id) throw new Error('payment_id é obrigatório');

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
      headers: {
        'Authorization': 'Bearer APP_USR-5316375940685600-051401-3a50359645e6380f06bf00fcab4f0b3f-3402398272',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API Mercado Pago: ${errorText}`);
    }

    const payment = await response.json();
    const transactionData = payment.point_of_interaction?.transaction_data;

    return NextResponse.json({
      qr_code: transactionData?.qr_code,
      qr_code_base64: transactionData?.qr_code_base64,
    });
  } catch (error: any) {
    console.error('PIX API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
