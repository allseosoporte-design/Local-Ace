
# Prompt de IA para Generar Aplicación Completa: "Local Leap"

## 1. Resumen del Proyecto

**Nombre de la Aplicación:** Local Leap

**Objetivo Principal:** Crear una aplicación web (SaaS) con Next.js, React, TailwindCSS, ShadCN, Firebase y Genkit, diseñada para que los dueños de negocios locales puedan optimizar su presencia en Google My Business (GMB). La aplicación tendrá un panel para el dueño del negocio y un panel de superadministrador para gestionar la plataforma.

**Paleta de Colores y Estilo:**
- **Primario:** Azul saturado (`#4285F4`)
- **Fondo:** Azul claro (`#E3F2FD`)
- **Acento:** Naranja (`#FFA726`)
- **Fuente:** `Inter`
- **Estilo General:** Moderno, limpio, con esquinas redondeadas y sombras sutiles en los componentes de ShadCN.

## 2. Estructura de la Base de Datos (Firestore)

Configura la base de datos de Firestore con la siguiente estructura. Utiliza un archivo `docs/backend.json` para definir las entidades y rutas, y genera las reglas de seguridad correspondientes en `firestore.rules`.

- `/businesses/{businessId}`: Documento principal para cada negocio.
  - **Subcolección `/internalFeedback/{feedbackId}`**: Almacena los comentarios negativos (1-4 estrellas) de los clientes de ese negocio.
  - **Subcolección `/landingPages/{pageId}`**: Almacena las configuraciones de las landing pages del negocio.
- `/users/{userId}`: Vincula el UID de autenticación de un usuario a su `businessId`.
- `/subscriptions/{subscriptionId}`: Planes de suscripción disponibles.
- Otras colecciones de superadministrador como `pendingPayments`, `supportTickets`, `backups`, etc.

**Reglas de Seguridad Clave:**
- El dueño de un negocio (`request.auth.uid == businessId`) puede leer y escribir en su propio documento `/businesses/{businessId}` y en sus subcolecciones.
- Las `landingPages` del negocio público (`allseosoporte`) deben ser de lectura pública.
- La creación de `internalFeedback` debe ser pública para permitir que los clientes envíen comentarios a través del embudo.
- Un rol de `isSuperAdmin` (gestionado a través de Custom Claims o por email (`allseosoporte@gmail.com`)) debe tener acceso de lectura/escritura a colecciones globales como `businesses`, `subscriptionPlans`, etc.

## 3. Funcionalidades del Panel de Usuario (Dashboard)

Crea un dashboard para usuarios autenticados (`/dashboard`) con las siguientes páginas:

1.  **Página Principal (`/dashboard`):**
    *   Muestra tarjetas con métricas clave de GMB (Visitas, Llamadas, Rutas, Clics).
    *   Incluye un gráfico de `recharts` (`Overview.tsx`) para visualizar el rendimiento.
    *   Muestra una lista de reseñas recientes de 5 estrellas (`RecentReviews.tsx`).

2.  **Gestión de Reseñas (`/dashboard/reviews`):**
    *   Un botón para copiar el "Enlace del Embudo" (`/funnel/{businessId}`).
    *   Un sistema de pestañas:
        *   **Reseñas Públicas:** Una tabla (`DataTable`) para mostrar reseñas positivas. Implementa un botón de acción con IA (`generateReviewResponse`) para redactar respuestas.
        *   **Feedback Interno:** Una tabla que consulta la subcolección `businesses/{user.uid}/internalFeedback` para mostrar los comentarios negativos.

3.  **Perfil de GMB (`/dashboard/profile`):**
    *   Pestañas para "Fotos", "Detalles" y "Palabras Clave".
    *   La pestaña "Palabras Clave" debe tener un botón de "Generar con IA" que llame a un flujo de Genkit (`suggestGMBKeywords`) para obtener sugerencias.

4.  **Publicaciones (`/dashboard/posts`):**
    *   Una tabla para listar publicaciones (Publicadas, Programadas, Borradores).
    *   Un diálogo modal para crear una nueva publicación con campos para contenido, imagen y fecha de programación.

5.  **Landing Page Builder (`/dashboard/landing-page`):**
    *   Una interfaz de dos columnas:
        *   **Izquierda:** Pestañas para editar "Principal (Hero)", "Secciones", "Testimonios", "SEO" y "Formulario".
        *   **Derecha:** Una vista previa en tiempo real (`EditorLandingPreview.tsx`) que refleje los cambios.
    *   La pestaña "Formulario" (`FormEditor.tsx`) permitirá configurar los textos y la URL de redirección del embudo de reseñas.

6.  **Configuración (`/dashboard/settings`):** Página básica para gestionar perfil y facturación.

## 4. Funcionalidades del Panel de Superadministrador

Crea un panel de administración (`/dashboard/admin`) protegido, accesible solo para superadministradores.

1.  **Gestión de Clientes (`/dashboard/admin`):**
    *   Una tabla para listar todos los negocios de la colección `businesses`.
    *   Funcionalidad CRUD completa (Crear, Leer, Editar, Eliminar) para los negocios a través de un modal.

2.  **Gestión de Planes (`/dashboard/admin/subscription-plans`):**
    *   Vista de tarjetas para mostrar los planes de la colección `subscriptionPlans`.
    *   Funcionalidad CRUD completa y opciones para reordenar y marcar planes como "populares".

3.  **Otras Páginas de Admin:**
    *   `pending-payments`: Para aprobar pagos manuales.
    *   `support`: Para gestionar tickets de soporte.
    *   `audit`: Para ver un log de auditoría.
    *   `maintenance`: Herramientas para limpiar caché y reindexar.
    *   `database`: Para visualizar la estructura de la base de datos.
    *   `backup`: Para iniciar y gestionar respaldos.
    *   `editor-landing`: Para editar la landing page pública principal.
    *   `payment-settings`: Para configurar pasarelas de pago por plan.
    *   `profile`: Para que el superadmin edite su propio perfil.
    *   `settings`: Configuraciones globales de la plataforma.

## 5. Autenticación y Páginas Públicas

1.  **Página de Inicio (`/`):** Debe mostrar una landing page estática por defecto para evitar errores de permisos. No debe realizar consultas a Firestore.
2.  **Login (`/login`):** Formulario de inicio de sesión con email y contraseña.
3.  **Registro (`/register`):** Formulario de registro. Al crear un usuario, debe crear automáticamente un documento en `users` y `businesses` (usando el `uid` del usuario como `businessId`), así como la configuración inicial del formulario en la subcolección `/businesses/{uid}/landingPages/form`.
4.  **Embudo de Reseñas (`/funnel/{businessId}`):**
    *   Página pública que recibe un `businessId` como parámetro.
    *   Muestra un componente de 5 estrellas para calificar.
    *   Si la calificación es 5, redirige a una URL configurada.
    *   Si la calificación es 1-4, muestra un formulario para enviar nombre, email y mensaje.
    *   Al enviar el formulario, crea un nuevo documento en la subcolección `/businesses/{businessId}/internalFeedback`.

## 6. Integración de IA (Genkit)

Implementa los siguientes flujos de Genkit en la carpeta `src/ai/flows`:
- `generateReviewResponse`: Genera respuestas a reseñas de clientes.
- `suggestGMBKeywords`: Sugiere palabras clave para perfiles de GMB.
- `uploadImage`: Gestiona la subida de imágenes a un servicio como Cloudinary.

Asegúrate de que los componentes de la interfaz de usuario llamen a estos flujos cuando sea necesario.
