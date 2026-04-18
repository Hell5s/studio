
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
  aspectRatio: z.enum(['16:9', '1:1', '4:3']).default('16:9').describe('Proporção da imagem.'),
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
    // Prompt refinado para estética Toda Bela
    const refinedPrompt = `High fashion editorial photography for 'Toda Bela' brand. 
    Theme: ${input.prompt}. 
    Style: Sophisticated, minimalist, clean, warm feminine lighting, cinematic, 8k resolution, professional studio quality. 
    Colors: Wine deep red, soft gold, cream, blush pink. 
    No text, no logos, centered composition.`;

    const { media } = await ai.generate({
      model: 'googleai/imagen-3.0-generate-001',
      prompt: refinedPrompt,
    });

    if (!media?.url) {
      throw new Error('Falha ao gerar a imagem do banner.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
