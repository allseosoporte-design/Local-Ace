
'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Copy, Eye, Settings, List, PlusCircle, Save, Loader2 } from 'lucide-react';
import { ContactFormField } from '@/components/dashboard/editor-contacto/ContactFormField';
import type { FormField } from '@/types/contact-form';
import { Textarea } from '@/components/ui/textarea';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';


const initialFields: FormField[] = [
    { id: uuidv4(), type: 'text', label: 'Nombre', placeholder: 'Tu nombre completo', required: true },
    { id: uuidv4(), type: 'email', label: 'Correo Electrónico', placeholder: 'tu@ejemplo.com', required: true },
    { id: uuidv4(), type: 'textarea', label: 'Mensaje', placeholder: 'Escribe tu mensaje aquí...', required: true },
];

interface EmailConfig {
    recipientEmail: string;
    subject: string;
}

const initialEmailConfig: EmailConfig = {
    recipientEmail: '',
    subject: 'Nuevo mensaje desde tu formulario de contacto',
}

interface FormConfig {
    fields: FormField[];
    emailConfig: EmailConfig;
}

export default function EditorContactoPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(initialEmailConfig);
  const [isSaving, setIsSaving] = useState(false);

  const formConfigRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'contact_forms', user.uid);
  }, [firestore, user]);

  const { data: loadedConfig, isLoading: isConfigLoading } = useDoc<FormConfig>(formConfigRef);

  useEffect(() => {
    if (loadedConfig) {
      setFields(loadedConfig.fields || initialFields);
      setEmailConfig(loadedConfig.emailConfig || initialEmailConfig);
    } else if (user && !isConfigLoading) {
      setEmailConfig(prev => ({...prev, recipientEmail: user.email || ''}));
    }
  }, [loadedConfig, user, isConfigLoading]);


  const publicUrl = user
    ? `${window.location.origin}/contact/${user.uid}`
    : '';

  const handleCopyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    toast({
      title: '✅ Enlace copiado correctamente',
      description: 'La URL pública de tu formulario de contacto ha sido copiada.',
    });
  };

  const openPublicUrl = () => {
    if (publicUrl) {
      window.open(publicUrl, '_blank');
    }
  };

  const addField = () => {
    const newField: FormField = {
        id: uuidv4(),
        type: 'text',
        label: 'Nuevo Campo',
        placeholder: '',
        required: false,
    };
    setFields([...fields, newField]);
  }

  const updateField = (id: string, updatedField: FormField) => {
    setFields(fields.map(f => f.id === id ? updatedField : f));
  }
  
  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  }

  const handleEmailConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailConfig(prev => ({...prev, [name]: value}));
  }

  const handleSaveChanges = async () => {
    if (!formConfigRef) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se puede guardar, usuario no autenticado.'});
      return;
    }
    setIsSaving(true);
    try {
      const configToSave: FormConfig = { fields, emailConfig };
      await setDoc(formConfigRef, { ...configToSave, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: '¡Guardado!', description: 'La configuración de tu formulario de contacto ha sido guardada.'});
    } catch (error) {
      console.error("Error saving form config:", error);
      toast({ variant: 'destructive', title: 'Error al Guardar', description: 'No se pudo guardar la configuración.'});
    } finally {
      setIsSaving(false);
    }
  }
  
  const isLoading = isUserLoading || isConfigLoading;

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Editor de Contacto
          </h1>
          <p className="text-muted-foreground">
            Crea y personaliza tu formulario de contacto profesional.
          </p>
        </div>
        <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Editor y Configuración */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Editor Visual de Formulario
              </CardTitle>
              <CardDescription>
                Arrastra y edita los campos de tu formulario.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                  {fields.map((field) => (
                      <ContactFormField 
                        key={field.id} 
                        field={field} 
                        updateField={updateField}
                        removeField={removeField}
                      />
                  ))}
              </div>
              <Button variant="outline" className="mt-4" onClick={addField}>
                  <PlusCircle className="mr-2 h-4 w-4"/>
                  Agregar Campo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración del Correo
              </CardTitle>
              <CardDescription>
                Define a dónde llegarán los mensajes y personaliza las
                respuestas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="recipientEmail">Correo de Destino</Label>
                    <Input 
                        id="recipientEmail"
                        name="recipientEmail"
                        type="email"
                        value={emailConfig.recipientEmail}
                        onChange={handleEmailConfigChange}
                        placeholder={user?.email || 'tu@email.com'}
                    />
                    <p className="text-xs text-muted-foreground">
                        Aquí recibirás los mensajes de tus clientes.
                    </p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="subject">Asunto del Mensaje</Label>
                    <Input 
                        id="subject"
                        name="subject"
                        value={emailConfig.subject}
                        onChange={handleEmailConfigChange}
                    />
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Vista Previa y Enlace */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Enlace Público</CardTitle>
              <CardDescription>
                Comparte este enlace para que te contacten.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="public-url">Tu URL de Contacto</Label>
                <div className="flex items-center gap-2">
                  <Input id="public-url" value={publicUrl} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    disabled={!user}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={openPublicUrl}
                disabled={!user}
              >
                <Eye className="mr-2 h-4 w-4" />
                Vista Previa Pública
              </Button>
            </CardContent>
            <CardFooter className="flex justify-center">
                 <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar Cambios
                </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 rounded-lg border p-4">
                 {fields.map(field => {
                     if (field.type === 'textarea') {
                         return (
                            <div key={field.id} className="space-y-2">
                                <Label>{field.label}</Label>
                                <Textarea placeholder={field.placeholder} disabled />
                            </div>
                         )
                     }
                     return (
                         <div key={field.id} className="space-y-2">
                            <Label>{field.label}</Label>
                            <Input type={field.type} placeholder={field.placeholder} disabled />
                         </div>
                     )
                 })}
                 <Button className='w-full' disabled>Enviar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
