export const CONSENT_KEY = 'tb_cookie_consent';
export const CONSENT_EVENT = 'tb-consent-change';

// Opt-out: rastreia desde a 1a visita (consent null/'granted'); só para se a cliente recusou.
export function isDenied(): boolean {
  try {
    return typeof window !== 'undefined' && localStorage.getItem(CONSENT_KEY) === 'denied';
  } catch {
    return false;
  }
}

export function newEventId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Dispara evento no Pixel (navegador) e na API de Conversões (servidor) com o mesmo eventId.
 * params.user_data ({ email, phone }) vai só para o servidor, nunca para o Pixel.
 */
export function trackEvent(name: string, params?: Record<string, unknown>, eventId?: string): void {
  if (typeof window === 'undefined' || isDenied()) return;
  const id = eventId || newEventId();
  const { user_data, ...custom } = (params || {}) as Record<string, unknown>;
  const w = window as unknown as { fbq?: (...a: unknown[]) => void };
  try {
    if (typeof w.fbq === 'function') w.fbq('track', name, custom, { eventID: id });
  } catch {}
  try {
    fetch('/api/meta-capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: name,
        event_id: id,
        event_source_url: window.location.href,
        custom_data: custom,
        user_data: user_data || undefined,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}
