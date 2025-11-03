
# Prompt de IA para Replicar Panel de Usuario Específico: "Local Presence Kit"

## 1. Resumen del Proyecto

**Nombre de la Aplicación:** Local Presence Kit

**Objetivo Principal:** Crear una aplicación web (SaaS) con Next.js, React, TailwindCSS, ShadCN y Firebase. El objetivo es proporcionar a los dueños de negocios locales las herramientas esenciales para construir y gestionar su presencia online a través de una landing page personalizable, un catálogo de productos y un sistema de contacto.

**Importante:** Este proyecto es una versión simplificada del panel de "Local Leap". Se deben **EXCLUIR explícitamente** todas las funcionalidades relacionadas con la gestión de Google My Business (GMB), como reseñas, publicaciones y perfil de GMB.

**Paleta de Colores y Estilo:**
- **Primario:** Azul (`#4285F4`)
- **Fondo:** Azul claro (`#E3F2FD`)
- **Acento:** Naranja (`#FFA726`)
- **Fuente:** `Inter`
- **Estilo General:** Moderno, limpio, con esquinas redondeadas y sombras sutiles, siguiendo la línea de los componentes de ShadCN.

## 2. Estructura de la Base de Datos (Firestore)

Configura una base de datos en Firestore que dé soporte a las funcionalidades requeridas. Utiliza un archivo `docs/backend.json` para definir las entidades y rutas, y genera las reglas de seguridad correspondientes en `firestore.rules`.

- `/businesses/{businessId}`: Documento principal para cada negocio.
  - **Subcolección `/landingPages/{pageId}`**: Almacena las configuraciones de la landing page del negocio.
  - **Subcolección `/catalogConfig/header`**: Configuración de la cabecera del catálogo.
  - **Subcolección `/contactForms/{formId}`**: Configuración del formulario de contacto.
  - **Subcolección `/contactSubmissions/{submissionId}`**: Mensajes recibidos desde el formulario de contacto.
- `/products/{productId}`: Colección global para los productos de todos los negocios, usando `businessId` para la segregación.
- `/users/{userId}`: Vincula el UID de autenticación de un usuario a su `businessId`.
- `/paymentSettings/{userId}`: Almacena las configuraciones de pago para un usuario/negocio.

**Reglas de Seguridad Clave:**
- El dueño de un negocio (`request.auth.uid == businessId`) puede leer y escribir en su propio documento `/businesses/{businessId}` y sus subcolecciones.
- Las `landingPages` y `catalogConfig` deben ser de lectura pública.
- La creación de `contactSubmissions` debe ser pública.
- El `businessId` debe usarse para proteger el acceso a `products`.

## 3. Funcionalidades del Panel de Usuario (Dashboard) - Funcionalidades a Incluir

Crea un dashboard para usuarios autenticados (`/dashboard`) con las siguientes páginas **únicamente**:

1.  **Página Principal (`/dashboard`):**
    *   Debe mostrar tarjetas con métricas clave como "Visitas a la Landing Page", "Envíos de Formulario", "Productos en Catálogo".
    *   **NO** debe incluir ninguna sección de "Reseñas Recientes" ni métricas relacionadas con GMB (Llamadas, Rutas, etc.).

2.  **Constructor de Landing Page (`/dashboard/landing-page`):**
    *   Debe ser una interfaz de dos columnas:
        *   **Izquierda:** Pestañas para editar "Principal (Hero)", "Secciones", "Testimonios" y "SEO".
        *   **Derecha:** Una vista previa en tiempo real (`EditorLandingPreview.tsx`) que refleje los cambios.

3.  **Gestión de Catálogo (`/dashboard/catalog`):**
    *   Una tabla para listar los productos del negocio (`ProductDataTable`).
    *   Un modal (`ProductModal`) para crear y editar productos (nombre, descripción, precio, stock, imágenes).
    *   Un componente para configurar la cabecera del catálogo público (`CatalogHeaderConfig`).
    *   Un componente para compartir el enlace del catálogo (`ShareCatalog`).

4.  **Editor de Formulario de Contacto (`/dashboard/editor-contacto`):**
    *   Una interfaz para que el usuario pueda añadir, eliminar y personalizar los campos de su formulario de contacto público (etiqueta, tipo de campo, placeholder, etc.).
    *   Debe incluir una sección para configurar el email de destino de las notificaciones.

5.  **Bandeja de Mensajes (`/dashboard/messages`):**
    *   Una tabla para visualizar los mensajes recibidos a través del formulario de contacto.
    *   Debe permitir ver el detalle de cada mensaje y eliminarlo.

6.  **Configuración (`/dashboard/settings`):**
    *   Página para que el usuario gestione su perfil (nombre, avatar).
    *   Sección para gestionar los métodos de pago que se mostrarán en su catálogo (Nequi, Stripe, etc.), utilizando el componente `PaymentPlanForm`.

## 4. Funcionalidades a EXCLUIR Explícitamente

Para evitar confusiones, el prompt **NO debe generar** lo siguiente:

*   **Página de Reseñas (`/dashboard/reviews`):** No crear este componente, ni sus tablas, ni la lógica de embudo (`/funnel/{businessId}`).
*   **Página de Publicaciones (`/dashboard/posts`):** No crear esta página ni su lógica de programación de contenido.
*   **Página de Perfil GMB (`/dashboard/profile`):** No crear la interfaz para gestionar fotos, detalles o palabras clave de Google My Business.
*   **Integración de IA para GMB:** No implementar flujos de Genkit como `generateReviewResponse` o `suggestGMBKeywords`.

## 5. Autenticación y Páginas Públicas

1.  **Página de Inicio (`/`):** Debe ser una landing page estática genérica que invite al registro.
2.  **Login (`/login`) y Registro (`/register`):** Formularios estándar de autenticación. El registro debe crear automáticamente los documentos necesarios en `users` y `businesses`.
3.  **Landing Page Pública (`/landing/{businessId}`):** Página que renderiza el contenido creado en el "Landing Page Builder".
4.  **Catálogo Público (`/catalog`):** Muestra los productos del negocio configurado como `SUPER_ADMIN_BUSINESS_ID`.
5.  **Formulario de Contacto Público (`/contact/{userId}`):** Página que renderiza el formulario personalizado por el usuario.

El objetivo es un producto enfocado y limpio. La IA debe adherirse estrictamente a las funcionalidades incluidas y omitir por completo las excluidas.
