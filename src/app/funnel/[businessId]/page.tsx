
'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import type { FormConfigData } from '@/components/dashboard/landing/FormEditor';
import { InteractiveReviewForm } from '@/components/interactive-review-form';
import { useMemo } from 'react';

const defaultFormConfig: FormConfigData = {
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

export default function ReviewFunnelPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const firestore = useFirestore();

  const formConfigRef = useMemo(() => {
    if (!firestore || !businessId) return null;
    return doc(firestore, `businesses/${businessId}/landingPages`, 'form');
  }, [firestore, businessId]);

  const { data: formConfig, isLoading: isFormLoading } = useDoc<FormConfigData>(formConfigRef);

  const displayFormConfig = formConfig || defaultFormConfig;

  if (isFormLoading || !businessId) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <InteractiveReviewForm businessId={businessId} formConfig={displayFormConfig} />
    </div>
  );
}
