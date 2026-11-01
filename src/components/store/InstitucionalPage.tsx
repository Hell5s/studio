"use client";

import React, { useMemo } from 'react';
import { Navbar } from '@/components/store/Navbar';
import { Footer } from '@/components/store/Footer';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { INSTITUCIONAL_PAGES } from '@/lib/institucional';
import { ArrowLeft, MessageCircle, Mail, Loader2, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';

interface InstitucionalPageProps {
  slug: string;
}

export function InstitucionalPage({ slug }: InstitucionalPageProps) {
  const db = useFirestore();
  const { cartCount } = useCart();
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings, isLoading } = useDoc(settingsRef);

  const pageData = INSTITUCIONAL_PAGES[slug];

  const processedContent = useMemo(() => {
    if (!pageData || !settings) return [];

    // Frase com os canais de atendimento que existem de fato (ex.: "pelo Instagram @loja ou pelo e-mail x"),
    // para os textos não citarem um WhatsApp ou e-mail que a loja ainda não tem.
    const channels = [
      settings.whatsapp && `pelo WhatsApp ${settings.whatsapp}`,
      settings.instagram && `pelo Instagram ${settings.instagram}`,
      settings.contactEmail && `pelo e-mail ${settings.contactEmail}`,
    ].filter(Boolean) as string[];
    const contactChannels = channels.length > 1
      ? `${channels.slice(0, -1).join(', ')} ou ${channels[channels.length - 1]}`
      : channels[0] || '';

    const vars: Record<string, string> = {
      storeName: settings.storeName || 'Toda Bela',
      contactEmail: settings.contactEmail || '',
      whatsapp: settings.whatsapp || '',
      instagram: settings.instagram || '',
      contactChannels,
      companyName: settings.companyName || settings.legalName || '',
      cnpj: settings.cnpj || '',
      address: settings.address || '',
      businessHours: settings.businessHours || '',
    };

    const lines = pageData.content.split('\n');
    const resultBlocks: any[] = [];
    let currentFaqGroup: any[] = [];

    // Helper para substituir variáveis
    const replaceVars = (text: string) => {
      let t = text;
      Object.entries(vars).forEach(([key, val]) => {
        t = t.replace(new RegExp(`{{${key}}}`, 'g'), val || '');
      });
      return t;
    };

    // Helper para checar se a linha tem variável vazia
    const hasEmptyVar = (text: string) => {
      const found = text.match(/{{(.*?)}}/g);
      if (!found) return false;
      return found.some(v => {
        const key = v.replace(/[{}]/g, '');
        return !vars[key];
      });
    };

    const flushFaq = () => {
      if (currentFaqGroup.length > 0) {
        resultBlocks.push({ type: 'faq', items: currentFaqGroup });
        currentFaqGroup = [];
      }
    };

    let i = 0;
    while (i < lines.length) {
      const rawLine = lines[i].trim();
      if (!rawLine) {
        i++;
        continue;
      }

      // Se a linha tem variável vazia, removemos ela (e o título anterior se for o caso)
      if (hasEmptyVar(rawLine)) {
        i++;
        continue;
      }

      const line = replaceVars(rawLine);

      if (line.startsWith('## ')) {
        flushFaq();
        resultBlocks.push({ type: 'h2', text: line.replace('## ', '') });
      } else if (line.startsWith('### ')) {
        const question = line.replace('### ', '');
        const answerLines: string[] = [];
        let j = i + 1;
        while (j < lines.length && !lines[j].trim().startsWith('## ') && !lines[j].trim().startsWith('### ')) {
          if (!hasEmptyVar(lines[j])) {
            answerLines.push(replaceVars(lines[j].trim()));
          }
          j++;
        }
        currentFaqGroup.push({ question, answer: answerLines.filter(Boolean) });
        i = j - 1;
      } else if (line.startsWith('- ')) {
        flushFaq();
        resultBlocks.push({ type: 'li', text: line.replace('- ', '') });
      } else if (line.startsWith('> ')) {
        flushFaq();
        resultBlocks.push({ type: 'quote', text: line.replace('> ', '') });
      } else {
        flushFaq();
        resultBlocks.push({ type: 'p', text: line });
      }
      i++;
    }
    flushFaq();

    // Filtro final: remover títulos (h2) que não têm conteúdo abaixo deles até o próximo título
    return resultBlocks.filter((block, idx) => {
      if (block.type !== 'h2') return true;
      const nextBlock = resultBlocks[idx + 1];
      if (!nextBlock || nextBlock.type === 'h2') return false;
      return true;
    });
  }, [pageData, settings]);

  const subtitle = useMemo(() => {
    if (!pageData?.subtitle || !settings) return pageData?.subtitle;
    let s = pageData.subtitle;
    s = s.replace(/{{storeName}}/g, settings.storeName || 'Toda Bela');
    return s;
  }, [pageData, settings]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FFF9F7]">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    );
  }

  const handleOpenWhatsApp = () => {
    const phone = (settings?.whatsapp || '').replace(/\D/g, '');
    if (phone) window.open(`https://wa.me/${phone}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background selection:bg-accent/30 selection:text-primary flex flex-col">
      <Navbar 
        onOpenLogin={() => {}} 
        onOpenCart={() => {}}
        onOpenFavorites={() => {}}
        cartCount={cartCount}
      />

      <main className="flex-1 pt-32 pb-24 md:pt-40 md:pb-40">
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl space-y-6">
            <Link href="/" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-accent transition-colors group w-fit">
              <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Voltar para Início
            </Link>
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-accent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent">Institucional</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-headline font-bold text-primary leading-tight tracking-tighter">
              {pageData.title}
            </h1>
            {subtitle && (
              <p className="text-lg md:text-2xl text-muted-foreground font-light italic max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
            {pageData.updatedAt && (
              <p className="text-[10px] font-bold uppercase text-primary/30 tracking-widest">
                Última atualização: {pageData.updatedAt}
              </p>
            )}

            {slug === 'fale-conosco' && (
              <div className="flex flex-wrap gap-4 pt-4">
                {settings?.whatsapp && (
                  <Button onClick={handleOpenWhatsApp} className="rounded-full bg-primary text-white h-14 px-8 font-bold uppercase text-[10px] tracking-widest shadow-xl">
                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                  </Button>
                )}
                {settings?.contactEmail && (
                  <Button variant="outline" onClick={() => window.location.href = `mailto:${settings.contactEmail}`} className="rounded-full border-primary/20 text-primary h-14 px-8 font-bold uppercase text-[10px] tracking-widest">
                    <Mail className="mr-2 h-4 w-4" /> E-mail
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="container mx-auto px-6">
          <div className="max-w-3xl space-y-2">
            {processedContent.map((block, idx) => {
              switch (block.type) {
                case 'p':
                  return <p key={idx} className="text-[15px] leading-8 text-foreground/75 mb-6">{block.text}</p>;
                case 'h2':
                  return <h2 key={idx} className="text-xl md:text-2xl font-headline font-bold text-primary mt-12 mb-4 uppercase tracking-tight">{block.text}</h2>;
                case 'li':
                  return (
                    <div key={idx} className="flex items-start gap-4 mb-4 pl-1">
                      <div className="h-1.5 w-1.5 bg-accent shrink-0 mt-3" />
                      <p className="text-[15px] leading-relaxed text-foreground/75">{block.text}</p>
                    </div>
                  );
                case 'quote':
                  return (
                    <div key={idx} className="p-6 md:p-8 bg-primary/5 border-l-4 border-accent rounded-r-2xl my-8">
                       <p className="text-sm italic text-primary/70 leading-relaxed font-light">{block.text}</p>
                    </div>
                  );
                case 'faq':
                  return (
                    <Accordion key={idx} type="single" collapsible className="w-full my-8 space-y-4">
                      {block.items.map((item: any, fIdx: number) => (
                        <AccordionItem key={fIdx} value={`faq-${idx}-${fIdx}`} className="border border-primary/5 rounded-2xl bg-white px-6">
                          <AccordionTrigger className="hover:no-underline text-left text-sm font-bold text-primary py-5 group">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="pb-6 space-y-4 text-foreground/70 leading-relaxed">
                            {item.answer.map((ans: string, aIdx: number) => (
                              <p key={aIdx}>{ans}</p>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  );
                default:
                  return null;
              }
            })}

            {/* Help Card */}
            <div className="mt-20 p-10 md:p-16 rounded-[3rem] bg-secondary/10 border border-primary/5 flex flex-col items-center text-center space-y-8">
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm text-accent">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-headline font-bold text-primary">Precisa de ajuda?</h4>
                <p className="text-sm text-muted-foreground italic font-light">Nossa equipe de curadoria está pronta para te atender.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                {settings?.whatsapp && (
                  <Button onClick={handleOpenWhatsApp} variant="outline" className="rounded-full border-primary/20 text-primary h-14 px-10 font-bold uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all">
                    WhatsApp VIP
                  </Button>
                )}
                {settings?.contactEmail && (
                  <Button onClick={() => window.location.href = `mailto:${settings.contactEmail}`} variant="outline" className="rounded-full border-primary/20 text-primary h-14 px-10 font-bold uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all">
                    Enviar E-mail
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
