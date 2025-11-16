'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Trash2 } from 'lucide-react';
import type { LLMIntegration } from '@/types/chatbot';

interface LLMProviderFormProps {
  integration: LLMIntegration;
  onUpdate: (integration: LLMIntegration) => void;
  onDelete: () => void;
}

const modelOptions = {
    google: ['gemini-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'],
    openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    huggingface: ['mistralai/Mistral-7B-Instruct-v0.2', 'google/gemma-7b'],
    mistral: ['mistral-tiny', 'mistral-small', 'mistral-large'],
};


export const LLMProviderForm = ({ integration, onUpdate, onDelete }: LLMProviderFormProps) => {

    const handleFieldChange = (field: keyof LLMIntegration, value: any) => {
        onUpdate({ ...integration, [field]: value });
    };

    const currentModels = modelOptions[integration.provider] || [];

    return (
        <div className="space-y-4">
             <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-2">
                    <Switch 
                        id={`enabled-${integration.id}`} 
                        checked={integration.enabled}
                        onCheckedChange={(val) => handleFieldChange('enabled', val)}
                    />
                    <Label htmlFor={`enabled-${integration.id}`}>Habilitado</Label>
                </div>
                 <Button variant="destructive" size="sm" onClick={onDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar Integración
                </Button>
             </div>
            <div className="space-y-2">
                <Label htmlFor={`apiKey-${integration.id}`}>API Key</Label>
                <Input 
                    id={`apiKey-${integration.id}`}
                    type="password"
                    value={integration.apiKey}
                    onChange={(e) => handleFieldChange('apiKey', e.target.value)}
                    placeholder="Introduce tu clave de API"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor={`model-${integration.id}`}>Modelo</Label>
                <select
                    id={`model-${integration.id}`}
                    value={integration.model}
                    onChange={(e) => handleFieldChange('model', e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                     <option value="" disabled>Selecciona un modelo</option>
                    {currentModels.map(model => (
                        <option key={model} value={model}>{model}</option>
                    ))}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Temperatura: {integration.temperature}</Label>
                    <Slider
                        value={[integration.temperature]}
                        min={0} max={1} step={0.1}
                        onValueChange={([val]) => handleFieldChange('temperature', val)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Máximo de Tokens</Label>
                    <Input
                        type="number"
                        value={integration.maxTokens}
                        onChange={(e) => handleFieldChange('maxTokens', Number(e.target.value))}
                    />
                </div>
            </div>
        </div>
    );
}