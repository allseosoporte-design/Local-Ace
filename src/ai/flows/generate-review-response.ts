'use server';

/**
 * @fileOverview Flow to generate a draft response to a customer review using AI.
 * 
 * Includes robust API key management and dynamic prompt roles.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Robustly initializes the Firebase Admin App and ensures Google API Key is set.
 */
async function ensureConfig(): Promise<void> {
  if (process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY) {
    return;
  }

  try {
    const apps = getApps();
    let app: App;
    
    if (apps.length > 0) {
      app = apps[0];
    } else {
      const saPath = path.join(process.cwd(), 'serviceAccountKey.json');
      if (fs.existsSync(saPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
        app = initializeApp({ credential: cert(serviceAccount) });
      } else {
        app = initializeApp();
      }
    }

    const db = getFirestore(app);
    const configDoc = await db.collection('adminConfig').doc('global').get();
    
    if (configDoc.exists) {
      const data = configDoc.data();
      const apiKey = data?.googleApiKey;
      if (apiKey) {
        process.env.GOOGLE_GENAI_API_KEY = apiKey;
        process.env.GOOGLE_API_KEY = apiKey; // Support both naming conventions
      }
    }
  } catch (error) {
    console.error('[AI Config Error]: Failed to load credentials:', error);
  }
}

const GenerateReviewResponseInputSchema = z.object({
  reviewText: z.string(),
  businessName: z.string(),
  customerName: z.string(),
  industry: z.string(),
  customerSentiment: z.string(),
});

export type GenerateReviewResponseInput = z.infer<typeof GenerateReviewResponseInputSchema>;

const GenerateReviewResponseOutputSchema = z.object({
  draftResponse: z.string(),
});

export type GenerateReviewResponseOutput = z.infer<typeof GenerateReviewResponseOutputSchema>;

const generateReviewResponsePrompt = ai.definePrompt({
  name: 'generateReviewResponsePrompt',
  input: { schema: GenerateReviewResponseInputSchema },
  output: { schema: GenerateReviewResponseOutputSchema },
  prompt: `
{{role "system"}}
Eres un experto en atención al cliente para {{{businessName}}}. Tu objetivo es generar una respuesta útil, profesional y empática a una reseña de un cliente en español.

{{role "user"}}
El nombre del cliente es: {{{customerName}}}
El texto de la reseña es: "{{{reviewText}}}"
Sentimiento: {{{customerSentiment}}}

Instrucciones:
- Si es 'positive', agradece cálidamente.
- Si es 'neutral', agradece y pregunta cómo mejorar a 5 estrellas.
- Si es 'negative', discúlpate sinceramente, muestra empatía e invita a contacto privado.
- Sé conciso y profesional.
`,
});

export async function generateReviewResponse(input: GenerateReviewResponseInput): Promise<GenerateReviewResponseOutput> {
  try {
    await ensureConfig();
    const { output } = await generateReviewResponsePrompt(input);
    
    if (!output) {
      throw new Error('La IA no generó contenido.');
    }
    
    return output;
  } catch (error: any) {
    console.error('[Review AI Flow Error]:', error.message);
    // Fallback response to avoid 500 error
    return {
      draftResponse: `Hola ${input.customerName}, gracias por tu comentario. Valoramos mucho tu opinión y estamos trabajando para brindarte el mejor servicio en ${input.businessName}. (Respuesta automática de respaldo)`
    };
  }
}
