
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { Copy, Eye, Settings, List, PlusCircle } from 'lucide-react';
import React from 'react';

export default function EditorContactoPage() {
  const { user } = useUser();
  const { toast } = useToast();

  const publicUrl = user
    ? `${window.location.origin}/contact/${user.uid}`
    : '';

  const handleCopyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    toast({
      title: '✅ Enlace copiado correctamente',
      description: 'La URL pública de tu formulario de contacto ha sido copiada.',
    });
  };

  const openPublicUrl = () => {
    if (publicUrl) {
      window.open(publicUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Editor de Contacto
        </h1>
        <p className="text-muted-foreground">
          Crea y personaliza tu formulario de contacto profesional.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Editor y Configuración */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Editor Visual de Formulario
              </CardTitle>
              <CardDescription>
                Arrastra y edita los campos de tu formulario.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-48 border-2 border-dashed rounded-lg">
                <p>El editor de campos estará disponible aquí.</p>
                <Button variant="outline" className="mt-4" disabled>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Agregar Campo
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración del Correo
              </CardTitle>
              <CardDescription>
                Define a dónde llegarán los mensajes y personaliza las
                respuestas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center text-center text-muted-foreground h-32 border-2 border-dashed rounded-lg">
                <p>
                  Las opciones de configuración de correo estarán aquí.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Vista Previa y Enlace */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Enlace Público</CardTitle>
              <CardDescription>
                Comparte este enlace para que te contacten.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="public-url">Tu URL de Contacto</Label>
                <div className="flex items-center gap-2">
                  <Input id="public-url" value={publicUrl} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    disabled={!user}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={openPublicUrl}
                disabled={!user}
              >
                <Eye className="mr-2 h-4 w-4" />
                Vista Previa Pública
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg">
                <p>La vista previa del formulario aparecerá aquí.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
