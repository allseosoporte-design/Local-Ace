
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
}

interface ApiConfig {
    enabled: boolean;
    apiKey: string;
    status?: 'connected' | 'error' | 'untested';
}

interface HuggingFaceConfig extends ApiConfig {
    modelEndpoint: string;
}

interface GeminiConfig extends ApiConfig {
    rateLimit: number;
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
  // New API Integration fields
  apiIntegrations?: {
      openRouter: ApiConfig;
      huggingFace: HuggingFaceConfig;
      deepInfra: ApiConfig;
      gemini: GeminiConfig;
  }
}
