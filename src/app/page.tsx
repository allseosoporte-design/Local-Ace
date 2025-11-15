'use client';

import { useMemo } from 'react';
import { EditorLandingPreview, type LandingPageData } from '@/components/editor-landing-preview';
import { HomeNav } from '@/components/home-nav';
import { SUPER_ADMIN_BUSINESS_ID } from '@/lib/constants';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import type { FormConfigData } from '@/components/dashboard/landing/FormEditor';
import type { SubscriptionPlan } from '@/types/subscription-plan';

export default function Home() {
  const firestore = useFirestore();

  const landingPageRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, `businesses/${SUPER_ADMIN_BUSINESS_ID}/landingPages`, 'config');
  }, [firestore]);

  const formConfigRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, `businesses/${SUPER_ADMIN_BUSINESS_ID}/landingPages`, 'form');
  }, [firestore]);

  const plansQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'subscriptionPlans'),
      orderBy('order', 'asc')
    );
  }, [firestore]);

  const { data: landingData, isLoading: isLandingLoading } = useDoc<LandingPageData>(landingPageRef);
  const { data: formConfig, isLoading: isFormLoading } = useDoc<FormConfigData>(formConfigRef);
  const { data: allPlans, isLoading: arePlansLoading } = useCollection<SubscriptionPlan>(plansQuery);

  const plans = useMemo(() => {
    if (!allPlans) return [];
    return allPlans.filter(plan => plan.isActive === true);
  }, [allPlans]);

  const isLoading = isLandingLoading || isFormLoading || arePlansLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!landingData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-center p-4">
        <div>
          <h1 className='text-2xl font-bold'>Página no configurada</h1>
          <p className='text-muted-foreground mt-2'>No se pudo cargar la configuración de la página de inicio desde la base de datos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HomeNav />
      <main className="flex-1">
        <EditorLandingPreview 
          key={SUPER_ADMIN_BUSINESS_ID}
          data={landingData} 
          formConfig={formConfig || undefined}
          businessId={SUPER_ADMIN_BUSINESS_ID}
          plans={plans}
        />
      </main>
    </div>
  );
}
