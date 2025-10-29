'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const mockConfig = {
    enabled: true,
    appearance: {
        position: 'bottom-right',
        primaryColor: '#4285F4',
        botName: 'Asistente Virtual',
        welcomeMessage: '¡Hola! ¿Cómo puedo ayudarte hoy?',
        placeholderText: 'Escribe tu mensaje...',
    },
    behavior: {
        showOnLoad: false,
        delaySeconds: 2,
    },
    faqs: [
        { question: '¿Qué es Local Leap?', answer: 'Local Leap es una plataforma para potenciar negocios locales en línea.', keywords: ['local leap', 'que es'] },
        { question: 'Precios', answer: 'Ofrecemos planes flexibles que se adaptan a tus necesidades. Visita nuestra sección de planes para más detalles.', keywords: ['precio', 'costo', 'planes'] },
        { question: '¿Cuáles son los métodos de pago?', answer: 'Aceptamos pagos con Nequi, Daviplata, Bancolombia, y también pago contra entrega.', keywords: ['pago', 'métodos', 'pagar', 'nequi', 'daviplata', 'bancolombia'] },
    ],
    aiConfig: {
        enabled: true,
        systemPrompt: 'Eres un asistente amigable y profesional para el SaaS Local Leap.',
        temperature: 0.7,
        maxTokens: 150,
    }
}

export default function ChatbotWidget() {
  const [config] = useState(mockConfig);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (config?.behavior.showOnLoad && !isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, config.behavior.delaySeconds * 1000);
      return () => clearTimeout(timer);
    }
  }, [config, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (config?.appearance.welcomeMessage) {
        setMessages([{
            id: '1',
            text: config.appearance.welcomeMessage,
            sender: 'bot',
            timestamp: new Date()
        }]);
    }
  }, [config]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !config) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate API call and bot response
    setTimeout(() => {
        const response = findResponse(inputValue);
        const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: response,
            sender: 'bot',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
    }, 1000);
  };

  const findResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();

    for (const faq of config.faqs) {
      const hasKeyword = faq.keywords.some(keyword => 
        lowerQuestion.includes(keyword.toLowerCase())
      );
      
      if (hasKeyword || lowerQuestion.includes(faq.question.toLowerCase())) {
        return faq.answer;
      }
    }
    
    // Default fallback response
    return 'Lo siento, no tengo información sobre eso. ¿Puedo ayudarte con algo más?';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!config || !config.enabled) return null;

  return (
    <>
      {/* Botón flotante */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`fixed ${
              config.appearance.position === 'bottom-right'
                ? 'bottom-6 right-6'
                : 'bottom-6 left-6'
            } z-50`}
          >
            <Button
              size="lg"
              className="rounded-full w-16 h-16 shadow-lg"
              style={{ backgroundColor: config.appearance.primaryColor }}
              onClick={() => setIsOpen(true)}
            >
              <MessageSquare className="w-8 h-8" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ventana del chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed ${
              config.appearance.position === 'bottom-right'
                ? 'bottom-6 right-6'
                : 'bottom-6 left-6'
            } z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border`}
          >
            {/* Header */}
            <div
              className="p-4 flex items-center justify-between text-white"
              style={{ backgroundColor: config.appearance.primaryColor }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{config.appearance.botName}</h3>
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

            {/* Messages */}
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
                          ? { backgroundColor: config.appearance.primaryColor }
                          : undefined
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
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-lg p-3 border">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={config.appearance.placeholderText}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  style={{ backgroundColor: config.appearance.primaryColor }}
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
