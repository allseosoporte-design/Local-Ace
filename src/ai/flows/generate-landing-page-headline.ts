'use server';
/**
 * @fileOverview A landing page headline generator AI agent.
 *
 * - generateLandingPageHeadline - A function that handles the headline generation process.
 * - GenerateLandingPageHeadlineInput - The input type for the generateLandingPageHeadline function.
 * - GenerateLandingPageHeadlineOutput - The return type for the generateLandingPageHeadline function.
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
    console.error('[Headline AI Error]:', error);
  }
}

const GenerateLandingPageHeadlineInputSchema = z.object({
  businessDescription: z
    .string()
    .describe('The description of the business for which the landing page is being created.'),
  targetAudience: z.string().describe('The target audience for the landing page.'),
  keywords: z.string().describe('Keywords related to the business or landing page.'),
});
export type GenerateLandingPageHeadlineInput = z.infer<
  typeof GenerateLandingPageHeadlineInputSchema
>;

const GenerateLandingPageHeadlineOutputSchema = z.object({
  headline: z.string().describe('A compelling headline for the landing page.'),
});
export type GenerateLandingPageHeadlineOutput = z.infer<
  typeof GenerateLandingPageHeadlineOutputSchema
>;

export async function generateLandingPageHeadline(
  input: GenerateLandingPageHeadlineInput
): Promise<GenerateLandingPageHeadlineOutput> {
  return generateLandingPageHeadlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLandingPageHeadlinePrompt',
  input: {schema: GenerateLandingPageHeadlineInputSchema},
  output: {schema: GenerateLandingPageHeadlineOutputSchema},
  prompt: `You are an expert copywriter specializing in creating high-converting headlines for landing pages.

  Generate a compelling headline for a landing page based on the following information:

  Business Description: {{{businessDescription}}}
  Target Audience: {{{targetAudience}}}
  Keywords: {{{keywords}}}

  The headline should be concise, attention-grabbing, and relevant to the business and target audience.
  It should also incorporate the provided keywords where appropriate to improve SEO.
  The headline should be no more than 15 words.
  The headline should be in Spanish.

  Headline:`,
});

const generateLandingPageHeadlineFlow = ai.defineFlow(
  {
    name: 'generateLandingPageHeadlineFlow',
    inputSchema: GenerateLandingPageHeadlineInputSchema,
    outputSchema: GenerateLandingPageHeadlineOutputSchema,
  },
  async input => {
    await ensureGoogleApiKey();
    const {output} = await prompt(input);
    return output!;
  }
);
