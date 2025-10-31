
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { ChatbotConfig } from '@/types/chatbot';

// Initialize Firebase Admin SDK
// This ensures we can securely access Firestore from the server.
/*
if (!getApps().length) {
  // IMPORTANT: In a real production environment, use environment variables
  // for service account credentials, not a hardcoded path.
  // const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
  // initializeApp({ credential: cert(serviceAccount) });
  
  // For Firebase Studio simplicity, we might allow a fallback if not configured
  try {
     const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
     initializeApp({ credential: cert(serviceAccount) });
  } catch (e) {
    console.warn(
      'Could not initialize Firebase Admin. Chatbot API may not work. ' +
      'Ensure FIREBASE_SERVICE_ACCOUNT_KEY is set in your environment.'
    );
  }
}

const db = getFirestore();
*/

// This function formats the conversation history for the Gemini API
const buildGeminiPrompt = (history: { text: string, sender: 'user' | 'bot' }[], newQuestion: string, systemPrompt: string) => {
  const contents = [];
  
  // Simulate system prompt for models that don't support it directly
  if (systemPrompt) {
    contents.push({ role: 'user', parts: [{ text: systemPrompt }]});
    contents.push({ role: 'model', parts: [{ text: "Entendido. Estoy listo para ayudar." }]});
  }
  
  // Add history, skipping the initial bot welcome message
  history.slice(1).forEach(msg => {
    contents.push({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    });
  });

  // Add the new user question
  contents.push({
    role: 'user',
    parts: [{ text: newQuestion }],
  });
  
  return { contents };
};

export async function POST(request: NextRequest) {
  console.log('=== CHATBOT API CALLED ===');
  try {
    const body = await request.json();
    const { history, question } = body;

    // 1. Fetch Chatbot Configuration from Firestore
    // For now, we will use mock data since firestore is commented out.
    // In a real scenario, you would uncomment the firestore initialization
    // and fetch the config like this:
    /*
    const configDocRef = db.collection('chatbot').doc('config');
    const configDoc = await configDocRef.get();

    if (!configDoc.exists) {
      throw new Error('Chatbot configuration not found in Firestore.');
    }

    const config = configDoc.data() as ChatbotConfig;
    */
    
    // Using mock config to avoid firestore dependency for now
    const config: Partial<ChatbotConfig> = {
        aiEnabled: true,
        apiIntegrations: {
            gemini: { enabled: true, apiKey: process.env.GEMINI_API_KEY || '' }
        },
        systemPrompt: 'Eres un asistente amigable y profesional para el SaaS Local Leap.',
        temperature: 0.7,
        maxTokens: 150
    }
    
    if (!config.aiEnabled || !config.apiIntegrations?.gemini.enabled) {
      return NextResponse.json({ answer: "Lo siento, la función de IA está desactivada actualmente." });
    }

    const apiKey = config.apiIntegrations.gemini.apiKey;
    const systemPrompt = config.systemPrompt;
    const temperature = config.temperature;
    const maxTokens = config.maxTokens;

    if (!apiKey) {
      console.error('Chatbot API error: Gemini API Key is not configured.');
      return NextResponse.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 });
    }
    
    const geminiPrompt = buildGeminiPrompt(history, question, systemPrompt || 'You are a helpful assistant.');

    const geminiRequest = {
        ...geminiPrompt,
        generationConfig: { // Corrected from generation_config
            temperature: temperature ?? 0.7,
            maxOutputTokens: maxTokens ?? 150,
        },
    };
    
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(geminiRequest),
    });

    if (!geminiResponse.ok) {
        const errorBody = await geminiResponse.text();
        console.error('Gemini API request failed:', geminiResponse.status, errorBody);
        return NextResponse.json({ error: `Gemini API request failed with status ${geminiResponse.status}`, details: errorBody }, { status: geminiResponse.status });
    }
    
    const geminiResult = await geminiResponse.json();
    
    const answer = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || 'Lo siento, no pude generar una respuesta.';

    return NextResponse.json({ answer });

  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
