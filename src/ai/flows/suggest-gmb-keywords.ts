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
    console.error('[Keywords AI Error]:', error);
  }
}

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
    await ensureGoogleApiKey();
    const {output} = await prompt(input);
    return output!;
  }
);
