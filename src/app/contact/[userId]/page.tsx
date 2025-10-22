
'use client';

import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// This is a placeholder for the public contact form page.
// It currently shows a static form.
// In the future, it will fetch the form configuration from Firestore.

export default function PublicContactPage() {
  const params = useParams();
  const userId = params.userId as string;

  if (!userId) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40">
          <p>ID de usuario no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Formulario de Contacto</CardTitle>
          <CardDescription>
            Completa los campos para enviarnos un mensaje.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" placeholder="Tu nombre completo" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" placeholder="tu@ejemplo.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Mensaje</Label>
            <Textarea id="message" placeholder="Escribe tu mensaje aquí..." />
          </div>
           <p className="text-xs text-center text-red-500 pt-2">
            Nota: El envío de este formulario aún no está implementado.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" disabled>Enviar Mensaje</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
