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
    // Prompt refinado para fotografia de moda de alta qualidade
    const refinedPrompt = `Professional fashion editorial photography for a luxury boutique website banner.
Theme: ${input.prompt}.
Style: Sophisticated, minimalist, high-end fashion magazine aesthetic, cinematic lighting.
Composition: Waist-up or full body shot of a model, centered, wide negative space for text overlay.
Colors: High contrast, elegant palette.
IMPORTANT: Generate a professional photography. Absolutely NO text, NO logos, NO distorted anatomy.`;

    try {
      // Imagen 4 é o modelo de última geração para Texto-para-Imagem no Genkit/Google AI
      const response = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: refinedPrompt,
      });

      if (response.media?.url) {
        return { imageUrl: response.media.url };
      }

      // Fallback para Imagen 3 caso o 4 não esteja habilitado no projeto
      const fallbackResponse = await ai.generate({
        model: 'googleai/imagen-3.0-generate-001',
        prompt: refinedPrompt,
      });

      if (fallbackResponse.media?.url) {
        return { imageUrl: fallbackResponse.media.url };
      }

      throw new Error('A IA não retornou uma imagem. Tente um prompt mais curto ou verifique as cotas do seu projeto.');
    } catch (error: any) {
      console.error('Erro na geração de imagem:', error);
      
      const errorMsg = error.message?.toLowerCase() || '';
      const isPermissionError = errorMsg.includes('403') || 
                               errorMsg.includes('disallowed') || 
                               errorMsg.includes('permission') ||
                               errorMsg.includes('billing');
      
      if (isPermissionError) {
        throw new Error('Geração negada: A API Vertex AI precisa ser habilitada e um plano de faturamento configurado no Console do Google Cloud para permitir a geração de imagens.');
      }

      throw new Error(`Erro na IA: ${error.message || 'O serviço de imagem está instável.'}`);
    }
  }
);
