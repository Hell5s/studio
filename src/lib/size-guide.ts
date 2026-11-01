// Monta a tabela de medidas a partir da descrição do produto. As descrições trazem as
// medidas em formatos variados ("°G1 / Busto - 84cm Esticando - 108cm",
// "Tamanho G1 (veste até 48/50) / Busto: 102cm", "N° 46- Cintura: 80cm; Quadril: 132cm"),
// então a leitura procura o tamanho e, nas linhas seguintes, as medidas em cm.

export type SizeChart = {
  sizes: string[];
  measures: string[];
  values: Record<string, Record<string, string>>; // values[tamanho][medida]
};

const MEASURE_NAMES: Record<string, string> = {
  busto: 'Busto',
  cintura: 'Cintura',
  quadril: 'Quadril',
  comprimento: 'Comprimento',
  altura: 'Comprimento',
  coxa: 'Coxa',
  manga: 'Manga',
  ombro: 'Ombro',
  gancho: 'Gancho',
  barra: 'Barra',
};

const MEASURE_RE = new RegExp(
  `(${Object.keys(MEASURE_NAMES).join('|')})[^\\d\\n]{0,12}(\\d{2,3}(?:[.,]\\d)?)(?:\\s*[–-]\\s*(\\d{2,3}(?:[.,]\\d)?))?\\s*cm` +
  `(?:[^\\d\\n]{0,20}esticando[^\\d\\n]{0,6}(\\d{2,3}(?:[.,]\\d)?)\\s*cm)?`,
  'gi'
);

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function findSize(line: string, sizes: string[]): string | null {
  // Tamanhos maiores primeiro, para "GG" não ser lido como "G".
  const sorted = [...sizes].sort((a, b) => b.length - a.length);
  for (const size of sorted) {
    const re = new RegExp(`(^|[^\\p{L}\\d])${escapeRe(size)}(?=$|[^\\p{L}\\d])`, 'iu');
    if (re.test(line)) return size;
  }
  return null;
}

export function parseSizeChart(description: string | undefined, sizes: string[] | undefined): SizeChart | null {
  if (!description || !Array.isArray(sizes) || !sizes.length) return null;
  const cleanSizes = sizes.map(s => s.trim()).filter(Boolean);
  const values: Record<string, Record<string, string>> = {};
  const measureOrder: string[] = [];
  let current: string | null = null;

  for (const rawLine of description.split('\n')) {
    const line = rawLine.replace(/\*\*/g, '').trim();
    if (!line) continue;

    const measures = [...line.matchAll(MEASURE_RE)];
    const sizeInLine = findSize(line.split(/[-:;]/)[0] || line, cleanSizes) || (measures.length ? null : findSize(line, cleanSizes));
    if (sizeInLine) current = sizeInLine;
    if (!current || !measures.length) continue;

    for (const m of measures) {
      const name = MEASURE_NAMES[m[1].toLowerCase()];
      // m[3] = faixa ("74–106 cm"); m[4] = medida esticando ("84cm Esticando - 108cm")
      const upTo = m[3] || m[4];
      const value = upTo ? `${m[2]} a ${upTo} cm` : `${m[2]} cm`;
      values[current] ??= {};
      if (!values[current][name]) values[current][name] = value;
      if (!measureOrder.includes(name)) measureOrder.push(name);
    }
  }

  const foundSizes = cleanSizes.filter(s => values[s] && Object.keys(values[s]).length);
  if (!foundSizes.length || !measureOrder.length) return null;
  return { sizes: foundSizes, measures: measureOrder, values };
}

// Tabela completa: pelo menos 2 tamanhos e todos com as mesmas medidas. Tabela incompleta
// confunde mais do que ajuda, então nesse caso o guia mostra o trecho original.
export function isCompleteChart(chart: SizeChart | null): chart is SizeChart {
  return !!chart && chart.sizes.length >= 2 &&
    chart.sizes.every(s => chart.measures.every(m => chart.values[s]?.[m]));
}

// Trecho da descrição com as medidas, do jeito que foi escrito: linhas com "cm" e o
// título curto logo antes delas (ex.: "°G1", "Tamanho G2 (veste até 52/54)").
export function extractMeasureLines(description: string | undefined): string[] {
  if (!description) return [];
  const lines = description.split('\n').map(l => l.replace(/\*\*/g, '').trim())
    .filter(l => l && !/^[|\s:-]+$/.test(l)); // sem as linhas "|----|" das tabelas em markdown
  const picked = new Set<number>();
  lines.forEach((line, i) => {
    if (!/\d{2,3}\s*cm/i.test(line)) return;
    picked.add(i);
    if (i > 0 && lines[i - 1].length <= 60 && !/\d{2,3}\s*cm/i.test(lines[i - 1])) picked.add(i - 1);
  });
  return [...picked].sort((a, b) => a - b).map(i => lines[i]);
}
