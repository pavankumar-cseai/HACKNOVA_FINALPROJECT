'use server';
/**
 * @fileOverview A single flow to process raw text by removing filler words,
 * eliminating repetitions, correcting grammar, and adjusting tone and style.
 *
 * - processText - A function that handles the entire text processing pipeline.
 * - ProcessTextInput - The input type for the processText function.
 * - ProcessTextOutput - The return type for the processText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessTextInputSchema = z.object({
  text: z.string().describe('The raw text to be processed.'),
  style: z
    .enum(['Formal', 'Casual', 'Concise', 'Neutral'])
    .describe('The desired tone/style.'),
});
export type ProcessTextInput = z.infer<typeof ProcessTextInputSchema>;

const ProcessTextOutputSchema = z.object({
  processedText: z.string().describe('The fully processed and styled text.'),
});
export type ProcessTextOutput = z.infer<typeof ProcessTextOutputSchema>;

export async function processText(input: ProcessTextInput): Promise<ProcessTextOutput> {
  return processTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processTextPrompt',
  input: {schema: ProcessTextInputSchema},
  output: {schema: ProcessTextOutputSchema},
  prompt: `You are a highly skilled writing assistant. Your task is to take raw text and perform the following steps to polish it:
1.  **Remove filler words:** Eliminate words like "umm", "uhh", "like", "you know".
2.  **Eliminate repetitions:** Identify and remove any repeated phrases or sentences.
3.  **Correct grammar and format:** Fix all grammatical errors, improve punctuation, capitalization, and add paragraph breaks for readability.
4.  **Adjust tone and style:** Rewrite the text to match the desired style.

**Input Text:**
"{{{text}}}"

**Desired Style:**
"{{{style}}}"

Provide only the final, processed text as your output.
`,
});

const processTextFlow = ai.defineFlow(
  {
    name: 'processTextFlow',
    inputSchema: ProcessTextInputSchema,
    outputSchema: ProcessTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
