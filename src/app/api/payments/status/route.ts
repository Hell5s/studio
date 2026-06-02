import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'orderId obrigatório' }, { status: 400 });
    }

    const db = await getAdminDb();
    const orderDoc = await db.collection('orders').doc(orderId).get();

    if (!orderDoc.exists) {
      // Se não encontrar no Firestore, tenta buscar no Mercado Pago como fallback
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      const mpResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/search?external_reference=${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      );
      
      const mpData = await mpResponse.json();
      const payment = mpData.results?.[0];
      
      if (payment) {
        return NextResponse.json({ 
          status: payment.status, 
          paymentStatus: payment.status 
        });
      }

      return NextResponse.json({ status: 'not_found' });
    }

    const order = orderDoc.data();
    return NextResponse.json({ 
      status: order?.status, 
      paymentStatus: order?.paymentStatus || order?.status
    });

  } catch (error: any) {
    console.error('Status API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}