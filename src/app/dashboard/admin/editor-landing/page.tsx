'use client';

import { useState, useMemo, useEffect } from "react";
import { EditorLandingForm } from "@/components/editor-landing-form";
import { EditorLandingPreview, type LandingPageData } from "@/components/editor-landing-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditorSections } from "@/components/editor-sections";
import { EditorTestimonials } from "@/components/editor-testimonials";
import { EditorSeo } from "@/components/editor-seo";
import { useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, setDoc, serverTimestamp, collection, query, orderBy } from "firebase/firestore";
import { SUPER_ADMIN_BUSINESS_ID } from "@/lib/constants";
import { Loader2, Save } from "lucide-react";
import type { SubscriptionPlan } from "@/types/subscription-plan";
import type { FormConfigData } from "@/components/dashboard/landing/FormEditor";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AdminEditorNavigation } from "@/components/admin/landing/AdminEditorNavigation";
import { AdminShareLandingPage } from "@/components/admin/landing/AdminShareLandingPage";

const defaultLandingData: LandingPageData = {
  title: "Moderniza tu negocio y aumenta tus ventas.",
  subtitle: "La herramienta definitiva para potenciar tu negocio gastronómico.",
  content: `Descubre la revolución para tu NEGOCIO.`,
  heroImageUrl: "https://picsum.photos/seed/websapmax/1200/800",
  ctaText: "Comenzar",
  ctaUrl: "/register",
  backgroundColor: "#FFFFFF",
  textColor: "#000000",
  buttonColor: "#FF4500",
  sections: [],
  testimonialsTitle: "Lo que opinan nuestros clientes",
  testimonialsSubtitle: "La satisfacción de nuestros usuarios impulsa lo que hacemos",
  testimonials: [],
  seo: {
    title: "Local Leap - Potencia tu Negocio",
    description: "La plataforma todo en uno para optimizar tu presencia en Google My Business.",
    keywords: ["Google My Business", "SEO Local", "gestión de reseñas"],
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
      logoText: "Local Leap",
      logoWidth: 120,
      logoAlignment: 'left'
  },
  footer: {
      enabled: true,
      copyrightText: `© ${new Date().getFullYear()} Local Leap. Todos los derechos reservados.`,
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


export default function EditorLandingPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [localData, setLocalData] = useState<LandingPageData | null>(null);

  const landingPageRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, `businesses/${SUPER_ADMIN_BUSINESS_ID}/landingPages`, 'config');
  }, [firestore]);

  const formConfigRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, `businesses/${SUPER_ADMIN_BUSINESS_ID}/landingPages`, 'form');
  }, [firestore]);

  const plansQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'subscriptionPlans'),
      orderBy('order', 'asc')
    );
  }, [firestore]);

  const { data: initialLandingData, isLoading: isLandingLoading } = useDoc<LandingPageData>(landingPageRef);
  const { data: formConfig, isLoading: isFormLoading } = useDoc<FormConfigData>(formConfigRef);
  const { data: allPlans, isLoading: arePlansLoading } = useCollection<SubscriptionPlan>(plansQuery);

  const plans = useMemo(() => {
    if (!allPlans) return [];
    return allPlans.filter(plan => plan.isActive === true);
  }, [allPlans]);

  useEffect(() => {
    if (initialLandingData) {
      setLocalData(initialLandingData);
    } else if (!isLandingLoading) {
      setLocalData(defaultLandingData);
    }
  }, [initialLandingData, isLandingLoading]);

  const isLoading = isLandingLoading || isFormLoading || arePlansLoading || !localData;

  const handleSave = async () => {
    if (!localData || !landingPageRef) return;
    setIsSaving(true);
    try {
        await setDoc(landingPageRef, { ...localData, updatedAt: serverTimestamp() }, { merge: true });
        toast({ title: '¡Guardado!', description: 'La configuración de la página principal se ha actualizado.' });
    } catch (error) {
        console.error("Error saving landing page config:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la configuración.' });
    } finally {
        setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Editor Landing Principal</h1>
            <p className="text-muted-foreground">
            Edita la configuración de la página de inicio pública de la aplicación.
            </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
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
            </TabsList>
            <TabsContent value="hero" className="space-y-6">
              <EditorLandingForm data={localData} setData={setLocalData} />
              <AdminShareLandingPage />
            </TabsContent>
            <TabsContent value="navigation">
                <AdminEditorNavigation data={localData} setData={setLocalData} />
            </TabsContent>
            <TabsContent value="sections">
              <EditorSections data={localData} setData={setLocalData} />
            </TabsContent>
            <TabsContent value="testimonials">
              <EditorTestimonials data={localData} setData={setLocalData} />
            </TabsContent>
            <TabsContent value="seo">
              <EditorSeo data={localData} setData={setLocalData} />
            </TabsContent>
          </Tabs>
        </div>
        <div className="lg:col-span-1 bg-white rounded-lg shadow-lg overflow-y-auto">
          <EditorLandingPreview 
            key={SUPER_ADMIN_BUSINESS_ID}
            data={localData} 
            formConfig={formConfig || undefined}
            businessId={SUPER_ADMIN_BUSINESS_ID}
            plans={plans}
            isPreview={true} 
          />
        </div>
      </div>
    </div>
  );
}
