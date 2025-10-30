'use server';
/**
 * @fileOverview An AI flow to generate a chatbot response when no FAQ matches.
 *
 * - generateChatbotResponse - A function that generates a response using the conversation history.
 * - GenerateChatbotResponseInput - The input type for the function.
 * - GenerateChatbotResponseOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the schema for a single message in the history
const MessageSchema = z.object({
  text: z.string(),
  sender: z.enum(['user', 'bot']),
});

const GenerateChatbotResponseInputSchema = z.object({
  history: z.array(MessageSchema).describe('The history of the conversation so far.'),
  question: z.string().describe('The latest question from the user.'),
  systemPrompt: z.string().describe('The base instruction for the AI assistant.'),
  temperature: z.number().min(0).max(1).describe('The creativity of the response.'),
  maxTokens: z.number().int().positive().describe('The maximum length of the response.'),
});
export type GenerateChatbotResponseInput = z.infer<typeof GenerateChatbotResponseInputSchema>;

const GenerateChatbotResponseOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user\'s question.'),
});
export type GenerateChatbotResponseOutput = z.infer<typeof GenerateChatbotResponseOutputSchema>;

export async function generateChatbotResponse(
  input: GenerateChatbotResponseInput
): Promise<GenerateChatbotResponseOutput> {
  return generateChatbotResponseFlow(input);
}

// Define the Handlebars template for the prompt
const promptTemplate = `
{{{systemPrompt}}}

Here is the conversation history:
{{#each history}}
  {{#if (eq sender "user")}}
    User: {{{text}}}
  {{else}}
    Assistant: {{{text}}}
  {{/if}}
{{/each}}

User: {{{question}}}
Assistant:
`;

const prompt = ai.definePrompt({
  name: 'generateChatbotResponsePrompt',
  input: {schema: GenerateChatbotResponseInputSchema},
  output: {schema: GenerateChatbotResponseOutputSchema},
  prompt: promptTemplate,
});

const generateChatbotResponseFlow = ai.defineFlow(
  {
    name: 'generateChatbotResponseFlow',
    inputSchema: GenerateChatbotResponseInputSchema,
    outputSchema: GenerateChatbotResponseOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input, {
        model: ai.model('googleai/gemini-2.5-flash'),
        config: {
          temperature: input.temperature,
          maxOutputTokens: input.maxTokens,
        }
    });
    return output!;
  }
);
