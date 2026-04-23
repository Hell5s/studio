'use server';
/**
 * @fileOverview Um agente de IA para gerar textos editoriais (Título, Subtítulo e CTA) para banners de moda.
 *
 * - generateBannerTexts - Função que gera os textos baseada em um conceito de campanha ou análise de imagem.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateBannerTextInputSchema = z.object({
  concept: z.string().optional().describe('O tema ou inspiração da campanha (opcional).'),
  imageUrl: z.string().optional().describe('URL da imagem do banner para análise visual.'),
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
  model: 'googleai/gemini-2.5-flash', // Modelo estável e robusto para análise visual e texto
  input: { schema: GenerateBannerTextInputSchema },
  output: { schema: GenerateBannerTextOutputSchema },
  prompt: `Você é um redator de moda sênior da boutique 'Toda Bela'. 
Sua marca é conhecida pela sofisticação, confiança feminina e elegância minimalista.

{{#if imageUrl}}
Analise visualmente esta imagem da nossa coleção: {{media url=imageUrl}}
Crie textos que harmonizem perfeitamente com o estilo, as cores e a vibração desta fotografia.
Se não houver um tema definido abaixo, baseie-se inteiramente no que você vê na imagem (estilo da roupa, cenário, iluminação).
{{/if}}

{{#if concept}}
O tema solicitado para esta campanha é: "{{{concept}}}".
{{else}}
Crie algo luxuoso, aspiracional e confiante que combine com a estética premium da Toda Bela.
{{/if}}

Gere textos persuasivos e sofisticados para um banner de site de moda feminina de luxo.

Regras:
- O título deve ser curto e potente (máximo 4 palavras).
- O subtítulo deve evocar desejo, elegância e exclusividade.
- O CTA deve ser direto e refinado.
- Idioma: Português do Brasil.
- Evite clichês de promoções genéricas; foque em estilo de vida e autoconfiança.`,
});

const generateBannerTextFlow = ai.defineFlow(
  {
    name: 'generateBannerTextFlow',
    inputSchema: GenerateBannerTextInputSchema,
    outputSchema: GenerateBannerTextOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) throw new Error('A IA não retornou um formato de texto válido.');
      return output;
    } catch (error: any) {
      console.error('Erro no fluxo de texto IA:', error);
      throw new Error(`Falha na IA: ${error.message || 'Erro de processamento'}`);
    }
  }
);
