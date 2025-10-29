
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  PlusCircle,
  Trash2,
  Settings,
  Palette,
  Bot,
  HelpCircle,
  Cpu,
  Save,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { ChatbotConfig, FAQ } from '@/types/chatbot';
import { v4 as uuidv4 } from 'uuid';

const FAQItem = ({ faq, onUpdate, onDelete }: { faq: FAQ, onUpdate: (updatedFaq: FAQ) => void, onDelete: () => void }) => (
  <div className="p-4 border rounded-lg bg-background space-y-4">
    <Input
      placeholder="Pregunta"
      value={faq.question}
      onChange={(e) => onUpdate({ ...faq, question: e.target.value })}
    />
    <Textarea
      placeholder="Respuesta"
      value={faq.answer}
      onChange={(e) => onUpdate({ ...faq, answer: e.target.value })}
    />
    <Input
      placeholder="Palabras clave (separadas por coma)"
      value={faq.keywords.join(', ')}
      onChange={(e) =>
        onUpdate({ ...faq, keywords: e.target.value.split(',').map(k => k.trim()) })
      }
    />
    <div className="flex justify-end">
      <Button variant="destructive" size="sm" onClick={onDelete}>
        <Trash2 className="h-4 w-4 mr-2" /> Eliminar
      </Button>
    </div>
  </div>
);

const defaultConfig: ChatbotConfig = {
    enabled: true,
    position: 'bottom-right',
    botName: 'Asistente Virtual',
    primaryColor: '#4285F4',
    welcomeMessage: '¡Hola! ¿Cómo puedo ayudarte hoy?',
    placeholderText: 'Escribe tu mensaje aquí...',
    showOnLoad: false,
    showDelay: 2,
    faqs: [
        {
          id: uuidv4(),
          question: '¿Cuáles son los métodos de pago?',
          answer: 'Aceptamos tarjetas de crédito, PayPal y transferencias.',
          keywords: ['pago', 'tarjeta', 'paypal'],
        },
        {
          id: uuidv4(),
          question: '¿Qué puede ayudarme tu aplicación con mi negocio de computadores?',
          answer: 'Aumentar la Interacción: Con herramientas para publicaciones y un formulario de contacto, mantendrás una comunicación fluida con tus clientes.\n\nEn resumen, te damos las herramientas para que vendas más, te veas más profesional en internet y gestiones tu presencia online de forma sencilla.',
          keywords: ['ayuda', 'aplicación', 'negocio', 'computadores'],
        },
    ],
    aiEnabled: true,
    systemPrompt: 'Eres un asistente amigable y profesional para el SaaS Local Leap.',
    temperature: 0.7,
    maxTokens: 256,
}

