
'use client';

import { useEffect, useState } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { EditorLandingPreview, type LandingPageData, type FormConfigData } from '@/components/editor-landing-preview';
import { Loader2 } from 'lucide-react';
import { HomeNav } from '@/components/home-nav';

const defaultData: LandingPageData = {
  title: "Optimiza tu Presencia en Google My Business",
  subtitle: "Local Leap te ayuda a gestionar tu reputación online, interactuar con clientes y mejorar tu ranking local.",
  content: `Descubre la revolución para tu NEGOCIO. Con nuestro menú digital interactivo, tus clientes explorarán tus platos con fotos de alta calidad y descripciones detalladas.`,
  heroImageUrl: "https://picsum.photos/seed/websapmax/1200/800",
  ctaText: "Comienza Ahora",
  ctaUrl: "/register",
  backgroundColor: "#FFFFFF",
  textColor: "#000000",
  buttonColor: "#FF4500",
  sections: [],
  testimonialsTitle: "Lo que opinan nuestros clientes",
  testimonialsSubtitle: "La satisfacción de nuestros usuarios impulsa lo que hacemos",
  testimonials: [],
  seo: {
    title: "Local Leap - Optimiza tu GMB",
    description: "La herramienta definitiva para potenciar tu negocio local.",
    keywords: ["google my business", "seo local", "reputación online"],
  }
};

const defaultFormConfig: FormConfigData = {
    redirectUrl: "https://www.google.com",
    notificationEmail: "",
    formTitle: "¿Cómo fue tu experiencia?",
    formSubtitle: "Tus comentarios nos ayudan a mejorar.",
    negativeFeedbackTitle: "Déjanos tus comentarios",
    negativeFeedbackSubtitle: "Lamentamos que tu experiencia no haya sido perfecta.",
    positiveFeedbackTitle: "¡Gracias por tu reseña!",
    positiveFeedbackSubtitle: "Nos alegra que hayas tenido una gran experiencia.",
    thankYouTitle: "¡Gracias!",
    thankYouSubtitle: "Tus comentarios son muy valiosos.",
};

// Se asume un ID de negocio estático para la página pública principal.
// En un escenario real multi-tenant, esto vendría de un subdominio o similar.
const PUBLIC_BUSINESS_ID = 'allseosoporte';

export default function Home() {
  const [pageData, setPageData] = useState<LandingPageData>(defaultData);
  const [formConfig, setFormConfig] = useState<FormConfigData>(defaultFormConfig);
  const firestore = useFirestore();

  const heroConfigRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, `businesses/${PUBLIC_BUSINESS_ID}/landingPages`, 'hero');
  }, [firestore]);

  const formConfigRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, `businesses/${PUBLIC_BUSINESS_ID}/landingPages`, 'form');
  }, [firestore]);

  const { data: heroData, isLoading: isHeroLoading } = useDoc<LandingPageData>(heroConfigRef);
  const { data: formConfigData, isLoading: isFormLoading } = useDoc<FormConfigData>(formConfigRef);

  useEffect(() => {
    if (heroData) {
      setPageData(prev => ({ ...prev, ...heroData }));
    }
  }, [heroData]);

  useEffect(() => {
    if (formConfigData) {
      setFormConfig(prev => ({...prev, ...formConfigData}));
    }
  }, [formConfigData]);
  
  const isLoading = isHeroLoading || isFormLoading;

  return (
    <div className="flex flex-col min-h-screen">
      <HomeNav />
      <main className="flex-1">
        {isLoading ? (
          <div className="flex h-[80vh] w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <EditorLandingPreview data={pageData} formConfig={formConfig} />
        )}
      </main>
      <footer className="flex items-center justify-center py-6 border-t">
          <p className="text-xs text-muted-foreground">&copy; 2024 Local Leap. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
