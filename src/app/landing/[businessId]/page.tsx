'use client';

import { useMemo, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { EditorLandingPreview, type LandingPageData, type HeaderConfig, type FooterConfig } from '@/components/editor-landing-preview';
import { Loader2 } from 'lucide-react';
import type { FormConfigData } from '@/components/dashboard/landing/FormEditor';
import type { SubscriptionPlan } from '@/types/subscription-plan';

const defaultFooter: FooterConfig = {
    enabled: true,
    copyrightText: `© ${new Date().getFullYear()} Tu Negocio. Todos los derechos reservados.`,
    columns: [
        { id: '1', title: 'Compañía', links: [{id: 'l1', text: 'Sobre nosotros', url: '#'}] },
        { id: '2', title: 'Legal', links: [{id: 'l2', text: 'Términos y condicones', url: '#'}] },
    ],
    socialLinks: [
        { id: '1', network: 'facebook', url: '#' },
        { id: '2', network: 'instagram', url: '#' },
    ],
    address: 'Calle Falsa 123, Ciudad',
    phone: '+123 456 7890',
    email: 'contacto@tu-negocio.com',
    backgroundColor: '#F8F9FA',
    textColor: '#333333',
    iconColor: '#4169E1'
};

const defaultNavigation: HeaderConfig = {
      enabled: true,
      links: [],
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      hoverColor: '#4169E1',
      fontSize: '16',
      spacing: '24',
      shadow: true,
      logoUrl: null,
      logoText: "Mi Negocio",
      logoWidth: 120,
      logoAlignment: 'left'
  };

const defaultLandingData: LandingPageData = {
  title: "Bienvenido a Nuestro Espacio",
  subtitle: "Descubre nuestros productos y servicios.",
  content: ``,
  heroImageUrl: "https://picsum.photos/seed/default-hero/1200/600",
  ctaText: "Contáctanos",
  ctaUrl: "#",
  backgroundColor: "#FFFFFF",
  textColor: "#000000",
  buttonColor: "hsl(221, 89%, 60%)",
  sections: [],
  testimonialsTitle: "Lo que opinan nuestros clientes",
  testimonialsSubtitle: "La satisfacción de nuestros usuarios impulsa lo que hacemos",
  testimonials: [],
  seo: {
    title: "Título de la Página",
    description: "Descripción de la página para motores de búsqueda.",
    keywords: [],
  },
  navigation: defaultNavigation,
  footer: defaultFooter,
};

export default function PublicLandingPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const firestore = useFirestore();
  
  const landingPageRef = useMemo(() => {
    if (!firestore || !businessId) return null;
    return doc(firestore, `businesses/${businessId}/landingPages`, 'config');
  }, [firestore, businessId]);

  const formConfigRef = useMemo(() => {
    if (!firestore || !businessId) return null;
    return doc(firestore, `businesses/${businessId}/landingPages`, 'form');
  }, [firestore, businessId]);

  const plansQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'subscriptionPlans'),
      orderBy('order', 'asc')
    );
  }, [firestore]);


  const { data: landingData, isLoading: isLandingLoading, error: landingError } = useDoc<LandingPageData>(landingPageRef);
  const { data: formConfig, isLoading: isFormLoading } = useDoc<FormConfigData>(formConfigRef);
  const { data: allPlans, isLoading: arePlansLoading } = useCollection<SubscriptionPlan>(plansQuery);

  const plans = useMemo(() => {
    if (!allPlans) return [];
    return allPlans.filter(plan => plan.isActive === true);
  }, [allPlans]);

  const displayData = useMemo(() => {
    if (isLandingLoading) return null; // Espera a que termine de cargar
    
    // Si hay datos, combínalos con los por defecto para asegurar que todos los campos existan
    if (landingData) {
        return {
            ...defaultLandingData,
            ...landingData,
            navigation: { ...defaultLandingData.navigation, ...(landingData.navigation || {}) },
            footer: { ...defaultLandingData.footer, ...(landingData.footer || {}) },
            sections: landingData.sections || [],
            testimonials: landingData.testimonials || [],
            seo: { ...defaultLandingData.seo, ...(landingData.seo || {}) },
        };
    }
    
    // Si no hay datos después de cargar y no hay error, significa que el documento no existe
    if (!landingData && !landingError) {
        return null;
    }

    return defaultLandingData; // Fallback en caso de error, para que no se rompa la vista

  }, [landingData, isLandingLoading, landingError]);
  
  const isLoading = isLandingLoading || isFormLoading || arePlansLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Cargando página...</p>
        </div>
      </div>
    );
  }

  if (landingError) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-center p-4">
        <div>
          <h1 className='text-2xl font-bold text-destructive'>Error al Cargar</h1>
          <p className='text-muted-foreground mt-2'>No se pudo cargar la configuración de la página. Es posible que el enlace no sea válido o haya un problema de permisos.</p>
        </div>
      </div>
    );
  }
  
  if (!displayData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-center p-4">
        <div>
          <h1 className='text-2xl font-bold'>Página no encontrada</h1>
          <p className='text-muted-foreground mt-2'>
            La página que buscas no existe o aún no se ha configurado.
          </p>
          <p className='text-xs text-muted-foreground mt-4'>
            Business ID: {businessId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <EditorLandingPreview 
          data={displayData} 
          formConfig={formConfig || undefined}
          businessId={businessId}
          plans={plans}
        />
      </main>
    </div>
  );
}
