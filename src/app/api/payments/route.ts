import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { formData } = await request.json();

    if (!formData) throw new Error('Dados do formulário são obrigatórios');

    const isPix = formData.payment_method_id === 'pix';
    const isBoleto = formData.payment_method_id === 'bolbradesco' || formData.payment_method_id === 'pec';

    const paymentPayload: any = {
      transaction_amount: Number(formData.transaction_amount),
      description: formData.description || 'Compra na Toda Bela',
      payment_method_id: formData.payment_method_id,
      payer: {
        email: formData.payer?.email || '',
        first_name: formData.payer?.first_name || 'Cliente',
        last_name: formData.payer?.last_name || 'Toda Bela',
        identification: {
          type: formData.payer?.identification?.type || 'CPF',
          number: (formData.payer?.identification?.number || '').replace(/\D/g, ''),
        },
      },
      external_reference: String(formData.external_reference || `PED-${Date.now()}`),
      notification_url: 'https://studio-mocha-sigma-26.vercel.app/api/webhook/mercadopago',
    };

    if (!isPix && !isBoleto) {
      paymentPayload.token = formData.token;
      paymentPayload.installments = Number(formData.installments);
      paymentPayload.issuer_id = formData.issuer_id;
    }

    console.log('==== PAYLOAD ENVIADO AO MP ====');
    console.log(JSON.stringify(paymentPayload, null, 2));
    console.log('==== ACCESS TOKEN (primeiros 20 chars) ====');
    console.log(process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 20));

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

    console.log('==== RESPOSTA COMPLETA DO MP ====');
    console.log(JSON.stringify(data, null, 2));

    if (!response.ok) {
      return NextResponse.json({ 
        message: data.message || 'Erro ao processar pagamento',
        cause: data.cause,
        error: data 
      }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Payments API Exception:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}