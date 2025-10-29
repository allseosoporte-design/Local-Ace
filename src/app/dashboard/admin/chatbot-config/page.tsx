
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  PlusCircle,
  Trash2,
  Settings,
  Palette,
  Bot,
  HelpCircle,
  Cpu,
  Save,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { ChatbotConfig, FAQ } from '@/types/chatbot';
import { v4 as uuidv4 } from 'uuid';

const FAQItem = ({ faq, onUpdate, onDelete }: { faq: FAQ, onUpdate: (updatedFaq: FAQ) => void, onDelete: () => void }) => (
  <div className="p-4 border rounded-lg bg-background space-y-4">
    <Input
      placeholder="Pregunta"
      value={faq.question}
      onChange={(e) => onUpdate({ ...faq, question: e.target.value })}
    />
    <Textarea
      placeholder="Respuesta"
      value={faq.answer}
      onChange={(e) => onUpdate({ ...faq, answer: e.target.value })}
    />
    <Input
      placeholder="Palabras clave (separadas por coma)"
      value={faq.keywords.join(', ')}
      onChange={(e) =>
        onUpdate({ ...faq, keywords: e.target.value.split(',').map(k => k.trim()) })
      }
    />
    <div className="flex justify-end">
      <Button variant="destructive" size="sm" onClick={onDelete}>
        <Trash2 className="h-4 w-4 mr-2" /> Eliminar
      </Button>
    </div>
  </div>
);

