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
import { getSubscriptionPlans } from '@/services/subscription-service';

// Define the tool for Genkit to use
const getSubscriptionPlansTool = ai.defineTool(
  {
    name: 'getSubscriptionPlans',
    description: 'Retrieves the available subscription plans from the database.',
    outputSchema: z.array(z.object({
        name: z.string(),
        price: z.number(),
        billingPeriod: z.string(),
        features: z.array(z.string()),
    }))
  },
  async () => {
    return await getSubscriptionPlans();
  }
);


const MessageSchema = z.object({
    text: z.string(),
    sender: z.enum(['user', 'bot'])
});

const GenerateChatbotResponseInputSchema = z.object({
  history: z.array(MessageSchema).describe("The conversation history."),
  question: z.string().describe("The user's latest question."),
  systemPrompt: z.string().describe("The system prompt to guide the AI's personality."),
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

export async function generateChatbotResponse(
  input: GenerateChatbotResponseInput
): Promise<GenerateChatbotResponseOutput> {
  
  const historyPrompt = input.history.map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join('\n');

  const prompt = ai.definePrompt({
    name: 'chatbotPrompt',
    input: { schema: GenerateChatbotResponseInputSchema },
    output: { schema: GenerateChatbotResponseOutputSchema },
    tools: [getSubscriptionPlansTool], // Make the tool available to the AI
    system: `${input.systemPrompt}
    
    IMPORTANT: If the user asks about subscription plans, pricing, costs, or features of the plans, you MUST use the 'getSubscriptionPlans' tool to fetch the current data before answering.
    If the tool returns an empty list, inform the user that there are currently no plans defined and they should check back later.
    Base your answer ONLY on the information provided by the tool.
    `,
    prompt: `Conversation History:
    ${historyPrompt}
    
    User Question:
    {{{question}}}
    
    Assistant Response:
    `,
    config: {
        temperature: input.temperature || 0.7,
        maxOutputTokens: input.maxTokens || 150
    }
  });

  const { output } = await prompt(input);
  return output!;
}
