
'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Loader2, CheckCircle } from 'lucide-react';
import type { FormField } from '@/types/contact-form';
import { useToast } from '@/hooks/use-toast';

interface FormConfig {
  fields: FormField[];
  emailConfig: {
    recipientEmail: string;
    subject: string;
  };
}

export default function PublicContactPage() {
  const params = useParams();
  const userId = params.userId as string;
  const firestore = useFirestore();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formConfigRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'contact_forms', userId);
  }, [firestore, userId]);

  const { data: formConfig, isLoading } = useDoc<FormConfig>(formConfigRef);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !userId) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo enviar el formulario.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const submissionsCollection = collection(firestore, `contact_forms/${userId}/submissions`);
      await addDoc(submissionsCollection, {
        ...formData,
        submittedAt: serverTimestamp(),
      });
      setIsSubmitted(true);
      toast({ title: '¡Mensaje Enviado!', description: 'Gracias por contactarnos. Te responderemos pronto.' });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Hubo un problema al enviar tu mensaje.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!formConfig) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <p>No se encontró la configuración de este formulario.</p>
      </div>
    );
  }
  
  if (isSubmitted) {
      return (
          <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
              <Card className="w-full max-w-lg text-center">
                  <CardHeader>
                      <div className="flex justify-center">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                      </div>
                      <CardTitle className="mt-4">Mensaje Enviado</CardTitle>
                      <CardDescription>
                          Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.
                      </CardDescription>
                  </CardHeader>
              </Card>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Formulario de Contacto</CardTitle>
            <CardDescription>
              Completa los campos para enviarnos un mensaje.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formConfig.fields.map(field => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.id}
                    name={field.label}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={formData[field.label] || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <Input
                    id={field.id}
                    name={field.label}
                    type={field.type}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={formData[field.label] || ''}
                    onChange={handleInputChange}
                  />
                )}
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Enviar Mensaje
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
