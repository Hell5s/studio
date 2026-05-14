
import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || (await request.json()).type;
    const dataId = searchParams.get('data.id') || (await request.json()).data?.id;

    if (type === 'payment' && dataId) {
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      });

      if (!paymentResponse.ok) return NextResponse.json({ status: 'ok' });

      const payment = await paymentResponse.json();
      const orderId = payment.external_reference;
      const status = payment.status;

      if (orderId) {
        const { firestore } = initializeFirebase();
        const orderRef = doc(firestore, 'orders', orderId);
        
        let newStatus = 'pending';
        if (status === 'approved') newStatus = 'paid';
        if (status === 'rejected' || status === 'cancelled') newStatus = 'canceled';
        if (status === 'in_process') newStatus = 'pending';

        await updateDoc(orderRef, {
          status: newStatus,
          paymentId: dataId,
          updatedAt: serverTimestamp(),
        });
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
