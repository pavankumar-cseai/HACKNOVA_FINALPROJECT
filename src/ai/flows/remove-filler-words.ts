'use server';

/**
 * @fileOverview This flow removes filler words from the input text.
 *
 * - removeFillerWords - A function that removes filler words from the input text.
 * - RemoveFillerWordsInput - The input type for the removeFillerWords function.
 * - RemoveFillerWordsOutput - The return type for the removeFillerWords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RemoveFillerWordsInputSchema = z.object({
  text: z.string().describe('The text to remove filler words from.'),
});
export type RemoveFillerWordsInput = z.infer<typeof RemoveFillerWordsInputSchema>;

const RemoveFillerWordsOutputSchema = z.object({
  cleanedText: z.string().describe('The text with filler words removed.'),
});
export type RemoveFillerWordsOutput = z.infer<typeof RemoveFillerWordsOutputSchema>;

export async function removeFillerWords(input: RemoveFillerWordsInput): Promise<RemoveFillerWordsOutput> {
  return removeFillerWordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'removeFillerWordsPrompt',
  input: {schema: RemoveFillerWordsInputSchema},
  output: {schema: RemoveFillerWordsOutputSchema},
  prompt: `Remove filler words from the following text. Filler words include umm, uhh, like, you know, and similar disfluencies. Return only the cleaned text.\n\nText: {{{text}}}`,
});

const removeFillerWordsFlow = ai.defineFlow(
  {
    name: 'removeFillerWordsFlow',
    inputSchema: RemoveFillerWordsInputSchema,
    outputSchema: RemoveFillerWordsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
