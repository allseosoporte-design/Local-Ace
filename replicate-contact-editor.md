
# Prompt de IA para Replicar Módulo: Editor de Formulario de Contacto

## 1. Resumen del Proyecto y Objetivo

**Nombre del Módulo:** Editor de Formulario de Contacto Dinámico

**Objetivo Principal:** Crear una página de panel de control en una aplicación (stack sugerido: Next.js, React, TailwindCSS, ShadCN) que permita a los usuarios construir y personalizar un formulario de contacto para su sitio público.

**Resultado Esperado:** Una interfaz de usuario de dos columnas: un panel de edición a la izquierda donde se configuran los campos y los ajustes, y una columna a la derecha que muestra una vista previa y opciones para compartir.

## 2. Descripción Detallada de la Interfaz de Usuario

### 2.1. Estructura General

- **Contenedor Principal:** Un layout que ocupe todo el ancho disponible.
- **Título y Descripción:** Encabezado con el título "Editor de Contacto" y una descripción como "Crea y personaliza tu formulario de contacto profesional".
- **Botón de Guardado Global:** Un botón principal en la parte superior derecha con el texto "Guardar Cambios".
- **Layout de Dos Columnas (Grid):**
    - **Columna Izquierda (Panel de Edición):** Ocupa aproximadamente 2/3 del ancho. Contiene el editor de campos y la configuración de notificaciones.
    - **Columna Derecha (Panel de Acciones):** Ocupa 1/3 del ancho. Contiene las tarjetas de "Enlace Público" y "Vista Previa".

### 2.2. Panel de Edición (Columna Izquierda)

1.  **Componente "Editor Visual de Formulario":**
    - **Título:** "Editor Visual de Formulario" con la descripción "Arrastra y edita los campos de tu formulario".
    - **Lista de Campos (Repetible):** Una interfaz para gestionar una lista de campos de formulario.
    - **Cada Campo debe tener (dentro de una tarjeta `Card`):**
        - Un ícono de arrastre (`GripVertical`) para reordenar la lista.
        - **Etiqueta:** Un campo de texto (`Input`) para el `label` del campo (ej. "Nombre").
        - **Tipo de Campo:** Un selector (`Select`) con opciones como "Texto", "Email", "Área de texto", "Teléfono", "Número".
        - **Placeholder:** Un campo de texto (`Input`) para el texto de ejemplo que se muestra dentro del campo.
        - **Requerido:** Un interruptor (`Switch`) para marcar si el campo es obligatorio.
        - **Botón de Eliminar:** Un botón con un ícono (`Trash2`) para eliminar el campo de la lista.
    - **Botón "Agregar Campo":** Un botón debajo de la lista para añadir un nuevo campo al formulario.

2.  **Componente "Configuración del Correo":**
    - **Título:** "Configuración del Correo" con la descripción "Define a dónde llegarán los mensajes y personaliza las respuestas".
    - **Correo de Destino:** Un campo de texto (`Input`) para que el usuario ingrese la dirección de email donde se recibirán las notificaciones de los envíos del formulario.

### 2.3. Panel de Acciones (Columna Derecha)

1.  **Tarjeta "Enlace Público":**
    - **Título:** "Enlace Público" con la descripción "Comparte este enlace para que te contacten".
    - **Campo de URL:** Un campo de texto (`Input`) de solo lectura que muestra la URL pública del formulario (ej. `https://.../contact/{userId}`). Debe tener un botón al lado para copiar la URL al portapapeles.
    - **Botón "Vista Previa Pública":** Un botón que abre la URL pública en una nueva pestaña del navegador.
    - **Botón "Guardar Cambios":** Un segundo botón de guardado en esta tarjeta para mayor comodidad.

2.  **Tarjeta "Vista Previa":**
    - **Título:** "Vista Previa".
    - **Renderizado Dinámico:** Debe mostrar una representación visual del formulario a medida que se edita.
    - Los campos (Inputs, Textareas) en la vista previa deben estar **deshabilitados** para que no se pueda escribir en ellos, ya que es solo una visualización.
    - Debe reflejar instantáneamente cualquier cambio en las etiquetas, placeholders y tipos de campo del editor.

## 3. Lógica y Flujo de Datos

- **Estado Centralizado:** Utiliza un estado (`useState`) en el componente principal de la página para gestionar un objeto que contenga la configuración del formulario (la lista de campos y la configuración del email).
- **Gestión de Campos:** Las funciones para `addField`, `updateField`, y `removeField` deben modificar este estado centralizado.
- **Paso de Datos:** Pasa el estado y las funciones de actualización como props a los componentes del editor.
- **Actualización en Tiempo Real:** Cualquier cambio en el estado debe provocar un re-renderizado de la "Vista Previa" para reflejar los cambios al instante.
- **Persistencia:** La función `handleSaveChanges` (vinculada al botón "Guardar Cambios") debe tomar el objeto de estado actual y guardarlo en una base de datos (como Firestore) en una ruta específica del usuario (ej. `/businesses/{userId}/contactForms/config`).
