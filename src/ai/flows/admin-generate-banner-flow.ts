'use server';

import { z } from 'genkit';

const GenerateBannerInputSchema = z.object({
  prompt: z.string(),
  aspectRatio: z.enum(['16:9', '1:1', '4:3', '3:4', '9:16']).default('16:9'),
});
export type GenerateBannerInput = z.infer<typeof GenerateBannerInputSchema>;

const GenerateBannerOutputSchema = z.object({
  imageUrl: z.string(),
});
export type GenerateBannerOutput = z.infer<typeof GenerateBannerOutputSchema>;

export async function generateBannerImage(input: GenerateBannerInput): Promise<GenerateBannerOutput> {
  return generateBannerFlow(input);
}

const dimensionMap: Record<string, { width: number; height: number }> = {
  '16:9': { width: 1280, height: 720 },
  '1:1':  { width: 1024, height: 1024 },
  '4:3':  { width: 1024, height: 768 },
  '3:4':  { width: 768,  height: 1024 },
  '9:16': { width: 720,  height: 1280 },
};

async function generateBannerFlow(input: GenerateBannerInput): Promise<GenerateBannerOutput> {
  const { width, height } = dimensionMap[input.aspectRatio] ?? dimensionMap['16:9'];

  const refinedPrompt = `Professional fashion editorial photography for a luxury women's boutique website banner. Theme: ${input.prompt}. Style: Sophisticated, high-end fashion magazine aesthetic, cinematic lighting, sharp focus, photorealistic. Composition: elegant model, wide negative space for text overlay. No text, no logos, no watermarks.`;

  const apiKey = process.env.HUGGING_FACE_API_KEY;
  if (!apiKey) throw new Error('Chave do Hugging Face não configurada no .env');

  const response = await fetch(
    'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: refinedPrompt,
        parameters: { width, height },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Erro no Hugging Face: ${err}`);
  }

  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const imageUrl = `data:image/jpeg;base64,${base64}`;

  return { imageUrl };
}