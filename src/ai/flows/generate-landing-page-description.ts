'use server';
/**
 * @fileOverview A landing page description generator AI agent.
 *
 * - generateLandingPageDescription - A function that handles the description generation process.
 * - GenerateLandingPageDescriptionInput - The input type for the generateLandingPageDescription function.
 * - GenerateLandingPageDescriptionOutput - The return type for the generateLandingPageDescription function.
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
    console.error('[Description AI Error]:', error);
  }
}

const GenerateLandingPageDescriptionInputSchema = z.object({
  headline: z.string().describe('The headline of the landing page.'),
  businessDescription: z
    .string()
    .describe('The description of the business for which the landing page is being created.'),
  targetAudience: z.string().describe('The target audience for the landing page.'),
  keywords: z.string().describe('Keywords related to the business or landing page.'),
});
export type GenerateLandingPageDescriptionInput = z.infer<
  typeof GenerateLandingPageDescriptionInputSchema
>;

const GenerateLandingPageDescriptionOutputSchema = z.object({
  description: z.string().describe('A compelling description for the landing page.'),
});
export type GenerateLandingPageDescriptionOutput = z.infer<
  typeof GenerateLandingPageDescriptionOutputSchema
>;

export async function generateLandingPageDescription(
  input: GenerateLandingPageDescriptionInput
): Promise<GenerateLandingPageDescriptionOutput> {
  return generateLandingPageDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLandingPageDescriptionPrompt',
  input: {schema: GenerateLandingPageDescriptionInputSchema},
  output: {schema: GenerateLandingPageDescriptionOutputSchema},
  prompt: `You are an expert copywriter specializing in creating high-converting descriptions for landing pages.

  Generate a compelling description for a landing page based on the following information:

  Headline: {{{headline}}}
  Business Description: {{{businessDescription}}}
  Target Audience: {{{targetAudience}}}
  Keywords: {{{keywords}}}

  The description should be concise, persuasive, and expand on the headline.
  It should highlight the key benefits for the target audience and include a call to action.
  Incorporate the provided keywords naturally.
  The description should be no more than 50 words.
  The description should be in Spanish.

  Description:`,
});

const generateLandingPageDescriptionFlow = ai.defineFlow(
  {
    name: 'generateLandingPageDescriptionFlow',
    inputSchema: GenerateLandingPageDescriptionInputSchema,
    outputSchema: GenerateLandingPageDescriptionOutputSchema,
  },
  async input => {
    await ensureGoogleApiKey();
    const {output} = await prompt(input);
    return output!;
  }
);
