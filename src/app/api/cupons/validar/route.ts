
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { calcCouponDiscount } from '@/lib/pricing';

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

    // Validade, pedido mínimo e cálculo do desconto ficam em src/lib/pricing.ts,
    // os mesmos usados para conferir o valor na hora do pagamento.
    const result = calcCouponDiscount(coupon, subtotal);
    if (!result.valid) {
      return NextResponse.json({ valid: false, message: result.message });
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: result.discount
    });

  } catch (error: any) {
    console.error('Coupon Validation Error:', error);
    return NextResponse.json({ valid: false, message: 'Erro ao validar cupom.' }, { status: 500 });
  }
}
