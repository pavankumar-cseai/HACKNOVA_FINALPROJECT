'use server';
/**
 * @fileOverview Adjusts the tone and style of the input text based on the selected style.
 *
 * - adjustToneAndStyle - A function that adjusts the tone and style of the text.
 * - AdjustToneAndStyleInput - The input type for the adjustToneAndStyle function.
 * - AdjustToneAndStyleOutput - The return type for the adjustToneAndStyle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustToneAndStyleInputSchema = z.object({
  text: z.string().describe('The text to adjust.'),
  style: z
    .enum(['Formal', 'Casual', 'Concise', 'Neutral'])
    .describe('The desired tone/style.'),
});
export type AdjustToneAndStyleInput = z.infer<typeof AdjustToneAndStyleInputSchema>;

const AdjustToneAndStyleOutputSchema = z.object({
  adjustedText: z.string().describe('The text adjusted to the desired style.'),
});
export type AdjustToneAndStyleOutput = z.infer<typeof AdjustToneAndStyleOutputSchema>;

export async function adjustToneAndStyle(
  input: AdjustToneAndStyleInput
): Promise<AdjustToneAndStyleOutput> {
  return adjustToneAndStyleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adjustToneAndStylePrompt',
  input: {schema: AdjustToneAndStyleInputSchema},
  output: {schema: AdjustToneAndStyleOutputSchema},
  prompt: `You are a writing assistant that helps adjust the tone and style of text.

  The user will provide text and a desired style. You will rewrite the text to match the style.

  Here are some examples of how to adjust the text for each style:

  Formal: Use proper grammar and punctuation. Avoid contractions and slang. Use a professional tone.
  Casual: Use contractions and slang. Use a conversational tone.
  Concise: Use as few words as possible to convey the message. Remove unnecessary details.
  Neutral: Use a neutral tone. Avoid expressing strong opinions or emotions.

  Text: {{{text}}}
  Style: {{{style}}}

  Adjusted Text:`,
});

const adjustToneAndStyleFlow = ai.defineFlow(
  {
    name: 'adjustToneAndStyleFlow',
    inputSchema: AdjustToneAndStyleInputSchema,
    outputSchema: AdjustToneAndStyleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {adjustedText: output!.adjustedText};
  }
);
