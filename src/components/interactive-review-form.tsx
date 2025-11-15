
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/app/funnel/[businessId]/star-rating';
import { CheckCircle, MessageSquare, Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { FormConfigData } from '@/components/dashboard/landing/FormEditor';
import { useToast } from '@/hooks/use-toast';

interface InteractiveReviewFormProps {
  businessId: string;
  formConfig: FormConfigData;
}

export function InteractiveReviewForm({ businessId, formConfig }: InteractiveReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleRating = (newRating: number) => {
    setRating(newRating);
    setStep(2);
  };

  useEffect(() => {
    if (
      step === 2 &&
      rating === 5 &&
      formConfig.redirectUrl &&
      businessId
    ) {
      const redirectUrl = formConfig.redirectUrl.replace('YOUR_BUSINESS_ID', businessId);
      window.location.href = redirectUrl;
    }
  }, [step, rating, businessId, formConfig.redirectUrl]);

  const handleSubmitFeedback = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Servicio de base de datos no disponible.' });
      return;
    }
  
    if (!businessId) {
      toast({ variant: 'destructive', title: 'Error', description: 'ID de negocio no encontrado.' });
      return;
    }
  
    setIsSubmitting(true);
    
    try {
      const feedbackColRef = collection(firestore, 'internalFeedback');
      
      const feedbackData = {
        businessId: businessId,
        rating: rating,
        name: name,
        email: email,
        review: message,
        status: 'Pending',
        createdAt: serverTimestamp(),
      };
      
      await addDoc(feedbackColRef, feedbackData);
      
      setStep(3);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      let errorMessage = 'No se pudo enviar tu comentario. Por favor, inténtalo más tarde.';
      if (error instanceof Error && error.message.includes('permission-denied')) {
        errorMessage = 'No tienes permiso para realizar esta acción.';
      }
      toast({ variant: 'destructive', title: 'Error al enviar', description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      {step === 1 && (
        <>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {formConfig.formTitle}
            </CardTitle>
            <CardDescription>
              {formConfig.formSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StarRating onRating={handleRating} />
          </CardContent>
        </>
      )}

      {step === 2 && rating > 0 && rating < 5 && (
        <form onSubmit={handleSubmitFeedback}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="text-primary" />{' '}
              {formConfig.negativeFeedbackTitle}
            </CardTitle>
            <CardDescription>
              {formConfig.negativeFeedbackSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@ejemplo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tus comentarios..."
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Enviar Comentarios
            </Button>
          </CardFooter>
        </form>
      )}

      {step === 2 && rating === 5 && (
        <CardHeader className="text-center">
          <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
          <CardTitle className="text-2xl font-bold pt-4">
            {formConfig.positiveFeedbackTitle}
          </CardTitle>
          <CardDescription>
            {formConfig.positiveFeedbackSubtitle}
          </CardDescription>
        </CardHeader>
      )}

      {step === 3 && (
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <CardTitle className="text-2xl font-bold">
            {formConfig.thankYouTitle}
          </CardTitle>
          <CardDescription>
            {formConfig.thankYouSubtitle}
          </CardDescription>
        </CardHeader>
      )}
    </Card>
  );
}
