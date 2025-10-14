
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Globe, Save } from 'lucide-react';
import type { LandingPageData } from './editor-landing-preview';
import { useToast } from '@/hooks/use-toast';

interface EditorSeoProps {
  data: LandingPageData;
  setData: React.Dispatch<React.SetStateAction<LandingPageData>>;
}

export function EditorSeo({ data, setData }: EditorSeoProps) {
  const [keywordInput, setKeywordInput] = useState('');
  const { toast } = useToast();

  const handleSeoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [e.target.name]: e.target.value,
      },
    }));
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() !== '' && !data.seo.keywords.includes(keywordInput.trim())) {
        const newKeywords = [...data.seo.keywords, keywordInput.trim()];
        setData((prev) => ({
            ...prev,
            seo: { ...prev.seo, keywords: newKeywords },
        }));
    }
    setKeywordInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    const newKeywords = data.seo.keywords.filter((kw) => kw !== keywordToRemove);
    setData((prev) => ({
      ...prev,
      seo: { ...prev.seo, keywords: newKeywords },
    }));
  };

  const handleSaveChanges = () => {
    // Aquí iría la lógica para guardar en Firebase
    console.log("Saving SEO data:", data.seo);
    toast({
      title: 'SEO guardado',
      description: 'La configuración SEO ha sido guardada exitosamente.',
    });
  };

  return (
    <Card className="h-full overflow-y-auto border-t-0 rounded-t-none bg-[#FEFBF9]">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Configuración SEO
        </CardTitle>
        <CardDescription>
          Edita el título, descripción y palabras clave que se mostrarán en los motores de búsqueda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="seo-title">Título SEO</Label>
          <Input
            id="seo-title"
            name="title"
            value={data.seo.title}
            onChange={handleSeoChange}
            placeholder="Ej: Moderniza tu negocio y aumenta tus ventas"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seo-description">Descripción SEO</Label>
          <Textarea
            id="seo-description"
            name="description"
            value={data.seo.description}
            onChange={handleSeoChange}
            placeholder="Describe tu página para los motores de búsqueda..."
            className="min-h-[150px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seo-keywords">Palabras Clave</Label>
          <div className="flex items-center gap-2">
            <Input
              id="seo-keywords"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Añade una palabra y presiona Enter..."
            />
            <Button onClick={handleAddKeyword} variant="outline">Añadir</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 min-h-[2.5rem]">
            {data.seo.keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="text-sm py-1 pl-3 pr-1">
                {keyword}
                <button
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
         <div className="flex justify-end gap-2 pt-4 border-t mt-6">
          <Button onClick={handleSaveChanges} style={{ backgroundColor: '#FF8550', color: '#FFFFFF' }}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Cambios SEO
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
