# Local Leap - SaaS para Presencia Local

¡Felicitaciones! Has construido una aplicación web completa y robusta con Local Leap. Esta plataforma está diseñada para que los dueños de negocios locales puedan optimizar su presencia en línea de manera sencilla y potente.

## ¡Listo para Producción!

Tu aplicación está lista para ser desplegada. Sigue estos últimos pasos para ponerla en línea.

### 1. Configurar Variables de Entorno

Antes de desplegar, necesitas configurar tus claves secretas en el archivo `.env`. Este archivo es ignorado por Git, por lo que tus claves estarán seguras.

1.  **Abre el archivo `.env`** en la raíz de tu proyecto.
2.  **Rellena las siguientes variables:**

    *   `CLOUDINARY_CLOUD_NAME`: Tu "Cloud Name" de Cloudinary.
    *   `CLOUDINARY_API_KEY`: Tu clave de API de Cloudinary.
    *   `CLOUDINARY_API_SECRET`: Tu secreto de API de Cloudinary.
    *   `GEMINI_API_KEY`: Tu clave de API de Google AI Studio o Google Cloud para usar los modelos de Genkit (Gemini).

    *Obtendrás las claves de Cloudinary desde tu [dashboard de Cloudinary](https://cloudinary.com/console).*
    *Obtendrás la clave de Gemini desde [Google AI Studio](https://aistudio.google.com/app/apikey) o la consola de Google Cloud.*

### 2. Despliegue en Firebase App Hosting

Tu proyecto está configurado para un despliegue sencillo con Firebase App Hosting.

1.  **Abre una terminal** en el directorio de tu proyecto.
2.  **Inicia sesión en Firebase:**
    ```bash
    firebase login
    ```
3.  **Selecciona tu proyecto de Firebase:**
    ```bash
    firebase use TU_ID_DE_PROYECTO
    ```
    *(Reemplaza `TU_ID_DE_PROYECTO` con el ID de tu proyecto de Firebase)*

4.  **Despliega la aplicación:**
    ```bash
    firebase apphosting:backends:deploy local-leap --location=us-central1
    ```
    *(`local-leap` es el nombre sugerido, puedes ajustarlo si lo deseas)*

¡Y eso es todo! Firebase se encargará de construir y desplegar tu aplicación. Una vez finalizado, te proporcionará la URL pública donde tu plataforma estará en vivo.

## Stack Tecnológico

*   **Framework:** Next.js (con App Router)
*   **Lenguaje:** TypeScript
*   **Estilos:** Tailwind CSS
*   **Componentes UI:** ShadCN
*   **Base de Datos y Autenticación:** Firebase (Firestore, Auth)
*   **Inteligencia Artificial:** Genkit (con modelos de Google Gemini)
*   **Subida de Imágenes:** Cloudinary

Ha sido un placer construir esta increíble aplicación contigo. ¡Mucho éxito en tu lanzamiento!