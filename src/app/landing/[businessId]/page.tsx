'use client';

import { useMemo, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { EditorLandingPreview, type LandingPageData, type HeaderConfig, type FooterConfig } from '@/components/editor-landing-preview';
import { Loader2 } from 'lucide-react';
import type { FormConfigData } from '@/components/dashboard/landing/FormEditor';

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
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadedData, setLoadedData] = useState<Partial<LandingPageData> | null>(null);
  const [formConfig, setFormConfig] = useState<FormConfigData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Crear referencias a Firestore
  const landingPageRef = useMemo(() => {
    if (!firestore || !businessId) return null;
    return doc(firestore, `businesses/${businessId}/landingPages`, 'config');
  }, [firestore, businessId]);

  const formConfigRef = useMemo(() => {
    if (!firestore || !businessId) return null;
    return doc(firestore, `businesses/${businessId}/landingPages`, 'form');
  }, [firestore, businessId]);

  // Usar onSnapshot para escuchar cambios en tiempo real
  useEffect(() => {
    if (!landingPageRef || !formConfigRef) {
      setIsLoading(false);
      setError('ID de negocio no válido.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Listener para landing page config
    const unsubscribeLanding = onSnapshot(
      landingPageRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setLoadedData(docSnap.data() as Partial<LandingPageData>);
        } else {
          setLoadedData(null); // Documento no existe
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Error al cargar landing page:', err);
        setError('Error al cargar la página. Verifica los permisos.');
        setIsLoading(false);
      }
    );

    // Listener para form config
    const unsubscribeForm = onSnapshot(
      formConfigRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setFormConfig(docSnap.data() as FormConfigData);
        } else {
          setFormConfig(null);
        }
      },
      (err) => {
        console.error('Error al cargar form config:', err);
        // No establecer error principal para este, puede que no exista
      }
    );

    // Cleanup: cancelar suscripciones
    return () => {
      unsubscribeLanding();
      unsubscribeForm();
    };
  }, [landingPageRef, formConfigRef]);

  // Combinar datos con defaults
  const displayData = useMemo(() => {
    if (isLoading || !loadedData) {
      return null;
    }

    return {
      ...defaultLandingData,
      ...loadedData,
      navigation: {
        ...defaultLandingData.navigation,
        ...(loadedData.navigation || {}),
      },
      footer: {
        ...defaultLandingData.footer,
        ...(loadedData.footer || {}),
      },
      sections: loadedData.sections || [],
      testimonials: loadedData.testimonials || [],
      seo: {
        ...defaultLandingData.seo,
        ...(loadedData.seo || {}),
      },
    };
  }, [loadedData, isLoading]);

  // Estados de carga y error
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

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-center p-4">
        <div>
          <h1 className='text-2xl font-bold text-destructive'>Error</h1>
          <p className='text-muted-foreground mt-2'>{error}</p>
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
        />
      </main>
    </div>
  );
}
