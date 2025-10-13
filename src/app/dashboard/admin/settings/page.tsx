'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [cloudinaryApiKey, setCloudinaryApiKey] = useState('');

  const handleSaveSettings = () => {
    console.log('Saving general settings:', { maintenanceMode });
    toast({
      title: 'Configuración guardada',
      description: 'Los ajustes generales han sido actualizados.',
    });
  };

  const handleSaveApiKeys = () => {
    console.log('Saving API keys:', { googleApiKey, cloudinaryApiKey });
    toast({
      title: 'Claves de API guardadas',
      description: 'Las claves de API han sido actualizadas de forma segura.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Configuración de Administrador
        </h1>
        <p className="text-muted-foreground">
          Gestiona la configuración global de la plataforma.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
          <CardDescription>Ajustes generales de la aplicación.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="maintenance-mode" className="font-semibold">
                Modo Mantenimiento
              </Label>
              <p className="text-sm text-muted-foreground">
                Desactiva temporalmente el acceso público a la plataforma.
              </p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSettings}>Guardar Configuración</Button>
        </CardFooter>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Integraciones</CardTitle>
          <CardDescription>
            Gestiona las claves de API y las conexiones con servicios de
            terceros.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google-api-key">Clave de API de Google</Label>
            <Input
              id="google-api-key"
              type="password"
              value={googleApiKey}
              onChange={(e) => setGoogleApiKey(e.target.value)}
              placeholder="••••••••••••••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cloudinary-api-key">Clave de API de Cloudinary</Label>
            <Input
              id="cloudinary-api-key"
              type="password"
              value={cloudinaryApiKey}
              onChange={(e) => setCloudinaryApiKey(e.target.value)}
              placeholder="••••••••••••••••••••"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveApiKeys}>Guardar Claves de API</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
