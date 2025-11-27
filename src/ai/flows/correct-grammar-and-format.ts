'use server';
/**
 * @fileOverview Corrects grammar, punctuation, capitalization, and adds paragraph breaks to text.
 *
 * - correctGrammarAndFormat - A function that handles the grammar correction and formatting process.
 * - CorrectGrammarAndFormatInput - The input type for the correctGrammarAndFormat function.
 * - CorrectGrammarAndFormatOutput - The return type for the correctGrammarAndFormat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CorrectGrammarAndFormatInputSchema = z.object({
  text: z.string().describe('The raw text to be corrected and formatted.'),
});
export type CorrectGrammarAndFormatInput = z.infer<typeof CorrectGrammarAndFormatInputSchema>;

const CorrectGrammarAndFormatOutputSchema = z.object({
  formattedText: z.string().describe('The grammar corrected, punctuated, and formatted text.'),
});
export type CorrectGrammarAndFormatOutput = z.infer<typeof CorrectGrammarAndFormatOutputSchema>;

export async function correctGrammarAndFormat(input: CorrectGrammarAndFormatInput): Promise<CorrectGrammarAndFormatOutput> {
  return correctGrammarAndFormatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'correctGrammarAndFormatPrompt',
  input: {schema: CorrectGrammarAndFormatInputSchema},
  output: {schema: CorrectGrammarAndFormatOutputSchema},
  prompt: `You are a highly skilled editor and proofreader. Your task is to correct any grammatical errors, improve punctuation and capitalization, and add paragraph breaks to the following text to enhance its readability and clarity.\n\nOriginal Text: {{{text}}}\n\nFormatted Text:`, 
});

const correctGrammarAndFormatFlow = ai.defineFlow(
  {
    name: 'correctGrammarAndFormatFlow',
    inputSchema: CorrectGrammarAndFormatInputSchema,
    outputSchema: CorrectGrammarAndFormatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
