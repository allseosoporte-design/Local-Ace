
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
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyAevyZmfR9IzY4A_OoEN0frE535rC3FcXA';
    
    // Construir contenido - gemini-pro requiere un formato de historial de chat específico.
    const contents = [];
    
    // Simular el system prompt como el primer par de mensajes en el historial.
    contents.push({
      role: 'user',
      parts: [{ text: systemPrompt }],
    });
    
    contents.push({
      role: 'model',
      parts: [{ text: 'Entendido. Estoy listo para ayudar.' }],
    });
    
    // Agregar el historial real de la conversación, omitiendo el mensaje de bienvenida inicial del bot.
    if (history.length > 1) {
        history.slice(1).forEach(msg => {
            contents.push({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }],
            });
        });
    }

    // Agregar la pregunta actual del usuario.
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

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

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
    console.error('Error in callGeminiAPI:', error);
    return { 
      answer: 'Lo siento, estoy teniendo problemas para conectarme en este momento. Por favor, intenta de nuevo más tarde.' 
    };
  }
}
