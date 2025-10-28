'use client';

import { useState } from 'react';
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
} from 'lucide-react';

const FAQItem = ({ faq, onUpdate, onDelete }: any) => (
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
        onUpdate({ ...faq, keywords: e.target.value.split(', ') })
      }
    />
    <div className="flex justify-end">
      <Button variant="destructive" size="sm" onClick={onDelete}>
        <Trash2 className="h-4 w-4 mr-2" /> Eliminar
      </Button>
    </div>
  </div>
);

export default function ChatbotConfigPage() {
  const [faqs, setFaqs] = useState([
    {
      question: '¿Cuáles son los métodos de pago?',
      answer: 'Aceptamos tarjetas de crédito, PayPal y transferencias.',
      keywords: ['pago', 'tarjeta', 'paypal'],
    },
  ]);

  const addFaq = () => {
    setFaqs([
      ...faqs,
      { question: '', answer: '', keywords: [] },
    ]);
  };

  const updateFaq = (index: number, updatedFaq: any) => {
    const newFaqs = [...faqs];
    newFaqs[index] = updatedFaq;
    setFaqs(newFaqs);
  };

  const deleteFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

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
        <Button size="lg">
          <Save className="mr-2 h-4 w-4" />
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
                <Switch id="chatbot-enabled" defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>Posición del Widget</Label>
                <Select defaultValue="bottom-right">
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
                  <Input defaultValue="Asistente Virtual" />
                </div>
                 <div className="space-y-2">
                  <Label>Color Primario</Label>
                  <Input type="color" defaultValue="#4285F4" className='p-1 h-10'/>
                </div>
              </div>
               <div className="space-y-2">
                  <Label>Mensaje de Bienvenida</Label>
                  <Input defaultValue="¡Hola! ¿Cómo puedo ayudarte hoy?" />
                </div>
                <div className="space-y-2">
                  <Label>Texto del Placeholder</Label>
                  <Input defaultValue="Escribe tu mensaje aquí..." />
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
                        <Switch id="show-on-load" />
                    </div>
                     <div className="space-y-2">
                        <Label>Retraso para mostrar (segundos)</Label>
                        <Input type="number" defaultValue={2} />
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
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  faq={faq}
                  onUpdate={(updatedFaq: any) => updateFaq(index, updatedFaq)}
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
                        <Switch id="ai-enabled" defaultChecked />
                    </div>
                     <div className="space-y-2">
                        <Label>Instrucción del Sistema (System Prompt)</Label>
                        <Textarea placeholder="Eres un asistente amigable y profesional..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Temperatura: 0.7</Label>
                            <Slider defaultValue={[0.7]} min={0} max={1} step={0.1} />
                        </div>
                        <div className="space-y-2">
                            <Label>Máximo de Tokens</Label>
                            <Input type="number" defaultValue={256} />
                        </div>
                    </div>
                 </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
