import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export const runtime = 'nodejs';

const WIDTHS = [320, 480, 640, 828, 1080, 1600];
const MAX_IMG = 10 * 1024 * 1024;
const MAX_VID = 50 * 1024 * 1024;
const VIDEO_EXT: Record<string, string> = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' };
const ADMIN_UID = 'LXaJZDm6tNUQLh3ooghcg6EQgJ43'; // mesmo fallback do painel admin

async function requireAdmin(req: NextRequest) {
  const idToken = req.headers.get('authorization')?.replace(/^Bearer /, '');
  if (!idToken) return false;
  const { initializeApp, getApps, cert } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');
  const { getFirestore } = await import('firebase-admin/firestore');
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
      }),
    });
  }
  try {
    const { uid } = await getAuth().verifyIdToken(idToken);
    if (uid === ADMIN_UID) return true;
    return (await getFirestore().collection('roles_admin').doc(uid).get()).exists;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_URL) {
    return NextResponse.json({ error: 'R2 não configurado' }, { status: 500 });
  }

  const form = await req.formData();
  const file = form.get('file');
  const kind = form.get('kind') === 'video' ? 'video' : 'image';
  if (!(file instanceof Blob)) return NextResponse.json({ error: 'Arquivo ausente' }, { status: 400 });

  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  });
  const put = (Key: string, Body: Buffer, ContentType: string) =>
    s3.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key, Body, ContentType, CacheControl: 'public, max-age=31536000, immutable' }));

  const base = R2_PUBLIC_URL.replace(/\/$/, '');
  const slug = ((file as File).name || 'foto').replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'foto';
  const id = `${slug}-${randomBytes(4).toString('hex')}`;

  try {
    if (kind === 'video') {
      const ext = VIDEO_EXT[file.type];
      if (!ext) return NextResponse.json({ error: 'Tipo de vídeo inválido' }, { status: 400 });
      if (file.size > MAX_VID) return NextResponse.json({ error: 'Vídeo acima de 50MB' }, { status: 413 });
      await put(`vid/${id}.${ext}`, Buffer.from(await file.arrayBuffer()), file.type);
      return NextResponse.json({ url: `${base}/vid/${id}.${ext}` });
    }

    if (!/^image\/(jpeg|png|webp|gif|avif|heic|heif)$/.test(file.type)) {
      return NextResponse.json({ error: 'Tipo de imagem inválido' }, { status: 400 });
    }
    if (file.size > MAX_IMG) return NextResponse.json({ error: 'Imagem acima de 10MB' }, { status: 413 });

    const sharp = (await import('sharp')).default;
    const input = Buffer.from(await file.arrayBuffer());
    await Promise.all([
      ...WIDTHS.map(async (w) =>
        put(`img/${id}/${w}.webp`, await sharp(input).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 90, smartSubsample: true, effort: 5 }).toBuffer(), 'image/webp')
      ),
      (async () => put(`img/${id}/orig.webp`, await sharp(input).rotate().webp({ quality: 95, smartSubsample: true, effort: 5 }).toBuffer(), "image/webp"))(),
    ]);
    return NextResponse.json({ url: `${base}/img/${id}/1080.webp` });
  } catch (e: any) {
    console.error('upload error', e);
    return NextResponse.json({ error: 'Falha ao processar o upload' }, { status: 500 });
  }
}
