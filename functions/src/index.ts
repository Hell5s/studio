import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { Resend } from "resend";
import { gerarEmailPosCompra, gerarEmailRastreio } from "./emailTemplate";
import { initializeApp, getApps } from "firebase-admin/app";

if (getApps().length === 0) {
  initializeApp();
}

/**
 * Helper para obter instância do Resend com a chave atualizada
 */
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY não configurada nas variáveis de ambiente.");
    return null;
  }
  return new Resend(apiKey);
}

/**
 * Função disparada quando o status do pedido muda para 'paid'
 */
export const enviarEmailPedidoPago = onDocumentUpdated(
  "orders/{orderId}",
  async (event) => {
    const resend = getResendClient();
    if (!resend) return;

    const before = event.data?.before.data();
    const after = event.data?.after.data();
    const orderId = event.params.orderId;

    if (!before || !after) return;

    // Condições: o status anterior não era 'paid', o atual é 'paid' e o e-mail ainda não foi enviado
    const wasPaid = before.status === 'paid';
    const isPaid = after.status === 'paid';

    if (isPaid && !wasPaid && !after.confirmationEmailSent) {
      const email = after.customerEmail || after.customer?.email;
      const name = after.customerName || after.customer?.name;
      const items = after.items || [];
      const total = typeof after.total === 'number' ? after.total : 0;
      
      const address = after.customerAddress || {
        street: after.customer?.address || 'Endereço não informado',
        number: '',
        neighborhood: '',
        city: after.customer?.city || '',
        state: after.customer?.state || '',
        zipCode: after.customer?.zip || '',
      };

      if (!email) {
        console.warn(`Pedido ${orderId} sem e-mail de cliente.`);
        return;
      }

      const html = gerarEmailPosCompra({ orderId, customerName: name || 'Cliente', items, total, address });

      // O Resend não lança exceção para erros de envio; verificamos o campo error da resposta
      const { data, error } = await resend.emails.send({
        from: "Toda Bela <onboarding@resend.dev>",
        to: email,
        subject: `✨ Pedido confirmado! Obrigada, ${(name || 'cliente').split(" ")[0]} 💛`,
        html,
      });

      if (error) {
        console.error("Erro ao enviar e-mail de confirmação via Resend (Status 4xx/5xx):", error);
        return;
      }

      // Sucesso: marca como enviado no Firestore para evitar duplicidade
      await event.data?.after.ref.update({
        confirmationEmailSent: true,
        confirmationEmailSentAt: new Date(),
        resendMessageId: data?.id
      });

      console.log(`Email de confirmação enviado para ${email} (Pedido: ${orderId})`);
    }
  }
);

/**
 * Função disparada quando o status do pedido muda para 'shipped' (Enviado)
 */
export const enviarEmailRastreio = onDocumentUpdated(
  "orders/{orderId}",
  async (event) => {
    const resend = getResendClient();
    if (!resend) return;

    const after = event.data?.after.data();
    if (!after) return;

    // Só processa se o status for 'shipped' (Enviado)
    if (after.status !== 'shipped' && after.status !== 'Enviado') return;

    // Filtra itens que possuem código de rastreio
    const itemsWithTracking = (after.items || []).filter((item: any) => item.trackingCode && String(item.trackingCode).trim() !== "");
    if (itemsWithTracking.length === 0) return;

    // Gera string identificadora dos códigos para evitar reenvio do mesmo código
    const trackingCodesString = itemsWithTracking
      .map((item: any) => String(item.trackingCode).trim())
      .sort()
      .join(",");

    // Evita loop infinito e reenvio se os códigos não mudaram
    if (after.trackingEmailSentCodes === trackingCodesString) return;

    const email = after.customerEmail || after.customer?.email;
    const name = after.customerName || after.customer?.name;

    if (!email) return;

    const html = gerarEmailRastreio({ 
      orderId: event.params.orderId, 
      customerName: name || 'Cliente', 
      items: itemsWithTracking.map((it: any) => ({ name: it.name, trackingCode: it.trackingCode }))
    });

    try {
      await resend.emails.send({
        from: "Toda Bela <onboarding@resend.dev>",
        to: email,
        subject: `📦 Seu pedido da Toda Bela está a caminho!`,
        html,
      });
      
      // Registra o envio no Firestore usando a referência do snapshot
      await event.data?.after.ref.update({
        trackingEmailSentCodes: trackingCodesString,
        trackingEmailSentAt: new Date(),
      });

      console.log(`Email de rastreio enviado para ${email} (Pedido: ${event.params.orderId})`);
    } catch (error) {
      console.error("Erro ao enviar email de rastreio:", error);
    }
  }
);
