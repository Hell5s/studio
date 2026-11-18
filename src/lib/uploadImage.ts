import { getAuth } from 'firebase/auth';

// Envia imagem/vídeo ao servidor (grava no R2). Retorna a URL pública.
export async function uploadImage(
  input: File | Blob | string,
  opts: { kind?: 'image' | 'video'; signal?: AbortSignal } = {}
): Promise<string> {
  let blob = typeof input === 'string' ? await (await fetch(input)).blob() : input;
  const kind = opts.kind ?? (blob.type.startsWith('video/') ? 'video' : 'image');
  // A Vercel limita o corpo da função a ~4,5MB: reduz fotos grandes antes de enviar.
  // shortcut: vídeo acima de ~4MB falha; usar URL pré-assinada se precisar.
  if (kind === 'image' && blob.size > 3_000_000 && blob.type !== 'image/gif') {
    try {
      const bmp = await createImageBitmap(blob);
      const s = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas');
      c.width = Math.round(bmp.width * s);
      c.height = Math.round(bmp.height * s);
      c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
      const small = await new Promise<Blob | null>(r => c.toBlob(r, 'image/webp', 0.88));
      if (small) blob = small;
    } catch { /* envia o original */ }
  }
  const token = await getAuth().currentUser?.getIdToken();
  if (!token) throw new Error('Faça login como admin para enviar arquivos');

  const form = new FormData();
  form.append('file', blob, (blob as File).name || 'upload');
  form.append('kind', kind);
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
    signal: opts.signal,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.error || 'Falha no upload');
  return data.url;
}
