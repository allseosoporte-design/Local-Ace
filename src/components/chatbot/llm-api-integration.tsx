'use client';

import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { LLMIntegration } from '@/types/chatbot';
import { LLMProviderForm } from './llm-provider-form';

interface LLMApiIntegrationProps {
  integrations: LLMIntegration[];
  setIntegrations: (integrations: LLMIntegration[]) => void;
}

const providerOptions = [
  { value: 'google', label: 'Google Gemini' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'huggingface', label: 'Hugging Face' },
  { value: 'mistral', label: 'Mistral' },
];

export function LLMApiIntegration({ integrations, setIntegrations }: LLMApiIntegrationProps) {

  const addIntegration = (provider: LLMIntegration['provider']) => {
    const newIntegration: LLMIntegration = {
      id: uuidv4(),
      provider,
      apiKey: '',
      model: '',
      temperature: 0.7,
      maxTokens: 1024,
      enabled: true,
    };
    setIntegrations([...integrations, newIntegration]);
  };

  const updateIntegration = (updatedIntegration: LLMIntegration) => {
    setIntegrations(
      integrations.map(integ => (integ.id === updatedIntegration.id ? updatedIntegration : integ))
    );
  };

  const removeIntegration = (id: string) => {
    setIntegrations(integrations.filter(integ => integ.id !== id));
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Integración APIs de Modelos de Lenguaje</CardTitle>
        <CardDescription>
          Conecta tu chatbot a diferentes proveedores de modelos de lenguaje externos para expandir sus capacidades.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 p-4 border rounded-lg bg-background">
            <Select onValueChange={(value) => addIntegration(value as LLMIntegration['provider'])}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Selecciona un proveedor para añadir..." />
                </SelectTrigger>
                <SelectContent>
                    {providerOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={() => {}} disabled>
                 <PlusCircle className="mr-2 h-4 w-4"/> Añadir Integración
            </Button>
        </div>

        <Accordion type="multiple" className="w-full space-y-2">
            {integrations.map(integration => (
                 <AccordionItem key={integration.id} value={integration.id} className="border rounded-lg bg-background">
                    <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-base">{providerOptions.find(p => p.value === integration.provider)?.label}</span>
                             <div className={`w-2 h-2 rounded-full ${integration.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 border-t">
                        <LLMProviderForm 
                            integration={integration}
                            onUpdate={updateIntegration}
                            onDelete={() => removeIntegration(integration.id)}
                        />
                    </AccordionContent>
                 </AccordionItem>
            ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
