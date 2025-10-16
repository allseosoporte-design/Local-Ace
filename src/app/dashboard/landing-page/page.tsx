
'use client';

import { useState, useEffect } from "react";
import { EditorLandingForm } from "@/components/editor-landing-form";
import { EditorLandingPreview, type LandingPageData } from "@/components/editor-landing-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditorSections } from "@/components/editor-sections";
import { EditorTestimonials } from "@/components/editor-testimonials";
import { EditorSeo } from "@/components/editor-seo";
import { FormEditor, type FormConfigData } from "@/components/dashboard/landing/FormEditor";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { Loader2 } from "lucide-react";
import { doc } from "firebase/firestore";

const defaultLandingData: LandingPageData = {
  title: "Tu Titular Atractivo Aquí",
  subtitle: "Describe tu negocio de una manera que entusiasme a tus clientes.",
  content: `Esta es tu oportunidad de brillar. Describe tu negocio con más detalle. Habla de lo que te hace especial, de tus productos estrella o de la experiencia que ofreces. Utiliza este espacio para conectar con tus visitantes.`,
  heroImageUrl: "https://picsum.photos/seed/15/1200/600",
  ctaText: "Contáctanos",
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
  }
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
  const { user } = useUser();
  const firestore = useFirestore();

  const [data, setData] = useState<LandingPageData>(defaultLandingData);
  const [formConfig, setFormConfig] = useState<FormConfigData>(defaultFormConfig);

  const formConfigRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `businesses/${user.uid}/landingPages`, 'form');
  }, [firestore, user]);

  const { data: initialFormConfig, isLoading: isFormConfigLoading } = useDoc<FormConfigData>(formConfigRef);

  useEffect(() => {
    if (initialFormConfig) {
      setFormConfig(initialFormConfig);
    }
  }, [initialFormConfig]);

  if (isFormConfigLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2">
            <Tabs defaultValue="hero">
                <TabsList>
                    <TabsTrigger value="hero">Principal</TabsTrigger>
                    <TabsTrigger value="sections">Secciones</TabsTrigger>
                    <TabsTrigger value="testimonials">Testimonios</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                    <TabsTrigger value="form">Formulario</TabsTrigger>
                </TabsList>
                <TabsContent value="hero">
                    <EditorLandingForm data={data} setData={setData} />
                </TabsContent>
                <TabsContent value="sections">
                    <EditorSections data={data} setData={setData} />
                </TabsContent>
                <TabsContent value="testimonials">
                    <EditorTestimonials data={data} setData={setData} />
                </TabsContent>
                 <TabsContent value="seo">
                    <EditorSeo data={data} setData={setData} />
                </TabsContent>
                <TabsContent value="form">
                    <FormEditor data={formConfig} setData={setFormConfig} />
                </TabsContent>
            </Tabs>
        </div>

      <div className="lg:col-span-1 bg-white rounded-lg shadow-lg overflow-y-auto">
         <EditorLandingPreview data={data} formConfig={formConfig} />
      </div>
    </div>
  );
}
