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

  // Keep onChangeRef updated with the latest onChange function
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || !editorRef.current || quillRef.current) {
      // If not mounted, no editor ref, or quill is already initialized, do nothing.
      return;
    }

    const loadQuill = async () => {
      const Quill = (await import('quill')).default;
      
      const toolbarOptions = [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image', 'video', 'blockquote', 'code-block'],
        ['clean']
      ];
      
      const handlers = {
        undo: () => quillRef.current.history.undo(),
        redo: () => quillRef.current.history.redo(),
      };

      quillRef.current = new Quill(editorRef.current!, {
        theme: 'snow',
        placeholder: placeholder || '',
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: handlers,
          },
           history: {
            delay: 2000,
            maxStack: 500,
            userOnly: true
          }
        }
      });
      
      // Set initial value
      if (value) {
        quillRef.current.root.innerHTML = value;
      }

      // Add listener for changes
      quillRef.current.on('text-change', (delta: any, oldDelta: any, source: string) => {
        if (source === 'user') {
          onChangeRef.current(quillRef.current.root.innerHTML);
        }
      });
    };

    loadQuill();

    // Cleanup function
    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]); // This effect runs only ONCE when isMounted becomes true.

  // Effect to update content when `value` prop changes from outside
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      const selection = quillRef.current.getSelection()
      quillRef.current.root.innerHTML = value
      if (selection) {
        // Try to restore selection, might not be perfect
        quillRef.current.setSelection(selection.index, selection.length)
      }
    }
  }, [value])

  if (!isMounted) {
    return <div className="h-64 bg-gray-50 animate-pulse rounded-lg" />
  }

  return (
    <div className="rich-editor-wrapper">
      <div ref={editorRef} />
    </div>
  )
}

export default RichTextEditor
