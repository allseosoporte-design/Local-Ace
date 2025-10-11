'use server';
/**
 * @fileOverview An AI agent that suggests relevant keywords for a Google My Business profile.
 *
 * - suggestGMBKeywords - A function that suggests keywords for a Google My Business profile.
 * - SuggestGMBKeywordsInput - The input type for the suggestGMBKeywords function.
 * - SuggestGMBKeywordsOutput - The return type for the suggestGMBKeywords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestGMBKeywordsInputSchema = z.object({
  businessDescription: z
    .string()
    .describe('The description of the business.'),
  businessCategory: z
    .string()
    .describe('The category of the business.'),
  location: z.string().describe('The location of the business.'),
});
export type SuggestGMBKeywordsInput = z.infer<
  typeof SuggestGMBKeywordsInputSchema
>;

const SuggestGMBKeywordsOutputSchema = z.object({
  keywords: z
    .array(z.string())
    .describe('An array of relevant keywords for the Google My Business profile.'),
});
export type SuggestGMBKeywordsOutput = z.infer<
  typeof SuggestGMBKeywordsOutputSchema
>;

export async function suggestGMBKeywords(
  input: SuggestGMBKeywordsInput
): Promise<SuggestGMBKeywordsOutput> {
  return suggestGMBKeywordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestGMBKeywordsPrompt',
  input: {schema: SuggestGMBKeywordsInputSchema},
  output: {schema: SuggestGMBKeywordsOutputSchema},
  prompt: `You are an expert in local SEO and Google My Business optimization.

  Based on the following information about a business, suggest a list of relevant keywords to use in their Google My Business profile to improve local search ranking.

  Business Description: {{{businessDescription}}}
  Business Category: {{{businessCategory}}}
  Location: {{{location}}}

  Please provide a list of keywords that are specific, relevant, and likely to be used by customers searching for this type of business in this location.

  Format the keywords as a JSON array of strings.`,
});

const suggestGMBKeywordsFlow = ai.defineFlow(
  {
    name: 'suggestGMBKeywordsFlow',
    inputSchema: SuggestGMBKeywordsInputSchema,
    outputSchema: SuggestGMBKeywordsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
