'use client';

type Message = {
  text: string;
  sender: 'user' | 'bot';
};

export async function callGeminiAPI(
  history: Message[],
  question: string,
  systemPrompt: string,
  temperature: number = 0.7,
  maxTokens: number = 150
): Promise<{ answer: string }> {
  try {
    const apiKey = 'AIzaSyAevvZmf09IzY4A_DoEN0'; // API key
    
    // Construir contenido - gemini-pro requiere formato específico
    const contents = [];
    
    // Agregar system prompt como primer mensaje del usuario
    contents.push({
      role: 'user',
      parts: [{ text: systemPrompt }],
    });
    
    contents.push({
      role: 'model',
      parts: [{ text: 'Entendido. Estoy listo para ayudar.' }],
    });
    
    // Agregar historial, omitiendo el mensaje de bienvenida inicial del bot
    if(history.length > 1) {
      history.slice(1).forEach(msg => {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      });
    }

    // Agregar pregunta actual
    contents.push({
      role: 'user',
      parts: [{ text: question }],
    });

    const geminiRequest = {
      contents: contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(geminiRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API failed: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      'Lo siento, no pude generar una respuesta en este momento.';

    return { answer };
  } catch (error) {
    console.error('Error calling Gemini:', error);
    return { 
      answer: 'Lo siento, estoy teniendo problemas para conectarme en este momento. Por favor, intenta de nuevo más tarde.' 
    };
  }
}
