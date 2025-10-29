'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { ChatbotConfig, FAQ } from '@/types/chatbot';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const mockConfig: ChatbotConfig = {
    enabled: true,
    position: 'bottom-right',
    botName: 'Asistente Virtual',
    primaryColor: '#4285F4',
    welcomeMessage: '¡Hola! ¿Cómo puedo ayudarte hoy?',
    placeholderText: 'Escribe tu mensaje...',
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

export default function ChatbotWidget() {
  const firestore = useFirestore();
  const configDocRef = doc(firestore, 'chatbot/config');
  const { data: loadedConfig, isLoading: isLoadingConfig } = useDoc<ChatbotConfig>(configDocRef);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const config = loadedConfig || mockConfig;

  useEffect(() => {
    if (config?.showOnLoad && !isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, config.showDelay * 1000);
      return () => clearTimeout(timer);
    }
  }, [config, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (config?.welcomeMessage && messages.length === 0) {
        setMessages([{
            id: '1',
            text: config.welcomeMessage,
            sender: 'bot',
            timestamp: new Date()
        }]);
    }
  }, [config, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const findResponse = (userInput: string): string => {
    const inputLower = userInput.toLowerCase().trim();
    
    if (!config || !config.faqs) {
        return 'Lo siento, no tengo información sobre eso. ¿Puedo ayudarte con algo más?';
    }

    let bestMatch = { score: 0, faq: config.faqs[0] };

    for (const faq of config.faqs) {
        let currentScore = 0;
        const questionLower = faq.question.toLowerCase();

        // 1. Coincidencia exacta = retorno inmediato
        if (questionLower === inputLower) {
            return faq.answer;
        }

        // 2. Buscar keywords completas en el input (prioridad alta)
        for (const keyword of faq.keywords) {
            const keywordLower = keyword.toLowerCase();
            if (inputLower.includes(keywordLower)) {
                currentScore += 50;
            }
        }

        // 3. Buscar palabras de keywords individualmente
        const keywordWords = faq.keywords.flatMap(k => k.toLowerCase().split(/\s+/)).filter(w => w.length > 2);
        const inputWords = inputLower.split(/\s+/).filter(w => w.length > 2);
        
        for (const word of inputWords) {
            if (keywordWords.includes(word)) {
                currentScore += 10;
            }
        }

        // 4. Coincidencia en la pregunta
        const questionWords = questionLower.split(/\s+/).filter(w => w.length > 2);
        for (const word of inputWords) {
            if (questionWords.includes(word)) {
                currentScore += 5;
            }
        }

        if (currentScore > bestMatch.score) {
            bestMatch = { score: currentScore, faq };
        }
    }

    // Retornar la mejor respuesta si supera el umbral
    return bestMatch.score >= 10 ? bestMatch.faq.answer : 'Lo siento, no tengo información sobre eso. ¿Puedo ayudarte con algo más?';
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !config) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate API call and bot response
    setTimeout(() => {
        const response = findResponse(inputValue);
        const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: response,
            sender: 'bot',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
    }, 1000);
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoadingConfig) {
      return null; // Or a loading spinner if you prefer
  }

  if (!config || !config.enabled) return null;

  return (
    <>
      {/* Botón flotante */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`fixed ${
              config.position === 'bottom-right'
                ? 'bottom-6 right-6'
                : 'bottom-6 left-6'
            } z-50`}
          >
            <Button
              size="lg"
              className="rounded-full w-16 h-16 shadow-lg"
              style={{ backgroundColor: config.primaryColor }}
              onClick={() => setIsOpen(true)}
            >
              <MessageSquare className="w-8 h-8" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ventana del chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed ${
              config.position === 'bottom-right'
                ? 'bottom-6 right-6'
                : 'bottom-6 left-6'
            } z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border`}
          >
            {/* Header */}
            <div
              className="p-4 flex items-center justify-between text-white"
              style={{ backgroundColor: config.primaryColor }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{config.botName}</h3>
                  <p className="text-xs opacity-90">En línea</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-3 ${
                        message.sender === 'user'
                          ? 'text-white'
                          : 'bg-white text-gray-900 border'
                      }`}
                      style={
                        message.sender === 'user'
                          ? { backgroundColor: config.primaryColor }
                          : {}
                      }
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {message.timestamp.toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-lg p-3 border">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={config.placeholderText}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
