import { NextResponse } from 'next/server';

let adminDb: any = null;

async function getAdminDb() {
  if (adminDb) return adminDb;

  const { initializeApp, getApps, cert } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
      })
    });
  }

  adminDb = getFirestore();
  return adminDb;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') || body.type || body.action;
    const dataId = searchParams.get('data.id') || body.data?.id || searchParams.get('id');

    console.log('Webhook recebido:', { type, dataId });

    const isPayment = type === 'payment' ||
                      body.action === 'payment.created' ||
                      body.action === 'payment.updated';

    if (isPayment && dataId) {
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      });

      if (!paymentResponse.ok) {
        console.error('Erro ao buscar pagamento MP:', await paymentResponse.text());
        return NextResponse.json({ status: 'ok' });
      }

      const payment = await paymentResponse.json();
      const orderId = payment.external_reference;
      const status = payment.status;

      console.log('Pagamento MP Detalhes:', { orderId, status, paymentId: dataId });

      if (orderId) {
        const db = await getAdminDb();
        const orderRef = db.collection('orders').doc(orderId);

        let newStatus = 'pending';
        if (status === 'approved') newStatus = 'paid';
        if (status === 'rejected' || status === 'cancelled') newStatus = 'canceled';
        if (status === 'in_process') newStatus = 'pending';
        if (status === 'refunded') newStatus = 'refunded';

        await orderRef.update({
          status: newStatus,
          paymentId: String(dataId),
          paymentStatus: status,
          updatedAt: new Date(),
        });

        console.log('Pedido atualizado no Firestore:', { orderId, newStatus });
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
