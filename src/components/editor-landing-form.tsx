
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, Save } from "lucide-react";

const colorOptions = [
    { name: "Azul", value: "hsl(221, 89%, 60%)" },
    { name: "Verde", value: "hsl(142, 71%, 45%)" },
    { name: "Rojo", value: "hsl(0, 84%, 60%)" },
    { name: "Naranja", value: "hsl(35, 100%, 57%)" },
    { name: "Morado", value: "hsl(262, 83%, 60%)" },
];

export function EditorLandingForm() {
  return (
    <Card className="h-full overflow-y-auto">
      <CardHeader>
        <CardTitle>Configuración del Hero</CardTitle>
        <CardDescription>
          Modifica el título, subtítulo, contenido y la imagen principal de tu página.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Título Principal</Label>
          <Input id="title" placeholder="Moderniza tu negocio y aumenta tus ventas." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtítulo</Label>
          <Input id="subtitle" placeholder="La herramienta definitiva para potenciar tu negocio gastronómico." />
        </div>
        <div className="space-y-2">
            <Label htmlFor="content">Contenido Adicional (HTML)</Label>
            <Textarea id="content" placeholder="Describe la revolución para tu NEGOCIO..." className="min-h-[150px]" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hero-image">Imagen del Hero</Label>
          <Input id="hero-image" type="file" accept="image/*" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="cta-text">Texto del Botón</Label>
                <Input id="cta-text" placeholder="Comenzar" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="cta-url">URL del Botón</Label>
                <Input id="cta-url" placeholder="/register" />
            </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="bg-color">Color de Fondo</Label>
                <Input id="bg-color" type="color" defaultValue="#FFFFFF" className="p-1 h-10" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="text-color">Color de Texto</Label>
                <Input id="text-color" type="color" defaultValue="#000000" className="p-1 h-10" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="btn-color">Color del Botón</Label>
                <Input id="btn-color" type="color" defaultValue="#FF4500" className="p-1 h-10" />
            </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Vista Previa
            </Button>
            <Button>
                <Save className="mr-2 h-4 w-4" />
                Publicar Cambios
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
