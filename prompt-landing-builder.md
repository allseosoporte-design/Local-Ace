# Prompt de IA para Replicar Módulo: Constructor de Landing Page

## 1. Resumen del Proyecto y Objetivo

**Nombre del Módulo:** Constructor de Landing Page Dinámica

**Objetivo Principal:** Crear un componente o conjunto de componentes en una aplicación web (stack sugerido: Next.js, React, TailwindCSS, ShadCN) que permita a los usuarios construir y personalizar una página de aterrizaje (landing page) de forma visual e intuitiva, sin necesidad de escribir código.

**Resultado Esperado:** Una interfaz de usuario de dos columnas: un panel de edición a la izquierda y una vista previa en tiempo real a la derecha. Los cambios realizados en el panel de edición deben reflejarse instantáneamente en la vista previa.

## 2. Descripción Detallada de la Interfaz de Usuario

### 2.1. Estructura General

- **Contenedor Principal:** Un layout que ocupe todo el ancho disponible.
- **Título y Descripción:** Encabezado con el título "Constructor de Landing Page" y una descripción como "Personaliza y previsualiza la página de tu negocio".
- **Botón de Guardado Global:** Un botón principal en la parte superior derecha con el texto "Guardar Toda la Configuración" y un icono de guardar. Debe mostrar un estado de carga (spinner) durante la operación de guardado.
- **Layout de Dos Columnas (Grid):**
    - **Columna Izquierda (Panel de Edición):** Ocupa 2/3 del ancho. Contiene un sistema de pestañas para organizar las diferentes opciones de configuración.
    - **Columna Derecha (Vista Previa):** Ocupa 1/3 del ancho. Muestra una representación en vivo de la landing page que se está construyendo. Esta vista previa debe ser "responsive" y estar contenida dentro de un marco que simule un navegador o un dispositivo.

### 2.2. Panel de Edición (Columna Izquierda)

Implementar un componente de `Tabs` (pestañas) de ShadCN con las siguientes pestañas:

1.  **Pestaña "Principal" (Hero Section):**
    - **Título:** Campo de texto para el titular principal (`h1`).
    - **Subtítulo:** Campo de texto para el subtítulo o eslogan.
    - **Contenido Adicional:** Un editor de texto enriquecido (Rich Text Editor, como Quill o similar) que permita formato (negrita, itálica), listas, enlaces, etc.
    - **Imagen del Hero:** Campo de texto para la URL de la imagen principal. Idealmente, con un botón para subir una imagen.
    - **Botón de Llamada a la Acción (CTA):** Dos campos de texto, uno para el "Texto del Botón" y otro para la "URL del Botón".
    - **Paleta de Colores:** Tres selectores de color (`<input type="color">`) para: "Color de Fondo", "Color de Texto" y "Color del Botón".

2.  **Pestaña "Navegación" (Header):**
    - **Logo:** Opción para subir una imagen de logo y un campo de texto para el nombre del negocio si no se usa logo.
    - **Enlaces de Navegación:** Un sistema para añadir, editar y eliminar enlaces del menú (campos para texto del enlace, URL y opción para abrir en nueva pestaña).
    - **Estilos:** Selectores de color para el fondo, texto y color "hover" de los enlaces. Slider o campo numérico para el tamaño de fuente y espaciado.
    - **Alineación:** Botones para alinear el logo (izquierda, centro, derecha).

3.  **Pestaña "Secciones":**
    - **Interfaz de Gestión:** Un botón para "Agregar Nueva Sección".
    - **Formulario por Sección (Repetible):** Cada sección debe tener su propio formulario colapsable (`Accordion`) con campos para:
        - Título y Subtítulo de la sección.
        - Contenido de la sección (usando un editor de texto enriquecido).
        - **Subsecciones (Tarjetas/Columnas):** Un sistema anidado para añadir tarjetas con imagen, título y descripción.
        - Colores de fondo y texto para la sección.

4.  **Pestaña "Testimonios":**
    - **Interfaz de Gestión:** Un botón para "Agregar Nuevo Testimonio".
    - **Formulario por Testimonio (Repetible):** Cada testimonio debe ser una tarjeta de edición con campos para:
        - Nombre del autor.
        - Cargo o rol del autor.
        - Texto del testimonio (editor de texto enriquecido).
        - Avatar o foto del autor (opción de subida).
        - Calificación (un selector de 1 a 5 estrellas).

5.  **Pestaña "SEO":**
    - **Título SEO:** Campo de texto para la etiqueta `<title>` de la página.
    - **Descripción SEO:** `Textarea` para la etiqueta `<meta name="description">`.
    - **Palabras Clave:** Un campo de entrada que permita añadir "tags" o palabras clave, que se visualizan como insignias (`Badge`) y se pueden eliminar.

6.  **Pestaña "Formulario" (Embudo de Reseñas):**
    - **Configuración de Comportamiento:**
        - Campo para la "URL para Reseñas Positivas" (a dónde redirigir con 5 estrellas).
        - Campo para el "Email para Notificaciones Internas" (a dónde enviar el feedback de 1-4 estrellas).
    - **Personalización de Mensajes:** Campos de texto para editar los títulos y subtítulos de cada paso del embudo (calificación inicial, formulario de feedback negativo, página de agradecimiento).

### 2.3. Vista Previa (Columna Derecha)

- **Componente `EditorLandingPreview`:** Debe ser un componente que reciba un objeto `data` con toda la configuración de la landing page.
- **Renderizado Dinámico:** El componente debe renderizar la página usando los valores del objeto `data`. Usa estilos en línea o variables CSS para aplicar los colores, tamaños de fuente, etc.
- **Renderizado Condicional:** Secciones como Testimonios o Secciones de Contenido solo deben mostrarse si existen en el objeto `data` y tienen contenido.
- **Aislamiento:** La vista previa debe estar contenida y no debe afectar al resto de la interfaz del panel de administración.

## 3. Lógica y Flujo de Datos

- **Estado Centralizado:** Utiliza un único estado (`useState` en el componente principal del constructor) para manejar el objeto `LandingPageData` que contiene toda la configuración.
- **Paso de Datos:** Pasa el objeto de datos completo y la función para actualizarlo (`setData`) como props a cada componente del panel de edición (ej. `EditorLandingForm`, `EditorSections`).
- **Actualización Inmediata:** Cualquier cambio en un campo del panel de edición debe invocar a la función `setData`, actualizando el estado central. Esto provocará un re-renderizado del componente de vista previa, reflejando el cambio al instante.
- **Persistencia de Datos:** La función del botón "Guardar Toda la Configuración" debe tomar el objeto de estado actual y enviarlo a una base de datos (como Firestore) para persistir los cambios. Al cargar la página, se debe intentar leer la configuración guardada desde la base de datos para inicializar el estado.