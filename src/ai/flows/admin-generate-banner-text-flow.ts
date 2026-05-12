'use server';
/**
 * @fileOverview Um agente de IA para gerar textos editoriais (Título, Subtítulo e CTA) para banners de moda usando a API do Groq.
 *
 * - generateBannerTexts - Função que gera os textos baseada em um conceito de campanha.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateBannerTextInputSchema = z.object({
  concept: z.string().optional().describe('O tema ou inspiração da campanha (opcional).'),
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

const generateBannerTextFlow = ai.defineFlow(
  {
    name: 'generateBannerTextFlow',
    inputSchema: GenerateBannerTextInputSchema,
    outputSchema: GenerateBannerTextOutputSchema,
  },
  async (input) => {
    const concept = input.concept || "Essência Feminina Premium";
    
    const promptMessage = `Você é um redator de moda sênior da boutique de luxo 'Toda Bela'.
Sua marca celebra a sofisticação, a confiança feminina e a elegância minimalista.

Sua missão é criar um copy editorial de alto impacto baseado no contexto da campanha.

CONTEXTO: "${concept}"

DIRETRIZES RÍGIDAS:
1. BASE TEMÁTICA: O tema deve ser o coração da mensagem.
2. PROIBIÇÃO DE GENÉRICOS: Proibido usar "Nova Coleção", "Elegância Sem Limites" ou "Estilo Único". Seja específico e criativo.
3. TÍTULO: Máximo de 3 palavras. Deve ser potente e visceral.
4. SUBTÍTULO: Máximo de 10 palavras. Deve evocar uma emoção profunda.
5. CTA: Curto e refinado (Ex: "Sinta o Luxo", "Celebre-se", "Presenteie com Amor").
6. IDIOMA: Português do Brasil (PT-BR).

REGRAS DE RESPOSTA:
- Responda APENAS com um objeto JSON válido.
- Estrutura: {"title": "...", "subtitle": "...", "ctaText": "..."}`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: 'Você é um assistente de redação que fala apenas JSON.' },
            { role: 'user', content: promptMessage }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.6,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API Groq: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content;

      if (!content) throw new Error('A IA não retornou um conteúdo válido.');

      // Limpeza de possíveis blocos de código markdown que a IA possa ter retornado mesmo em modo JSON
      content = content.replace(/```json/g, '').replace(/```/g, '').trim();

      const result = JSON.parse(content);
      
      return GenerateBannerTextOutputSchema.parse({
        title: result.title || 'Essência Toda Bela',
        subtitle: result.subtitle || 'Elegância em cada movimento.',
        ctaText: result.ctaText || 'Ver Coleção'
      });
    } catch (error: any) {
      console.error('Erro Groq Flow:', error);
      throw new Error(error.message || 'Erro inesperado no processamento da IA');
    }
  }
);
