
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
import { CheckCircle, MessageSquare, Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface PageProps {
  params: { businessId: string } | Promise<{ businessId: string }>;
}

// Define default form configuration statically
const defaultFormConfig = {
  redirectUrl: "https://www.google.com/maps/search/?api=1&query=YOUR_BUSINESS_ID",
  formTitle: "¿Cómo fue tu experiencia?",
  formSubtitle: "Tus comentarios nos ayudan a mejorar.",
  negativeFeedbackTitle: "Déjanos tus comentarios",
  negativeFeedbackSubtitle: "Lamentamos que tu experiencia no haya sido perfecta. Por favor, dinos cómo podemos mejorar.",
  positiveFeedbackTitle: "¡Gracias por tu reseña!",
  positiveFeedbackSubtitle: "Nos alegra que hayas tenido una gran experiencia. Ayuda a otros a descubrirnos compartiendo tu opinión en Google.",
  thankYouTitle: "¡Gracias!",
  thankYouSubtitle: "Tus comentarios son muy valiosos para nosotros.",
};

export default function ReviewFunnelPage({ params }: PageProps) {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const firestore = useFirestore();

  // Resolve params whether it's a Promise or direct object
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await Promise.resolve(params);
      setBusinessId(resolved.businessId);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (
      step === 2 &&
      rating === 5 &&
      defaultFormConfig.redirectUrl
    ) {
      // Replace placeholder with actual businessId for a more dynamic redirect
      const redirectUrl = defaultFormConfig.redirectUrl.replace('YOUR_BUSINESS_ID', businessId || '');
      window.location.href = redirectUrl;
    }
  }, [step, rating, businessId]);

  const handleRating = (rate: number) => {
    setRating(rate);
    setStep(2);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !businessId) {
        console.error("Firestore or Business ID not available");
        return;
    };

    setIsSubmitting(true);
    try {
      const feedbackColRef = collection(firestore, 'businesses', businessId, 'internalFeedback');
      
      const feedbackData = {
          businessId: businessId,
          rating: rating,
          name: name,
          email: email,
          review: message, // CORREGIDO: 'message' ahora es 'review'
          status: 'Pending',
          createdAt: serverTimestamp(),
      };
      
      await addDoc(feedbackColRef, feedbackData);
      setStep(3);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!businessId) {
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
                {defaultFormConfig.formTitle}
              </CardTitle>
              <CardDescription>
                {defaultFormConfig.formSubtitle}
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
                {defaultFormConfig.negativeFeedbackTitle}
              </CardTitle>
              <CardDescription>
                {defaultFormConfig.negativeFeedbackSubtitle}
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
              {defaultFormConfig.positiveFeedbackTitle}
            </CardTitle>
            <CardDescription>
              {defaultFormConfig.positiveFeedbackSubtitle}
            </CardDescription>
          </CardHeader>
        )}

        {step === 3 && (
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <CardTitle className="text-2xl font-bold">
              {defaultFormConfig.thankYouTitle}
            </CardTitle>
            <CardDescription>
              {defaultFormConfig.thankYouSubtitle}
            </CardDescription>
          </CardHeader>
        )}
      </Card>
    </div>
  );
}
