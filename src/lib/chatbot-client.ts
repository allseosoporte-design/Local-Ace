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
    // Llamar directamente a Gemini desde el cliente
    // Nota: En producción deberías usar una API route o Server Action
    // Por ahora usamos fetch directo para que funcione en Firebase Studio
    
    const apiKey = 'AIzaSyAevyZmfR9IzY4A_OoEN0frE535rC3FcXA'; // Tu API key del .env
    
    const contents = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    contents.push({
      role: 'user',
      parts: [{ text: question }],
    });

    const geminiRequest = {
      system_instruction: {
        role: "system",
        parts: [{ text: systemPrompt }]
      },
      contents: contents,
      generation_config: {
        temperature,
        max_output_tokens: maxTokens,
      },
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
      answer: 'Lo siento, tuve un problema al procesar tu pregunta. Por favor, intenta de nuevo.' 
    };
  }
}
