"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface ProductDescriptionProps {
  text: string;
  productName?: string;
}

export function ProductDescription({ text, productName }: ProductDescriptionProps) {
  if (!text) return null;

  // 1. Normalização e Preparação
  let processedText = text.replace(/\r\n/g, '\n');

  // Se o texto for um bloco único sem quebras, tentamos inserir quebras antes de títulos conhecidos e marcadores
  const sectionHeaders = [
    'CARACTERÍSTICAS DO PRODUTO', 'CARACTERISTICAS DO PRODUTO', 
    'COMO USAR', 'MODELAGEM', 'TABELA DE MEDIDAS', 
    'COMPOSIÇÃO', 'COMPOSICAO', 'CUIDADOS', 'DETALHES DA PEÇA', 'DETALHES DA PECA'
  ];

  if (!processedText.includes('\n')) {
    sectionHeaders.forEach(header => {
      const regex = new RegExp(`(${header})`, 'gi');
      processedText = processedText.replace(regex, '\n$1');
    });
    processedText = processedText.replace(/([*•])/g, '\n$1');
  }

  const lines = processedText.split('\n').map(l => l.trim()).filter(Boolean);
  const blocks: React.ReactNode[] = [];

  let isInsideTable = false;
  const tableRows: string[][] = [];

  // Função para processar linha de medida e tentar extrair colunas
  const parseMeasureLine = (line: string) => {
    // Padrão: "Tamanho GG Busto: 110 a 116 cm Cintura: 92 a 98 cm Comprimento: 70 cm"
    const parts = line.split(/(Tamanho|Busto:|Cintura:|Comprimento:)/i).map(p => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      const row: string[] = ["", "", "", ""]; // [Tam, Busto, Cint, Comp]
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i].toLowerCase();
        if (p === 'tamanho') row[0] = parts[i+1] || "";
        if (p === 'busto:') row[1] = parts[i+1] || "";
        if (p === 'cintura:') row[2] = parts[i+1] || "";
        if (p === 'comprimento:') row[3] = parts[i+1] || "";
      }
      return row.some(r => r !== "") ? row : null;
    }
    return null;
  };

  const renderTable = (rows: string[][]) => {
    if (rows.length === 0) return null;
    return (
      <div key={`table-${Math.random()}`} className="my-6 overflow-x-auto border border-primary/5 rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-[12px] border-collapse">
          <thead>
            <tr className="bg-secondary/20 border-b border-primary/10">
              <th className="px-4 py-2 font-bold uppercase tracking-widest text-primary/60">Tamanho</th>
              <th className="px-4 py-2 font-bold uppercase tracking-widest text-primary/60">Busto</th>
              <th className="px-4 py-2 font-bold uppercase tracking-widest text-primary/60">Cintura</th>
              <th className="px-4 py-2 font-bold uppercase tracking-widest text-primary/60">Comprimento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-secondary/5 transition-colors">
                <td className="px-4 py-3 font-bold text-primary">{row[0]}</td>
                <td className="px-4 py-3 text-muted-foreground">{row[1]}</td>
                <td className="px-4 py-3 text-muted-foreground">{row[2]}</td>
                <td className="px-4 py-3 text-muted-foreground">{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  lines.forEach((line, index) => {
    // Ignorar nome do produto se for a primeira linha
    if (index === 0 && productName && line.toLowerCase().startsWith(productName.toLowerCase())) {
      const rest = line.substring(productName.length).trim();
      if (rest.startsWith(':')) return; // Pula se for só o título
      if (!rest) return; // Pula se for só o nome
    }

    // Detectar Títulos (Caixa Alta)
    const isTitle = sectionHeaders.some(h => line.toUpperCase().startsWith(h)) || (line === line.toUpperCase() && line.length > 3 && !line.startsWith('*') && !line.startsWith('•'));
    
    if (isTitle) {
      if (isInsideTable) {
        blocks.push(renderTable([...tableRows]));
        tableRows.length = 0;
        isInsideTable = false;
      }

      // Separar título de texto colado (ex: "COMO USAR O body...")
      let displayTitle = line;
      let extraText = "";
      const matchedHeader = sectionHeaders.find(h => line.toUpperCase().startsWith(h));
      
      if (matchedHeader && line.length > matchedHeader.length + 2) {
        displayTitle = line.substring(0, matchedHeader.length).replace(/:$/, '');
        extraText = line.substring(matchedHeader.length).trim().replace(/^:/, '').trim();
      }

      blocks.push(
        <h4 key={index} className={cn(
          "text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-2",
          blocks.length > 0 ? "mt-8" : "mt-0"
        )}>
          {displayTitle.replace(/:$/, '')}
        </h4>
      );

      if (displayTitle.toUpperCase().includes('TABELA DE MEDIDAS')) {
        isInsideTable = true;
      }

      if (extraText) {
        blocks.push(<p key={`${index}-extra`} className="text-[14px] leading-7 text-foreground/70 font-normal mb-3">{extraText}</p>);
      }
      return;
    }

    // Detectar Listas
    if (line.startsWith('*') || line.startsWith('•') || line.startsWith('- ')) {
      if (isInsideTable) {
        blocks.push(renderTable([...tableRows]));
        tableRows.length = 0;
        isInsideTable = false;
      }
      blocks.push(
        <div key={index} className="flex items-start gap-3 mb-3 pl-1">
          <div className="h-1.5 w-1.5 bg-accent rotate-45 shrink-0 mt-[10px]" />
          <span className="text-[14px] leading-7 text-foreground/70 font-normal">
            {line.replace(/^[*•-]\s?/, '')}
          </span>
        </div>
      );
      return;
    }

    // Detectar Dados de Tabela
    if (isInsideTable) {
      const row = parseMeasureLine(line);
      if (row) {
        tableRows.push(row);
        return;
      }
    }

    // Parágrafo Padrão
    blocks.push(
      <p key={index} className="text-[14px] leading-7 text-foreground/70 font-normal mb-4">
        {line}
      </p>
    );
  });

  // Fechar tabela se ainda estiver aberta
  if (isInsideTable && tableRows.length > 0) {
    blocks.push(renderTable([...tableRows]));
  }

  return <div className="space-y-1">{blocks}</div>;
}
