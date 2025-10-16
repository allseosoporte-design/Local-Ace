
'use client';

import { EditorLandingPreview, type LandingPageData } from '@/components/editor-landing-preview';
import { HomeNav } from '@/components/home-nav';
import { SUPER_ADMIN_BUSINESS_ID } from '@/lib/constants';

const defaultData: LandingPageData = {
  title: "Optimiza tu Presencia en Google My Business",
  subtitle: "Local Leap te ayuda a gestionar tu reputación online, interactuar con clientes y mejorar tu ranking local.",
  content: `Descubre la revolución para tu NEGOCIO. Con nuestro menú digital interactivo, tus clientes explorarán tus platos con fotos de alta calidad y descripciones detalladas.`,
  heroImageUrl: "https://picsum.photos/seed/websapmax/1200/800",
  ctaText: "Deja tu Reseña",
  ctaUrl: `/funnel/${SUPER_ADMIN_BUSINESS_ID}`, // Use the correct, centralized business ID
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


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HomeNav />
      <main className="flex-1">
        <EditorLandingPreview data={defaultData} />
      </main>
      <footer className="flex items-center justify-center py-6 border-t">
          <p className="text-xs text-muted-foreground">&copy; 2024 Local Leap. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
