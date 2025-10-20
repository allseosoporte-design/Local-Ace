'use client';

import { useMemo, useEffect, useState, useRef } from 'react';
import { EditorLandingPreview, type LandingPageData } from '@/components/editor-landing-preview';
import { HomeNav } from '@/components/home-nav';
import { SUPER_ADMIN_BUSINESS_ID } from '@/lib/constants';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import type { FormConfigData } from '@/components/dashboard/landing/FormEditor';

const defaultLandingData: LandingPageData = {
  title: "Moderniza tu negocio y aumenta tus ventas.",
  subtitle: "La herramienta definitiva para potenciar tu negocio gastronómico.",
  content: `Descubre la revolución para tu NEGOCIO. ¿Tienes una cafetería, pizzería, food truck, panadería, pastelería, servicio de catering o cualquier otro negocio gastronómico? ¡Esta solución es para ti!

Con nuestro menú digital interactivo, tus clientes explorarán tus platos con fotos de alta calidad y descripciones detalladas, facilitando su elección y aumentando su satisfacción.

Además, nuestro sistema de gestión integral te permite controlar cada aspecto de tu negocio: desde el inventario y los pedidos hasta las mesas y el personal, todo en una sola plataforma.

Optimiza tu operación, reduce costos y toma decisiones más inteligentes con datos en tiempo real. Es la solución completa para llevar tu restaurante a un nuevo nivel de eficiencia y rentabilidad.`,
  heroImageUrl: "https://picsum.photos/seed/websapmax/1200/800",
  ctaText: "Comenzar",
  ctaUrl: "/register",
  backgroundColor: "#FFFFFF",
  textColor: "#000000",
  buttonColor: "#FF4500",
  sections: [],
  testimonialsTitle: "Lo que opinan nuestros clientes",
  testimonialsSubtitle: "La satisfacción de nuestros usuarios impulsa lo que hacemos",
  testimonials: [
    {
      id: "1",
      authorName: "Ana López",
      authorRole: "Dueña, Restaurante Sabor del Sol",
      text: "¡Local Leap ha transformado mi negocio! Mis ventas han aumentado un 30% desde que implementé el menú digital.",
      avatarUrl: "https://picsum.photos/seed/testi1/100/100",
      rating: 5,
    },
    {
      id: "2",
      authorName: "Juan Martínez",
      authorRole: "Gerente, Burger Hub",
      text: "La gestión de pedidos y mesas es increíblemente intuitiva. He reducido los errores en las órdenes a casi cero.",
      avatarUrl: "https://picsum.photos/seed/testi2/100/100",
      rating: 5,
    }
  ],
  seo: {
    title: "Moderniza tu negocio y aumenta tus ventas",
    description: "Descubre la revolución para tu NEGOCIO. Con nuestro menú digital interactivo, tus clientes explorarán tus platos con fotos de alta calidad y descripciones detalladas, facilitando su elección y aumentando su satisfacción.",
    keywords: ["Aumenta tus ventas", "Negocio digital", "Herramientas tecnológicas", "Éxito empresarial"],
  }
};

export default function Home() {
  const firestore = useFirestore();
  const [renderKey, setRenderKey] = useState(0);
  const isMountedRef = useRef(false);

  // Forzar re-render completo al montar el componente
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      setRenderKey(prev => prev + 1);
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const landingPageRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, `businesses/${SUPER_ADMIN_BUSINESS_ID}/landingPages`, 'config');
  }, [firestore]);

  const formConfigRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, `businesses/${SUPER_ADMIN_BUSINESS_ID}/landingPages`, 'form');
  }, [firestore]);

  const { data: landingData, isLoading: isLandingLoading } = useDoc<LandingPageData>(landingPageRef);
  const { data: formConfig, isLoading: isFormLoading } = useDoc<FormConfigData>(formConfigRef);

  const isLoading = isLandingLoading || isFormLoading;

  const displayData = useMemo(() => {
    // No procesar hasta que la carga haya terminado
    if (isLoading) {
      return null;
    }
    
    // Si existen datos en Firestore, fusiónalos con los por defecto para asegurar que todos los campos existan.
    // Si no existen, usa los por defecto.
    const finalLandingData = landingData ? { ...defaultLandingData, ...landingData } : defaultLandingData;
    
    // Asegurar que las arrays existan
    finalLandingData.sections = finalLandingData.sections || [];
    finalLandingData.testimonials = finalLandingData.testimonials || [];
    finalLandingData.seo = { ...defaultLandingData.seo, ...(finalLandingData.seo || {})};
    
    return finalLandingData;
  }, [isLoading, landingData]);

  if (!displayData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div key={`home-superadmin-${renderKey}`} className="flex flex-col min-h-screen">
      <HomeNav />
      <main className="flex-1">
        <EditorLandingPreview 
          key={`preview-superadmin-${renderKey}`}
          data={displayData} 
          formConfig={formConfig || undefined} 
        />
      </main>
      <footer className="flex items-center justify-center py-6 border-t bg-card">
          <p className="text-xs text-muted-foreground">&copy; 2024 Creado con Local Leap</p>
      </footer>
    </div>
  );
}
