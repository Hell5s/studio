import { NextResponse } from 'next/server';

export async function GET() {
  const payload = {
    transaction_amount: 1.00,
    description: 'Teste PIX Toda Bela',
    payment_method_id: 'pix',
    payer: {
      email: 'comprador_teste@email.com',
      first_name: 'Cliente',
      last_name: 'Teste',
      identification: {
        type: 'CPF',
        number: '19119119100',
      },
    },
    external_reference: `TEST-${Date.now()}`,
  };

  console.log('Testando PIX com payload:', JSON.stringify(payload, null, 2));
  console.log('Token (início):', process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 25));

  const response = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': `test-pix-${Date.now()}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  console.log('Resposta MP:', JSON.stringify(data, null, 2));

  return NextResponse.json({ status: response.status, data });
}
