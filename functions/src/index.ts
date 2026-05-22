import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { Resend } from "resend";
import { gerarEmailPosCompra } from "./emailTemplate";

const resend = new Resend("re_fhEi5DMN_DYeuayfLaaBBbnsivM9Lns6f");

export const enviarEmailPosCompra = onDocumentCreated(
  "orders/{orderId}",
  async (event) => {
    const order = event.data?.data();
    const orderId = event.params.orderId;

    if (!order || !order.customerEmail) return;

    const html = gerarEmailPosCompra({
      orderId,
      customerName: order.customerName,
      items: order.items,
      total: order.total,
      address: order.customerAddress,
    });

    try {
      await resend.emails.send({
        from: "Toda Bela <onboarding@resend.dev>",
        to: order.customerEmail,
        subject: `✨ Pedido confirmado! Obrigada, ${order.customerName.split(" ")[0]} 💛`,
        html,
      });
    } catch (error) {
      console.error("Erro ao enviar email:", error);
    }
  }
);