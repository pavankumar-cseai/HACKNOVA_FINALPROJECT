'use server';
/**
 * @fileOverview Identifies and removes repeated phrases or n-grams from the input text.
 *
 * - eliminateRepetitions - A function that handles the repetition removal process.
 * - EliminateRepetitionsInput - The input type for the eliminateRepetitions function.
 * - EliminateRepetitionsOutput - The return type for the eliminateRepetitions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EliminateRepetitionsInputSchema = z.object({
  text: z.string().describe('The input text to remove repetitions from.'),
});
export type EliminateRepetitionsInput = z.infer<typeof EliminateRepetitionsInputSchema>;

const EliminateRepetitionsOutputSchema = z.object({
  cleanedText: z.string().describe('The text with repetitions removed.'),
});
export type EliminateRepetitionsOutput = z.infer<typeof EliminateRepetitionsOutputSchema>;

export async function eliminateRepetitions(input: EliminateRepetitionsInput): Promise<EliminateRepetitionsOutput> {
  return eliminateRepetitionsFlow(input);
}

const repetitionRemovalPrompt = ai.definePrompt({
  name: 'repetitionRemovalPrompt',
  input: {schema: EliminateRepetitionsInputSchema},
  output: {schema: EliminateRepetitionsOutputSchema},
  prompt: `You are a text cleaning expert. Your job is to remove repetitions in a given text.

Here is the text: {{{text}}}

Please provide the cleaned text with repetitions removed.
`,
});

const eliminateRepetitionsFlow = ai.defineFlow(
  {
    name: 'eliminateRepetitionsFlow',
    inputSchema: EliminateRepetitionsInputSchema,
    outputSchema: EliminateRepetitionsOutputSchema,
  },
  async input => {
    const {output} = await repetitionRemovalPrompt(input);
    return output!;
  }
);
