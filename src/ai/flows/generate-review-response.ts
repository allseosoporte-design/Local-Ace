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
 * Prioriza .env, luego busca en Firestore adminConfig/global.
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
        console.log('[Review AI]: API Key cargada desde Firestore.');
      }
    }
  } catch (error) {
    console.error('[Review AI Error]: No se pudo recuperar la API Key de Firestore:', error);
  }
}

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
  system: `Eres un experto en atención al cliente para {{{businessName}}}. Tu objetivo es generar una respuesta útil, profesional y empática a una reseña de un cliente.
  La respuesta debe estar en español.`,
  prompt: `
El nombre del cliente es: {{{customerName}}}
El texto de la reseña es:
"{{{reviewText}}}"

El sentimiento de esta reseña es: {{{customerSentiment}}}

Basado en el sentimiento, sigue estas instrucciones:
- Si el sentimiento es 'positive', escribe una respuesta cálida y de agradecimiento. Expresa gratitud por su preferencia y comentarios positivos.
- Si el sentimiento es 'neutral', reconoce sus comentarios, agradécele por su tiempo y pregunta si hay algo que puedas hacer para que su próxima experiencia sea de 5 estrellas.
- Si el sentimiento es 'negative', comienza disculpándote sinceramente por su experiencia. Muestra empatía y ofrece una forma de arreglar las cosas. Invítalo a contactarte en privado para resolver el problema y menciona que valoras sus comentarios para mejorar.

La respuesta debe ser concisa, profesional y siempre dirigirse al cliente por su nombre, {{{customerName}}}.
No pidas que cambien su reseña directamente, pero para las reseñas negativas, crea una atmósfera donde quieran hacerlo después de que se resuelva su problema.
`,
});

const generateReviewResponseFlow = ai.defineFlow(
  {
    name: 'generateReviewResponseFlow',
    inputSchema: GenerateReviewResponseInputSchema,
    outputSchema: GenerateReviewResponseOutputSchema,
  },
  async input => {
    try {
      await ensureGoogleApiKey();
      const {output} = await generateReviewResponsePrompt(input);
      if (!output) {
        throw new Error('La IA no pudo generar una respuesta válida.');
      }
      return output;
    } catch (error) {
      console.error('[Review Flow Execution Error]:', error);
      throw error;
    }
  }
);
