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
    const refinedPrompt = `High-end fashion editorial photography for a boutique called 'Toda Bela'. 
    Theme: ${input.prompt}. 
    Aesthetic: Sophisticated, minimal, elegant, soft warm lighting, cinematic, 8k resolution. 
    Composition: Wide shot suitable for a website banner, clean background, high fashion model.
    Colors: Deep wine red, soft gold, cream, and champagne. 
    Strictly no text, no watermarks, no logos in the image.`;

    try {
      // Utilizando o Imagen 4 (modelo mais estável e recente para geração de imagens no Genkit)
      const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: refinedPrompt,
        config: {
          aspectRatio: input.aspectRatio,
          safetySettings: [
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          ]
        }
      });

      if (!media?.url) {
        throw new Error('O modelo não retornou uma imagem válida.');
      }

      return {
        imageUrl: media.url,
      };
    } catch (error: any) {
      console.error('Erro na geração Imagen:', error);
      throw new Error(`Falha na IA: ${error.message || 'Erro desconhecido'}`);
    }
  }
);
