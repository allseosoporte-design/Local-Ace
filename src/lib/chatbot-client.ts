
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
    
    // Agregar historial quitando el primer mensaje de bienvenida del bot
    if (history.length > 1) {
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
      generationConfig: { // Corregido de generation_config a generationConfig
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
    console.error('Error calling Gemini:', error);
    return { 
      answer: 'Lo siento, tuve un problema al procesar tu pregunta. Por favor, intenta de nuevo.' 
    };
  }
}
