'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, Save, RotateCcw, Loader2 } from 'lucide-react';
import type { LandingPageData } from './editor-landing-preview';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quilljs').then((mod) => mod.ReactQuill), { ssr: false });

interface EditorLandingFormProps {
  data: LandingPageData;
  setData: React.Dispatch<React.SetStateAction<LandingPageData>>;
}

// Custom toolbar configuration for React Quill
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['link', 'image', 'video'],
    ['code-block'],
    ['clean'],
  ],
};

export function EditorLandingForm({ data, setData }: EditorLandingFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
  
  const handleContentChange = (content: string) => {
    setData({ ...data, content });
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setData({ ...data, [e.target.name]: e.target.value });
  }

  const handleSave = async () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debes iniciar sesión para guardar los cambios.',
      });
      return;
    }
    setIsSaving(true);
    try {
      const heroConfigRef = doc(firestore, `businesses/${user.uid}/landingPages`, 'hero');
      
      const { sections, testimonials, seo, ...heroData } = data;

      await setDoc(heroConfigRef, {
        ...heroData,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      toast({
        title: '¡Guardado!',
        description: 'La configuración del hero ha sido actualizada.',
      });
    } catch (error) {
      console.error('Error saving hero config:', error);
      toast({
        variant: 'destructive',
        title: 'Error al Guardar',
        description: 'No se pudo guardar la configuración del hero. Revisa la consola para más detalles.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="h-full overflow-y-auto border-t-0 rounded-t-none">
      <CardHeader>
        <CardTitle className="text-lg">Configuración del Hero</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="title">Título Principal</Label>
                <Input
                    id="title"
                    name="title"
                    value={data.title}
                    onChange={handleChange}
                    placeholder="Moderniza tu negocio y aumenta tus ventas."
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="subtitle">Subtítulo</Label>
                <Input
                    id="subtitle"
                    name="subtitle"
                    value={data.subtitle}
                    onChange={handleChange}
                    placeholder="La herramienta definitiva para potenciar tu negocio."
                />
            </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Contenido Adicional (HTML)</Label>
          <div className='bg-white rounded-md border'>
             <ReactQuill
                theme="snow"
                value={data.content}
                onChange={handleContentChange}
                modules={quillModules}
                placeholder="Describe tu negocio o servicio con más detalle. Añade imágenes, enlaces o texto enriquecido para destacar lo mejor de tu marca."
              />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="heroImageUrl">URL de Imagen del Hero</Label>
          <Input
            id="heroImageUrl"
            name="heroImageUrl"
            value={data.heroImageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.png"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="ctaText">Texto del Botón</Label>
            <Input
              id="ctaText"
              name="ctaText"
              value={data.ctaText}
              onChange={handleChange}
              placeholder="Comenzar"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ctaUrl">URL del Botón</Label>
            <Input
              id="ctaUrl"
              name="ctaUrl"
              value={data.ctaUrl}
              onChange={handleChange}
              placeholder="/register"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="backgroundColor">Color de Fondo</Label>
            <Input
              id="backgroundColor"
              name="backgroundColor"
              type="color"
              value={data.backgroundColor}
              onChange={handleColorChange}
              className="p-1 h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="textColor">Color de Texto</Label>
            <Input
              id="textColor"
              name="textColor"
              type="color"
              value={data.textColor}
              onChange={handleColorChange}
              className="p-1 h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buttonColor">Color del Botón</Label>
            <Input
              id="buttonColor"
              name="buttonColor"
              type="color"
              value={data.buttonColor}
              onChange={handleColorChange}
              className="p-1 h-10"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Vista Previa
          </Button>
          <Button variant="secondary">
            <RotateCcw className="mr-2 h-4 w-4" />
            Cargar Default
          </Button>
          <Button onClick={handleSave} disabled={isSaving} style={{ backgroundColor: data.buttonColor, color: '#FFFFFF' }}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar Cambios
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
