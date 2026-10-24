import { Metadata } from 'next';
import { INSTITUCIONAL_PAGES } from '@/lib/institucional';
import { InstitucionalPage } from '@/components/store/InstitucionalPage';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(INSTITUCIONAL_PAGES).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = INSTITUCIONAL_PAGES[slug];

  if (!page) {
    return { title: 'Página não encontrada | Toda Bela' };
  }

  return {
    title: `${page.title} | Toda Bela`,
    description: page.subtitle || `Página institucional ${page.title} da Toda Bela - Moda Feminina.`,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  
  if (!INSTITUCIONAL_PAGES[slug]) {
    notFound();
  }

  return <InstitucionalPage slug={slug} />;
}
