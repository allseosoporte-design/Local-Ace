# Prompt de IA para Replicar Página de Catálogo Público

## 1. Resumen del Proyecto y Objetivo

**Nombre del Módulo:** Página de Catálogo de Productos Público

**Objetivo Principal:** Crear una página pública en una aplicación web (stack sugerido: Next.js, React, TailwindCSS, ShadCN, Firebase) que muestre un catálogo de productos de un negocio específico. La página debe ser interactiva, permitir a los usuarios ver detalles de los productos, añadirlos a un carrito y realizar un pedido a través de WhatsApp.

**Resultado Esperado:** Una página de catálogo funcional y estéticamente agradable, que se carga dinámicamente con los productos y la configuración de un negocio desde Firestore.

## 2. Descripción Detallada de la Interfaz de Usuario

### 2.1. Estructura General de la Página (`/catalog/{businessId}`)

- **Layout Principal:** Una página de ancho completo con un fondo neutro (`bg-muted/40`).
- **Encabezado (`CatalogHeader`):** En la parte superior, debe renderizar un componente de encabezado dinámico. Este componente recibe un objeto de configuración (`config`) que contiene `bannerUrl`, `businessName`, `address`, `socialLinks`, y un `carouselItems` para un carrusel de imágenes promocionales.
- **Cuadrícula de Productos:** Debajo del encabezado, una cuadrícula responsive (`grid`) que muestra las tarjetas de los productos.
- **Pie de Página (`Footer`):** Un pie de página simple con información de copyright.

### 2.2. Tarjeta de Producto (`ProductCard`)

- **Contenedor:** Un componente `Card` de ShadCN con sombra y una sutil transición al pasar el cursor.
- **Imagen:** Una imagen principal del producto con una relación de aspecto de `4:3`, que ocupa la parte superior de la tarjeta.
- **Contenido:**
    - **Título (`CardTitle`):** Nombre del producto.
    - **Precio:** Mostrado de forma prominente, con formato de moneda local (ej. `$15.000`).
- **Valoración (`StarRatingDisplay`):** Un componente que muestra la calificación promedio del producto con estrellas y el número de valoraciones. Debe permitir a un usuario nuevo valorar el producto una vez.
- **Botón de Acción:** Un botón con el texto "Ver Producto" que ocupe todo el ancho del `CardFooter`. Al hacer clic, debe abrir el `ProductViewModal`.

### 2.3. Modal de Vista de Producto (`ProductViewModal`)

- **Disparador:** Se abre al hacer clic en una `ProductCard`.
- **Layout:** Un diálogo (`Dialog`) de dos columnas.
    - **Columna Izquierda (Galería):**
        - Una imagen principal grande con efecto de zoom al pasar el cursor (`ImageZoom`).
        - Una serie de miniaturas (`thumbnail`) de las imágenes secundarias del producto. Al hacer clic en una miniatura, esta se convierte en la imagen principal.
    - **Columna Derecha (Detalles):**
        - **Nombre del Producto:** Título grande y en negrita.
        - **Categoría:** Una `Badge` con la categoría del producto.
        - **Precio:** Mostrado de forma destacada.
        - **Descripción:** Un área que renderiza la descripción del producto (puede contener HTML del editor de texto enriquecido).
        - **Stock:** Información sobre las unidades disponibles.
- **Pie del Modal:** Un botón grande "Agregar al Carrito" con un ícono de `ShoppingCart`.

### 2.4. Funcionalidad del Carrito de Compras

- **Botón Flotante (`CartButton`):** Un botón circular y fijo en la esquina inferior derecha de la pantalla, que solo aparece si hay al menos un producto en el carrito. Debe mostrar una `Badge` con el número total de artículos.
- **Modal de Checkout (`CartCheckoutModal`):**
    - Se abre al hacer clic en el `CartButton`.
    - **Contenido:**
        - Una lista de los productos en el carrito, con su imagen, nombre, cantidad y precio.
        - Controles para aumentar, disminuir o eliminar productos del carrito.
        - El precio total del pedido.
        - Un formulario (`Accordion`) para que el cliente ingrese su nombre, teléfono y dirección de entrega.
        - Una sección para seleccionar el método de pago (debe leer las opciones habilitadas por el negocio desde Firestore).
    - **Acción Final:** Un botón "Pedir por WhatsApp" que, al ser presionado, abre una nueva pestaña de WhatsApp con un mensaje pre-configurado que incluye el resumen del pedido y los datos del cliente.

## 3. Lógica y Flujo de Datos

- **Fuente de Datos:** La página debe obtener los datos de Firestore.
    - **Configuración del Encabezado:** Debe leer el documento `/businesses/{businessId}/catalogConfig/header`.
    - **Productos:** Debe realizar una consulta a la colección `/products`, filtrando por el `businessId` correspondiente al negocio cuyo catálogo se está viendo.
- **Gestión de Estado del Carrito (`useCart`):**
    - Utilizar un `Context` de React para gestionar el estado del carrito de compras.
    - El estado debe persistir en el `localStorage` para que no se pierda al recargar la página.
    - Debe proveer funciones para `addItem`, `removeItem`, `updateQuantity` y `clearCart`.
- **Valoraciones:** Al enviar una nueva valoración, se debe actualizar el documento del producto en Firestore, recalculando el `rating` promedio y aumentando el `ratingCount`. El sistema debe usar `localStorage` para evitar que un mismo usuario valore un producto varias veces desde el mismo navegador.
- **Carga de Datos:** La interfaz debe mostrar estados de carga (`Loader2`) mientras se obtienen los datos de productos y configuración desde Firestore. Si no se encuentran productos, se debe mostrar un mensaje amigable al usuario.
- **Pasarelas de Pago:** La sección de métodos de pago en el modal de checkout debe leer la configuración del documento `/paymentSettings/{businessId}` para mostrar solo las opciones que el negocio ha habilitado.
