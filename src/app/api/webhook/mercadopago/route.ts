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

        // 1. Leia o pedido antes da atualização para verificar notificações prévias
        const orderSnap = await orderRef.get();
        const prev = orderSnap.exists ? orderSnap.data() : null;

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

        // 2. Enviar aviso pelo Telegram se for PAGO e não notificado ainda
        if (newStatus === 'paid' && prev && prev.paidNotified !== true) {
          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          const chatId = process.env.TELEGRAM_CHAT_ID;

          if (botToken && chatId) {
            try {
              const shortId = orderId.substring(0, 6).toUpperCase();
              const customerName = prev.customer?.name || 'Cliente';
              const totalFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prev.total || 0);
              
              let msg = `💰 Nova venda!\n`;
              msg += `Pedido #${shortId}\n`;
              msg += `${customerName} — ${totalFormatted}\n`;
              
              prev.items?.forEach((item: any) => {
                const specs = [item.selectedSize, item.selectedColor].filter(Boolean).join(', ');
                msg += `${item.quantity}x ${item.name}${specs ? ` (${specs})` : ''}\n`;
              });

              const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studio-mocha-sigma-26.vercel.app';
              msg += `\nVer no painel: ${siteUrl}/?admin=true`;

              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000);

              await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: msg
                }),
                signal: controller.signal
              });

              clearTimeout(timeoutId);
              
              // Marca como notificado para evitar duplicidade
              await orderRef.update({ paidNotified: true });
              console.log('Notificação Telegram enviada com sucesso');
            } catch (telErr) {
              console.error('Erro ao enviar notificação para o Telegram:', telErr);
            }
          }
        }
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
