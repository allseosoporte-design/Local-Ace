
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
  customerName: z.string().describe('The name of the customer who wrote the review.'),
  industry: z.string().describe('The industry of the business.'),
  customerSentiment: z.string().describe('The sentiment expressed in the customer review (positive, negative, neutral).'),
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
  prompt: `You are a customer service expert for {{businessName}}. Your goal is to generate a helpful, professional, and empathetic response to a customer review.

The customer's name is: {{customerName}}
The review text is:
"{{reviewText}}"

The sentiment of this review is: {{customerSentiment}}

Based on the sentiment, follow these instructions:
- If the sentiment is 'positive', write a warm and thankful response. Express gratitude for their business and positive feedback.
- If the sentiment is 'neutral', acknowledge their feedback, thank them for their time, and ask if there is anything you can do to make their next experience a 5-star one.
- If the sentiment is 'negative', start by apologizing sincerely for their experience. Show empathy and offer a way to make things right. Invite them to contact you privately to resolve the issue and mention that you value their feedback to improve.

The response should be concise, professional, and always address the customer by their name, {{customerName}}.
Do not ask them to change their review directly, but for negative reviews, create an atmosphere where they might want to after their issue is resolved.
The response must be in Spanish.
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
