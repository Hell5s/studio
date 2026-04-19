
"use client";

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProductTabsProps {
  product: any;
}

export function ProductTabs({ product }: ProductTabsProps) {
  const scrollToReviews = () => {
    const el = document.getElementById('avaliacoes');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full border-t border-primary/5">
      <AccordionItem value="item-1" className="border-b border-primary/5">
        <AccordionTrigger className="hover:no-underline py-5 group text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80 [&[data-state=open]>svg]:rotate-45">
          Descrição Editorial
        </AccordionTrigger>
        <AccordionContent className="pb-6 text-[13px] text-muted-foreground leading-relaxed font-light italic space-y-4">
          <p>{product.longDescription || product.description}</p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2" className="border-b border-primary/5">
        <AccordionTrigger className="hover:no-underline py-5 group text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80 [&[data-state=open]>svg]:rotate-45">
          Guia de Cuidados & Tecido
        </AccordionTrigger>
        <AccordionContent className="pb-6 text-[13px] text-muted-foreground leading-relaxed font-light italic">
          <p className="mb-4">Para preservar a essência e a durabilidade desta peça Toda Bela, recomendamos:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Lavagem à mão com sabão neutro para fibras delicadas.</li>
            <li>Secagem à sombra para manter a vivacidade da cor.</li>
            <li>Evitar o uso de máquinas de secar ou alvejantes à base de cloro.</li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-3" className="border-b border-primary/5">
        <button 
          onClick={scrollToReviews}
          className="flex flex-1 items-center justify-between py-5 font-medium transition-all text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80 w-full text-left"
        >
          Avaliações das Clientes
          <span className="text-accent text-[8px] font-black px-2 py-0.5 bg-accent/10 rounded-full">★ 4.9</span>
        </button>
      </AccordionItem>
    </Accordion>
  );
}
