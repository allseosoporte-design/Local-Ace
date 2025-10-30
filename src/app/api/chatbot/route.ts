
import { NextRequest, NextResponse } from 'next/server';

// This function formats the conversation history for the Gemini API
const buildGeminiPrompt = (history: { text: string, sender: 'user' | 'bot' }[], newQuestion: string, systemPrompt: string) => {
  const contents = history.map(message => ({
    role: message.sender === 'user' ? 'user' : 'model',
    parts: [{ text: message.text }],
  }));

  // Add the new user question to the history
  contents.push({
    role: 'user',
    parts: [{ text: newQuestion }],
  });
  
  return {
    system_instruction: {
        role: "system",
        parts: [{ text: systemPrompt }]
    },
    contents: contents,
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { history, question, systemPrompt, temperature, maxTokens } = body;

    if (!question || !systemPrompt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      console.error('Chatbot API error: GOOGLE_GENAI_API_KEY is not set.');
      return NextResponse.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 });
    }
    
    const geminiPrompt = buildGeminiPrompt(history, question, systemPrompt);

    const geminiRequest = {
        ...geminiPrompt,
        generation_config: {
            temperature: temperature ?? 0.7,
            max_output_tokens: maxTokens ?? 150,
        },
    };
    
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiRequest),
    });

    if (!geminiResponse.ok) {
        const errorBody = await geminiResponse.text();
        console.error('Gemini API request failed:', geminiResponse.status, errorBody);
        return NextResponse.json({ error: `Gemini API request failed with status ${geminiResponse.status}`, details: errorBody }, { status: geminiResponse.status });
    }
    
    const geminiResult = await geminiResponse.json();
    
    // Extract the text from the response
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
