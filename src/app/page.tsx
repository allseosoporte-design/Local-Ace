'use client';

import { useMemo, useEffect, useState, useRef } from 'react';
import { EditorLandingPreview, type LandingPageData } from '@/components/editor-landing-preview';
import { HomeNav } from '@/components/home-nav';
import { SUPER_ADMIN_BUSINESS_ID } from '@/lib/constants';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import type { FormConfigData } from '@/components/dashboard/landing/FormEditor';
import type { SubscriptionPlan } from '@/types/subscription-plan';

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
  },
  navigation: {
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
  },
  footer: {
      enabled: true,
      copyrightText: `© ${new Date().getFullYear()} Tu Negocio. Todos los derechos reservados.`,
      columns: [],
      socialLinks: [],
      address: '',
      phone: '',
      email: '',
      backgroundColor: '#F8F9FA',
      textColor: '#333333',
      iconColor: '#4169E1'
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

  const landingPageRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, `businesses/${SUPER_ADMIN_BUSINESS_ID}/landingPages`, 'config');
  }, [firestore]);

  const formConfigRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, `businesses/${SUPER_ADMIN_BUSINESS_ID}/landingPages`, 'form');
  }, [firestore]);

  // Query para obtener los planes de suscripción
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

  // Filtrar planes activos en memoria
  const plans = useMemo(() => {
    if (!allPlans) return [];
    return allPlans.filter(plan => plan.isActive === true);
  }, [allPlans]);

  const isLoading = isLandingLoading || isFormLoading || arePlansLoading;

  const displayData = useMemo(() => {
    const finalData = { ...defaultLandingData, ...landingData };
    finalData.sections = finalData.sections || [];
    finalData.testimonials = finalData.testimonials || [];
    finalData.seo = { ...defaultLandingData.seo, ...(finalData.seo || {}) };
    finalData.navigation = { ...defaultLandingData.navigation, ...(finalData.navigation || {}) };
    finalData.footer = { ...defaultLandingData.footer, ...(finalData.footer || {}) };
    return finalData;
  }, [landingData]);

  if (isLoading || !displayData) {
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
          businessId={SUPER_ADMIN_BUSINESS_ID}
          plans={plans}
        />
      </main>
      <footer className="flex items-center justify-center py-6 border-t bg-card">
          <p className="text-xs text-muted-foreground">&copy; 2024 Creado con Local Leap</p>
      </footer>
    </div>
  );
}
