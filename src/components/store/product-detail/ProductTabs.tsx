
"use client";

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus } from 'lucide-react';

interface ProductTabsProps {
  product: any;
}

export function ProductTabs({ product }: ProductTabsProps) {
  return (
    <Accordion type="single" collapsible className="w-full border-t border-primary/5">
      <AccordionItem value="item-1" className="border-b border-primary/5">
        <AccordionTrigger className="hover:no-underline py-5 group text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80 [&[data-state=open]>svg]:rotate-45">
          Descrição do Produto
        </AccordionTrigger>
        <AccordionContent className="pb-6 text-xs text-muted-foreground leading-relaxed font-light italic">
          {product.longDescription || product.description}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2" className="border-b border-primary/5">
        <AccordionTrigger className="hover:no-underline py-5 group text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80 [&[data-state=open]>svg]:rotate-45">
          Cuidados com seu produto
        </AccordionTrigger>
        <AccordionContent className="pb-6 text-xs text-muted-foreground leading-relaxed font-light italic">
          Para manter a vivacidade e a durabilidade da sua peça Toda Bela, recomendamos lavagem à mão com sabão neutro, secagem à sombra e evitar o uso de alvejantes ou máquinas de secar.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-3" className="border-b border-primary/5">
        <AccordionTrigger className="hover:no-underline py-5 group text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80 [&[data-state=open]>svg]:rotate-45">
          Avaliações
        </AccordionTrigger>
        <AccordionContent className="pb-6 text-xs text-muted-foreground leading-relaxed font-light italic">
          Esta peça possui nota máxima entre nossas clientes. "Modelagem impecável e tecido de altíssima qualidade" - Cliente Verificada.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
