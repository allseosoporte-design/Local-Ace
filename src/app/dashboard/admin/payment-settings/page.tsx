
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Save } from 'lucide-react';
import { PaymentPlanForm } from '@/components/payment-plan-form';
import type { PlanPaymentSettings } from '@/types/payment-settings';

const initialPlanSettings: PlanPaymentSettings = {
    nequi: {
        enabled: false,
        qrImageUrl: null,
        accountNumber: '',
        holderName: '',
        idDocument: '',
        phone: '',
        isMainQR: false,
        instructions: ''
    },
    bancolombia: {
        enabled: false,
        qrImageUrl: null,
        accountNumber: '',
        holderName: '',
        idDocument: '',
        phone: '',
        isMainQR: false,
        instructions: ''
    },
    daviplata: {
        enabled: false,
        qrImageUrl: null,
        accountNumber: '',
        holderName: '',
        idDocument: '',
        phone: '',
        isMainQR: false,
        instructions: ''
    },
    stripe: { enabled: false, publicKey: '', secretKey: '' },
    mercadoPago: { enabled: false, accessToken: '', publicKey: '', mode: 'production', instructions: '' },
    cashOnDelivery: false,
};


export default function AdminPaymentSettingsPage() {
  const [starterSettings, setStarterSettings] = useState<PlanPaymentSettings>(initialPlanSettings);
  const [professionalSettings, setProfessionalSettings] = useState<PlanPaymentSettings>(initialPlanSettings);
  const [businessSettings, setBusinessSettings] = useState<PlanPaymentSettings>(initialPlanSettings);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Configuración de Pagos por Plan
          </h1>
          <p className="text-muted-foreground">
            Define qué métodos de pago están disponibles para cada nivel de suscripción.
          </p>
        </div>
         <Button size="lg">
          <Save className="mr-2 h-4 w-4" />
          Guardar Toda la Configuración
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="starter" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-14 rounded-t-lg rounded-b-none">
              <TabsTrigger value="starter" className="h-full">Starter</TabsTrigger>
              <TabsTrigger value="professional" className="h-full">Professional</TabsTrigger>
              <TabsTrigger value="business" className="h-full">Business</TabsTrigger>
            </TabsList>
            <TabsContent value="starter">
                <PaymentPlanForm isLoading={false} settings={starterSettings} setSettings={setStarterSettings} />
            </TabsContent>
            <TabsContent value="professional">
                <PaymentPlanForm isLoading={false} settings={professionalSettings} setSettings={setProfessionalSettings} />
            </TabsContent>
            <TabsContent value="business">
                <PaymentPlanForm isLoading={false} settings={businessSettings} setSettings={setBusinessSettings} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
