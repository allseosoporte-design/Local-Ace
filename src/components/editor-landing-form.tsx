
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Eye, Save, RotateCcw } from 'lucide-react';
import type { LandingPageData } from './editor-landing-preview';

interface EditorLandingFormProps {
  data: LandingPageData;
  setData: React.Dispatch<React.SetStateAction<LandingPageData>>;
}

export function EditorLandingForm({ data, setData }: EditorLandingFormProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setData({ ...data, [e.target.name]: e.target.value });
  }

  return (
    <Card className="h-full overflow-y-auto">
      <CardHeader>
        <CardTitle>Configuración del Hero</CardTitle>
        <CardDescription>
          Modifica el título, subtítulo, contenido y la imagen principal de tu
          página.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
            placeholder="La herramienta definitiva para potenciar tu negocio gastronómico."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Contenido Adicional (HTML permitido)</Label>
          <Textarea
            id="content"
            name="content"
            value={data.content}
            onChange={handleChange}
            placeholder="Describe la revolución para tu NEGOCIO..."
            className="min-h-[200px]"
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
        <div className="grid grid-cols-2 gap-4">
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
          <Button style={{ backgroundColor: data.buttonColor }}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
