'use client';

import { useState, useMemo, useEffect } from "react";
import { EditorLandingForm } from "@/components/editor-landing-form";
import { EditorLandingPreview, type LandingPageData } from "@/components/editor-landing-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditorSections } from "@/components/editor-sections";
import { EditorTestimonials } from "@/components/editor-testimonials";
import { EditorSeo } from "@/components/editor-seo";
import { useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, setDoc, serverTimestamp, collection, query, orderBy, getDoc } from "firebase/firestore";
import { SUPER_ADMIN_BUSINESS_ID } from "@/lib/constants";
import { Loader2, Save, AlertCircle } from "lucide-react";
import type { SubscriptionPlan } from "@/types/subscription-plan";
import type { FormConfigData } from "@/components/dashboard/landing/FormEditor";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AdminEditorNavigation } from "@/components/admin/landing/AdminEditorNavigation";
import { AdminShareLandingPage } from "@/components/admin/landing/AdminShareLandingPage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


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
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Helper para agregar logs de debug
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const log = `[${timestamp}] ${message}`;
    console.log(`[SUPER-ADMIN-EDITOR] ${log}`);
    setDebugInfo(prev => [...prev.slice(-9), log]);
  };

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
    return query(collection(firestore, 'subscriptionPlans'), orderBy('order', 'asc'));
  }, [firestore]);

  const { data: initialLandingData, isLoading: isLandingLoading } = useDoc<LandingPageData>(landingPageRef);
  const { data: formConfig, isLoading: isFormLoading } = useDoc<FormConfigData>(formConfigRef);
  const { data: allPlans, isLoading: arePlansLoading } = useCollection<SubscriptionPlan>(plansQuery);

  const plans = useMemo(() => {
    if (!allPlans) return [];
    return allPlans.filter(plan => plan.isActive === true);
  }, [allPlans]);

  useEffect(() => {
    addDebugLog('Effect triggered: [initialLandingData, isLandingLoading]');
    if (isLandingLoading) {
      addDebugLog('⏳ Esperando datos de landing page...');
      return;
    }
    if (initialLandingData) {
      addDebugLog('📥 Datos de landing page cargados desde Firestore.');
      setLocalData({ ...defaultLandingData, ...initialLandingData });
    } else {
      addDebugLog('⚠️ No hay datos, usando defaults.');
      setLocalData(defaultLandingData);
    }
  }, [initialLandingData, isLandingLoading]);

  const isLoading = isLandingLoading || isFormLoading || arePlansLoading || !localData;

  const handleSave = async () => {
    if (!localData || !landingPageRef) return;
    setIsSaving(true);
    addDebugLog('💾 Guardando datos...');
    try {
        await setDoc(landingPageRef, { ...localData, updatedAt: serverTimestamp() }, { merge: true });
        toast({ title: '¡Guardado!', description: 'La configuración de la página principal se ha actualizado.' });
        addDebugLog('✅ Guardado exitoso.');
    } catch (error) {
        addDebugLog(`❌ Error al guardar: ${error}`);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la configuración.' });
    } finally {
        setIsSaving(false);
    }
  };
  
  const verifyFirestoreData = async () => {
    if (!landingPageRef) return;
    addDebugLog('🔍 Verificando datos...');
    try {
      const docSnap = await getDoc(landingPageRef);
      if (docSnap.exists()) {
        toast({ title: "Verificación Exitosa", description: `Título en BD: "${docSnap.data().title}"`});
      } else {
        toast({ variant: "destructive", title: "Verificación Fallida", description: "El documento no existe en la base de datos."});
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error de Verificación", description: e.message });
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
      <Alert variant="default" className="bg-orange-50 border-orange-200 mb-6">
        <AlertCircle className="h-4 w-4 !text-orange-700" />
        <AlertTitle className="text-orange-800 font-semibold">Panel de Depuración (Super Admin)</AlertTitle>
        <AlertDescription className="text-orange-700">
          <div className="text-xs space-y-1 max-h-32 overflow-y-auto font-mono">
            <strong>Logs (Super Admin):</strong>
            {debugInfo.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
          <Button size="sm" variant="outline" className="mt-2 text-orange-800 border-orange-300 hover:bg-orange-100" onClick={verifyFirestoreData}>
            Verificar Firestore
          </Button>
        </AlertDescription>
      </Alert>

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
              <EditorLandingForm data={localData!} setData={setLocalData as React.Dispatch<React.SetStateAction<LandingPageData>>} />
              <AdminShareLandingPage />
            </TabsContent>
            <TabsContent value="navigation">
                <AdminEditorNavigation data={localData!} setData={setLocalData} />
            </TabsContent>
            <TabsContent value="sections">
              <EditorSections data={localData!} setData={setLocalData as React.Dispatch<React.SetStateAction<LandingPageData>>} />
            </TabsContent>
            <TabsContent value="testimonials">
              <EditorTestimonials data={localData!} setData={setLocalData as React.Dispatch<React.SetStateAction<LandingPageData>>} />
            </TabsContent>
            <TabsContent value="seo">
              <EditorSeo data={localData!} setData={setLocalData as React.Dispatch<React.SetStateAction<LandingPageData>>} />
            </TabsContent>
          </Tabs>
        </div>
        <div className="lg:col-span-1 bg-white rounded-lg shadow-lg overflow-y-auto">
          <EditorLandingPreview 
            key={SUPER_ADMIN_BUSINESS_ID}
            data={localData!} 
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
    
