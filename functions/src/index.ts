import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { Resend } from "resend";
import { gerarEmailPosCompra, gerarEmailRastreio } from "./emailTemplate";
import { initializeApp, getApps } from "firebase-admin/app";

if (getApps().length === 0) {
  initializeApp();
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const enviarEmailPosCompra = onDocumentCreated(
  "orders/{orderId}",
  async (event) => {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY não configurada");
      return;
    }

    const order = event.data?.data();
    const orderId = event.params.orderId;

    if (!order) return;

    const email = order.customerEmail || order.customer?.email;
    const name = order.customerName || order.customer?.name;
    const items = order.items || [];
    const total = order.total;
    const address = order.customerAddress || {
      street: order.customer?.address || '',
      number: '',
      neighborhood: '',
      city: order.customer?.city || '',
      state: order.customer?.state || '',
      zipCode: order.customer?.zip || '',
    };

    if (!email) return;

    const html = gerarEmailPosCompra({ orderId, customerName: name || 'Cliente', items, total, address });

    try {
      await resend.emails.send({
        from: "Toda Bela <onboarding@resend.dev>",
        to: email,
        subject: `✨ Pedido confirmado! Obrigada, ${(name || 'cliente').split(" ")[0]} 💛`,
        html,
      });
      console.log(`Email enviado para ${email}`);
    } catch (error) {
      console.error("Erro ao enviar email:", error);
    }
  }
);

export const enviarEmailRastreio = onDocumentUpdated(
  "orders/{orderId}",
  async (event) => {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY não configurada");
      return;
    }

    const after = event.data?.after.data();
    if (!after) return;

    // Só processa se o status for 'shipped' (Enviado)
    if (after.status !== 'shipped') return;

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