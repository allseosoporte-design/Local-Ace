
import { NextRequest, NextResponse } from 'next/server';
import { generateChatbotResponse } from '@/ai/flows/generate-chatbot-response';
import type { GenerateChatbotResponseInput } from '@/ai/flows/generate-chatbot-response';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateChatbotResponseInput;
    
    const { history, question, systemPrompt, temperature, maxTokens } = body;
    
    // Validación básica
    if (!question || !systemPrompt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await generateChatbotResponse({
      history: history || [],
      question,
      systemPrompt,
      temperature: temperature ?? 0.7,
      maxTokens: maxTokens ?? 150,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
