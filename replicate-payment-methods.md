# Prompt de IA para Replicar Módulo: Configuración de Métodos de Pago (QR)

## 1. Resumen del Proyecto y Objetivo

**Nombre del Módulo:** Configuración de Métodos de Pago QR (Colombia)

**Objetivo Principal:** Crear un componente de React en una aplicación (stack sugerido: Next.js, React, TailwindCSS, ShadCN) que permita a un usuario configurar tres métodos de pago específicos basados en QR y transferencia: Nequi, Bancolombia y Daviplata.

**Resultado Esperado:** Una interfaz de usuario donde se puedan habilitar/deshabilitar estos métodos de pago y, al seleccionar uno, se muestre un formulario para configurar sus detalles, incluyendo la subida de una imagen para el código QR.

## 2. Descripción Detallada de la Interfaz de Usuario

### 2.1. Estructura General

- **Contenedor Principal:** Un componente o tarjeta (`Card`) que agrupe toda la funcionalidad.
- **Título y Descripción:** Un encabezado que indique "Opciones de Pago Disponibles" y una descripción como "Configura los métodos de pago que aceptarás de tus clientes."

### 2.2. Lista de Selección de Métodos de Pago

- Utilizar un `RadioGroup` de ShadCN para presentar las opciones de pago. Esto asegura que solo un formulario de configuración pueda estar visible a la vez.
- **Cada Opción de Pago (dentro del `RadioGroup`) debe ser un `Label` que contenga:**
    1.  **Icono:** Un ícono representativo de la marca (Nequi, Bancolombia, Daviplata).
    2.  **Nombre:** El texto del método de pago (ej. "Paga con Nequi").
    3.  **Interruptor de Activación (`Switch`):** A la derecha de cada opción, debe haber un `Switch` de ShadCN para habilitar o deshabilitar globalmente ese método de pago. Este `Switch` debe funcionar de manera independiente al `RadioGroup`.

### 2.3. Formulario de Configuración Dinámico

- Debajo de la lista de métodos de pago, debe mostrarse un formulario (`Card`) de manera condicional.
- El formulario que se muestra debe corresponder al método de pago seleccionado en el `RadioGroup`.
- **Componente Reutilizable `QRForm`:** Crear un componente de formulario reutilizable que acepte las siguientes props: `methodName`, `data`, `setData`.
- **Campos del Formulario `QRForm`:**
    - **Titular:** Un campo de texto (`Input`) para el nombre del titular de la cuenta.
    - **Número de cuenta/teléfono:** Un campo de texto (`Input`) para el número de la cuenta o el teléfono asociado.
    - **Subida de Código QR:**
        - Un área designada (puede ser un `div` con borde discontinuo) que actúe como zona para subir archivos.
        - Debe mostrar un ícono de "subir" (`UploadCloud`) y un texto como "Sube una imagen".
        - Al hacer clic, debe abrir el selector de archivos del sistema.
        - Una vez que se selecciona una imagen, debe mostrarse una vista previa de la imagen del código QR en este mismo espacio.
        - Debe mostrar un estado de carga (`Loader2`) mientras la imagen se está subiendo.

## 3. Lógica y Flujo de Datos

- **Estado Principal:** Utilizar un estado central (`useState`) en el componente principal para manejar un objeto que contenga la configuración de los tres métodos de pago. La estructura del estado podría ser:
  ```typescript
  interface PaymentSettings {
      nequi: QRFormData;
      bancolombia: QRFormData;
      daviplata: QRFormData;
  }

  interface QRFormData {
      enabled: boolean;
      qrImageUrl: string | null;
      accountNumber: string;
      holderName: string;
      // ...otros campos relevantes
  }
  ```
- **Selección de Método:** Un estado (`useState`) para rastrear qué método está seleccionado en el `RadioGroup` (ej. `'nequi'`).
- **Renderizado Condicional:** El formulario `QRForm` se renderiza solo para el método seleccionado. Por ejemplo: `selectedMethod === 'nequi' && <QRForm ... />`.
- **Habilitar/Deshabilitar:** El `Switch` de cada método debe actualizar la propiedad `enabled` en el objeto de estado correspondiente a ese método (ej. `settings.nequi.enabled`).
- **Subida de Imágenes:** La lógica para subir la imagen del QR debe invocar una función (preferiblemente un flujo de Genkit/Server Action como `uploadImage`) que tome el archivo, lo suba a un servicio de almacenamiento (como Cloudinary) y devuelva la URL segura. Esa URL debe guardarse en el estado (`qrImageUrl`).
- **Persistencia:** Debe haber un botón de "Guardar" principal que tome el objeto de estado completo y lo envíe a una base de datos (como Firestore) para persistir toda la configuración.