
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { PaymentPlanForm } from '@/components/payment-plan-form';
import type { PlanPaymentSettings } from '@/types/payment-settings';

const initialQRData = {
  enabled: false,
  qrImageUrl: null,
  accountNumber: '',
  holderName: '',
  idDocument: '',
  phone: '',
  isMainQR: false,
  instructions: '',
};

const initialStripeData = { enabled: false, publicKey: '', secretKey: '' };

const initialMercadoPagoData = { enabled: false, accessToken: '', publicKey: '', mode: 'production' as 'production' | 'sandbox', instructions: '' };

const initialPlanSettings: PlanPaymentSettings = {
    nequi: initialQRData,
    bancolombia: initialQRData,
    stripe: initialStripeData,
    mercadoPago: initialMercadoPagoData
};


export default function PaymentSettingsPage() {
  const [activeTab, setActiveTab] = useState('starter');
  const [settings, setSettings] = useState<PlanPaymentSettings>(initialPlanSettings);
  const [isSaving, setIsSaving] = useState(false);

  const firestore = useFirestore();
  const { toast } = useToast();

  const settingsDocRef = useMemoFirebase(() => {
      if (!firestore) return null;
      const docId = `plan_${activeTab}`;
      return doc(firestore, 'paymentSettings', docId);
  }, [firestore, activeTab]);

  const { data: initialData, isLoading: isLoadingData } = useDoc<PlanPaymentSettings>(settingsDocRef);

  useEffect(() => {
    if (initialData) {
      // Merge initialData with the default structure to avoid missing fields if they are added later
      const mergedSettings = {
        nequi: { ...initialQRData, ...(initialData.nequi || {}) },
        bancolombia: { ...initialQRData, ...(initialData.bancolombia || {}) },
        stripe: { ...initialStripeData, ...(initialData.stripe || {}) },
        mercadoPago: { ...initialMercadoPagoData, ...(initialData.mercadoPago || {}) }
      };
      setSettings(mergedSettings);
    } else if (!isLoadingData) {
      setSettings(initialPlanSettings);
    }
  }, [initialData, isLoadingData, activeTab]);
  
  const handleSaveSettings = async () => {
    if (!settingsDocRef) {
      toast({ variant: "destructive", title: "Error", description: "No se puede conectar a la base de datos." });
      return;
    }
    setIsSaving(true);
    try {
      await setDoc(settingsDocRef, { ...settings, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: 'Configuración guardada', description: 'Los ajustes de pago han sido actualizados.' });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la configuración." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Métodos de Pago por Plan</h1>
        <p className="text-muted-foreground">
          Configura los métodos de pago disponibles para cada plan de suscripción.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="starter">Plan Starter</TabsTrigger>
          <TabsTrigger value="professional">Plan Professional</TabsTrigger>
          <TabsTrigger value="business">Plan Business</TabsTrigger>
        </TabsList>
        <TabsContent value="starter">
          <PaymentPlanForm 
            isLoading={isLoadingData} 
            settings={settings} 
            setSettings={setSettings} 
          />
        </TabsContent>
        <TabsContent value="professional">
          <PaymentPlanForm 
            isLoading={isLoadingData} 
            settings={settings} 
            setSettings={setSettings} 
          />
        </TabsContent>
        <TabsContent value="business">
           <PaymentPlanForm 
            isLoading={isLoadingData} 
            settings={settings} 
            setSettings={setSettings} 
          />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end mt-8">
        <Button size="lg" onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar Configuración General
        </Button>
      </div>
    </div>
  );
}
