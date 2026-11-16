import type { Metadata } from 'next';
import { getAdminDb } from '@/lib/server/firebase-admin';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.todabelaoficial.com.br';

type Props = { params: Promise<{ id: string }>; children: React.ReactNode };

async function load(id: string) {
  try {
    const db = await getAdminDb();
    const snap = await db.collection('products').doc(id).get();
    if (!snap.exists) return null;
    const product = { id, ...snap.data() } as any;
    const rs = await db.collection('reviews').where('productId', '==', id).where('status', '==', 'published').get();
    const ratings: number[] = rs.docs.map((d: any) => d.data()).filter((r: any) => !r.isDemo && r.rating > 0).map((r: any) => r.rating);
    return { product, ratings };
  } catch {
    return null; // sem credenciais do servidor: a página segue funcionando, só sem metadados
  }
}

const imageOf = (v: any): string => (typeof v === 'string' ? v : v?.url || '');
const plain = (t: string) => t.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await load(id);
  if (!data) return { title: 'Toda Bela' };
  const { product } = data;
  const image = imageOf(product.images?.[0]) || imageOf(product.image);
  const description = plain(product.description || '').slice(0, 155) || `${product.name} na Toda Bela - Moda Feminina.`;
  return {
    title: `${product.name} | Toda Bela`,
    description,
    openGraph: {
      title: product.name,
      description,
      url: `${SITE_URL}/products/${id}`,
      type: 'website',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: product.name, images: image ? [image] : undefined },
  };
}

export default async function ProductLayout({ params, children }: Props) {
  const { id } = await params;
  const data = await load(id);
  let jsonLd: any = null;

  if (data) {
    const { product, ratings } = data;
    const images = [...(product.images || []), product.image].map(imageOf).filter(Boolean);
    const stock = product.stock === undefined || product.stock === null || product.stock === '' ? null : Number(product.stock);
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: plain(product.description || ''),
      image: images,
      sku: product.sku || id,
      brand: { '@type': 'Brand', name: 'Toda Bela' },
      offers: {
        '@type': 'Offer',
        url: `${SITE_URL}/products/${id}`,
        priceCurrency: 'BRL',
        price: Number(product.price) || 0,
        availability: stock !== null && stock <= 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
      ...(ratings.length > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)),
          reviewCount: ratings.length,
        },
      }),
    };
  }

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />}
      {children}
    </>
  );
}
