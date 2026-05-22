interface Item {
    name: string;
    image: string;
    price: number;
    quantity: number;
  }
  
  interface Address {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  }
  
  interface EmailProps {
    orderId: string;
    customerName: string;
    items: Item[];
    total: number;
    address: Address;
  }
  
  function formatarPreco(valor: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  }
  
  function formatarEndereco(address: Address): string {
    const complemento = address.complement ? `, ${address.complement}` : "";
    return `${address.street}, ${address.number}${complemento} — ${address.neighborhood}, ${address.city}/${address.state} — CEP ${address.zipCode}`;
  }
  
  export function gerarEmailPosCompra({ orderId, customerName, items, total, address }: EmailProps): string {
    const primeiroNome = customerName.split(" ")[0];
    const idCurto = orderId.slice(0, 8).toUpperCase();
  
    const itensHtml = items.map((item) => `
      <tr>
        <td style="padding:16px 0;border-bottom:1px solid #f0e8e0;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="72" style="vertical-align:top;">
              <img src="${item.image}" width="64" height="64" style="border-radius:8px;object-fit:cover;display:block;" />
            </td>
            <td style="padding-left:16px;vertical-align:top;">
              <p style="margin:0 0 4px 0;font-family:Georgia,serif;font-size:15px;color:#3d1f27;font-weight:600;">${item.name}</p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#8c6e5a;">Quantidade: ${item.quantity}</p>
            </td>
            <td style="text-align:right;vertical-align:top;">
              <p style="margin:0;font-family:Georgia,serif;font-size:15px;color:#6E3C47;font-weight:700;">${formatarPreco(item.price * item.quantity)}</p>
            </td>
          </tr></table>
        </td>
      </tr>`).join("");
  
    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/></head>
  <body style="margin:0;padding:0;background-color:#fdf8f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fdf8f4;padding:40px 16px;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  
    <tr><td style="background:linear-gradient(135deg,#6E3C47 0%,#9b5466 100%);border-radius:16px 16px 0 0;padding:40px 48px;text-align:center;">
      <p style="margin:0 0 8px 0;font-family:Georgia,serif;font-size:32px;font-weight:700;color:#C7A17A;letter-spacing:4px;text-transform:uppercase;">Toda Bela</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#e8c9b0;letter-spacing:2px;text-transform:uppercase;">Moda Feminina</p>
      <p style="margin:24px 0 8px 0;font-family:Georgia,serif;font-size:22px;color:#fff;">Pedido confirmado! 🎉</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#e8c9b0;">Obrigada pela sua compra, <strong>${primeiroNome}</strong> 💛</p>
    </td></tr>
  
    <tr><td style="background-color:#ffffff;padding:40px 48px;">
      <p style="margin:0 0 24px 0;font-family:Georgia,serif;font-size:18px;color:#3d1f27;">Olá, ${primeiroNome}!</p>
      <p style="margin:0 0 32px 0;font-family:Arial,sans-serif;font-size:14px;color:#6b4f4f;line-height:1.7;">Seu pedido foi recebido com sucesso e já está sendo preparado com muito carinho. Em breve você receberá uma atualização sobre o envio. 🌸</p>
  
      <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#fdf0e8,#fae8d8);border-radius:12px;margin-bottom:32px;">
        <tr><td style="padding:20px 24px;">
          <p style="margin:0 0 4px 0;font-family:Arial,sans-serif;font-size:11px;color:#8c6e5a;text-transform:uppercase;letter-spacing:1.5px;">Número do pedido</p>
          <p style="margin:0;font-family:Georgia,serif;font-size:22px;color:#6E3C47;font-weight:700;letter-spacing:2px;">#${idCurto}</p>
        </td></tr>
      </table>
  
      <p style="margin:0 0 4px 0;font-family:Arial,sans-serif;font-size:11px;color:#8c6e5a;text-transform:uppercase;letter-spacing:1.5px;">Seus itens</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">${itensHtml}</table>
  
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #6E3C47;margin-bottom:32px;">
        <tr>
          <td style="padding-top:16px;font-family:Arial,sans-serif;font-size:14px;color:#6b4f4f;">Total da compra</td>
          <td style="text-align:right;padding-top:16px;font-family:Georgia,serif;font-size:22px;color:#6E3C47;font-weight:700;">${formatarPreco(total)}</td>
        </tr>
      </table>
  
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fdf8f4;border-radius:12px;margin-bottom:32px;border-left:3px solid #C7A17A;">
        <tr><td style="padding:20px 24px;">
          <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:11px;color:#8c6e5a;text-transform:uppercase;letter-spacing:1.5px;">📦 Endereço de entrega</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#3d1f27;line-height:1.6;">${formatarEndereco(address)}</p>
        </td></tr>
      </table>
  
      <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#6b4f4f;line-height:1.7;text-align:center;">Qualquer dúvida, estamos à disposição. 💌<br/>Com amor,<br/><strong style="color:#6E3C47;font-family:Georgia,serif;">Equipe Toda Bela</strong></p>
    </td></tr>
  
    <tr><td style="background-color:#3d1f27;border-radius:0 0 16px 16px;padding:28px 48px;text-align:center;">
      <p style="margin:0 0 8px 0;font-family:Georgia,serif;font-size:16px;color:#C7A17A;letter-spacing:3px;text-transform:uppercase;">Toda Bela</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#8c6e5a;line-height:1.6;">© ${new Date().getFullYear()} Toda Bela. Todos os direitos reservados.</p>
    </td></tr>
  
  </table>
  </td></tr>
  </table>
  </body></html>`;
  }