
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { formData } = await request.json();

    if (!formData) throw new Error('Dados do formulário são obrigatórios');

    const isPix = formData.payment_method_id === 'pix';
    const isBoleto = formData.payment_method_id === 'bolbradesco' || formData.payment_method_id === 'pec';

    // Mapeamento dinâmico para a API do Mercado Pago
    const paymentPayload: any = {
      transaction_amount: Number(formData.transaction_amount),
      description: formData.description || 'Compra na Toda Bela',
      payment_method_id: formData.payment_method_id,
      payer: {
        email: formData.payer?.email || '',
        first_name: formData.payer?.first_name,
        last_name: formData.payer?.last_name,
        identification: formData.payer?.identification,
      },
      external_reference: String(formData.external_reference),
      notification_url: 'https://studio-mocha-sigma-26.vercel.app/api/webhook/mercadopago',
    };

    // Campos específicos para cartão de crédito
    if (!isPix && !isBoleto) {
      paymentPayload.token = formData.token;
      paymentPayload.installments = Number(formData.installments);
      paymentPayload.issuer_id = formData.issuer_id;
    }

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${formData.external_reference}-${Date.now()}`
      },
      body: JSON.stringify(paymentPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Mercado Pago API Error:', data);
      return NextResponse.json({ 
        message: data.message || 'Erro ao processar pagamento',
        error: data 
      }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Payments API Exception:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
