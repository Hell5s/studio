import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { computeOrderTotal } from '@/lib/server/order-total';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.todabelaoficial.com.br';

export async function POST(request: Request) {
  try {
    const { formData } = await request.json();

    if (!formData) throw new Error('Dados do formulário são obrigatórios');

    // O valor cobrado vem sempre do pedido salvo no banco, recalculado aqui no servidor.
    const orderId = String(formData.external_reference || '');
    if (!orderId) {
      return NextResponse.json({ message: 'Pedido não informado.' }, { status: 400 });
    }

    const db = await getAdminDb();
    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      return NextResponse.json({ message: 'Pedido não encontrado.' }, { status: 404 });
    }
    const order = orderSnap.data();
    if (order.status !== 'pending') {
      return NextResponse.json({ message: 'Este pedido não está mais aguardando pagamento.' }, { status: 409 });
    }

    const computed = await computeOrderTotal(db, order);
    if (computed.problems.length || computed.total <= 0) {
      return NextResponse.json({ message: computed.problems[0] || 'Valor do pedido inválido.' }, { status: 400 });
    }
    if (Math.abs(Number(formData.transaction_amount) - computed.total) > 0.01) {
      return NextResponse.json({
        message: 'O valor do pedido foi atualizado. Volte para a etapa de entrega e confira o total.',
        expectedTotal: computed.total,
      }, { status: 409 });
    }

    await orderRef.update({
      subtotal: computed.subtotal,
      couponDiscount: computed.discount,
      'shipping.price': computed.shipping,
      total: computed.total,
      updatedAt: new Date(),
    });

    const isPix = formData.payment_method_id === 'pix';
    const isBoleto = formData.payment_method_id === 'bolbradesco' || formData.payment_method_id === 'pec' || formData.payment_method_id === 'ticket';

    // Normalização dos dados do pagador para a API do Mercado Pago
    const payerEmail = formData.payer?.email || '';
    const firstName = formData.payer?.first_name || formData.payer?.firstName || 'Cliente';
    const lastName = formData.payer?.last_name || formData.payer?.lastName || 'Toda Bela';
    const identificationType = formData.payer?.identification?.type || 'CPF';
    const identificationNumber = (formData.payer?.identification?.number || '').replace(/\D/g, '');

    const paymentPayload: any = {
      transaction_amount: computed.total,
      description: formData.description || 'Compra na Toda Bela',
      payment_method_id: formData.payment_method_id,
      payer: {
        email: payerEmail,
        first_name: firstName,
        last_name: lastName,
        identification: {
          type: identificationType,
          number: identificationNumber,
        },
      },
      external_reference: orderId,
      notification_url: `${SITE_URL}/api/webhook/mercadopago`,
    };

    // Adiciona endereço se disponível (Muitas vezes obrigatório para boleto)
    if (formData.payer?.address) {
      paymentPayload.payer.address = {
        zip_code: formData.payer.address.zip_code?.replace(/\D/g, ''),
        street_name: formData.payer.address.street_name,
        street_number: formData.payer.address.street_number,
        neighborhood: formData.payer.address.neighborhood,
        city: formData.payer.address.city,
        federal_unit: formData.payer.address.federal_unit,
      };
    }

    if (!isPix && !isBoleto) {
      paymentPayload.token = formData.token;
      paymentPayload.installments = Number(formData.installments);
      paymentPayload.issuer_id = formData.issuer_id;
    }

    console.log('==== PAYLOAD ENVIADO AO MP ====');
    console.log(JSON.stringify(paymentPayload, null, 2));

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