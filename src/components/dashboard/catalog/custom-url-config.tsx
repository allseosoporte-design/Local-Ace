
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Globe } from 'lucide-react';
import type { CatalogHeaderConfigData } from '@/types/catalog';
import { cn } from '@/lib/utils';

export function CustomUrlConfig() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [customSlug, setCustomSlug] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const configDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `businesses/${user.uid}/catalogConfig/header`);
  }, [firestore, user]);

  const { data: initialData, isLoading: isLoadingDoc } = useDoc<CatalogHeaderConfigData>(configDocRef);

  useEffect(() => {
    if (initialData) {
      setCustomSlug(initialData.customSlug || '');
      setIsEnabled(initialData.isCustomSlugEnabled || false);
    }
  }, [initialData]);

  const handleSave = async () => {
    if (!configDocRef) return;
    
    // Validar slug: solo letras minúsculas, números y guiones
    const slugRegex = /^[a-z0-9-]+$/;
    if (isEnabled && customSlug && !slugRegex.test(customSlug)) {
        toast({
            variant: 'destructive',
            title: 'URL no válida',
            description: 'La URL personalizada solo puede contener letras minúsculas, números y guiones.'
        });
        return;
    }

    setIsSaving(true);
    try {
      await setDoc(configDocRef, {
        customSlug: customSlug.toLowerCase().trim(),
        isCustomSlugEnabled: isEnabled,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      toast({
        title: 'URL actualizada',
        description: 'La configuración de la URL personalizada ha sido guardada.'
      });
    } catch (error) {
      console.error("Error saving custom URL:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar la configuración.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const fullUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/catalog/${isEnabled && customSlug ? customSlug : (user?.uid || '...')}`
    : '';

  if (isUserLoading || isLoadingDoc) {
    return (
        <Card className="mt-6 border-primary/20 shadow-sm">
            <CardContent className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="mt-6 border-primary/20 shadow-sm overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Globe className="h-5 w-5" />
          Personalizar URL del Catálogo
        </CardTitle>
        <CardDescription>
          Configura una dirección web única y fácil de recordar para tu catálogo.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="space-y-0.5">
                <Label className="text-base font-semibold">Activar URL Personalizada</Label>
                <p className="text-xs text-muted-foreground">Si se desactiva, se usará tu ID de negocio por defecto.</p>
            </div>
            <Switch 
                checked={isEnabled} 
                onCheckedChange={setIsEnabled}
            />
        </div>

        <div className={cn("space-y-4 transition-opacity duration-300", !isEnabled && "opacity-50 pointer-events-none")}>
            <div className="space-y-2">
                <Label htmlFor="custom-slug">Slug de la URL</Label>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground bg-muted p-2 rounded-l-md border-y border-l">
                        /catalog/
                    </span>
                    <Input 
                        id="custom-slug"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value)}
                        placeholder="mi-negocio-pro"
                        className="rounded-l-none"
                    />
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                    Usa solo minúsculas, números y guiones. Ejemplo: "cafeteria-central"
                </p>
            </div>

            <div className="p-3 bg-muted rounded-md border border-dashed">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Vista previa del enlace:</p>
                <p className="text-sm font-mono truncate text-primary font-bold">
                    {fullUrl}
                </p>
            </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/10 border-t p-4 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="font-semibold px-6">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar Cambios URL
        </Button>
      </CardFooter>
    </Card>
  );
}
