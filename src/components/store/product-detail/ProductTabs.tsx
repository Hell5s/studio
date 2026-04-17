
"use client";

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Package, Truck, ShieldAlert, Ruler } from 'lucide-react';

interface ProductTabsProps {
  product: any;
}

export function ProductTabs({ product }: ProductTabsProps) {
  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      <AccordionItem value="item-1" className="border-none bg-white rounded-[2.5rem] px-8 shadow-sm">
        <AccordionTrigger className="hover:no-underline py-6">
          <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
            <Package className="h-4 w-4 text-accent" />
            Detalhes e Composição
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-8 text-sm text-muted-foreground/80 leading-relaxed font-light italic">
          Nossas peças são confeccionadas com os mais altos padrões de qualidade da moda internacional. 
          Este modelo possui acabamento premium, costuras reforçadas e toque acetinado exclusivo Toda Bela.
          <br /><br />
          Composição: 95% Poliéster Premium, 5% Elastano.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2" className="border-none bg-white rounded-[2.5rem] px-8 shadow-sm">
        <AccordionTrigger className="hover:no-underline py-6">
          <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
            <Ruler className="h-4 w-4 text-accent" />
            Guia de Medidas
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-8 text-sm text-muted-foreground/80 leading-relaxed font-light italic">
          P: Busto 86-90 | Cintura 68-72 | Quadril 94-98<br />
          M: Busto 92-96 | Cintura 74-78 | Quadril 100-104<br />
          G: Busto 98-102 | Cintura 80-84 | Quadril 106-110<br /><br />
          *As medidas podem variar até 2cm para mais ou menos.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-3" className="border-none bg-white rounded-[2.5rem] px-8 shadow-sm">
        <AccordionTrigger className="hover:no-underline py-6">
          <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
            <Truck className="h-4 w-4 text-accent" />
            Envio e Prazos
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-8 text-sm text-muted-foreground/80 leading-relaxed font-light italic">
          O prazo de entrega varia de acordo com a sua localização. 
          Como somos uma Maison de curadoria global, nossos prazos de entrega 
          estimados para produtos importados selecionados variam de 10 a 20 dias úteis.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-4" className="border-none bg-white rounded-[2.5rem] px-8 shadow-sm">
        <AccordionTrigger className="hover:no-underline py-6">
          <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
            <ShieldAlert className="h-4 w-4 text-accent" />
            Trocas e Devoluções
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-8 text-sm text-muted-foreground/80 leading-relaxed font-light italic">
          Sua satisfação é nossa prioridade absoluta. Caso a peça não atenda suas expectativas, 
          você tem até 7 dias após o recebimento para solicitar a troca ou devolução sem custos adicionais.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
