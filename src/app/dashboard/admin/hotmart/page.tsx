
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HotmartConfigTab } from '@/components/admin/hotmart/HotmartConfigTab';
import { HotmartMappingTab } from '@/components/admin/hotmart/HotmartMappingTab';
import { HotmartLogTab } from '@/components/admin/hotmart/HotmartLogTab';
import { ShoppingCart, Settings, Repeat, Activity } from 'lucide-react';

export default function HotmartAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-3">
          <ShoppingCart className="h-8 w-8 text-primary" />
          Integración con Hotmart
        </h1>
        <p className="text-muted-foreground">
          Gestione la automatización de suscripciones y pagos internacionales.
        </p>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-14 bg-muted/20 p-1">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> Configuración
          </TabsTrigger>
          <TabsTrigger value="mapping" className="flex items-center gap-2">
            <Repeat className="h-4 w-4" /> Mapeo de Planes
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" /> Log de Eventos
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="config">
            <HotmartConfigTab />
          </TabsContent>
          <TabsContent value="mapping">
            <HotmartMappingTab />
          </TabsContent>
          <TabsContent value="logs">
            <HotmartLogTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
