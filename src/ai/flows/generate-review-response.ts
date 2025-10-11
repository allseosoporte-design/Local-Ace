'use server';

/**
 * @fileOverview A flow to generate a draft response to a customer review using AI.
 *
 * - generateReviewResponse - A function that generates a draft response to a customer review.
 * - GenerateReviewResponseInput - The input type for the generateReviewResponse function.
 * - GenerateReviewResponseOutput - The return type for the generateReviewResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReviewResponseInputSchema = z.object({
  reviewText: z.string().describe('The text content of the customer review.'),
  businessName: z.string().describe('The name of the business receiving the review.'),
  industry: z.string().describe('The industry of the business.'),
  customerSentiment: z.string().describe('The sentiment expressed in the customer review (e.g., positive, negative, neutral).'),
});

export type GenerateReviewResponseInput = z.infer<typeof GenerateReviewResponseInputSchema>;

const GenerateReviewResponseOutputSchema = z.object({
  draftResponse: z.string().describe('The AI-generated draft response to the customer review.'),
});

export type GenerateReviewResponseOutput = z.infer<typeof GenerateReviewResponseOutputSchema>;

export async function generateReviewResponse(input: GenerateReviewResponseInput): Promise<GenerateReviewResponseOutput> {
  return generateReviewResponseFlow(input);
}

const generateReviewResponsePrompt = ai.definePrompt({
  name: 'generateReviewResponsePrompt',
  input: {schema: GenerateReviewResponseInputSchema},
  output: {schema: GenerateReviewResponseOutputSchema},
  prompt: `You are a customer service expert for {{businessName}}, a business in the {{industry}} industry.  Your goal is to generate a helpful and professional response to customer reviews.

  The review text is:
  {{reviewText}}

The sentiment of this review is: {{customerSentiment}}

  Generate a draft response that addresses the customer's concerns and offers a resolution or further assistance.  Keep the response concise and professional.
  `,
});

const generateReviewResponseFlow = ai.defineFlow(
  {
    name: 'generateReviewResponseFlow',
    inputSchema: GenerateReviewResponseInputSchema,
    outputSchema: GenerateReviewResponseOutputSchema,
  },
  async input => {
    const {output} = await generateReviewResponsePrompt(input);
    return output!;
  }
);
