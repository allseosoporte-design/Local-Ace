# Prompt de IA para Replicar Módulo: Bandeja de Entrada de Mensajes

## 1. Resumen del Proyecto y Objetivo

**Nombre del Módulo:** Bandeja de Entrada de Mensajes de Contacto

**Objetivo Principal:** Crear una página de panel de control en una aplicación (stack sugerido: Next.js, React, TailwindCSS, ShadCN, Firebase) que muestre los mensajes recibidos a través de un formulario de contacto público.

**Resultado Esperado:** Una interfaz de usuario limpia y funcional que presenta una lista de mensajes en una tabla, con opciones para ver el detalle de cada mensaje y eliminarlo.

## 2. Descripción Detallada de la Interfaz de Usuario

### 2.1. Estructura General

- **Contenedor Principal:** Un layout que ocupe todo el ancho disponible.
- **Título y Descripción:** Encabezado con el título "Mensajes de Contacto" y una descripción como "Revisa los mensajes enviados desde tu formulario de contacto."

### 2.2. Tarjeta "Bandeja de Entrada"

- Implementar un componente `Card` de ShadCN que contenga la tabla de mensajes.
- **Cabecera de la Tarjeta (`CardHeader`):**
    - **Título:** "Bandeja de Entrada".
    - **Descripción:** "Aquí puedes ver todos los mensajes recibidos."
- **Contenido de la Tarjeta (`CardContent`):**
    - Aquí se debe renderizar el componente de la tabla de datos (`DataTable`).

## 3. Tabla de Datos de Mensajes

### 3.1. Componente `DataTable`

- Crear un componente reutilizable `DataTable` que reciba `columns` (la definición de las columnas) y `data` (los mensajes).
- La tabla debe usar los componentes `Table` de ShadCN (`Table`, `TableHeader`, `TableHead`, `TableRow`, `TableBody`, `TableCell`).
- Debe mostrar un mensaje como "No hay mensajes." en el centro si el array de `data` está vacío.
- Debe mostrar un estado de carga (ej. un `Loader2` de `lucide-react`) mientras los datos se están obteniendo.

### 3.2. Columnas de la Tabla

- **Remitente:** Muestra el nombre de la persona que envió el mensaje.
- **Mensaje:** Muestra un fragmento o truncado del contenido del mensaje.
- **Fecha:** Muestra la fecha y hora en que se recibió el mensaje, formateada de manera legible (ej. `dd/MM/yyyy HH:mm`).
- **Acciones:** Una columna a la derecha que contiene un menú desplegable (`DropdownMenu`) por cada fila.

### 3.3. Menú de Acciones (`DropdownMenu`)

Cada fila de la tabla debe tener un botón con un ícono de tres puntos (`MoreHorizontal`) que, al hacer clic, despliegue un menú con las siguientes opciones:

1.  **Ver Mensaje (`Eye`):**
    - Al hacer clic, debe abrir un diálogo modal (`Dialog`).
    - El modal debe mostrar todos los detalles del mensaje seleccionado:
        - De (nombre del remitente)
        - Email (como un enlace `mailto:`)
        - Fecha
        - El mensaje completo en un área de texto o párrafo bien formateado.
    - Debe tener un botón para "Cerrar" el modal.

2.  **Eliminar (`Trash2`):**
    - Al hacer clic, debe eliminar el documento correspondiente de la base de datos de Firestore.
    - Se debe mostrar una notificación (`Toast`) de éxito o error tras la operación.

## 4. Lógica y Flujo de Datos

- **Fuente de Datos:** Los datos de los mensajes deben obtenerse en tiempo real de la subcolección de Firestore `businesses/{userId}/contactSubmissions`, donde `{userId}` es el ID del usuario autenticado.
- **Ordenación:** Los mensajes deben estar ordenados por fecha de envío (`submittedAt`) de forma descendente (los más nuevos primero).
- **Estado de Carga:** La interfaz debe mostrar un indicador de carga (`Loader`) mientras se obtienen los datos iniciales de Firestore.
- **Eliminación de Datos:** La acción "Eliminar" debe ejecutar una operación `deleteDoc` en el documento de Firestore correspondiente al mensaje seleccionado.
