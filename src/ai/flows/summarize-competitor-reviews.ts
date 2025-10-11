// SummarizeCompetitorReviews story implementation.
'use server';
/**
 * @fileOverview A flow to summarize competitor reviews.
 *
 * - summarizeCompetitorReviews - A function that summarizes reviews for a given business.
 * - SummarizeCompetitorReviewsInput - The input type for the summarizeCompetitorReviews function.
 * - SummarizeCompetitorReviewsOutput - The return type for the summarizeCompetitorReviews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCompetitorReviewsInputSchema = z.object({
  businessName: z.string().describe('The name of the business.'),
  reviews: z.string().describe('The reviews for the business.'),
});
export type SummarizeCompetitorReviewsInput = z.infer<typeof SummarizeCompetitorReviewsInputSchema>;

const SummarizeCompetitorReviewsOutputSchema = z.object({
  summary: z.string().describe('The summary of the reviews.'),
});
export type SummarizeCompetitorReviewsOutput = z.infer<typeof SummarizeCompetitorReviewsOutputSchema>;

export async function summarizeCompetitorReviews(input: SummarizeCompetitorReviewsInput): Promise<SummarizeCompetitorReviewsOutput> {
  return summarizeCompetitorReviewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCompetitorReviewsPrompt',
  input: {schema: SummarizeCompetitorReviewsInputSchema},
  output: {schema: SummarizeCompetitorReviewsOutputSchema},
  prompt: `You are an expert business analyst.

You will analyze the reviews for a given business and provide a summary of the reviews.

Business Name: {{{businessName}}}
Reviews: {{{reviews}}}

Summary: `,
});

const summarizeCompetitorReviewsFlow = ai.defineFlow(
  {
    name: 'summarizeCompetitorReviewsFlow',
    inputSchema: SummarizeCompetitorReviewsInputSchema,
    outputSchema: SummarizeCompetitorReviewsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
