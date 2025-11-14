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
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const [landingData, setLandingData] = useState<LandingPageData | null>(null);
  const [formConfig, setFormConfig] = useState<FormConfigData | null>(null);
  
  // Helper para agregar logs de debug
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const log = `[${timestamp}] ${message}`;
    console.log(log);
    setDebugInfo(prev => [...prev.slice(-9), log]); // Mantener últimos 10 logs
  };

  const defaultNavigation: HeaderConfig = useMemo(() => {
    const nav = {
      enabled: true,
      links: [
        { id: '1', text: 'Inicio', url: '#', order: 1, newTab: false },
        { id: '2', text: 'Servicios', url: '#', order: 2, newTab: false },
        { id: '3', text: 'Contacto', url: user ? `/contact/${user.uid}` : '#', order: 3, newTab: false },
        { id: '4', text: 'Catalogo', url: user ? `/catalog/${user.uid}` : '#', order: 4, newTab: false },
        { id: '5', text: 'Blog', url: '#', order: 5, newTab: false },
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
    addDebugLog(`DefaultNavigation creado para user: ${user?.uid || 'null'}`);
    return nav;
  }, [user]);

  const landingConfigRef = useMemo(() => {
    if (!firestore || !user) {
      addDebugLog('❌ No se puede crear ref: firestore o user null');
      return null;
    }
    const path = `businesses/${user.uid}/landingPages/config`;
    addDebugLog(`✅ Ref creada: ${path}`);
    return doc(firestore, path);
  }, [firestore, user]);

  const formConfigRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `businesses/${user.uid}/landingPages`, 'form');
  }, [firestore, user]);

  const { data: initialLandingData, isLoading: isLandingLoading } = useDoc<LandingPageData>(landingConfigRef);
  const { data: initialFormConfig, isLoading: isFormConfigLoading } = useDoc<FormConfigData>(formConfigRef);

  // EFECTO CRÍTICO: Inicialización única de datos
  useEffect(() => {
    // Evitar re-inicialización
    if (isInitialized) return;
    
    // Esperar a que termine de cargar
    if (isLandingLoading || !user) {
      addDebugLog(`⏳ Esperando... isLoading: ${isLandingLoading}, user: ${!!user}`);
      return;
    }

    addDebugLog('🔄 Iniciando carga de datos...');
    
    if (initialLandingData) {
      addDebugLog(`📥 Datos encontrados en Firestore`);
      addDebugLog(`   - Título: "${initialLandingData.title?.substring(0, 30)}..."`);
      
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
      addDebugLog(`✅ Datos cargados correctamente`);
    } else {
      addDebugLog(`⚠️ No hay datos en Firestore, usando defaults`);
      setLandingData({
        ...defaultLandingData,
        navigation: defaultNavigation,
        footer: defaultFooter
      });
    }
    
    setIsInitialized(true);
    addDebugLog(`✅ Inicialización completada`);
  }, [initialLandingData, isLandingLoading, user, isInitialized, defaultNavigation]);

  // Efecto separado para formConfig
  useEffect(() => {
    if (isFormConfigLoading) return;
    
    if (initialFormConfig) {
      addDebugLog(`📥 Form config cargado desde Firestore`);
      setFormConfig({ ...defaultFormConfig, ...initialFormConfig });
    } else {
      addDebugLog(`⚠️ No hay form config, usando defaults`);
      setFormConfig(defaultFormConfig);
    }
  }, [initialFormConfig, isFormConfigLoading]);
  
  const isLoading = isUserLoading || !isInitialized || !landingData || !formConfig;

  // Función para verificar datos en Firestore directamente
  const verifyFirestoreData = async () => {
    if (!landingConfigRef) return;
    
    try {
      addDebugLog('🔍 Verificando datos en Firestore...');
      const docSnap = await getDoc(landingConfigRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        addDebugLog(`✅ Documento existe en Firestore`);
        addDebugLog(`   Path: ${docSnap.ref.path}`);
        addDebugLog(`   Título: "${data.title?.substring(0, 30)}..."`);
        console.log('📄 Datos completos en Firestore:', data);
        toast({ title: "Verificación Exitosa", description: `Título en BD: "${data.title}"`});
      } else {
        addDebugLog(`❌ El documento NO existe en Firestore`);
        addDebugLog(`   Path que se intentó: ${landingConfigRef.path}`);
        toast({ variant: "destructive", title: "Verificación Fallida", description: "El documento no existe en la base de datos."});
      }
    } catch (error: any) {
      addDebugLog(`❌ Error al verificar: ${error.message}`);
      console.error(error);
      toast({ variant: "destructive", title: "Error de Verificación", description: "No se pudo leer la base de datos."});
    }
  };

  const handleSaveAll = async () => {
    if (!user || !firestore || !landingConfigRef || !formConfigRef || !landingData) {
        addDebugLog('❌ No se puede guardar: faltan requisitos');
        toast({ variant: 'destructive', title: 'Error', description: 'No se puede guardar. Usuario o conexión no disponible.' });
        return;
    }
    
    setIsSaving(true);
    addDebugLog('💾 Iniciando guardado...');
    
    try {
        const dataToSave = { ...landingData, updatedAt: serverTimestamp() };
        
        addDebugLog(`📤 Guardando en: ${landingConfigRef.path}`);
        addDebugLog(`   Título a guardar: "${landingData.title?.substring(0, 30)}..."`);
        
        await setDoc(landingConfigRef, dataToSave, { merge: true });
        await setDoc(formConfigRef, { ...formConfig, updatedAt: serverTimestamp() }, { merge: true });
        
        addDebugLog('✅ Guardado exitoso');
        
        setTimeout(() => verifyFirestoreData(), 1000);
        
        toast({ title: '¡Guardado!', description: 'Toda la configuración ha sido actualizada.' });
    } catch (error: any) {
        addDebugLog(`❌ Error al guardar: ${error.message}`);
        console.error("Error completo:", error);
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
      <Alert variant="default" className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 !text-blue-700" />
        <AlertTitle className="text-blue-800 font-semibold">Panel de Depuración (Usuario)</AlertTitle>
        <AlertDescription className="text-blue-700">
          <div className="text-xs space-y-1 max-h-32 overflow-y-auto font-mono">
            <strong>Logs (Usuario: {user?.uid?.substring(0, 8)}...):</strong>
            {debugInfo.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
          <Button size="sm" variant="outline" className="mt-2 text-blue-800 border-blue-300 hover:bg-blue-100" onClick={verifyFirestoreData}>
            Verificar Firestore
          </Button>
        </AlertDescription>
      </Alert>

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
                      <EditorLandingForm data={landingData} setData={setLandingData} />
                      <ShareLandingPage />
                  </TabsContent>
                   <TabsContent value="navigation">
                      <EditorNavigation data={landingData} setData={setLandingData} />
                  </TabsContent>
                  <TabsContent value="sections">
                      <EditorSections data={landingData} setData={setLandingData} />
                  </TabsContent>
                  <TabsContent value="testimonials">
                      <EditorTestimonials data={landingData} setData={setLandingData} />
                  </TabsContent>
                  <TabsContent value="seo">
                      <EditorSeo data={landingData} setData={setLandingData} />
                  </TabsContent>
                  <TabsContent value="form">
                      <FormEditor data={formConfig!} setData={setFormConfig} />
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