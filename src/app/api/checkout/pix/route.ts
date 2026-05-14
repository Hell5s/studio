
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { formData } = await request.json();

    if (!formData) throw new Error('Dados do formulário são obrigatórios');

    // Criação direta do pagamento PIX na API do Mercado Pago
    // Adicionado tratamento seguro para campos do pagador (payer)
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `pix-${Date.now()}`
      },
      body: JSON.stringify({
        transaction_amount: formData.transaction_amount,
        description: formData.description || 'Compra na Toda Bela',
        payment_method_id: 'pix',
        payer: {
          email: formData.payer?.email || formData.email || 'contato@todabela.com.br',
          first_name: formData.payer?.first_name || 'Cliente',
          last_name: formData.payer?.last_name || 'Toda Bela',
          identification: formData.payer?.identification
        },
        external_reference: formData.external_reference,
        notification_url: 'https://studio-mocha-sigma-26.vercel.app/api/webhook/mercadopago',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Mercado Pago PIX Error:', data);
      return NextResponse.json(data, { status: response.status });
    }

    const transactionData = data.point_of_interaction?.transaction_data;

    return NextResponse.json({
      qr_code: transactionData?.qr_code,
      qr_code_base64: transactionData?.qr_code_base64,
      payment_id: data.id,
      status: data.status
    });
  } catch (error: any) {
    console.error('PIX Creation API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