const defaultConfig: ChatbotConfig = {
    enabled: true,
    position: 'bottom-right',
    botName: 'Asistente Virtual',
    primaryColor: '#4285F4',
    welcomeMessage: '¡Hola! ¿Cómo puedo ayudarte hoy?',
    placeholderText: 'Escribe tu mensaje aquí...',
    showOnLoad: false,
    showDelay: 2,
    faqs: [
        {
      id: 'faq-1',
      question: '¿Qué es Local Leap?',
      answer: 'Local Leap es una plataforma SaaS (Software como Servicio) diseñada para ayudar a los dueños de negocios locales a optimizar su presencia online, especialmente en Google My Business (GMB). Te damos las herramientas para gestionar reseñas, crear publicaciones, construir una landing page y mucho más.',
      keywords: ['local leap', 'que es', 'aplicacion', 'plataforma', 'servicio']
    },
    {
      id: 'faq-2',
      question: '¿Para qué tipo de negocios es ideal Local Leap?',
      answer: 'Local Leap es ideal para cualquier negocio local que quiera mejorar su presencia en internet, como restaurantes, cafeterías, tiendas, salones de belleza, talleres y servicios profesionales. Si tienes un perfil de Google My Business, nuestra plataforma es para ti.',
      keywords: ['tipo de negocio', 'para quien', 'industrias', 'negocios']
    },
    {
      id: 'faq-3',
      question: '¿Cómo me ayuda Local Leap a conseguir más clientes?',
      answer: 'Te ayudamos a atraer más clientes mejorando tu reputación online con más reseñas positivas en Google, optimizando tu perfil para búsquedas locales (SEO), y dándote una landing page profesional para convertir visitantes en clientes.',
      keywords: ['clientes', 'conseguir', 'atraer', 'ventas']
    },
    {
      id: 'faq-4',
      question: '¿Necesito conocimientos técnicos para usar la plataforma?',
      answer: '¡No! Local Leap está diseñado para ser muy intuitivo y fácil de usar. No necesitas saber de código ni ser un experto en marketing digital. Nuestra interfaz te guía en cada paso.',
      keywords: ['conocimientos', 'tecnico', 'dificil', 'facil', 'usar']
    },
    {
      id: 'faq-5',
      question: '¿Es seguro usar Local Leap?',
      answer: 'Sí, la seguridad es nuestra máxima prioridad. Utilizamos Firebase de Google para garantizar que todos tus datos y los de tus clientes estén protegidos con los más altos estándares de seguridad.',
      keywords: ['seguro', 'seguridad', 'privacidad', 'datos']
    },
    {
      id: 'faq-6',
      question: '¿Cómo funciona el embudo de reseñas?',
      answer: 'Nuestro embudo de reseñas te permite conseguir más valoraciones de 5 estrellas en Google. Compartes un enlace único con tus clientes. Si te dan 5 estrellas, los dirigimos a tu perfil de Google para que dejen la reseña públicamente. Si la calificación es de 1 a 4 estrellas, les mostramos un formulario privado para que te envíen sus comentarios directamente a ti, protegiendo tu reputación.',
      keywords: ['embudo', 'reseñas', 'opiniones', 'valoraciones', 'rating']
    },
    {
      id: 'faq-7',
      question: '¿Puedo responder a las reseñas desde Local Leap?',
      answer: 'Sí, en la sección de "Reseñas" de tu panel, puedes ver tus reseñas públicas y utilizar nuestra IA para generar respuestas profesionales y personalizadas con un solo clic.',
      keywords: ['responder reseñas', 'contestar', 'ia', 'inteligencia artificial']
    },
    {
      id: 'faq-8',
      question: '¿Qué pasa con las reseñas negativas?',
      answer: 'Las reseñas con calificación de 1 a 4 estrellas se convierten en "feedback interno". No se publican en Google, sino que llegan a tu panel privado para que puedas analizar las áreas de mejora y contactar al cliente para solucionar el problema.',
      keywords: ['reseñas negativas', 'malas', 'feedback', 'comentarios negativos']
    },
    {
      id: 'faq-9',
      question: '¿Cómo optimizo mi perfil de Google My Business (GMB) con la app?',
      answer: 'En la sección "Perfil" de tu dashboard, puedes actualizar los detalles de tu negocio, subir fotos y, lo más importante, usar nuestra IA para generar palabras clave estratégicas que mejorarán tu posicionamiento en las búsquedas locales.',
      keywords: ['gmb', 'google my business', 'optimizar', 'perfil', 'seo']
    },
    {
      id: 'faq-10',
      question: '¿Puedo programar publicaciones para mi perfil de GMB?',
      answer: '¡Sí! Desde la sección "Publicaciones", puedes crear contenido, añadir imágenes y programar tus publicaciones para que se publiquen automáticamente en la fecha y hora que elijas. Esto mantiene tu perfil activo y atractivo para Google.',
      keywords: ['publicaciones', 'programar', 'posts', 'contenido']
    },
    {
      id: 'faq-11',
      question: '¿Qué es el Landing Page Builder?',
      answer: 'Es una herramienta que te permite crear una página web profesional para tu negocio sin necesidad de código. Puedes personalizar el diseño, añadir secciones, testimonios y configurar un formulario de contacto.',
      keywords: ['landing page', 'pagina web', 'constructor', 'sitio web', 'editor']
    },
    {
      id: 'faq-12',
      question: '¿La landing page es compatible con móviles?',
      answer: 'Sí, todas las landing pages creadas con nuestro constructor son completamente "responsive", lo que significa que se verán perfectas en cualquier dispositivo, ya sea un computador, una tablet o un teléfono móvil.',
      keywords: ['responsive', 'movil', 'celular', 'dispositivos']
    },
    {
      id: 'faq-13',
      question: '¿Puedo crear un catálogo de productos?',
      answer: 'Sí, puedes crear un catálogo digital completo en la sección "Catálogo". Sube tus productos con imágenes, descripciones, precios y stock. Este catálogo se puede compartir con tus clientes.',
      keywords: ['catalogo', 'productos', 'menu digital', 'inventario']
    },
    {
      id: 'faq-14',
      question: '¿Qué métodos de pago puedo configurar?',
      answer: 'Puedes configurar una amplia variedad de métodos de pago, incluyendo Nequi, Daviplata, Bancolombia, Stripe (tarjetas de crédito), Mercado Pago, PayPal y pago contra entrega. Tú eliges cuáles habilitar.',
      keywords: ['pago', 'metodos', 'pagar', 'nequi', 'daviplata', 'bancolombia', 'tarjeta', 'stripe', 'paypal']
    },
    {
      id: 'faq-15',
      question: '¿Qué puede ayudarme tu aplicación con mi negocio de computadores?',
      answer: '¡Hola! Gracias por tu interés. Nuestra aplicación "Local Leap" es perfecta para un negocio de computadores. Podemos ayudarte a crear un catálogo digital profesional, mejorar tu reputación online, tener tu propia página web optimizada para SEO y aumentar la interacción con tus clientes.',
      keywords: ['ayuda', 'aplicacion', 'negocio', 'computadores']
    },
    {
      id: 'faq-16',
      question: '¿Cuáles son los planes de precios?',
      answer: 'Ofrecemos varios planes que se adaptan a las necesidades de tu negocio, desde un plan básico hasta opciones más avanzadas con todas las funcionalidades. Puedes consultar los detalles en nuestra página principal.',
      keywords: ['precios', 'costo', 'planes', 'suscripcion', 'valor']
    },
    {
      id: 'faq-17',
      question: '¿Hay un plan gratuito?',
      answer: 'Actualmente no ofrecemos un plan gratuito, pero sí un período de prueba en nuestros planes de pago para que puedas explorar todas las funcionalidades sin compromiso.',
      keywords: ['gratis', 'prueba', 'free trial']
    },
    {
      id: 'faq-18',
      question: '¿Cómo se factura? ¿Mensual o anual?',
      answer: 'Ofrecemos flexibilidad. Puedes elegir un plan de facturación mensual o uno anual, con el cual obtienes un descuento significativo.',
      keywords: ['facturacion', 'pago', 'mensual', 'anual']
    },
    {
      id: 'faq-19',
      question: '¿Puedo cambiar de plan en cualquier momento?',
      answer: 'Sí, puedes cambiar de plan (hacer un "upgrade" o "downgrade") en cualquier momento desde la sección de "Configuración" y "Facturación" de tu panel.',
      keywords: ['cambiar plan', 'upgrade', 'downgrade']
    },
    {
      id: 'faq-20',
      question: '¿Qué pasa si cancelo mi suscripción?',
      answer: 'Si cancelas tu suscripción, seguirás teniendo acceso a tu cuenta hasta que finalice el período de facturación actual. Después, tu cuenta quedará inactiva, pero no eliminaremos tus datos inmediatamente por si decides volver.',
      keywords: ['cancelar', 'darse de baja', 'terminar suscripcion']
    },
    {
      id: 'faq-21',
      question: '¿Cómo me registro?',
      answer: 'Es muy fácil. Simplemente haz clic en el botón "Registrarse", completa el formulario con tu correo y contraseña, ¡y listo! Se creará tu cuenta y tu espacio de negocio automáticamente.',
      keywords: ['registro', 'registrarse', 'crear cuenta']
    },
    {
      id: 'faq-22',
      question: 'He olvidado mi contraseña, ¿qué hago?',
      answer: 'En la página de inicio de sesión, haz clic en el enlace "¿Olvidaste tu contraseña?". Podrás introducir tu correo electrónico para recibir instrucciones sobre cómo restablecerla.',
      keywords: ['contraseña', 'olvidado', 'restablecer', 'password']
    },
    {
      id: 'faq-23',
      question: '¿Dónde encuentro el enlace de mi landing page?',
      answer: 'Puedes encontrar y copiar el enlace público de tu landing page en la sección "Landing Page" de tu panel de control. Hay una tarjeta específica para compartir el enlace.',
      keywords: ['enlace', 'url', 'link', 'compartir landing']
    },
    {
      id: 'faq-24',
      question: '¿Cómo veo los mensajes de mi formulario de contacto?',
      answer: 'Todos los mensajes enviados a través de tu formulario de contacto público se pueden ver en la sección "Mensajes" de tu panel de control.',
      keywords: ['mensajes', 'contacto', 'bandeja de entrada', 'submissions']
    },
    {
      id: 'faq-25',
      question: '¿El catálogo de productos tiene carrito de compras?',
      answer: 'Sí, nuestro catálogo público incluye un carrito de compras. Tus clientes pueden añadir productos y finalizar el pedido, el cual te llegará como un mensaje de WhatsApp con todos los detalles.',
      keywords: ['carrito', 'compras', 'pedido', 'whatsapp']
    },
    {
      id: 'faq-26',
      question: '¿Qué es la marca blanca para agencias?',
      answer: 'La marca blanca es una funcionalidad para agencias de marketing que les permite usar nuestra plataforma y ofrecerla a sus propios clientes bajo su propia marca, sin que aparezca el nombre de Local Leap.',
      keywords: ['marca blanca', 'white label', 'agencias']
    },
    {
      id: 'faq-27',
      question: '¿Ofrecen soporte técnico?',
      answer: 'Sí, ofrecemos soporte técnico a nuestros usuarios. Puedes contactarnos a través del sistema de tickets de soporte en el panel de superadministrador o a nuestro correo de contacto.',
      keywords: ['soporte', 'ayuda tecnica', 'problema', 'asistencia']
    },
    {
      id: 'faq-28',
      question: '¿Hacen respaldos de mi información?',
      answer: 'Sí, realizamos respaldos periódicos de la base de datos para garantizar la seguridad y la integridad de tu información. Como superadministrador, también puedes iniciar respaldos manuales desde el panel.',
      keywords: ['respaldo', 'backup', 'copia de seguridad']
    },
    {
      id: 'faq-29',
      question: '¿Puedo exportar mis datos?',
      answer: 'Sí, desde el panel de superadministrador, en la sección de base de datos, tendrás opciones para exportar colecciones de datos, como tus productos o reseñas.',
      keywords: ['exportar', 'descargar datos', 'informacion']
    },
    {
      id: 'faq-30',
      question: '¿Qué es Genkit y cómo lo usan?',
      answer: 'Genkit es un framework de Google que utilizamos para integrar funcionalidades de inteligencia artificial en la aplicación, como la generación de respuestas a reseñas o la sugerencia de palabras clave.',
      keywords: ['genkit', 'ia', 'inteligencia artificial']
    },
    {
      id: 'faq-31',
      question: '¿Mi landing page tendrá un dominio personalizado?',
      answer: 'La landing page se crea con una URL bajo nuestro dominio, pero ofrecemos opciones en nuestros planes avanzados para conectarla a tu propio dominio personalizado (ej. www.tu-negocio.com).',
      keywords: ['dominio', 'personalizado', 'custom domain', 'url']
    },
    {
      id: 'faq-32',
      question: '¿Cuántos productos puedo añadir a mi catálogo?',
      answer: 'El número de productos que puedes añadir a tu catálogo depende del plan de suscripción que elijas. Nuestros planes superiores ofrecen un número ilimitado de productos.',
      keywords: ['limite productos', 'cuantos productos', 'catalogo']
    },
    {
      id: 'faq-33',
      question: '¿Puedo tener varios usuarios para mi negocio?',
      answer: 'La funcionalidad para múltiples usuarios por negocio está en nuestra hoja de ruta. Actualmente, cada cuenta de negocio está asociada a un único usuario administrador.',
      keywords: ['usuarios', 'equipo', 'multiples usuarios', 'roles']
    },
    {
      id: 'faq-34',
      question: '¿Qué es el panel de superadministrador?',
      answer: 'El panel de superadministrador es una sección especial para los administradores de la plataforma Local Leap. Desde aquí se pueden gestionar todos los clientes, planes, configuraciones globales y monitorear el estado del sistema.',
      keywords: ['superadmin', 'super administrador', 'panel admin']
    },
    {
      id: 'faq-35',
      question: '¿Cómo me convierto en superadministrador?',
      answer: 'El rol de superadministrador se asigna manualmente por el equipo de Local Leap a las cuentas de administración interna. No es un rol al que los usuarios generales puedan registrarse.',
      keywords: ['convertirse superadmin', 'ser admin']
    },
    {
      id: 'faq-36',
      question: '¿Qué es la sección de Auditoría?',
      answer: 'La sección de Auditoría, en el panel de superadmin, es un registro detallado de todas las acciones críticas que ocurren en la plataforma, como la creación de un plan o la eliminación de un negocio. Es una herramienta de seguridad y seguimiento.',
      keywords: ['auditoria', 'log', 'registro', 'actividad']
    },
    {
      id: 'faq-37',
      question: '¿Para qué sirve la sección de Mantenimiento?',
      answer: 'La sección de Mantenimiento permite a los superadministradores realizar tareas para asegurar el buen funcionamiento de la plataforma, como limpiar la caché, reindexar la base de datos o activar un modo de mantenimiento temporal.',
      keywords: ['mantenimiento', 'cache', 'reindexar']
    },
    {
      id: 'faq-38',
      question: '¿Puedo gestionar los planes que ofrezco a mis clientes?',
      answer: 'Sí, como superadministrador, tienes control total sobre los planes de suscripción desde la sección "Gestión de Planes". Puedes crear, editar, eliminar, reordenar y marcar planes como "populares".',
      keywords: ['gestionar planes', 'editar planes', 'crear plan']
    },
    {
      id: 'faq-39',
      question: '¿Cómo apruebo un pago pendiente?',
      answer: 'En el panel de superadmin, ve a "Pagos Pendientes". Verás una lista de pagos notificados por transferencia. Desde allí, puedes aprobarlos para activar la suscripción del cliente o rechazarlos.',
      keywords: ['aprobar pago', 'pagos pendientes', 'activar cliente']
    },
    {
      id: 'faq-40',
      question: '¿Qué son los recordatorios de pago?',
      answer: 'Es un sistema automático que, como superadmin, puedes configurar para enviar emails o mensajes a los clientes antes o después de que venza su suscripción, ayudando a reducir la tasa de abandono.',
      keywords: ['recordatorios', 'pago vencido', 'notificaciones pago']
    },
    {
      id: 'faq-41',
      question: '¿Puedo personalizar el chatbot para toda la plataforma?',
      answer: 'Sí, desde el panel de superadministrador, en "Configuración de Chatbot", puedes definir el comportamiento, la apariencia, las respuestas y la IA del chatbot que verán los visitantes en la página principal.',
      keywords: ['configurar chatbot', 'personalizar bot']
    },
    {
      id: 'faq-42',
      question: '¿Qué métricas puedo ver en los analytics del chatbot?',
      answer: 'Puedes ver métricas clave como el total de conversaciones, el número de mensajes por sesión, la tasa de satisfacción y la distribución de respuestas entre FAQs y la IA. También puedes ver un historial de las conversaciones.',
      keywords: ['analytics', 'metricas', 'estadisticas', 'chatbot']
    },
    {
      id: 'faq-43',
      question: '¿Qué es el editor de landing del superadmin?',
      answer: 'Es una herramienta en el panel de superadmin que te permite editar la página de inicio principal de Local Leap, la que ven todos los visitantes antes de registrarse o iniciar sesión.',
      keywords: ['editor landing', 'pagina principal', 'portada']
    },
    {
      id: 'faq-44',
      question: '¿Cómo se maneja el SEO para mi landing page?',
      answer: 'En el constructor de landing page, tienes una pestaña de "SEO" donde puedes definir el título, la descripción y las palabras clave para que los motores de búsqueda como Google puedan encontrar y posicionar mejor tu página.',
      keywords: ['seo', 'posicionamiento', 'google', 'meta tags']
    },
    {
      id: 'faq-45',
      question: '¿Las imágenes que subo están optimizadas?',
      answer: 'Sí, al subir imágenes a través de nuestra plataforma, utilizamos un servicio en la nube (Cloudinary) que las optimiza automáticamente para garantizar que se carguen rápidamente sin perder calidad.',
      keywords: ['imagenes', 'optimizar', 'cloudinary', 'velocidad']
    },
    {
      id: 'faq-46',
      question: '¿Qué tecnologías usa la aplicación?',
      answer: 'Nuestra aplicación está construida con tecnologías modernas y robustas, incluyendo Next.js, React, TailwindCSS para el frontend, y Firebase (Firestore, Auth) para el backend.',
      keywords: ['tecnologia', 'stack', 'nextjs', 'firebase', 'react']
    },
    {
      id: 'faq-47',
      question: '¿Dónde se alojan mis datos y mi página?',
      answer: 'Tu landing page y todos los datos de tu negocio se alojan de forma segura en la infraestructura de Google Cloud a través de los servicios de Firebase.',
      keywords: ['hosting', 'alojamiento', 'servidor', 'google cloud']
    },
    {
      id: 'faq-48',
      question: '¿Puedo integrar Local Leap con otras herramientas?',
      answer: 'Actualmente, ofrecemos integración directa con WhatsApp para pedidos. Estamos trabajando para añadir más integraciones en el futuro. ¡Mantente atento a nuestras actualizaciones!',
      keywords: ['integracion', 'api', 'conectar']
    },
    {
      id: 'faq-49',
      question: '¿Qué diferencia hay entre el feedback interno y una reseña pública?',
      answer: 'Una reseña pública aparece en tu perfil de Google y es visible para todos. El feedback interno es un comentario privado que un cliente te envía a través de nuestro embudo cuando su calificación es de 1 a 4 estrellas. Es una oportunidad para mejorar antes de que una mala experiencia se haga pública.',
      keywords: ['diferencia', 'feedback', 'reseña publica']
    },
     {
      id: 'faq-50',
      question: '¿Cuáles son los métodos de pago?',
      answer: 'Aceptamos tarjetas de crédito, PayPal y transferencias bancarias a través de pasarelas de pago seguras como Stripe y Mercado Pago. También puedes configurar opciones como Nequi, Daviplata y Bancolombia.',
      keywords: ['pago', 'métodos', 'tarjeta', 'paypal', 'nequi', 'stripe']
    }
  ],
    aiEnabled: true,
    systemPrompt: 'Eres un asistente amigable y profesional para el SaaS Local Leap.',
    temperature: 0.7,
    maxTokens: 150,
}

