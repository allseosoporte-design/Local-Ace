"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, X, Sparkles, Loader2 } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { suggestGMBKeywords } from "@/ai/flows/suggest-gmb-keywords";

export default function ProfilePage() {
  const photos = PlaceHolderImages.filter(p => p.id.startsWith("business-photo"));
  const [keywords, setKeywords] = useState(["cafetería", "café", "pastelería", "brunch"]);
  const [newKeyword, setNewKeyword] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddKeyword = () => {
    if (newKeyword && !keywords.includes(newKeyword)) {
      setKeywords([...keywords, newKeyword]);
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(keyword => keyword !== keywordToRemove));
  };
  
  const handleGenerateKeywords = async () => {
    setIsGenerating(true);
    try {
      const result = await suggestGMBKeywords({
        businessDescription: "Una acogedora cafetería local que sirve café artesanal, pasteles recién horneados y opciones de brunch ligero. Nos enfocamos en ingredientes de alta calidad y un ambiente amigable.",
        businessCategory: "Cafetería",
        location: "Brooklyn, NY"
      });
      if(result.keywords) {
        setKeywords(prev => [...new Set([...prev, ...result.keywords])]);
      }
    } catch (error) {
      console.error("Failed to generate keywords:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Perfil de GMB</h1>
        <p className="text-muted-foreground">
          Optimiza tu perfil de Google My Business para máxima visibilidad.
        </p>
      </div>

      <Tabs defaultValue="photos">
        <TabsList>
          <TabsTrigger value="photos">Fotos</TabsTrigger>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="keywords">Palabras Clave</TabsTrigger>
        </TabsList>

        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Fotos</CardTitle>
              <CardDescription>Sube y organiza imágenes de alta calidad para atraer clientes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map(photo => (
                  <div key={photo.id} className="relative group aspect-w-16 aspect-h-9">
                    <Image
                      src={photo.imageUrl}
                      alt={photo.description}
                      width={400}
                      height={300}
                      data-ai-hint={photo.imageHint}
                      className="rounded-lg object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="destructive" size="sm">Eliminar</Button>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-4">
                  <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Subir</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details">
           <Card>
            <CardHeader>
              <CardTitle>Detalles del Negocio</CardTitle>
              <CardDescription>Mantén tu información precisa y actualizada.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business-name">Nombre del Negocio</Label>
                <Input id="business-name" defaultValue="The Cozy Corner Cafe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" defaultValue="Una acogedora cafetería local que sirve café artesanal, pasteles recién horneados y opciones de brunch ligero. Nos enfocamos en ingredientes de alta calidad y un ambiente amigable." />
              </div>
               <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" defaultValue="123 Main St, Brooklyn, NY 11201" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="keywords">
           <Card>
            <CardHeader>
              <CardTitle>Palabras Clave Estratégicas</CardTitle>
              <CardDescription>Optimiza con palabras clave para mejorar el SEO local.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Input 
                  placeholder="Añadir una palabra clave"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                />
                <Button onClick={handleAddKeyword}>Añadir</Button>
                <Button variant="outline" onClick={handleGenerateKeywords} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generar con IA
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {keywords.map(keyword => (
                  <Badge key={keyword} variant="secondary" className="text-sm py-1 pl-3 pr-1">
                    {keyword}
                    <button onClick={() => handleRemoveKeyword(keyword)} className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
