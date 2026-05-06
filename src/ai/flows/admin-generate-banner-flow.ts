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
    // Prompt refinado para estética Toda Bela - Focado em Moda Premium
    const refinedPrompt = `Wide panoramic fashion editorial photography, aspect ratio ${input.aspectRatio}. 
Theme: ${input.prompt}. 
IMPORTANT: The model must be shown from waist up only, centered in frame, with wide background on both sides.
Style: Sophisticated, cinematic, 8k, soft warm lighting.
Colors: Deep wine red, soft gold, cream, champagne.
Format: LANDSCAPE.
No text, no watermarks, no logos.`;

    try {
      // Usando Imagen 4 para geração de imagem a partir de texto (mais estável para banners)
      const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: refinedPrompt,
      });

      if (!media?.url) {
        throw new Error('A IA não retornou uma imagem válida. Verifique se o prompt cumpre as diretrizes de segurança.');
      }

      return {
        imageUrl: media.url,
      };
    } catch (error: any) {
      console.error('Erro na geração de banner com Imagen 4:', error);
      
      // Tentativa de fallback para o modelo multimodal se o Imagen falhar
      if (error.message?.includes('404') || error.message?.toLowerCase().includes('not found')) {
        try {
          const { media } = await ai.generate({
            model: 'googleai/gemini-2.5-flash-image',
            prompt: refinedPrompt,
            config: {
              responseModalities: ['IMAGE', 'TEXT'],
            }
          });
          if (media?.url) return { imageUrl: media.url };
        } catch (fallbackError) {
          console.error('Erro no fallback multimodal:', fallbackError);
        }
      }

      // Se chegar aqui, o erro é mais profundo (como projeto desativado ou falta de permissão)
      const errorMessage = error.message?.includes('decommissioned') 
        ? 'Seu projeto de IA parece estar com restrições de acesso. Verifique as APIs ativadas no console do Google Cloud.' 
        : (error.message || 'O modelo de IA está indisponível no momento.');

      throw new Error(`Erro na Geração: ${errorMessage}`);
    }
  }
);