export default function ChatbotConfigPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [config, setConfig] = useState<ChatbotConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);

  const configDocRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'chatbot/config');
  }, [firestore]);

  const { data: loadedConfig, isLoading: isLoadingConfig } = useDoc<ChatbotConfig>(configDocRef);

  useEffect(() => {
    if (loadedConfig) {
      setConfig(prev => ({...prev, ...loadedConfig}));
    }
  }, [loadedConfig]);


  const handleConfigChange = (field: keyof ChatbotConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const addFaq = () => {
    const newFaq: FAQ = { 
        id: uuidv4(),
        question: 'Nueva Pregunta', 
        answer: 'Nueva Respuesta', 
        keywords: [] 
    };
    handleConfigChange('faqs', [...config.faqs, newFaq]);
  };

  const updateFaq = (index: number, updatedFaq: FAQ) => {
    const newFaqs = [...config.faqs];
    newFaqs[index] = updatedFaq;
    handleConfigChange('faqs', newFaqs);
  };

  const deleteFaq = (index: number) => {
    handleConfigChange('faqs', config.faqs.filter((_, i) => i !== index));
  };
  
  const handleSaveConfiguration = async () => {
    if (!configDocRef) return;
    setIsSaving(true);
    try {
        await setDoc(configDocRef, { ...config, updatedAt: serverTimestamp() }, { merge: true });
        toast({
            title: '¡Guardado!',
            description: 'La configuración del chatbot se ha guardado correctamente.'
        });
    } catch (error) {
        console.error("Error saving chatbot config:", error);
        toast({
            variant: 'destructive',
            title: 'Error al Guardar',
            description: 'No se pudo guardar la configuración del chatbot.'
        });
    } finally {
        setIsSaving(false);
    }
  }

  if (isLoadingConfig) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Configuración de Chatbot
          </h1>
          <p className="text-muted-foreground">
            Define el comportamiento, apariencia y respuestas de tu chatbot.
          </p>
        </div>
        <Button size="lg" onClick={handleSaveConfiguration} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar Configuración
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">
            <Settings className="mr-2 h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" /> Apariencia
          </TabsTrigger>
          <TabsTrigger value="behavior">
            <Bot className="mr-2 h-4 w-4" /> Comportamiento
          </TabsTrigger>
          <TabsTrigger value="faqs">
            <HelpCircle className="mr-2 h-4 w-4" /> FAQs
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Cpu className="mr-2 h-4 w-4" /> IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Activación y Posición</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <Label htmlFor="chatbot-enabled" className="font-semibold">
                  Activar Chatbot en el sitio
                </Label>
                <Switch 
                  id="chatbot-enabled" 
                  checked={config.enabled}
                  onCheckedChange={(val) => handleConfigChange('enabled', val)}
                />
              </div>
              <div className="space-y-2">
                <Label>Posición del Widget</Label>
                <Select 
                  value={config.position}
                  onValueChange={(val: 'bottom-right' | 'bottom-left') => handleConfigChange('position', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">Abajo a la Derecha</SelectItem>
                    <SelectItem value="bottom-left">Abajo a la Izquierda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia del Chatbot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre del Bot</Label>
                  <Input 
                    value={config.botName}
                    onChange={(e) => handleConfigChange('botName', e.target.value)}
                  />
                </div>
                 <div className="space-y-2">
                  <Label>Color Primario</Label>
                  <Input 
                    type="color" 
                    value={config.primaryColor} 
                    onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                    className='p-1 h-10'
                  />
                </div>
              </div>
               <div className="space-y-2">
                  <Label>Mensaje de Bienvenida</Label>
                  <Input 
                    value={config.welcomeMessage}
                    onChange={(e) => handleConfigChange('welcomeMessage', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Texto del Placeholder</Label>
                  <Input 
                    value={config.placeholderText}
                    onChange={(e) => handleConfigChange('placeholderText', e.target.value)}
                  />
                </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="behavior">
            <Card>
                 <CardHeader><CardTitle>Comportamiento del Chatbot</CardTitle></CardHeader>
                 <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <Label htmlFor="show-on-load" className="font-semibold">Mostrar automáticamente al cargar la página</Label>
                        <Switch 
                          id="show-on-load" 
                          checked={config.showOnLoad}
                          onCheckedChange={(val) => handleConfigChange('showOnLoad', val)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label>Retraso para mostrar (segundos)</Label>
                        <Input 
                          type="number" 
                          value={config.showDelay}
                          onChange={(e) => handleConfigChange('showDelay', Number(e.target.value))}
                        />
                    </div>
                 </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Preguntas Frecuentes</CardTitle>
                <Button onClick={addFaq}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Añadir FAQ
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.faqs.map((faq, index) => (
                <FAQItem
                  key={faq.id}
                  faq={faq}
                  onUpdate={(updatedFaq) => updateFaq(index, updatedFaq)}
                  onDelete={() => deleteFaq(index)}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ai">
            <Card>
                 <CardHeader><CardTitle>Configuración de IA</CardTitle></CardHeader>
                 <CardContent className="space-y-6">
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <Label htmlFor="ai-enabled" className="font-semibold">Habilitar respuestas con IA</Label>
                        <Switch 
                          id="ai-enabled" 
                          checked={config.aiEnabled}
                          onCheckedChange={(val) => handleConfigChange('aiEnabled', val)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label>Instrucción del Sistema (System Prompt)</Label>
                        <Textarea 
                          placeholder="Eres un asistente amigable y profesional..." 
                          value={config.systemPrompt}
                          onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Temperatura: {config.temperature}</Label>
                            <Slider 
                              value={[config.temperature]} 
                              min={0} max={1} step={0.1}
                              onValueChange={([val]) => handleConfigChange('temperature', val)}
                             />
                        </div>
                        <div className="space-y-2">
                            <Label>Máximo de Tokens</Label>
                            <Input 
                              type="number" 
                              value={config.maxTokens}
                              onChange={(e) => handleConfigChange('maxTokens', Number(e.target.value))}
                            />
                        </div>
                    </div>
                 </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
