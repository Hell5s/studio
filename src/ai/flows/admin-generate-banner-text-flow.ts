'use server';
/**
 * @fileOverview Um agente de IA para gerar textos editoriais (Título, Subtítulo e CTA) para banners de moda usando a API do Groq.
 *
 * - generateBannerTexts - Função que gera os textos baseada em um conceito de campanha.
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
  title: z.string().describe('Um título curto e impactante para o banner.'),
  subtitle: z.string().describe('Um subtítulo elegante e fluido.'),
  ctaText: z.string().describe('Um texto curto para o botão de ação.'),
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
    const concept = input.concept || "Moda Feminina Premium";
    const tags = (input.tags || []).join(", ");
    
    const promptMessage = `Você é um especialista em copywriting de moda feminina brasileira de alto padrão. 
Sua marca chama-se 'Toda Bela', focada em sofisticação, confiança e elegância minimalista.

Com base no contexto da campanha: "${concept}", 
Tags e Estilos: "${tags}",
Referência atual (se houver): Título: "${input.currentTitle || ''}", Subtítulo: "${input.currentSubtitle || ''}"

Sua missão é criar um copy editorial de alto impacto.

DIRETRIZES:
1. TÍTULO: 1 título impactante obrigatoriamente em CAIXA ALTA (máximo 4 palavras).
2. SUBTÍTULO: 1 subtítulo elegante, sofisticado e fluido (máximo 10 palavras).
3. CTA: 1 texto para o botão de ação, curto e refinado (máximo 2 palavras).

Responda APENAS em JSON no seguinte formato: { "title": "...", "subtitle": "...", "cta": "..." }`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'Você é um assistente de redação de moda de luxo que fala apenas JSON.' },
            { role: 'user', content: promptMessage }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API Groq: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content;

      if (!content) throw new Error('A IA não retornou um conteúdo válido.');

      // Limpeza de possíveis blocos de código markdown
      content = content.replace(/```json/g, '').replace(/```/g, '').trim();

      const result = JSON.parse(content);
      
      return GenerateBannerTextOutputSchema.parse({
        title: result.title || 'ESSÊNCIA TODA BELA',
        subtitle: result.subtitle || 'Elegância em cada movimento.',
        ctaText: result.cta || 'CONFIRA'
      });
    } catch (error: any) {
      console.error('Erro Groq Flow:', error);
      throw new Error(error.message || 'Erro inesperado no processamento da IA');
    }
  }
);
