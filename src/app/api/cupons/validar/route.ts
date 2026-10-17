
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
    const { code, subtotal } = await request.json();

    if (!subtotal || typeof subtotal !== 'number' || subtotal <= 0) {
      return NextResponse.json({ valid: false, message: 'Valor do pedido inválido.' }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Informe o código do cupom.' });
    }

    const normalizedCode = String(code).trim().toUpperCase();
    const db = await getAdminDb();
    
    const couponsSnap = await db.collection('coupons')
      .where('code', '==', normalizedCode)
      .where('active', '==', true)
      .limit(1)
      .get();

    if (couponsSnap.empty) {
      return NextResponse.json({ valid: false, message: 'Cupom inválido ou inativo.' });
    }

    const coupon = couponsSnap.docs[0].data();

    // 1. Validação de Expiração (Fuso Horário Brasil)
    if (coupon.expiresAt) {
      const today = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      const [todayD, todayM, todayY] = today.split('/').map(Number);
      const todayNum = (todayY * 10000) + (todayM * 100) + todayD;

      const [expY, expM, expD] = coupon.expiresAt.split('-').map(Number);
      const expNum = (expY * 10000) + (expM * 100) + expD;

      if (todayNum > expNum) {
        return NextResponse.json({ valid: false, message: 'Este cupom expirou.' });
      }
    }

    // 2. Validação de Pedido Mínimo
    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return NextResponse.json({ 
        valid: false, 
        message: `Este cupom exige pedido mínimo de R$ ${coupon.minOrder.toFixed(2)}.` 
      });
    }

    // 3. Cálculo do Desconto
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = subtotal * (coupon.value / 100);
    } else {
      discountAmount = coupon.value;
    }

    // Limita o desconto ao valor do subtotal
    const finalDiscount = Math.min(subtotal, Number(discountAmount.toFixed(2)));

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: finalDiscount
    });

  } catch (error: any) {
    console.error('Coupon Validation Error:', error);
    return NextResponse.json({ valid: false, message: 'Erro ao validar cupom.' }, { status: 500 });
  }
}
