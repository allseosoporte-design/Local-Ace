'use server';

/**
 * @fileOverview A chatbot response generator AI agent.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

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
        process.env.GOOGLE_API_KEY = apiKey;
      }
    }
  } catch (error) {
    console.error('[Chatbot Config Error]:', error);
  }
}

const MessageSchema = z.object({
    text: z.string(),
    sender: z.enum(['user', 'bot'])
});

const GenerateChatbotResponseInputSchema = z.object({
  history: z.array(MessageSchema),
  question: z.string(),
  systemPrompt: z.string(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional()
});

const GenerateChatbotResponseOutputSchema = z.object({
  answer: z.string(),
});

export type GenerateChatbotResponseInput = z.infer<typeof GenerateChatbotResponseInputSchema>;
export type GenerateChatbotResponseOutput = z.infer<typeof GenerateChatbotResponseOutputSchema>;

const chatbotPrompt = ai.definePrompt({
    name: 'chatbotPrompt',
    input: {
      schema: z.object({
        systemPrompt: z.string(),
        prompt: z.string()
      })
    },
    output: { schema: GenerateChatbotResponseOutputSchema },
    prompt: `
{{role "system"}}
{{{systemPrompt}}}

{{role "user"}}
{{{prompt}}}
`,
});

export async function generateChatbotResponse(input: GenerateChatbotResponseInput): Promise<GenerateChatbotResponseOutput> {
  try {
    await ensureConfig();

    const historyPrompt = input.history
      .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
      .join('\n');

    const { output } = await chatbotPrompt({
      systemPrompt: input.systemPrompt,
      prompt: `Conversation History:\n${historyPrompt}\n\nUser Question: ${input.question}\n\nAssistant Response:`,
      config: {
          temperature: input.temperature || 0.7,
          maxOutputTokens: input.maxTokens || 400
      }
    });
    
    return output || { answer: "No pude procesar tu solicitud." };

  } catch (error: any) {
    console.error('[Chatbot AI Error]:', error.message);
    return {
      answer: "Lo siento, estoy teniendo dificultades técnicas. Por favor, intenta de nuevo en unos minutos."
    };
  }
}
