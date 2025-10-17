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

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || !editorRef.current) return

    const loadQuill = async () => {
      const Quill = (await import('quill')).default
      
      if (quillRef.current) return

      const toolbarOptions = [
        [{ header: [1, 2, 3, 4, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link', 'image', 'video'],
        ['code-block'],
        ['clean']
      ]

      quillRef.current = new Quill(editorRef.current!, {
        theme: 'snow',
        placeholder: placeholder || '',
        modules: {
          toolbar: toolbarOptions
        }
      })

      if (value) {
        quillRef.current.root.innerHTML = value
      }

      quillRef.current.on('text-change', () => {
        onChange(quillRef.current.root.innerHTML)
      })
    }

    loadQuill()

    return () => {
      if (quillRef.current) {
        quillRef.current = null
      }
    }
  }, [isMounted, onChange, placeholder, value])

  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      const selection = quillRef.current.getSelection()
      quillRef.current.root.innerHTML = value
      if (selection) {
        quillRef.current.setSelection(selection)
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
