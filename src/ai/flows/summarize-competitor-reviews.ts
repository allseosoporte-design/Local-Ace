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
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Inicializa la aplicación de administración de Firebase de forma segura.
 */
function getAdminApp(): App {
  const apps = getApps();
  if (apps.length > 0) return apps[0];

  try {
    const serviceAccount = require('../../../serviceAccountKey.json');
    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    return initializeApp();
  }
}

/**
 * Asegura que la API Key de Google esté disponible en el entorno.
 */
async function ensureGoogleApiKey(): Promise<void> {
  if (process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY) {
    return;
  }

  try {
    const app = getAdminApp();
    const db = getFirestore(app);
    const configDoc = await db.collection('adminConfig').doc('global').get();
    
    if (configDoc.exists) {
      const data = configDoc.data();
      const apiKey = data?.googleApiKey;
      if (apiKey) {
        process.env.GOOGLE_GENAI_API_KEY = apiKey;
      }
    }
  } catch (error) {
    console.error('[Summary AI Error]:', error);
  }
}

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
    await ensureGoogleApiKey();
    const {output} = await prompt(input);
    return output!;
  }
);
