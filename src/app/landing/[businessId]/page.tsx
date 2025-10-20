
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
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

  const [landingData, setLandingData] = useState<LandingPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !businessId) {
      setIsLoading(false);
      return;
    }

    const fetchLandingPageData = async () => {
      setIsLoading(true);
      try {
        const landingPagesRef = collection(firestore, `businesses/${businessId}/landingPages`);
        const querySnapshot = await getDocs(landingPagesRef);
        
        let combinedData: Partial<LandingPageData> = {};

        querySnapshot.forEach(doc => {
            const docId = doc.id;
            const docData = doc.data();

            if (docId === 'hero') {
                combinedData = { ...combinedData, ...docData };
            } else if (docId === 'sections') {
                 if (docData.sections) {
                    combinedData.sections = docData.sections;
                 }
            } else if (docId === 'testimonials') {
                if (docData.testimonials) {
                    combinedData.testimonials = docData.testimonials;
                    combinedData.testimonialsTitle = docData.testimonialsTitle;
                    combinedData.testimonialsSubtitle = docData.testimonialsSubtitle;
                }
            } else if (docId === 'seo') {
                if (docData.seo) {
                    combinedData.seo = docData.seo;
                }
            }
        });
        
        // Merge with defaults to ensure all fields are present
        setLandingData({ ...defaultLandingData, ...combinedData });

      } catch (error) {
        console.error("Error fetching landing page data:", error);
        setLandingData(defaultLandingData); // Fallback to default on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchLandingPageData();
  }, [firestore, businessId]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!landingData) {
    return (
         <div className="flex h-screen w-full items-center justify-center bg-background text-center">
            <div>
                <h1 className='text-2xl font-bold'>Página no encontrada</h1>
                <p className='text-muted-foreground'>La página que buscas no existe o no se pudo cargar.</p>
            </div>
        </div>
    );
  }

  return (
     <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <EditorLandingPreview data={landingData} />
      </main>
      <footer className="flex items-center justify-center py-6 border-t bg-card">
          <p className="text-xs text-muted-foreground">&copy; 2024 Creado con Local Leap</p>
      </footer>
    </div>
  );
}
