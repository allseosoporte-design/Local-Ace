
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  HardDriveDownload,
  DatabaseZap,
  Wrench,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

export default function MaintenancePage() {
  const { toast } = useToast();
  const [isCleaningCache, setIsCleaningCache] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleAction = (
    action: () => Promise<any>,
    setLoading: (loading: boolean) => void,
    messages: { loading: string; success: string; error: string }
  ) => {
    setLoading(true);
    toast({ title: messages.loading });
    action()
      .then(() => {
        toast({ title: 'Éxito', description: messages.success });
      })
      .catch((err) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: messages.error,
        });
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  const handleCleanCache = () => {
    handleAction(
      () => new Promise((resolve) => setTimeout(resolve, 1500)),
      setIsCleaningCache,
      {
        loading: 'Limpiando la caché...',
        success: 'La caché de la aplicación ha sido limpiada.',
        error: 'No se pudo limpiar la caché.',
      }
    );
  };

  const handleReindex = () => {
     handleAction(
      () => new Promise((resolve) => setTimeout(resolve, 2500)),
      setIsReindexing,
      {
        loading: 'Reindexando la base de datos...',
        success: 'La base de datos ha sido reindexada y optimizada.',
        error: 'Ocurrió un error durante la reindexación.',
      }
    );
  };
  
  const handleDiagnose = () => {
      handleAction(
      () => new Promise((resolve) => setTimeout(resolve, 3000)),
      setIsDiagnosing,
      {
        loading: 'Ejecutando diagnóstico del sistema...',
        success: 'Diagnóstico completado. Todos los sistemas funcionan correctamente.',
        error: 'El diagnóstico encontró un problema en uno de los servicios.',
      }
    );
  };

  const handleMaintenanceModeToggle = (checked: boolean) => {
    setMaintenanceMode(checked);
    toast({
        title: `Modo Mantenimiento ${checked ? 'Activado' : 'Desactivado'}`,
        description: checked 
            ? 'La plataforma ahora es accesible solo para superadministradores.'
            : 'La plataforma ahora es accesible para todos los usuarios.',
    });
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Mantenimiento del Sistema
        </h1>
        <p className="text-muted-foreground">
          Herramientas y tareas para asegurar el correcto funcionamiento de la
          plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-start gap-4">
            <HardDriveDownload className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Gestión de Caché</CardTitle>
              <CardDescription>
                Limpia la caché de la aplicación para reflejar cambios
                inmediatos.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCleanCache} disabled={isCleaningCache} className="w-full">
              {isCleaningCache ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Limpiar caché
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-start gap-4">
            <DatabaseZap className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Mantenimiento de BD</CardTitle>
              <CardDescription>
                Ejecuta tareas como reindexar para optimizar el rendimiento.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={handleReindex} disabled={isReindexing} variant="outline" className="w-full">
               {isReindexing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Reindexar base de datos
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-start gap-4">
            <Wrench className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Diagnóstico del Sistema</CardTitle>
              <CardDescription>
                Ejecuta pruebas para verificar la salud y estado del sistema.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={handleDiagnose} disabled={isDiagnosing} variant="outline" className="w-full">
              {isDiagnosing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Ejecutar diagnóstico
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-red-50 border-red-200">
        <CardHeader className="flex flex-row items-start gap-4">
            <ShieldAlert className="h-8 w-8 text-destructive" />
             <div>
                <CardTitle className="text-destructive">Modo de Mantenimiento</CardTitle>
                <CardDescription className="text-red-900/70">
                Activa una página de "en mantenimiento" para todos los usuarios no
                administradores.
                </CardDescription>
            </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border bg-background p-4">
            <div>
              <Label htmlFor="maintenance-mode" className="font-semibold">
                Habilitar modo de mantenimiento
              </Label>
              <p className="text-sm text-muted-foreground">
                Al activar, solo los superadministradores podrán acceder al
                sistema.
              </p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={maintenanceMode}
              onCheckedChange={handleMaintenanceModeToggle}
              aria-label="Modo de mantenimiento"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