export default function ChatbotConfigPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [config, setConfig] = useState<ChatbotConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);

  const configDocRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'chatbot/config');
  }, [firestore]);

  const { data: loadedConfig, isLoading: isLoadingConfig, error } = useDoc<ChatbotConfig>(configDocRef);

  useEffect(() => {
    if (loadedConfig) {
      // If data is loaded from Firestore, set it, ensuring defaults for any missing fields.
      setConfig(prev => ({...defaultConfig, ...prev, ...loadedConfig}));
    } else if (!isLoadingConfig && !error) {
      // If no data is loaded and there's no error, it means the document doesn't exist.
      // We "seed" the database with our default configuration.
      const seedDatabase = async () => {
        if (configDocRef) {
          try {
            await setDoc(configDocRef, defaultConfig);
            setConfig(defaultConfig); // Ensure local state also has the default config
            toast({
              title: "Configuración inicial creada",
              description: "Se han guardado las 50 FAQs por defecto en la base de datos."
            });
          } catch (e) {
            console.error("Failed to seed chatbot config:", e);
            toast({
              variant: "destructive",
              title: "Error de inicialización",
              description: "No se pudo guardar la configuración inicial del chatbot."
            });
          }
        }
      };
      seedDatabase();
    }
  }, [loadedConfig, isLoadingConfig, error, configDocRef, toast]);


  const handleConfigChange = (field: keyof ChatbotConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const addFaq = () => {
    const newFaq: FAQ = { 
        id: uuidv4(),
        question: 'Nueva Pregunta', 
        answer: 'Nueva Respuesta', 
        keywords: [] 
    };
    handleConfigChange('faqs', [...config.faqs, newFaq]);
  };

  const updateFaq = (index: number, updatedFaq: FAQ) => {
    const newFaqs = [...config.faqs];
    newFaqs[index] = updatedFaq;
    handleConfigChange('faqs', newFaqs);
  };

  const deleteFaq = (index: number) => {
    handleConfigChange('faqs', config.faqs.filter((_, i) => i !== index));
  };
  
  const handleSaveConfiguration = async () => {
    if (!configDocRef) return;
    setIsSaving(true);
    try {
        await setDoc(configDocRef, { ...config, updatedAt: serverTimestamp() }, { merge: true });
        toast({
            title: '¡Guardado!',
            description: 'La configuración del chatbot se ha guardado correctamente.'
        });
    } catch (error) {
        console.error("Error saving chatbot config:", error);
        toast({
            variant: 'destructive',
            title: 'Error al Guardar',
            description: 'No se pudo guardar la configuración del chatbot.'
        });
    } finally {
        setIsSaving(false);
    }
  }

  if (isLoadingConfig && !config) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Configuración de Chatbot
          </h1>
          <p className="text-muted-foreground">
            Define el comportamiento, apariencia y respuestas de tu chatbot.
          </p>
        </div>
        <Button size="lg" onClick={handleSaveConfiguration} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar Configuración
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">
            <Settings className="mr-2 h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" /> Apariencia
          </TabsTrigger>
          <TabsTrigger value="behavior">
            <Bot className="mr-2 h-4 w-4" /> Comportamiento
          </TabsTrigger>
          <TabsTrigger value="faqs">
            <HelpCircle className="mr-2 h-4 w-4" /> FAQs
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Cpu className="mr-2 h-4 w-4" /> IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Activación y Posición</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <Label htmlFor="chatbot-enabled" className="font-semibold">
                  Activar Chatbot en el sitio
                </Label>
                <Switch 
                  id="chatbot-enabled" 
                  checked={config.enabled}
                  onCheckedChange={(val) => handleConfigChange('enabled', val)}
                />
              </div>
              <div className="space-y-2">
                <Label>Posición del Widget</Label>
                <Select 
                  value={config.position}
                  onValueChange={(val: 'bottom-right' | 'bottom-left') => handleConfigChange('position', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">Abajo a la Derecha</SelectItem>
                    <SelectItem value="bottom-left">Abajo a la Izquierda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia del Chatbot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre del Bot</Label>
                  <Input 
                    value={config.botName}
                    onChange={(e) => handleConfigChange('botName', e.target.value)}
                  />
                </div>
                 <div className="space-y-2">
                  <Label>Color Primario</Label>
                  <Input 
                    type="color" 
                    value={config.primaryColor} 
                    onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                    className='p-1 h-10'
                  />
                </div>
              </div>
               <div className="space-y-2">
                  <Label>Mensaje de Bienvenida</Label>
                  <Input 
                    value={config.welcomeMessage}
                    onChange={(e) => handleConfigChange('welcomeMessage', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Texto del Placeholder</Label>
                  <Input 
                    value={config.placeholderText}
                    onChange={(e) => handleConfigChange('placeholderText', e.target.value)}
                  />
                </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="behavior">
            <Card>
                 <CardHeader><CardTitle>Comportamiento del Chatbot</CardTitle></CardHeader>
                 <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <Label htmlFor="show-on-load" className="font-semibold">Mostrar automáticamente al cargar la página</Label>
                        <Switch 
                          id="show-on-load" 
                          checked={config.showOnLoad}
                          onCheckedChange={(val) => handleConfigChange('showOnLoad', val)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label>Retraso para mostrar (segundos)</Label>
                        <Input 
                          type="number" 
                          value={config.showDelay}
                          onChange={(e) => handleConfigChange('showDelay', Number(e.target.value))}
                        />
                    </div>
                 </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Preguntas Frecuentes</CardTitle>
                <Button onClick={addFaq}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Añadir FAQ
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.faqs.map((faq, index) => (
                <FAQItem
                  key={faq.id}
                  faq={faq}
                  onUpdate={(updatedFaq) => updateFaq(index, updatedFaq)}
                  onDelete={() => deleteFaq(index)}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ai">
            <Card>
                 <CardHeader><CardTitle>Configuración de IA</CardTitle></CardHeader>
                 <CardContent className="space-y-6">
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <Label htmlFor="ai-enabled" className="font-semibold">Habilitar respuestas con IA</Label>
                        <Switch 
                          id="ai-enabled" 
                          checked={config.aiEnabled}
                          onCheckedChange={(val) => handleConfigChange('aiEnabled', val)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label>Instrucción del Sistema (System Prompt)</Label>
                        <Textarea 
                          placeholder="Eres un asistente amigable y profesional..." 
                          value={config.systemPrompt}
                          onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Temperatura: {config.temperature}</Label>
                            <Slider 
                              value={[config.temperature]} 
                              min={0} max={1} step={0.1}
                              onValueChange={([val]) => handleConfigChange('temperature', val)}
                             />
                        </div>
                        <div className="space-y-2">
                            <Label>Máximo de Tokens</Label>
                            <Input 
                              type="number" 
                              value={config.maxTokens}
                              onChange={(e) => handleConfigChange('maxTokens', Number(e.target.value))}
                            />
                        </div>
                    </div>
                 </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
