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
    const refinedPrompt = `Wide panoramic fashion editorial photography, aspect ratio 16:9 horizontal landscape format. 
Theme: ${input.prompt}. 
IMPORTANT: The model must be shown from waist up only, centered in frame, with wide background on both sides.
Style: Sophisticated, cinematic, 8k, soft warm lighting.
Colors: Deep wine red, soft gold, cream, champagne.
Format: WIDE LANDSCAPE, NOT portrait, NOT vertical. Horizontal banner format only.
No text, no watermarks, no logos.`;

    try {
      // Configuração necessária para geração de imagens (Gemini 2.5 Flash Image)
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image',
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
        throw new Error('O modelo Gemini 2.5 Flash Image não está disponível com sua chave atual ou nesta região.');
      }

      throw new Error(`Falha na IA: ${error.message || 'Erro de conexão'}`);
    }
  }
);