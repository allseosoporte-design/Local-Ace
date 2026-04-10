
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
import { Loader2, Save, Info } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Settings State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState('defgl3hjt');
  const [cloudinaryApiKey, setCloudinaryApiKey] = useState('346383138464218');
  const [cloudinaryApiSecret, setCloudinaryApiSecret] = useState('3igu6wHKuRxuf4NMho4vjdFSqu8');

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
          if (data.cloudinaryCloudName) setCloudinaryCloudName(data.cloudinaryCloudName);
          if (data.cloudinaryApiKey) setCloudinaryApiKey(data.cloudinaryApiKey);
          if (data.cloudinaryApiSecret) setCloudinaryApiSecret(data.cloudinaryApiSecret);
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
        description: 'Los ajustes globales se han actualizado en Firestore.',
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: 'No se pudieron guardar los ajustes.',
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
          Gestiona las claves de API y el estado global de la plataforma.
        </p>
      </div>

      {!cloudinaryCloudName && (
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Acción requerida</AlertTitle>
          <AlertDescription className="text-blue-700">
            Por favor, ingresa tu <strong>Cloud Name</strong> de Cloudinary abajo para habilitar la subida de imágenes.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <Card>
          <CardHeader>
            <CardTitle>Configuración General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="maintenance-mode" className="font-semibold">
                  Modo Mantenimiento
                </Label>
                <p className="text-sm text-muted-foreground">
                  Desactiva el acceso a usuarios no administradores.
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

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Integraciones</CardTitle>
            <CardDescription>
              Claves para Google Gemini y Cloudinary.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="google-api-key">Google Gemini API Key</Label>
              <Input
                id="google-api-key"
                type="password"
                value={googleApiKey}
                onChange={(e) => setGoogleApiKey(e.target.value)}
                placeholder="AIza..."
              />
            </div>

            <div className="pt-4 border-t space-y-4">
              <h3 className="text-sm font-semibold">Cloudinary (Imágenes)</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cloudinary-cloud-name" className="text-blue-600 font-bold">Cloud Name (Obligatorio)</Label>
                  <Input
                    id="cloudinary-cloud-name"
                    value={cloudinaryCloudName}
                    onChange={(e) => setCloudinaryCloudName(e.target.value)}
                    placeholder="Ej: dxxxxxxx"
                    className={!cloudinaryCloudName ? "border-blue-400 bg-blue-50" : ""}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cloudinary-api-key">API Key</Label>
                    <Input
                      id="cloudinary-api-key"
                      value={cloudinaryApiKey}
                      onChange={(e) => setCloudinaryApiKey(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cloudinary-api-secret">API Secret</Label>
                    <Input
                      id="cloudinary-api-secret"
                      type="password"
                      value={cloudinaryApiSecret}
                      onChange={(e) => setCloudinaryApiSecret(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Guardar Configuración
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
