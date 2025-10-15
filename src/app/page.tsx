
'use client';

import { useEffect, useState } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { EditorLandingPreview, type LandingPageData } from '@/components/editor-landing-preview';
import { Loader2 } from 'lucide-react';
import { HomeNav } from '@/components/home-nav';

const defaultData: LandingPageData = {
  title: "Optimiza tu Presencia en Google My Business",
  subtitle: "Local Leap te ayuda a gestionar tu reputación online, interactuar con clientes y mejorar tu ranking local.",
  content: `Descubre la revolución para tu NEGOCIO. Con nuestro menú digital interactivo, tus clientes explorarán tus platos con fotos de alta calidad y descripciones detalladas.`,
  heroImageUrl: "https://picsum.photos/seed/websapmax/1200/800",
  ctaText: "Deja tu Reseña",
  ctaUrl: "", // Será actualizado dinámicamente
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


// Se asume un ID de negocio estático para la página pública principal.
// En un escenario real multi-tenant, esto vendría de un subdominio o similar.
const PUBLIC_BUSINESS_ID = 'allseosoporte';

export default function Home() {
  const [pageData, setPageData] = useState<LandingPageData>(defaultData);
  const firestore = useFirestore();

  const heroConfigRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, `businesses/${PUBLIC_BUSINESS_ID}/landingPages`, 'hero');
  }, [firestore]);

  
  const { data: heroData, isLoading: isHeroLoading } = useDoc<LandingPageData>(heroConfigRef);
  
  useEffect(() => {
    if (heroData) {
      // Combina los datos de Firestore con los datos por defecto
      // y establece la URL del CTA dinámicamente.
      setPageData(prev => ({ 
        ...prev, 
        ...heroData,
        ctaUrl: `/funnel/${PUBLIC_BUSINESS_ID}` // Redirige siempre al embudo
      }));
    } else {
      // Si no hay datos, usa los por defecto y establece la URL del CTA
      setPageData(prev => ({
        ...prev,
        ctaUrl: `/funnel/${PUBLIC_BUSINESS_ID}`
      }));
    }
  }, [heroData]);
  
  const isLoading = isHeroLoading;

  return (
    <div className="flex flex-col min-h-screen">
      <HomeNav />
      <main className="flex-1">
        {isLoading ? (
          <div className="flex h-[80vh] w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <EditorLandingPreview data={pageData} />
        )}
      </main>
      <footer className="flex items-center justify-center py-6 border-t">
          <p className="text-xs text-muted-foreground">&copy; 2024 Local Leap. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
