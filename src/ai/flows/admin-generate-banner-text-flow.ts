'use server';
/**
 * @fileOverview Um agente de IA especializado em copywriting de moda de luxo para banners da Toda Bela.
 * 
 * - generateBannerTexts - Função que gera títulos, subtítulos e CTAs baseados na persona de luxo brasileira.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateBannerTextInputSchema = z.object({
  concept: z.string().optional().describe('O tema ou inspiração da campanha.'),
  tags: z.array(z.string()).optional().describe('Palavras-chave ou estilos da campanha.'),
  currentTitle: z.string().optional().describe('Título atual como referência.'),
  currentSubtitle: z.string().optional().describe('Subtítulo atual como referência.'),
});
export type GenerateBannerTextInput = z.infer<typeof GenerateBannerTextInputSchema>;

const GenerateBannerTextOutputSchema = z.object({
  title: z.string().describe('Um título impactante em CAIXA ALTA (máximo 4 palavras).'),
  subtitle: z.string().describe('Um subtítulo elegante e sofisticado (máximo 10 palavras).'),
  ctaText: z.string().describe('Um texto de botão irresistível (máximo 2 palavras).'),
});
export type GenerateBannerTextOutput = z.infer<typeof GenerateBannerTextOutputSchema>;

export async function generateBannerTexts(input: GenerateBannerTextInput): Promise<GenerateBannerTextOutput> {
  return generateBannerTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBannerTextPrompt',
  input: { schema: GenerateBannerTextInputSchema },
  output: { schema: GenerateBannerTextOutputSchema },
  prompt: `Você é um copywriter especialista em moda feminina de luxo brasileira, com vasto conhecimento em marcas como Animale, Farm, Shoulder e Dress To. 
A marca é a "Toda Bela - Moda Feminina", com cores vinho (#6E3C47) e dourado (#C7A17A), transmitindo elegância, sofisticação e empoderamento feminino.

Com base no contexto da campanha: "{{#if concept}}{{concept}}{{else}}Moda Feminina Premium{{/if}}"
Tags e Estilos: "{{#each tags}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}"
Referência atual: Título: "{{currentTitle}}", Subtítulo: "{{currentSubtitle}}"

Sua missão é criar um copy editorial de alto impacto.

DIRETRIZES:
1. TÍTULO: 1 título impactante obrigatoriamente em CAIXA ALTA (máximo 4 palavras, poético e poderoso). Inspire-se em frases como: "PRESENÇA QUE INSPIRA", "ELEGÂNCIA ATEMPORAL", "BRILHO PRÓPRIO".
2. SUBTÍTULO: 1 subtítulo elegante e sofisticado (máximo 10 palavras).
3. CTA: 1 texto irresistível para o botão de ação, curto e refinado (máximo 2 palavras).

Gere os textos para o banner da Toda Bela.`,
});

const generateBannerTextFlow = ai.defineFlow(
  {
    name: 'generateBannerTextFlow',
    inputSchema: GenerateBannerTextInputSchema,
    outputSchema: GenerateBannerTextOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error('A IA não retornou um conteúdo válido.');
    }

    return output;
  }
);
