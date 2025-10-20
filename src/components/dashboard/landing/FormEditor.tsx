
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import React from 'react';

export interface FormConfigData {
  redirectUrl: string;
  notificationEmail: string;
  formTitle: string;
  formSubtitle: string;
  negativeFeedbackTitle: string;
  negativeFeedbackSubtitle: string;
  positiveFeedbackTitle: string;
  positiveFeedbackSubtitle: string;
  thankYouTitle: string;
  thankYouSubtitle: string;
}

interface FormEditorProps {
  data: FormConfigData;
  setData: React.Dispatch<React.SetStateAction<FormConfigData>>;
}

export function FormEditor({ data, setData }: FormEditorProps) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <Card className="h-full overflow-y-auto border-t-0 rounded-t-none">
      <CardHeader>
        <CardTitle className="text-lg">Configuración del Formulario de Reseñas</CardTitle>
        <CardDescription>Personaliza el comportamiento y los mensajes de tu embudo de reseñas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className='p-4 border rounded-lg bg-background'>
            <h3 className='font-semibold text-md mb-4'>Comportamiento del Formulario</h3>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="redirectUrl">URL para Reseñas Positivas (5 estrellas)</Label>
                    <Input
                        id="redirectUrl"
                        name="redirectUrl"
                        value={data.redirectUrl}
                        onChange={handleChange}
                        placeholder="https://www.google.com/maps/search/?api=1&query=YOUR_BUSINESS_ID"
                    />
                     <p className="text-xs text-muted-foreground">Aquí es donde se redirigirá a los clientes que dejen 5 estrellas.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="notificationEmail">Email para Notificaciones Internas</Label>
                    <Input
                        id="notificationEmail"
                        name="notificationEmail"
                        type="email"
                        value={data.notificationEmail}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                    />
                    <p className="text-xs text-muted-foreground">Recibirás un email aquí cuando alguien deje feedback de 1 a 4 estrellas.</p>
                </div>
            </div>
        </div>
        
        <div className='p-4 border rounded-lg bg-background'>
             <h3 className='font-semibold text-md mb-4'>Personalización de Mensajes</h3>
            <div className="space-y-4">
                <Separator />
                <p className='text-sm font-medium text-muted-foreground'>Paso 1: Pedir Calificación</p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="formTitle">Título del Formulario</Label>
                        <Input id="formTitle" name="formTitle" value={data.formTitle} onChange={handleChange}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="formSubtitle">Subtítulo del Formulario</Label>
                        <Input id="formSubtitle" name="formSubtitle" value={data.formSubtitle} onChange={handleChange}/>
                    </div>
                </div>
                <Separator />
                <p className='text-sm font-medium text-muted-foreground'>Paso 2: Feedback Negativo (1-4 Estrellas)</p>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="negativeFeedbackTitle">Título para Feedback Negativo</Label>
                        <Input id="negativeFeedbackTitle" name="negativeFeedbackTitle" value={data.negativeFeedbackTitle} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="negativeFeedbackSubtitle">Subtítulo para Feedback Negativo</Label>
                        <Input id="negativeFeedbackSubtitle" name="negativeFeedbackSubtitle" value={data.negativeFeedbackSubtitle} onChange={handleChange} />
                    </div>
                </div>
                <Separator />
                 <p className='text-sm font-medium text-muted-foreground'>Paso 2: Feedback Positivo (5 Estrellas)</p>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="positiveFeedbackTitle">Título para Feedback Positivo</Label>
                        <Input id="positiveFeedbackTitle" name="positiveFeedbackTitle" value={data.positiveFeedbackTitle} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="positiveFeedbackSubtitle">Subtítulo para Feedback Positivo</Label>
                        <Input id="positiveFeedbackSubtitle" name="positiveFeedbackSubtitle" value={data.positiveFeedbackSubtitle} onChange={handleChange} />
                    </div>
                </div>
                <Separator />
                 <p className='text-sm font-medium text-muted-foreground'>Paso 3: Página de Agradecimiento</p>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="thankYouTitle">Título de Agradecimiento</Label>
                        <Input id="thankYouTitle" name="thankYouTitle" value={data.thankYouTitle} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="thankYouSubtitle">Subtítulo de Agradecimiento</Label>
                        <Input id="thankYouSubtitle" name="thankYouSubtitle" value={data.thankYouSubtitle} onChange={handleChange} />
                    </div>
                 </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
