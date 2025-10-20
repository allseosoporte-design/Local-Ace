'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { EditorLandingPreview, type LandingPageData } from '@/components/editor-landing-preview';
import { Loader2 } from 'lucide-react';

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

  const landingPageRef = useMemoFirebase(() => {
    if (!firestore || !businessId) return null;
    // CORRECCIÓN FINAL: Ruta correcta con permisos de lectura públicos.
    return doc(firestore, `businesses/${businessId}/landingPages`, 'config');
  }, [firestore, businessId]);

  const { data: loadedData, isLoading } = useDoc<Partial<LandingPageData>>(landingPageRef);

  const displayData = useMemo(() => {
    if (isLoading) return null;

    if (!loadedData) {
      // Si no hay datos, en lugar de fallar, mostramos la data por defecto.
      // Esto es útil si el usuario aún no ha guardado nada.
      return defaultLandingData;
    }
    
    // Fusión profunda para asegurar que todas las propiedades existan.
    const merged: LandingPageData = {
      ...defaultLandingData,
      ...loadedData,
      sections: loadedData.sections || [],
      testimonials: loadedData.testimonials || [],
      seo: {
        ...defaultLandingData.seo,
        ...(loadedData.seo || {}),
        keywords: loadedData.seo?.keywords || [],
      }
    };
    return merged;
  }, [loadedData, isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!displayData) {
      // Esta condición ahora es menos probable que se cumpla, pero es una buena práctica mantenerla.
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-center p-4">
        <div>
          <h1 className='text-2xl font-bold'>Página no encontrada</h1>
          <p className='text-muted-foreground mt-2'>La página que buscas no existe o no se pudo cargar. Es posible que la configuración aún no se haya guardado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <EditorLandingPreview data={displayData} />
      </main>
      <footer className="flex items-center justify-center py-6 border-t bg-card">
        <p className="text-xs text-muted-foreground">&copy; 2024 Creado con Local Leap</p>
      </footer>
    </div>
  );
}
