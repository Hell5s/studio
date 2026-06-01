import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { Resend } from "resend";
import { gerarEmailPosCompra } from "./emailTemplate";

const resend = new Resend("re_fhEi5DMN_DYeuayfLaaBBbnsivM9Lns6f");

export const enviarEmailPosCompra = onDocumentCreated(
  "orders/{orderId}",
  async (event) => {
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