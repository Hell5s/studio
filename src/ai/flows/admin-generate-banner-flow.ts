'use server';
/**
 * @fileOverview Um agente de IA para gerar imagens de banners publicitários de moda.
 *
 * - generateBannerImage - Função que gera a imagem baseada em um prompt.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateBannerInputSchema = z.object({
  prompt: z.string().describe('O conceito da campanha, ex: Coleção de Inverno Elegante.'),
  aspectRatio: z.enum(['16:9', '1:1', '4:3', '3:4', '9:16']).default('16:9').describe('Proporção da imagem.'),
});
export type GenerateBannerInput = z.infer<typeof GenerateBannerInputSchema>;

const GenerateBannerOutputSchema = z.object({
  imageUrl: z.string().describe('A URL (data URI) da imagem gerada.'),
});
export type GenerateBannerOutput = z.infer<typeof GenerateBannerOutputSchema>;

export async function generateBannerImage(input: GenerateBannerInput): Promise<GenerateBannerOutput> {
  return generateBannerFlow(input);
}

const generateBannerFlow = ai.defineFlow(
  {
    name: 'generateBannerFlow',
    inputSchema: GenerateBannerInputSchema,
    outputSchema: GenerateBannerOutputSchema,
  },
  async (input) => {
    // Prompt otimizado para a estética Toda Bela
    const refinedPrompt = `Fashion editorial photography for a boutique website banner.
Theme: ${input.prompt}.
Style: Sophisticated, luxury, minimalist, cinematic lighting.
Composition: Centered model, waist up, wide background for banner usage.
Colors: Deep wine red, gold, cream.
Format: ${input.aspectRatio}.
IMPORTANT: Generate a high-quality professional image. No text, no logos.`;

    try {
      // Tentativa prioritária com Gemini 2.5 Flash Image (mais versátil e menos restrito que o Imagen puro)
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image',
        prompt: refinedPrompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        }
      });

      if (media?.url) {
        return { imageUrl: media.url };
      }

      // Tenta Imagen 4 apenas se o Gemini não retornar imagem
      const imagenResponse = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: refinedPrompt,
      });

      if (imagenResponse.media?.url) {
        return { imageUrl: imagenResponse.media.url };
      }

      throw new Error('A IA não conseguiu gerar a imagem. Tente um prompt mais simples.');
    } catch (error: any) {
      console.error('Erro na geração de imagem:', error);
      
      const isPermissionError = error.message?.includes('403') || error.message?.includes('disallowed');
      
      if (isPermissionError) {
        throw new Error('Geração negada: Verifique se a API "Vertex AI" e o faturamento estão ativos no Console do Google Cloud para este projeto.');
      }

      throw new Error(`Erro na IA: ${error.message || 'O serviço de imagem está instável no momento.'}`);
    }
  }
);
