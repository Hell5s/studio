'use server';
/**
 * @fileOverview Um agente de IA para gerar textos editoriais (Título, Subtítulo e CTA) para banners de moda.
 *
 * - generateBannerTexts - Função que gera os textos baseada em um conceito de campanha.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateBannerTextInputSchema = z.object({
  concept: z.string().describe('O conceito ou prompt da campanha de moda.'),
});
export type GenerateBannerTextInput = z.infer<typeof GenerateBannerTextInputSchema>;

const GenerateBannerTextOutputSchema = z.object({
  title: z.string().describe('Um título curto e impactante para o banner.'),
  subtitle: z.string().describe('Um subtítulo elegante e fluido.'),
  ctaText: z.string().describe('Um texto curto para o botão de ação, ex: Confira, Ver Coleção.'),
});
export type GenerateBannerTextOutput = z.infer<typeof GenerateBannerTextOutputSchema>;

export async function generateBannerTexts(input: GenerateBannerTextInput): Promise<GenerateBannerTextOutput> {
  return generateBannerTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBannerTextPrompt',
  input: { schema: GenerateBannerTextInputSchema },
  output: { schema: GenerateBannerTextOutputSchema },
  prompt: `Você é um redator de moda sênior da boutique 'Toda Bela'. 
Sua marca é conhecida pela sofisticação, confiança feminina e elegância minimalista.

Baseado no conceito da campanha: "{{{concept}}}", gere textos persuasivos e luxuosos para um banner de site.

Regras:
- O título deve ser curto (máximo 4 palavras).
- O subtítulo deve evocar emoção e desejo.
- O CTA deve ser direto e refinado.
- Idioma: Português do Brasil.
- Evite clichês de promoções baratas; foque em exclusividade.`,
});

const generateBannerTextFlow = ai.defineFlow(
  {
    name: 'generateBannerTextFlow',
    inputSchema: GenerateBannerTextInputSchema,
    outputSchema: GenerateBannerTextOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
