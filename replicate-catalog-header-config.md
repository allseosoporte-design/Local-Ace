# Prompt de IA para Replicar Módulo: Configuración del Encabezado del Catálogo

## 1. Resumen del Proyecto y Objetivo

**Nombre del Módulo:** Configuración del Encabezado del Catálogo Público

**Objetivo Principal:** Crear una página o un componente grande en una aplicación (stack sugerido: Next.js, React, TailwindCSS, ShadCN) que permita al usuario personalizar completamente la cabecera de su catálogo de productos público.

**Resultado Esperado:** Una interfaz de usuario unificada dentro de un componente `Card`, que contenga campos para configurar el banner, los detalles del negocio, los enlaces a redes sociales y las imágenes del carrusel promocional.

## 2. Descripción Detallada de la Interfaz de Usuario

### 2.1. Estructura General

- **Contenedor Principal:** Un componente `Card` de ShadCN.
- **Cabecera del Componente:**
    - **Título:** "Configurar Encabezado del Catálogo".
        - **Descripción:** "Personaliza la cabecera que se mostrará en tu catálogo público."
            - **Botones de Acción Globales:**
                    - Un botón "Guardar Cambios" con un ícono de `Save`, que se encargará de persistir toda la configuración. Debe mostrar un estado de carga (`Loader2`).
                            - Un botón "Restablecer" con un ícono de `RotateCcw` para descartar los cambios no guardados.

                            ### 2.2. Sección 1: Banner Principal

                            - **Título de la Sección:** Un `Label` que diga "Banner del Catálogo".
                            - **Área de Subida de Imagen:**
                                - Un `div` con borde discontinuo (`border-dashed`) que ocupe todo el ancho (proporción recomendada `3:1` o `1200x400px`).
                                    - Al estar vacío, debe mostrar un ícono de `UploadCloud` y un texto como "Haz clic para subir una imagen".
                                        - Al subir una imagen, debe mostrarse una vista previa de la misma.
                                            - Durante la subida, debe mostrar un indicador de carga (`Loader2`).
                                                - La lógica de subida debe usar una función como `uploadImage` que retorne la URL de la imagen.

                                                ### 2.3. Sección 2: Información del Negocio

                                                - **Grid Layout:** Campos organizados en una cuadrícula para optimizar el espacio.
                                                - **Campos de Texto (`Input`):**
                                                    - **Nombre del Negocio:** `Label` "Nombre del Negocio".
                                                        - **Dirección:** `Label` "Dirección".
                                                            - **Teléfono / WhatsApp:** `Label` "Teléfono / WhatsApp".
                                                                - **Correo Electrónico (opcional):** `Label` "Correo Electrónico (opcional)".

                                                                ### 2.4. Sección 3: Redes Sociales

                                                                - **Título de la Sección:** Un `Label` que diga "Redes Sociales".
                                                                - **Campos Repetibles o Fijos:** Una serie de campos de texto, cada uno precedido por el ícono de la red social correspondiente (TikTok, Instagram, Facebook, WhatsApp, Twitter/X).
                                                                    - **Ejemplo:** Ícono de Instagram seguido de un `Input` para la URL del perfil de Instagram.

                                                                    ### 2.5. Sección 4: Imágenes del Carrusel

                                                                    - **Título de la Sección:** Un `Label` que diga "Imágenes del Carrusel".
                                                                    - **Descripción:** Un texto explicativo como "Sube aquí las imágenes que se mostrarán en el carrusel de tu catálogo (máximo 3)."
                                                                    - **Grid Layout:** Una cuadrícula de 3 columnas para gestionar los 3 elementos del carrusel.
                                                                    - **Cada Elemento del Carrusel (dentro de un `Card`):**
                                                                        - **Vista Previa de Imagen:**
                                                                                - Un área con borde discontinuo (`border-dashed`) y una relación de aspecto de video (`16:9`).
                                                                                        - Si no hay imagen, muestra un ícono de `UploadCloud`.
                                                                                                - Si hay imagen, la muestra.
                                                                                                        - Durante la carga, muestra un `Loader2`.
                                                                                                            - **Campo de Texto (`Input`):**
                                                                                                                    - `Label`: "Texto sobreimpreso".
                                                                                                                            - Para que el usuario escriba el "slogan" o texto que aparecerá sobre la imagen en el carrusel.
                                                                                                                                - **Botones de Acción por Tarjeta:**
                                                                                                                                        - Un botón "Subir" o "Reemplazar" (`Pencil`) para abrir el selector de archivos.
                                                                                                                                                - Un botón "Eliminar" (`Trash2`) para quitar ese elemento del carrusel.

                                                                                                                                                ## 3. Lógica y Flujo de Datos

                                                                                                                                                - **Estado Centralizado:** Utiliza un único estado (`useState`) para manejar un objeto `CatalogHeaderConfigData` que contenga toda la configuración (URL del banner, datos del negocio, redes sociales y un array de `carouselItems`).
                                                                                                                                                - **Manejo del Carrusel:** El estado del carrusel debe ser un array de objetos, donde cada objeto tiene `imageUrl` y `slogan`. Las funciones `add`, `update` y `remove` deben operar sobre este array.
                                                                                                                                                - **Subida de Imágenes:** La lógica para subir tanto el banner como las imágenes del carrusel debe invocar una función (preferiblemente un flujo de Genkit/Server Action como `uploadImage`) que tome el archivo, lo suba a un servicio de almacenamiento (como Cloudinary) y devuelva la URL segura.
                                                                                                                                                - **Persistencia:** La función `handleSaveChanges` (vinculada al botón "Guardar Cambios") debe tomar el objeto de estado completo y guardarlo en una base de datos (como Firestore) en una ruta específica del usuario (ej. `/businesses/{userId}/catalogConfig/header`).
                                                                                                                                                - **Retroalimentación:** Utiliza notificaciones (`toast`) para informar al usuario sobre el estado de las operaciones (guardado exitoso, error de subida, etc.).
                                                                                                                                                