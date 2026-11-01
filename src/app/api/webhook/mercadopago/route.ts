import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { computeOrderTotal } from '@/lib/server/order-total';

async function sendTelegram(text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return false;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: controller.signal
    });
    return true;
  } finally {
    clearTimeout(timeoutId);
  }
}

const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

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
        if (!orderSnap.exists) {
          console.error('Webhook: pedido não encontrado', { orderId, paymentId: dataId });
          return NextResponse.json({ status: 'ok' });
        }
        const prev = orderSnap.data();

        let newStatus = 'pending';
        if (status === 'approved') newStatus = 'paid';
        if (status === 'rejected' || status === 'cancelled') newStatus = 'canceled';
        if (status === 'in_process') newStatus = 'pending';
        if (status === 'refunded') newStatus = 'refunded';

        // Pagamento aprovado só vira "pago" se o valor pago cobrir o valor real do pedido,
        // recalculado aqui com os preços do banco (não com o que veio do navegador).
        let amountMismatch: { paid: number; expected: number } | null = null;
        if (newStatus === 'paid') {
          const computed = await computeOrderTotal(db, prev);
          const paid = Number(payment.transaction_amount) || 0;
          if (computed.problems.length || paid + 0.01 < computed.total) {
            amountMismatch = { paid, expected: computed.total };
            newStatus = 'pending';
          }
        }

        await orderRef.update({
          status: newStatus,
          paymentId: String(dataId),
          paymentStatus: amountMismatch ? 'amount_mismatch' : status,
          paymentAmountMismatch: amountMismatch,
          updatedAt: new Date(),
        });

        console.log('Pedido atualizado no Firestore:', { orderId, newStatus, amountMismatch });

        // 2. Alerta no Telegram se o valor pago não bater com o pedido
        if (amountMismatch && prev.mismatchNotified !== true) {
          try {
            const sent = await sendTelegram(
              `⚠️ Pagamento com valor errado!\n` +
              `Pedido #${orderId}\n` +
              `Pago: ${formatBRL(amountMismatch.paid)} — Valor do pedido: ${formatBRL(amountMismatch.expected)}\n` +
              `O pedido NÃO foi marcado como pago. Confira antes de enviar.`
            );
            if (sent) await orderRef.update({ mismatchNotified: true });
          } catch (telErr) {
            console.error('Erro ao enviar alerta para o Telegram:', telErr);
          }
        }

        // 3. Enviar aviso pelo Telegram se for PAGO e não notificado ainda
        if (newStatus === 'paid' && prev.paidNotified !== true) {
          try {
            const customerName = prev.customer?.name || 'Cliente';

            let msg = `💰 Nova venda!\n`;
            msg += `Pedido #${orderId}\n`;
            msg += `${customerName} — ${formatBRL(prev.total || 0)}\n`;

            prev.items?.forEach((item: any) => {
              const specs = [item.selectedSize, item.selectedColor].filter(Boolean).join(', ');
              msg += `${item.quantity}x ${item.name}${specs ? ` (${specs})` : ''}\n`;
            });

            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.todabelaoficial.com.br';
            msg += `\nVer no painel: ${siteUrl}/?admin=true`;

            // Marca como notificado para evitar duplicidade
            if (await sendTelegram(msg)) {
              await orderRef.update({ paidNotified: true });
              console.log('Notificação Telegram enviada com sucesso');
            }
          } catch (telErr) {
            console.error('Erro ao enviar notificação para o Telegram:', telErr);
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
