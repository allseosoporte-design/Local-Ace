'use client';

import { useState, useEffect, useMemo } from "react";
import { EditorLandingForm } from "@/components/editor-landing-form";
import { EditorLandingPreview, type LandingPageData, type HeaderConfig, type FooterConfig } from "@/components/editor-landing-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditorSections } from "@/components/editor-sections";
import { EditorTestimonials } from "@/components/editor-testimonials";
import { EditorSeo } from "@/components/editor-seo";
import { FormEditor, type FormConfigData } from "@/components/dashboard/landing/FormEditor";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { ShareLandingPage } from "@/components/dashboard/landing/share-landing-page";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { EditorNavigation } from "@/components/dashboard/landing/EditorNavigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

const defaultLandingData: LandingPageData = {
  title: "Tecnología que impulsa tu mundo",
  subtitle: "Soluciones innovadoras para tu negocio.",
  content: `Nos especializamos en la venta y reparación de computadores, ofreciendo un servicio de alta calidad y garantía.`,
  heroImageUrl: "https://picsum.photos/seed/15/1200/600",
  ctaText: "Explora nuestros productos",
  ctaUrl: "#contact",
  backgroundColor: "#FFFFFF",
  textColor: "#000000",
  buttonColor: "hsl(221, 89%, 60%)",
  sections: [],
  testimonialsTitle: "Lo que opinan nuestros clientes",
  testimonialsSubtitle: "La satisfacción de nuestros usuarios impulsa lo que hacemos",
  testimonials: [],
  seo: {
    title: "Tu Negocio - El Mejor Lugar en la Ciudad",
    description: "Describe tu negocio de una manera que entusiasme a tus clientes y les haga querer saber más.",
    keywords: ["palabra clave 1", "palabra clave 2", "tu ciudad"],
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
  footer: defaultFooter,
};

const defaultFormConfig: FormConfigData = {
  redirectUrl: "https://www.google.com/maps/search/?api=1&query=YOUR_BUSINESS_ID",
  notificationEmail: "tu@email.com",
  formTitle: "¿Cómo fue tu experiencia?",
  formSubtitle: "Tus comentarios nos ayudan a mejorar.",
  negativeFeedbackTitle: "Déjanos tus comentarios",
  negativeFeedbackSubtitle: "Lamentamos que tu experiencia no haya sido perfecta. Por favor, dinos cómo podemos mejorar.",
  positiveFeedbackTitle: "¡Gracias por tu reseña!",
  positiveFeedbackSubtitle: "Nos alegra que hayas tenido una gran experiencia. Ayuda a otros a descubrirnos compartiendo tu opinión en Google.",
  thankYouTitle: "¡Gracias!",
  thankYouSubtitle: "Tus comentarios son muy valiosos para nosotros.",
};

export default function LandingPageBuilder() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [landingData, setLandingData] = useState<LandingPageData | null>(null);
  const [formConfig, setFormConfig] = useState<FormConfigData | null>(null);
  
  const landingConfigRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `businesses/${user.uid}/landingPages`, 'config');
  }, [firestore, user]);

  const formConfigRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `businesses/${user.uid}/landingPages`, 'form');
  }, [firestore, user]);

  const { data: initialLandingData, isLoading: isLandingLoading } = useDoc<LandingPageData>(landingConfigRef);
  const { data: initialFormConfig, isLoading: isFormConfigLoading } = useDoc<FormConfigData>(formConfigRef);

  const defaultNavigation: HeaderConfig = useMemo(() => {
      const catalogUrl = user?.uid === 'DzH9Kc6eYqOih5Y705ebM0SzfZf2' ? '/catalog' : `/catalog/${user?.uid}`;
      return {
          enabled: true,
          links: [
            { id: '1', text: 'Inicio', url: '#', order: 1, newTab: false },
            { id: '2', text: 'Servicios', url: '#', order: 2, newTab: false },
            { id: '3', text: 'Contacto', url: user ? `/contact/${user.uid}` : '#', order: 3, newTab: false },
            { id: '4', text: 'Catálogo', url: catalogUrl, order: 4, newTab: false },
          ],
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
  }, [user]);

  useEffect(() => {
    if (!isLandingLoading && user) {
        if (initialLandingData) {
            const cleanData: LandingPageData = {
                ...defaultLandingData,
                ...initialLandingData,
                navigation: {
                    ...defaultNavigation,
                    ...(initialLandingData.navigation || {})
                },
                footer: {
                    ...defaultFooter,
                    ...(initialLandingData.footer || {})
                },
                sections: initialLandingData.sections || [],
                testimonials: initialLandingData.testimonials || [],
                seo: {
                    ...defaultLandingData.seo,
                    ...(initialLandingData.seo || {})
                }
            };
            setLandingData(cleanData);
        } else {
            setLandingData({
                ...defaultLandingData,
                navigation: defaultNavigation,
                footer: defaultFooter
            });
        }
    }
  }, [initialLandingData, isLandingLoading, user, defaultNavigation]);

  useEffect(() => {
    if (!isFormConfigLoading) {
        if (initialFormConfig) {
            setFormConfig({ ...defaultFormConfig, ...initialFormConfig });
        } else {
            setFormConfig(defaultFormConfig);
        }
    }
  }, [initialFormConfig, isFormConfigLoading]);
  
  const isLoading = isUserLoading || !landingData || !formConfig;

  const handleSaveAll = async () => {
    if (!user || !firestore || !landingConfigRef || !formConfigRef || !landingData) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se puede guardar. Usuario o conexión no disponible.' });
        return;
    }
    
    setIsSaving(true);
    
    try {
        await setDoc(landingConfigRef, { ...landingData, updatedAt: serverTimestamp() }, { merge: true });
        await setDoc(formConfigRef, { ...formConfig, updatedAt: serverTimestamp() }, { merge: true });
        
        toast({ title: '¡Guardado!', description: 'Toda la configuración ha sido actualizada.' });
    } catch (error: any) {
        console.error("Error al guardar:", error);
        toast({ variant: 'destructive', title: 'Error al Guardar', description: 'No se pudo guardar. Revisa la consola.' });
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Constructor de Landing Page</h1>
            <p className="text-muted-foreground">Personaliza y previsualiza la página de tu negocio.</p>
          </div>
          <Button size="lg" onClick={handleSaveAll} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar Toda la Configuración
          </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2">
              <Tabs defaultValue="hero">
                  <TabsList>
                      <TabsTrigger value="hero">Principal</TabsTrigger>
                      <TabsTrigger value="navigation">Navegación</TabsTrigger>
                      <TabsTrigger value="sections">Secciones</TabsTrigger>
                      <TabsTrigger value="testimonials">Testimonios</TabsTrigger>
                      <TabsTrigger value="seo">SEO</TabsTrigger>
                      <TabsTrigger value="form">Formulario</TabsTrigger>
                  </TabsList>
                  <TabsContent value="hero" className="space-y-6">
                      <EditorLandingForm data={landingData!} setData={setLandingData as React.Dispatch<React.SetStateAction<LandingPageData>>} />
                      <ShareLandingPage />
                  </TabsContent>
                   <TabsContent value="navigation">
                      <EditorNavigation data={landingData!} setData={setLandingData as React.Dispatch<React.SetStateAction<LandingPageData>>} />
                  </TabsContent>
                  <TabsContent value="sections">
                      <EditorSections data={landingData!} setData={setLandingData as React.Dispatch<React.SetStateAction<LandingPageData>>} />
                  </TabsContent>
                  <TabsContent value="testimonials">
                      <EditorTestimonials data={landingData!} setData={setLandingData as React.Dispatch<React.SetStateAction<LandingPageData>>} />
                  </TabsContent>
                  <TabsContent value="seo">
                      <EditorSeo data={landingData!} setData={setLandingData as React.Dispatch<React.SetStateAction<LandingPageData>>} />
                  </TabsContent>
                  <TabsContent value="form">
                      <FormEditor data={formConfig!} setData={setFormConfig as React.Dispatch<React.SetStateAction<FormConfigData>>} />
                  </TabsContent>
              </Tabs>
          </div>

        <div className="lg:col-span-1 bg-white rounded-lg shadow-lg overflow-y-auto">
          <EditorLandingPreview 
            data={landingData} 
            formConfig={formConfig!} 
            isPreview={true} 
            businessId={user?.uid} 
          />
        </div>
      </div>
    </div>
  );
}

    