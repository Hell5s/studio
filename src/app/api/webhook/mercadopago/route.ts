import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get('type') || body.type;
    const dataId = searchParams.get('data.id') || body.data?.id;

    console.log('Webhook recebido:', { type, dataId });

    if (type === 'payment' && dataId) {
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      });

      if (!paymentResponse.ok) {
        console.error('Erro ao buscar pagamento:', await paymentResponse.text());
        return NextResponse.json({ status: 'ok' });
      }

      const payment = await paymentResponse.json();
      const orderId = payment.external_reference;
      const status = payment.status;

      console.log('Pagamento:', { orderId, status, paymentId: dataId });

      if (orderId) {
        const { firestore } = initializeFirebase();
        const orderRef = doc(firestore, 'orders', orderId);
        
        let newStatus = 'pending';
        if (status === 'approved') newStatus = 'paid';
        if (status === 'rejected' || status === 'cancelled') newStatus = 'canceled';
        if (status === 'in_process') newStatus = 'pending';
        if (status === 'refunded') newStatus = 'refunded';

        await updateDoc(orderRef, {
          status: newStatus,
          paymentId: String(dataId),
          paymentStatus: status,
          updatedAt: serverTimestamp(),
        });

        console.log('Pedido atualizado:', { orderId, newStatus });
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'webhook ativo' });
}
