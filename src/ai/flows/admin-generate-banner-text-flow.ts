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
  model: 'googleai/gemini-2.5-flash',
  input: { schema: GenerateBannerTextInputSchema },
  output: { schema: GenerateBannerTextOutputSchema },
  prompt: `Você é um redator de moda sênior da boutique de luxo 'Toda Bela'.
Sua marca celebra a sofisticação, a confiança feminina e a elegância minimalista.

{{#if imageUrl}}
Analise visualmente esta imagem da nossa coleção: {{media url=imageUrl}}
Os textos gerados devem harmonizar com o estilo, cores e iluminação desta fotografia.
{{/if}}

Contexto Central da Campanha:
{{#if concept}}
"{{{concept}}}"
{{else}}
"Essência Feminina Premium"
{{/if}}

Sua missão é criar um copy editorial de alto impacto baseado OBRIGATORIAMENTE no contexto acima como base central.

DIRETRIZES RÍGIDAS:
1. BASE TEMÁTICA: O tema deve ser o coração da mensagem.
   - Se o contexto for "Plus Size": Títulos que celebram curvas, poder e orgulho.
   - Se "Dia das Mães": Títulos emotivos, repletos de carinho e conexão.
   - Se "Inverno": Títulos que evocam aconchego, tecidos nobres e elegância fria.
2. PROIBIÇÃO DE GENÉRICOS: É estritamente proibido usar clichês vazios como "Nova Coleção", "Elegância Sem Limites", "Descubra o Novo" ou "Estilo Único".
3. TÍTULO: Máximo de 3 palavras. Deve ser potente, específico e visceralmente ligado ao contexto.
4. SUBTÍTULO: Máximo de 10 palavras. Deve evocar uma emoção profunda e exclusiva ligada ao tema.
5. CTA: Curto, direto e refinado (Ex: "Sinta o Luxo", "Celebre-se", "Presenteie com Amor").
6. IDIOMA: Português do Brasil (PT-BR).

Gere agora os textos para o banner de moda premium:`,
});

const generateBannerTextFlow = ai.defineFlow(
  {
    name: 'generateBannerTextFlow',
    inputSchema: GenerateBannerTextInputSchema,
    outputSchema: GenerateBannerTextOutputSchema,
  },
  async (input) => {
    try {
      // Tenta gerar com imagem se fornecida
      const { output } = await prompt(input);
      if (!output) throw new Error('A IA não retornou um formato de texto válido.');
      return output;
    } catch (error: any) {
      console.warn('Erro ao processar imagem no fluxo de texto, tentando apenas texto:', error);
      // Se falhar (ex: erro de download de imagem externa), tenta apenas com o conceito em texto
      if (input.imageUrl) {
        const { output } = await prompt({ concept: input.concept });
        if (output) return output;
      }
      throw new Error(`Falha na IA: ${error.message || 'Erro de processamento'}`);
    }
  }
);