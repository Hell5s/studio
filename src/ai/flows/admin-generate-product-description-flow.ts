'use server';
/**
 * @fileOverview An AI agent for administrators to generate engaging product descriptions.
 *
 * - adminGenerateProductDescription - A function that handles the product description generation process.
 * - AdminGenerateProductDescriptionInput - The input type for the adminGenerateProductDescription function.
 * - AdminGenerateProductDescriptionOutput - The return type for the adminGenerateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdminGenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  category: z.string().describe('The category of the product, e.g., Vestidos, Conjuntos, Blusas.'),
  price: z.string().describe('The current price of the product, e.g., R$ 149,90.'),
  oldPrice: z.string().optional().describe('The original price of the product before discount, if any.'),
  badge: z.string().optional().describe('A promotional badge for the product, e.g., Mais vendido, Novo, Oferta, Trend.'),
  keyFeatures: z.array(z.string()).describe('A list of key features or selling points of the product.'),
});
export type AdminGenerateProductDescriptionInput = z.infer<typeof AdminGenerateProductDescriptionInputSchema>;

const AdminGenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('An engaging and relevant product description.'),
});
export type AdminGenerateProductDescriptionOutput = z.infer<typeof AdminGenerateProductDescriptionOutputSchema>;

export async function adminGenerateProductDescription(input: AdminGenerateProductDescriptionInput): Promise<AdminGenerateProductDescriptionOutput> {
  return adminGenerateProductDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  input: {schema: AdminGenerateProductDescriptionInputSchema},
  output: {schema: AdminGenerateProductDescriptionOutputSchema},
  prompt: `You are an expert copywriter for 'Toda Bela', a modern, feminine fashion brand known for sophistication, elegance, and confidence.
Your task is to generate an engaging and relevant product description based on the provided product details.

Craft a description that highlights the product's style, benefits, and appeal to the confident 'Toda Bela' woman.
Keep the tone consistent with a refined, warm feminine aesthetic, evoking confidence and elegance.

Product Details:
- Name: {{{productName}}}
- Category: {{{category}}}
- Price: {{{price}}}{{#if oldPrice}} (Original: {{{oldPrice}}}){{/if}}
{{#if badge}}- Badge: {{{badge}}}{{/if}}
- Key Features:
{{#each keyFeatures}}
  - {{{this}}}
{{/each}}

Generate an engaging product description:`,
});

const adminGenerateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'adminGenerateProductDescriptionFlow',
    inputSchema: AdminGenerateProductDescriptionInputSchema,
    outputSchema: AdminGenerateProductDescriptionOutputSchema,
  },
  async input => {
    let lastError;
    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const { output } = await prompt(input);
        if (!output) throw new Error('A IA não retornou um conteúdo válido.');
        return output;
      } catch (error: any) {
        lastError = error;
        if (error.message?.includes('503') || error.message?.includes('429') || error.message?.includes('high demand')) {
          await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
          continue;
        }
        throw error;
      }
    }
    throw lastError || new Error('Falha na geração de descrição após múltiplas tentativas.');
  }
);
