
# Prompt para Desarrollador: Implementar Componente de Editor de Texto Enriquecido (Quill)

## 1. Objetivo del Componente

Crear un componente reutilizable de React con TypeScript, llamado `RichTextEditor`, que encapsule el editor de texto enriquecido [Quill](https://quilljs.com/). El editor debe permitir formato de texto (negritas, itálicas), listas, inserción de enlaces, imágenes, y más, y ser fácilmente integrable en cualquier formulario de una aplicación Next.js/React.

## 2. Requisitos y Dependencias

### 2.1. Instalación de Paquetes

Para implementar el editor, necesitarás instalar la librería `quill` y sus tipos correspondientes. Ejecuta el siguiente comando en tu terminal:

```bash
npm install quill
npm install --save-dev @types/quill
```

### 2.2. Archivos a Crear

1.  **Componente Principal:** `src/components/editor/RichTextEditor.tsx`
2.  **Estilos CSS:** Las modificaciones se añadirán a tu archivo global de CSS (ej. `src/app/globals.css`).

## 3. Implementación del Componente

### 3.1. Código del Componente (`RichTextEditor.tsx`)

Este componente carga `quill` de forma dinámica solo en el lado del cliente para evitar errores de renderizado en el servidor (SSR) con Next.js.

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'
import 'quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const [isMounted, setIsMounted] = useState(false)
  const quillRef = useRef<any>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange);

  // Mantener onChangeRef actualizado con la última función onChange
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || !editorRef.current || quillRef.current) {
      // Si no está montado, no hay ref del editor, o quill ya está inicializado, no hacer nada.
      return;
    }

    const loadQuill = async () => {
      const Quill = (await import('quill')).default;
      
      const toolbarOptions = [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [false, 'center', 'right', 'justify'] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image', 'video', 'blockquote', 'code-block'],
        ['clean']
      ];

      quillRef.current = new Quill(editorRef.current!, {
        theme: 'snow',
        placeholder: placeholder || '',
        modules: {
          toolbar: toolbarOptions
        }
      });

      // Establecer valor inicial
      if (value) {
        quillRef.current.root.innerHTML = value;
      }

      // Añadir listener para los cambios
      quillRef.current.on('text-change', (delta: any, oldDelta: any, source: string) => {
        if (source === 'user') {
          onChangeRef.current(quillRef.current.root.innerHTML);
        }
      });
    };

    loadQuill();

    // Función de limpieza
    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]); // Este efecto se ejecuta solo UNA VEZ cuando isMounted se vuelve true.

  // Efecto para actualizar el contenido cuando la prop `value` cambia desde fuera
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      const selection = quillRef.current.getSelection()
      quillRef.current.root.innerHTML = value
      if (selection) {
        // Intenta restaurar la selección
        quillRef.current.setSelection(selection.index, selection.length)
      }
    }
  }, [value])

  if (!isMounted) {
    // Muestra un esqueleto de carga mientras el editor se monta en el cliente
    return <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
  }

  return (
    <div className="rich-editor-wrapper">
      <div ref={editorRef} />
    </div>
  )
}

export default RichTextEditor
```

### 3.2. Estilos CSS Globales

Añade las siguientes líneas a tu archivo CSS principal (ej. `src/app/globals.css`) para asegurarte de que el editor tenga el estilo correcto.

```css
/* Importar el tema 'snow' de Quill */
@import 'quill/dist/quill.snow.css';

/* Estilos personalizados para el contenedor del editor */
.rich-editor-wrapper {
  background: white;
  border-radius: 0.5rem; /* Ajustar según tu diseño */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.rich-editor-wrapper .quill {
  font-family: inherit; /* Hereda la fuente de tu aplicación */
}

/* Estilos para la barra de herramientas */
.rich-editor-wrapper .ql-toolbar {
  border: 1px solid #e5e7eb; /* Gris claro */
  border-radius: 0.5rem 0.5rem 0 0;
  background: #f9fafb; /* Un fondo ligeramente gris */
}

/* Estilos para el contenedor del contenido */
.rich-editor-wrapper .ql-container {
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 0.5rem 0.5rem;
  min-height: 200px;
  font-size: 1rem; /* o 16px */
}

.rich-editor-wrapper .ql-editor {
  min-height: 200px;
}

/* Placeholder */
.rich-editor-wrapper .ql-editor.ql-blank::before {
  color: #9ca3af; /* Color de placeholder */
  font-style: normal;
}
```

## 4. Instrucciones de Uso

Para usar el componente en tu aplicación, impórtalo y úsalo dentro de un formulario. El componente requiere que lo gestiones con el estado de React (`useState`).

**Ejemplo de uso en un componente de formulario:**

```typescript
'use client';

import { useState } from 'react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { Button } from '@/components/ui/button';

export default function MyFormComponent() {
  // Estado para almacenar el contenido HTML del editor
  const [editorContent, setEditorContent] = useState<string>('');

  const handleSave = () => {
    console.log('Contenido a guardar:', editorContent);
    // Aquí enviarías el `editorContent` a tu base de datos.
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-lg font-semibold">Descripción del Producto</label>
        <p className="text-sm text-gray-500">Añade una descripción detallada y atractiva.</p>
      </div>

      <RichTextEditor
        value={editorContent}
        onChange={setEditorContent}
        placeholder="Escribe aquí la descripción de tu producto..."
      />

      <Button onClick={handleSave}>Guardar Descripción</Button>
      
      <div className="mt-8 border p-4 rounded-lg">
        <h3 className="font-semibold">Vista previa del HTML generado:</h3>
        <pre className="text-xs bg-gray-100 p-2 rounded-md mt-2 overflow-x-auto">
          {editorContent}
        </pre>
      </div>
    </div>
  );
}
```

Siguiendo estos pasos, tendrás un editor de texto enriquecido completamente funcional y reutilizable en tu nueva aplicación.
