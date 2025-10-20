
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LandingPageData } from './editor-landing-preview';
import RichTextEditor from '@/components/editor/RichTextEditor';

interface EditorLandingFormProps {
  data: LandingPageData;
  setData: React.Dispatch<React.SetStateAction<LandingPageData>>;
}

export function EditorLandingForm({ data, setData }: EditorLandingFormProps) {

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
          <Label>Contenido Adicional (HTML)</Label>
          <RichTextEditor
            value={data.content}
            onChange={handleContentChange}
            placeholder="Describe tu negocio o servicio con más detalle. Añade imágenes, enlaces o texto enriquecido para destacar lo mejor de tu marca."
          />
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
      </CardContent>
    </Card>
  );
}
