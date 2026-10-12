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
  try {
    // 1. Verificação de Segurança
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const db = await getAdminDb();
    const HORAS_LIMITE = 24;
    const agora = new Date();
    const limiteMillis = HORAS_LIMITE * 60 * 60 * 1000;

    // 2. Busca pedidos pendentes
    const ordersSnapshot = await db.collection('orders')
      .where('status', '==', 'pending')
      .get();

    let cancelados = 0;
    let verificados = ordersSnapshot.size;

    for (const orderDoc of ordersSnapshot.docs) {
      const order = orderDoc.data();
      const createdAt = order.createdAt;

      // Conversão segura de data (Timestamp, Date ou String)
      let createdDate: Date | null = null;
      if (createdAt?.toDate) {
        createdDate = createdAt.toDate();
      } else if (createdAt) {
        createdDate = new Date(createdAt);
      }

      if (!createdDate || isNaN(createdDate.getTime())) continue;

      const idadeMillis = agora.getTime() - createdDate.getTime();

      // Critérios de cancelamento
      if (idadeMillis > limiteMillis) {
        // Ignorar se o pagamento estiver em análise
        if (['in_process', 'authorized'].includes(order.paymentStatus)) {
          continue;
        }

        // 3. Cancelar no Mercado Pago se houver paymentId
        if (order.paymentId) {
          try {
            await fetch(`https://api.mercadopago.com/v1/payments/${order.paymentId}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: 'cancelled' }),
            });
            console.log(`Pagamento ${order.paymentId} cancelado no Mercado Pago.`);
          } catch (mpError) {
            console.error(`Erro ao cancelar pagamento ${order.paymentId} no MP:`, mpError);
          }
        }

        // 4. Atualizar no Firestore
        await orderDoc.ref.update({
          status: 'canceled',
          canceledReason: 'pagamento_nao_realizado',
          canceledAt: agora,
          updatedAt: agora,
        });

        cancelados++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      cancelados, 
      verificados,
      message: `Processamento concluído. ${cancelados} pedidos expirados foram cancelados.`
    });

  } catch (error: any) {
    console.error('Erro na Cron de Cancelamento:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
