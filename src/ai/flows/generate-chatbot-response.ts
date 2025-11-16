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

// The prompt no longer needs a tool because the plan data will be passed in the systemPrompt.
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
  
  const historyPrompt = input.history.map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join('\n');

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
        maxOutputTokens: input.maxTokens || 150
    }
  });
  
  return output!;
}
