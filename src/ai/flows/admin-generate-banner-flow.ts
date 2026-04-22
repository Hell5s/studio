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
      // Configuração necessária para geração de imagens (Gemini 2.0 Flash)
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: refinedPrompt,
        config: {
          responseModalities: ['IMAGE', 'TEXT'],
        }
      });

      if (!media?.url) {
        throw new Error('A IA não conseguiu gerar a imagem. Isso pode ocorrer se o prompt for considerado sensível ou se o modelo estiver instável.');
      }

      return {
        imageUrl: media.url,
      };
    } catch (error: any) {
      console.error('Erro na geração Gemini:', error);
      
      // Mensagem específica para erro de modelo não encontrado (comum em Genkit)
      if (error.message?.includes('404') || error.message?.toLowerCase().includes('not found')) {
        throw new Error('O modelo Gemini 2.0 Flash não está disponível com sua chave atual ou nesta região.');
      }

      throw new Error(`Falha na IA: ${error.message || 'Erro de conexão'}`);
    }
  }
);