
'use client';

import { useState, useEffect } from 'react';
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
import { StarRating } from './star-rating';
import { CheckCircle, MessageSquare, Star, Loader2 } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import type { FormConfigData } from '@/components/dashboard/landing/FormEditor';

export default function ReviewFunnelPage({
  params,
}: {
  params: { businessId: string };
}) {
  const [rating, setRating] = useState(0);
  const [step, setStep] = useState(1); // 1: rating, 2: form/redirect, 3: thank you
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const firestore = useFirestore();
  
  const formConfigRef = useMemoFirebase(() => {
    if (!firestore || !params.businessId) return null;
    return doc(firestore, `businesses/${params.businessId}/landingPages`, 'form');
  }, [firestore, params.businessId]);

  const { data: formConfig, isLoading } = useDoc<FormConfigData>(formConfigRef);

  useEffect(() => {
    if (
      !isLoading &&
      formConfig &&
      step === 2 &&
      rating === 5 &&
      formConfig.redirectUrl
    ) {
      window.location.href = formConfig.redirectUrl;
    }
  }, [step, rating, formConfig, isLoading]);

  const handleRating = (rate: number) => {
    setRating(rate);
    setStep(2);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !params.businessId) return;

    setIsSubmitting(true);
    try {
      const feedbackColRef = collection(firestore, `businesses/${params.businessId}/privateFeedback`);
      await addDoc(feedbackColRef, {
        name,
        email,
        review: message,
        rating,
        status: 'Pending',
        createdAt: serverTimestamp(),
      });
      setStep(3);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        {step === 1 && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                {formConfig?.formTitle || '¿Cómo fue tu experiencia?'}
              </CardTitle>
              <CardDescription>
                {formConfig?.formSubtitle ||
                  'Tus comentarios nos ayudan a mejorar.'}
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
                {formConfig?.negativeFeedbackTitle || 'Déjanos tus comentarios'}
              </CardTitle>
              <CardDescription>
                {formConfig?.negativeFeedbackSubtitle ||
                  'Lamentamos que tu experiencia no haya sido perfecta. Por favor, dinos cómo podemos mejorar.'}
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
              {formConfig?.positiveFeedbackTitle || '¡Gracias por tu reseña!'}
            </CardTitle>
            <CardDescription>
              {formConfig?.positiveFeedbackSubtitle ||
                'Redirigiendo para que puedas compartir tu experiencia...'}
            </CardDescription>
          </CardHeader>
        )}

        {step === 3 && (
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <CardTitle className="text-2xl font-bold">
              {formConfig?.thankYouTitle || '¡Gracias!'}
            </CardTitle>
            <CardDescription>
              {formConfig?.thankYouSubtitle ||
                'Tus comentarios son muy valiosos para nosotros.'}
            </CardDescription>
          </CardHeader>
        )}
      </Card>
    </div>
  );
}
