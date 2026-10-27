import { NextResponse } from 'next/server';

let adminDb: any = null;
let adminAuth: any = null;

async function getAdminServices() {
  if (adminDb && adminAuth) return { db: adminDb, auth: adminAuth };

  const { initializeApp, getApps, cert } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');
  const { getAuth } = await import('firebase-admin/auth');

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
  adminAuth = getAuth();
  return { db: adminDb, auth: adminAuth };
}

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const { db, auth } = await getAdminServices();

    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (e) {
      return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
    }

    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'order_not_found' }, { status: 404 });
    }

    const order = orderDoc.data();
    const userUid = decodedToken.uid;
    const userEmail = decodedToken.email?.toLowerCase();

    const isOwner = order.userId === userUid || (order.customer?.email?.toLowerCase() === userEmail && userEmail);

    if (!isOwner) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    if (!['pending', 'Pedido recebido'].includes(order.status)) {
      return NextResponse.json({ message: "Este pedido não está mais pendente." }, { status: 409 });
    }

    if (order.paymentId) {
      try {
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${order.paymentId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          }
        });

        if (mpResponse.ok) {
          const payment = await mpResponse.json();
          if (payment.status === 'approved') {
            return NextResponse.json({ message: "Seu pagamento já foi aprovado." }, { status: 409 });
          }

          if (['pending', 'in_process', 'authorized'].includes(payment.status)) {
            await fetch(`https://api.mercadopago.com/v1/payments/${order.paymentId}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: 'cancelled' }),
            });
          }
        }
      } catch (mpError) {
        console.error("Erro ao gerenciar pagamento no Mercado Pago:", mpError);
      }
    }

    await orderRef.update({
      status: 'canceled',
      canceledReason: 'refeito_pelo_cliente',
      canceledAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ items: order.items });

  } catch (error: any) {
    console.error('Erro ao refazer pedido:', error);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
