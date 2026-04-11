
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Save, Link as LinkIcon, ShieldCheck } from 'lucide-react';
import type { HotmartConfig } from '@/types/hotmart';

export function HotmartConfigTab() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<HotmartConfig>({
    hottokSecret: '',
    productId: ''
  });

  const configDocRef = doc(firestore, 'adminConfig', 'hotmart');
  const { data: initialData, isLoading } = useDoc<HotmartConfig>(configDocRef);

  useEffect(() => {
    if (initialData) {
      setConfig(initialData);
    }
  }, [initialData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(configDocRef, {
        ...config,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      toast({ title: 'Configuración guardada', description: 'Los parámetros de Hotmart han sido actualizados.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la configuración.' });
    } finally {
      setIsSaving(false);
    }
  };

  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/hotmart` : '---';

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Credenciales de Webhook
          </CardTitle>
          <CardDescription>
            Configura el secreto HOTTOK que Hotmart enviará en cada notificación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hottok">Hotmart Token (HOTTOK)</Label>
            <Input 
              id="hottok" 
              type="password"
              value={config.hottokSecret} 
              onChange={(e) => setConfig(prev => ({ ...prev, hottokSecret: e.target.value }))}
              placeholder="Pega aquí el HOTTOK desde el panel de Hotmart" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pid">ID de Producto en Hotmart</Label>
            <Input 
              id="pid" 
              value={config.productId} 
              onChange={(e) => setConfig(prev => ({ ...prev, productId: e.target.value }))}
              placeholder="Ej: 123456" 
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar Configuración
          </Button>
        </CardFooter>
      </Card>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            URL del Webhook para Hotmart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-background border rounded text-xs truncate">
              {webhookUrl}
            </code>
            <Button variant="outline" size="sm" onClick={() => {
              navigator.clipboard.writeText(webhookUrl);
              toast({ title: 'Copiado', description: 'URL copiada al portapapeles.' });
            }}>Copiar</Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground italic">
            Copia esta URL y pégala en la sección de Webhooks del panel de Hotmart.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
