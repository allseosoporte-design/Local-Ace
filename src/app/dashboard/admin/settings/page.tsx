'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, Save } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Settings State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState('');
  const [cloudinaryApiKey, setCloudinaryApiKey] = useState('');
  const [cloudinaryApiSecret, setCloudinaryApiSecret] = useState('');

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!firestore) return;
      try {
        const docRef = doc(firestore, 'adminConfig', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setMaintenanceMode(data.maintenanceMode || false);
          setGoogleApiKey(data.googleApiKey || '');
          setCloudinaryCloudName(data.cloudinaryCloudName || '');
          setCloudinaryApiKey(data.cloudinaryApiKey || '');
          setCloudinaryApiSecret(data.cloudinaryApiSecret || '');
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, [firestore]);

  const handleSave = async () => {
    if (!firestore) return;
    setIsSaving(true);
    try {
      await setDoc(doc(firestore, 'adminConfig', 'global'), {
        maintenanceMode,
        googleApiKey,
        cloudinaryCloudName,
        cloudinaryApiKey,
        cloudinaryApiSecret,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({
        title: 'Configuración guardada',
        description: 'Los ajustes globales de la plataforma han sido actualizados.',
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: 'No se pudieron guardar los ajustes en la base de datos.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Configuración de Administrador
        </h1>
        <p className="text-muted-foreground">
          Gestiona la configuración global de la plataforma y las integraciones.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
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
        </Card>

        <Separator className="my-6" />

        <Card>
          <CardHeader>
            <CardTitle>Integraciones</CardTitle>
            <CardDescription>
              Gestiona las claves de API para los servicios de la plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="google-api-key">Clave de API de Google (Gemini)</Label>
              <Input
                id="google-api-key"
                type="password"
                value={googleApiKey}
                onChange={(e) => setGoogleApiKey(e.target.value)}
                placeholder="AIza..."
              />
            </div>

            <div className="pt-4 border-t space-y-4">
              <h3 className="text-sm font-semibold">Configuración de Cloudinary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cloudinary-cloud-name">Cloud Name</Label>
                  <Input
                    id="cloudinary-cloud-name"
                    value={cloudinaryCloudName}
                    onChange={(e) => setCloudinaryCloudName(e.target.value)}
                    placeholder="Tu Cloud Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cloudinary-api-key">API Key</Label>
                  <Input
                    id="cloudinary-api-key"
                    value={cloudinaryApiKey}
                    onChange={(e) => setCloudinaryApiKey(e.target.value)}
                    placeholder="API Key de Cloudinary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cloudinary-api-secret">API Secret</Label>
                <Input
                  id="cloudinary-api-secret"
                  type="password"
                  value={cloudinaryApiSecret}
                  onChange={(e) => setCloudinaryApiSecret(e.target.value)}
                  placeholder="API Secret de Cloudinary"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Guardar Toda la Configuración
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
