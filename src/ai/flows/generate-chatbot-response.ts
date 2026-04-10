'use server';
/**
 * @fileOverview A chatbot response generator AI agent.
 *
 * - generateChatbotResponse - A function that handles the chatbot response generation process.
 * - GenerateChatbotResponseInput - The input type for the generateChatbotResponse function.
 * - GenerateChatbotResponseOutput - The return type for the generateChatbotResponse function.
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
    // Intentar cargar la cuenta de servicio si existe
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
        // Inyectamos en el entorno para que el plugin de Genkit lo detecte
        process.env.GOOGLE_GENAI_API_KEY = apiKey;
        console.log('[Chatbot AI]: API Key cargada desde Firestore.');
      }
    }
  } catch (error) {
    console.error('[Chatbot AI Error]: No se pudo recuperar la API Key de Firestore:', error);
  }
}

const MessageSchema = z.object({
    text: z.string(),
    sender: z.enum(['user', 'bot'])
});

const GenerateChatbotResponseInputSchema = z.object({
  history: z.array(MessageSchema).describe("The conversation history."),
  question: z.string().describe("The user's latest question."),
  systemPrompt: z.string().describe("The system prompt to guide the AI's personality and provide it with contextual data like subscription plans."),
  temperature: z.number().optional().describe("The creativity of the response."),
  maxTokens: z.number().optional().describe("The maximum length of the response.")
});
export type GenerateChatbotResponseInput = z.infer<
  typeof GenerateChatbotResponseInputSchema
>;

const GenerateChatbotResponseOutputSchema = z.object({
  answer: z.string().describe('The generated response from the AI.'),
});
export type GenerateChatbotResponseOutput = z.infer<
  typeof GenerateChatbotResponseOutputSchema
>;

const prompt = ai.definePrompt({
    name: 'chatbotPrompt',
    input: {
      schema: z.object({
        systemPrompt: z.string(),
        prompt: z.string()
      })
    },
    system: `{{systemPrompt}}`,
    output: { schema: GenerateChatbotResponseOutputSchema },
});

export async function generateChatbotResponse(
  input: GenerateChatbotResponseInput
): Promise<GenerateChatbotResponseOutput> {
  
  try {
    // 1. Asegurar credenciales
    await ensureGoogleApiKey();

    const historyPrompt = input.history.map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join('\n');

    // 2. Ejecutar prompt con manejo de errores
    const { output } = await prompt({
      systemPrompt: input.systemPrompt,
      prompt: `Conversation History:
      ${historyPrompt}
      
      User Question:
      ${input.question}
      
      Assistant Response:
      `,
      config: {
          temperature: input.temperature || 0.7,
          maxOutputTokens: input.maxTokens || 400
      }
    });
    
    if (!output) {
      throw new Error('La IA no generó una respuesta válida.');
    }

    return output;

  } catch (error: unknown) {
    // 3. Estrategia de manejo de errores mejorada
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[Chatbot AI Error]:', errorMessage);

    // Si es un error de modelo no encontrado (404), damos un feedback específico al log pero fallback al usuario
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      console.error('[Critical]: El modelo configurado no está disponible o el nombre es incorrecto.');
    }

    // Devolvemos una respuesta de fallback segura para el usuario final del SaaS
    return {
      answer: "Lo siento, estoy teniendo dificultades técnicas para procesar tu solicitud en este momento. Por favor, intenta de nuevo en unos minutos o contacta a soporte si el problema persiste."
    };
  }
}
