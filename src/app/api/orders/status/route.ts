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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: 'orderId obrigatório' }, { status: 400 });
  }

  try {
    const db = await getAdminDb();
    const orderSnap = await db.collection('orders').doc(orderId).get();

    if (!orderSnap.exists) {
      return NextResponse.json({ status: 'not_found' });
    }

    const data = orderSnap.data();
    return NextResponse.json({ status: data?.status || 'pending' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
