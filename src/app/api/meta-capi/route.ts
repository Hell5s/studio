import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

export const runtime = 'nodejs';

const sha = (v: string) => createHash('sha256').update(v).digest('hex');
const str = (v: unknown, max = 500) => (typeof v === 'string' && v.length <= max ? v : undefined);

export async function POST(req: NextRequest) {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) return new NextResponse(null, { status: 204 });

  let b: any;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }
  const name = str(b?.event_name, 60);
  const eventId = str(b?.event_id, 100);
  if (!name || !/^[A-Za-z][A-Za-z0-9_]*$/.test(name) || !eventId) {
    return NextResponse.json({ error: 'Evento inválido' }, { status: 400 });
  }

  const custom =
    b.custom_data && typeof b.custom_data === 'object' && !Array.isArray(b.custom_data) ? b.custom_data : undefined;
  const ud: Record<string, unknown> = {
    client_user_agent: req.headers.get('user-agent') || undefined,
    client_ip_address: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || undefined,
    fbp: req.cookies.get('_fbp')?.value,
    fbc: req.cookies.get('_fbc')?.value,
  };
  const email = str(b.user_data?.email, 200)?.trim().toLowerCase();
  if (email) ud.em = [sha(email)];
  const phone = str(b.user_data?.phone, 30)?.replace(/\D/g, '');
  if (phone) ud.ph = [sha(phone.length <= 11 ? `55${phone}` : phone)]; // assume Brasil sem DDI

  const payload = {
    data: [{
      event_name: name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: str(b.event_source_url, 2000),
      action_source: 'website',
      user_data: ud,
      custom_data: custom,
    }],
  };

  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return new NextResponse(null, { status: r.ok ? 204 : 502 });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
