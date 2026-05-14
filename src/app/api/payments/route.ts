
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { formData } = await request.json();

    if (!formData) throw new Error('Dados do formulário são obrigatórios');

    // O v1/payments do Mercado Pago exige obrigatoriamente um objeto 'payer' com 'email'.
    // Algumas versões do Brick, quando usadas com preferenceId, podem omitir o payer se 
    // ele já estiver na preferência, mas a API de pagamentos diretos ainda o exige.
    if (!formData.payer) {
      formData.payer = {
        email: formData.email || 'cliente@todabela.com.br'
      };
    }

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `pay-${Date.now()}`
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Retorna o erro estruturado do Mercado Pago para que o frontend possa tratar
      console.error('Mercado Pago Error:', data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Payments API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
