'use client';

import { useMemo, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { EditorLandingPreview, type LandingPageData } from '@/components/editor-landing-preview';
import { Loader2 } from 'lucide-react';
import type { FormConfigData } from '@/components/dashboard/landing/FormEditor';

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
  }
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

  // ✨ SOLUCIÓN: Usar onSnapshot para escuchar cambios en tiempo real
  useEffect(() => {
    if (!landingPageRef || !formConfigRef) {
      console.log('[PUBLIC] Referencias no disponibles');
      return;
    }

    console.log('[PUBLIC] Suscribiendo a cambios en:', landingPageRef.path);
    setIsLoading(true);
    setError(null);

    // Listener para landing page config
    const unsubscribeLanding = onSnapshot(
      landingPageRef,
      (docSnap) => {
        console.log('[PUBLIC] Snapshot recibido para landing page');
        
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<LandingPageData>;
          console.log('[PUBLIC] ✅ Datos cargados:', {
            title: data.title?.substring(0, 30),
            sections: data.sections?.length,
            testimonials: data.testimonials?.length
          });
          setLoadedData(data);
        } else {
          console.log('[PUBLIC] ⚠️ Documento no existe');
          setLoadedData(null);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('[PUBLIC] ❌ Error al cargar landing page:', err);
        setError('Error al cargar la página');
        setIsLoading(false);
      }
    );

    // Listener para form config
    const unsubscribeForm = onSnapshot(
      formConfigRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as FormConfigData;
          console.log('[PUBLIC] ✅ Form config cargado');
          setFormConfig(data);
        } else {
          console.log('[PUBLIC] ⚠️ Form config no existe');
          setFormConfig(null);
        }
      },
      (err) => {
        console.error('[PUBLIC] ❌ Error al cargar form config:', err);
      }
    );

    // Cleanup: cancelar suscripciones
    return () => {
      console.log('[PUBLIC] 🔌 Desconectando listeners');
      unsubscribeLanding();
      unsubscribeForm();
    };
  }, [landingPageRef, formConfigRef]);

  // Combinar datos con defaults
  const displayData = useMemo(() => {
    if (!loadedData) {
      console.log('[PUBLIC] No hay datos para mostrar');
      return null;
    }

    const merged: LandingPageData = {
      ...defaultLandingData,
      ...loadedData,
      sections: loadedData.sections || [],
      testimonials: loadedData.testimonials || [],
      seo: {
        ...defaultLandingData.seo,
        ...(loadedData.seo || {}),
        keywords: loadedData.seo?.keywords || [],
      },
      navigation: loadedData.navigation || defaultLandingData.navigation,
      footer: loadedData.footer || defaultLandingData.footer,
    };

    console.log('[PUBLIC] 🎨 Datos preparados para renderizar:', {
      title: merged.title?.substring(0, 30),
      sections: merged.sections?.length,
    });

    return merged;
  }, [loadedData]);

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
      <footer className="flex items-center justify-center py-6 border-t bg-card">
        <p className="text-xs text-muted-foreground">&copy; 2024 Creado con Local Leap</p>

      </footer>
    </div>
  );
}