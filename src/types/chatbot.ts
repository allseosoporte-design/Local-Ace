

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
}

export interface LLMIntegration {
  id: string;
  provider: 'google' | 'openai' | 'huggingface' | 'mistral';
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  enabled: boolean;
}

export interface ChatbotConfig {
  enabled: boolean;
  position: 'bottom-right' | 'bottom-left';
  botName: string;
  primaryColor: string;
  welcomeMessage: string;
  placeholderText: string;
  showOnLoad: boolean;
  showDelay: number;
  faqs: FAQ[];
  aiEnabled: boolean;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  llmIntegrations: LLMIntegration[];
}
