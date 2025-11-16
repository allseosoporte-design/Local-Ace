'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import type { ChatbotConfig, FAQ } from '@/types/chatbot';
import type { SubscriptionPlan } from '@/types/subscription-plan';
import { generateChatbotResponse } from '@/ai/flows/generate-chatbot-response';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const mockConfig: ChatbotConfig = {
    enabled: true,
    position: 'bottom-right',
    botName: 'Asistente Virtual',
    primaryColor: '#4285F4',
    welcomeMessage: '¡Hola! ¿Cómo puedo ayudarte hoy?',
    placeholderText: 'Escribe tu mensaje...',
    showOnLoad: false,
    showDelay: 2,
    faqs: [],
    aiEnabled: true,
    systemPrompt: 'Eres un asistente amigable y profesional para el SaaS Local Leap.',
    temperature: 0.7,
    maxTokens: 150,
    llmIntegrations: [],
};

export default function ChatbotWidget() {
  const firestore = useFirestore();
  const configDocRef = doc(firestore, 'chatbot/config');
  const { data: loadedConfig, isLoading: isLoadingConfig } = useDoc<ChatbotConfig>(configDocRef);
  
  const plansQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'subscriptionPlans'), orderBy('order', 'asc'));
  }, [firestore]);
  const { data: plans, isLoading: isLoadingPlans } = useCollection<SubscriptionPlan>(plansQuery);


  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const config = loadedConfig || mockConfig;
  
  useEffect(() => {
    if (config?.showOnLoad && !isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, config.showDelay * 1000);
      return () => clearTimeout(timer);
    }
  }, [config, isOpen]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (isOpen && config?.welcomeMessage && messages.length === 0) {
      setMessages([{ 
        id: '1', 
        text: config.welcomeMessage, 
        sender: 'bot', 
        timestamp: new Date() 
      }]);
    }
  }, [config, messages.length, isOpen]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const findResponse = (userInput: string): string | null => {
    const inputLower = userInput.toLowerCase().trim();
    if (!config || !config.faqs) {
      return null;
    }

    let bestMatch: { score: number; faq: FAQ | null } = {
      score: 0,
      faq: null,
    };

    const stopWords = new Set(['que', 'es', 'el', 'la', 'de', 'en', 'y', 'a', 'un', 'una', 'para', 'con', 'por', 'mi', 'tu', 'su', 'como', 'ahora', 'tiene', 'tienes', 'hay', 'dime', 'para', 'que', 'sirve', 'esta', 'aplicacion', 'mi', 'negocio']);

    for (const faq of config.faqs) {
      let currentScore = 0;
      const questionLower = faq.question.toLowerCase();

      if (questionLower === inputLower) {
        return faq.answer;
      }

      for (const keyword of faq.keywords) {
        const keywordLower = keyword.toLowerCase();
        if (keywordLower.includes(' ') && inputLower.includes(keywordLower)) {
          currentScore += 100;
        }
      }
      
      const inputWords = inputLower.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
      
      if (inputWords.length === 0) continue;

      for (const keyword of faq.keywords) {
        const keywordLower = keyword.toLowerCase();
        if (!keywordLower.includes(' ') && inputWords.includes(keywordLower)) {
          currentScore += 40;
        }
      }

      if (currentScore > bestMatch.score) {
        bestMatch = { score: currentScore, faq };
      }
    }
    
    return bestMatch.score >= 80 ? bestMatch.faq!.answer : null;
  };
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !config) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);
    
    const faqResponse = findResponse(currentInput);
    
    if (faqResponse) {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: faqResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 500);
    } else if (config.aiEnabled) {
      try {
        
        let planInfo = "No hay información de planes de suscripción disponible en este momento.";
        if (plans && plans.length > 0) {
            planInfo = "Aquí están los planes de suscripción disponibles:\n" + plans.map(p => 
                `- Plan: ${p.name}\n  Precio: $${p.price.toLocaleString('es-CO')} ${p.currency} / ${p.billingPeriod === 'monthly' ? 'mes' : 'año'}\n  Descripción: ${p.description}\n  Características: ${p.features.join(', ')}`
            ).join('\n\n');
        }

        const fullSystemPrompt = `${config.systemPrompt}\n\nDATA CONTEXT:\n${planInfo}\n\nIMPORTANT: Base your answer about subscriptions ONLY on the DATA CONTEXT provided. Do not use any other knowledge.`;

        const result = await generateChatbotResponse({
            history: newMessages.map(m => ({ text: m.text, sender: m.sender })),
            question: currentInput,
            systemPrompt: fullSystemPrompt,
            temperature: config.temperature,
            maxTokens: config.maxTokens
        });
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: result.answer,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error("AI response generation failed:", error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Lo siento, estoy teniendo problemas para conectarme en este momento. Por favor, intenta de nuevo más tarde.',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    } else {
      const defaultMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, no tengo información sobre eso. ¿Puedo ayudarte con algo más?',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, defaultMessage]);
      setIsTyping(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (isLoadingConfig || isLoadingPlans) {
    return null;
  }
  
  if (!config || !config.enabled) return null;
  
  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`fixed ${
              config.position === 'bottom-right'
                ? 'bottom-6 right-6'
                : 'bottom-6 left-6'
            } z-50`}
          >
            <Button
              size="lg"
              className="rounded-full w-16 h-16 shadow-lg"
              style={{ backgroundColor: config.primaryColor }}
              onClick={() => setIsOpen(true)}
            >
              <MessageSquare className="w-8 h-8" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed ${
              config.position === 'bottom-right'
                ? 'bottom-6 right-6'
                : 'bottom-6 left-6'
            } z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border`}
          >
            <div
              className="p-4 flex items-center justify-between text-white"
              style={{ backgroundColor: config.primaryColor }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{config.botName}</h3>
                  <p className="text-xs opacity-90">En línea</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1 p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-3 ${
                        message.sender === 'user'
                          ? 'text-white'
                          : 'bg-white text-gray-900 border'
                      }`}
                      style={
                        message.sender === 'user'
                          ? { backgroundColor: config.primaryColor }
                          : {}
                      }
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {message.timestamp.toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-lg p-3 border">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={config.placeholderText}
                  disabled={isTyping}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isTyping || !inputValue.trim()}
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
