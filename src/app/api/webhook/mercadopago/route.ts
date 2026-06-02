import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

function getDb() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const app = getApps().length > 0 ? getApp() : initializeApp(config);
  return getFirestore(app);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || body.type || body.action;
    const dataId = searchParams.get('data.id') || body.data?.id || searchParams.get('id');
    console.log('Webhook recebido:', { type, dataId });
    const isPayment = type === 'payment' || body.action === 'payment.created' || body.action === 'payment.updated';
    if (isPayment && dataId) {
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
        headers: { 'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
      });
      if (!paymentResponse.ok) return NextResponse.json({ status: 'ok' });
      const payment = await paymentResponse.json();
      const orderId = payment.external_reference;
      const status = payment.status;
      console.log('Pagamento MP:', { orderId, status });
      if (orderId) {
        const db = getDb();
        let newStatus = 'pending';
        if (status === 'approved') newStatus = 'paid';
        if (status === 'rejected' || status === 'cancelled') newStatus = 'canceled';
        if (status === 'refunded') newStatus = 'refunded';
        await updateDoc(doc(db, 'orders', orderId), {
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