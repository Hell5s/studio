"use client";

import React, { useMemo, useState } from 'react';
import { Ruler } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { sizeLabel } from './utils';
import { extractMeasureLines, isCompleteChart, parseSizeChart } from '@/lib/size-guide';

// Guia de medidas da página do produto: tabela montada a partir da descrição quando ela
// traz as medidas completas; senão, o trecho original com as medidas; e sempre o "como se medir".
export function SizeGuide({ description, sizes }: { description?: string; sizes?: string[] }) {
  const [open, setOpen] = useState(false);
  const chart = useMemo(() => parseSizeChart(description, sizes), [description, sizes]);
  const excerpt = useMemo(() => (isCompleteChart(chart) ? [] : extractMeasureLines(description)), [chart, description]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary underline underline-offset-4 min-h-[44px]"
      >
        <Ruler className="h-4 w-4" /> Guia de medidas
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-[1.5rem] p-6 md:p-8">
          <DialogTitle className="font-headline text-2xl text-primary">Guia de medidas</DialogTitle>
          <DialogDescription className="text-sm text-gray-700">
            Medidas da peça. Compare com uma roupa sua que veste bem.
          </DialogDescription>

          {isCompleteChart(chart) ? (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-widest text-muted-foreground">
                    <th className="px-2 py-2">Tamanho</th>
                    {chart.measures.map(m => <th key={m} className="px-2 py-2">{m}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {chart.sizes.map(size => (
                    <tr key={size}>
                      <td className="px-2 py-2 font-bold text-primary">{sizeLabel(size)}</td>
                      {chart.measures.map(m => <td key={m} className="px-2 py-2 whitespace-nowrap">{chart.values[size][m]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
              {chart.sizes.some(s => Object.values(chart.values[s]).some(v => v.includes(' a '))) && (
                <p className="px-2 pt-2 text-sm text-gray-700 italic">Quando aparecem dois números, o primeiro é a medida da peça sem esticar e o segundo, esticada.</p>
              )}
            </div>
          ) : excerpt.length > 0 ? (
            <div className="rounded-xl bg-secondary/20 p-4 space-y-1 text-xs text-primary/80">
              {excerpt.map((line, i) => <p key={i}>{line.replace(/\*\*/g, '').replace(/^[✔✅•*\-\s]+/, '')}</p>)}
            </div>
          ) : (
            <p className="rounded-xl bg-secondary/20 p-4 text-xs text-primary/80">
              Esta peça ainda não tem a tabela de medidas cadastrada. Fale com a gente antes de comprar, que ajudamos você a escolher o tamanho.
            </p>
          )}

          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold uppercase tracking-widest text-accent">Como se medir</p>
            <ul className="text-xs text-primary/80 space-y-1.5 list-disc pl-4">
              <li><b>Busto:</b> passe a fita na parte mais cheia do busto, sem apertar.</li>
              <li><b>Cintura:</b> na parte mais fina do tronco, um pouco acima do umbigo.</li>
              <li><b>Quadril:</b> na parte mais larga do quadril, com os pés juntos.</li>
              <li>Entre dois tamanhos, prefira o maior para peças sem elastano.</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
