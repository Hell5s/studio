
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { formData } = await request.json();

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer APP_USR-5316375940685600-051401-3a50359645e6380f06bf00fcab4f0b3f-3402398272',
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `pay-${Date.now()}`
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao criar pagamento: ${errorText}`);
    }

    const payment = await response.json();
    return NextResponse.json(payment);
  } catch (error: any) {
    console.error('Payments API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
