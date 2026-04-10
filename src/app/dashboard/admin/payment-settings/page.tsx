'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Save, Loader2, AlertTriangle, Info } from 'lucide-react';
import { PaymentPlanForm } from '@/components/payment-plan-form';
import type { PlanPaymentSettings } from '@/types/payment-settings';
import { useFirestore, useCollection, useUser } from '@/firebase';
import { collection, query, orderBy, doc, setDoc, serverTimestamp, getDoc, writeBatch } from 'firebase/firestore';
import type { SubscriptionPlan } from '@/types/subscription-plan';
import { useToast } from '@/hooks/use-toast';
import React from 'react';
import Link from 'next/link';
import { SUPER_ADMIN_BUSINESS_ID } from '@/lib/constants';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

const initialPayPalData = { enabled: false, clientId: '', clientSecret: '', mode: 'sandbox' as 'production' | 'sandbox'};

const initialWompiData = { enabled: false, publicKey: '', privateKey: '', mode: 'sandbox' as 'production' | 'sandbox'};

const initialPlanSettings: PlanPaymentSettings = {
    nequi: initialQRData,
    bancolombia: initialQRData,
    daviplata: initialQRData,
    stripe: initialStripeData,
    mercadoPago: initialMercadoPagoData,
    paypal: initialPayPalData,
    wompi: initialWompiData,
    cashOnDelivery: false,
};

type SettingsByPlan = Record<string, PlanPaymentSettings>;

export default function AdminPaymentSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  const [settings, setSettings] = useState<SettingsByPlan>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const plansQuery = useMemo(() => {
    if (isUserLoading || !user || !firestore) return null;
    return query(collection(firestore, 'subscriptionPlans'), orderBy('order'));
  }, [firestore, user, isUserLoading]);

  const { data: plans, isLoading: isLoadingPlans } = useCollection<SubscriptionPlan>(plansQuery);

  useEffect(() => {
    const fetchAllSettings = async () => {
      if (isLoadingPlans || !plans || !firestore) {
        if (!isLoadingPlans) {
          setIsLoadingSettings(false);
        }
        return;
      }
      
      setIsLoadingSettings(true);

      if (plans.length === 0) {
        setSettings({});
        setIsLoadingSettings(false);
        return;
      }
      
      const allSettings: SettingsByPlan = {};
      
      for (const plan of plans) {
        const settingsDocRef = doc(firestore, 'paymentSettings', plan.id);
        const docSnap = await getDoc(settingsDocRef);
        
        const loadedData = docSnap.exists() ? docSnap.data() as PlanPaymentSettings : initialPlanSettings;
        
        const mergedSettings = {
            ...initialPlanSettings,
            ...loadedData,
            nequi: { ...initialQRData, ...(loadedData.nequi || {}) },
            bancolombia: { ...initialQRData, ...(loadedData.bancolombia || {}) },
            daviplata: { ...initialQRData, ...(loadedData.daviplata || {}) },
            stripe: { ...initialStripeData, ...(loadedData.stripe || {}) },
            mercadoPago: { ...initialMercadoPagoData, ...(loadedData.mercadoPago || {}) },
            paypal: { ...initialPayPalData, ...(loadedData.paypal || {}) },
            wompi: { ...initialWompiData, ...(loadedData.wompi || {}) },
            cashOnDelivery: loadedData.cashOnDelivery || false,
        };

        allSettings[plan.id] = mergedSettings;
      }
      
      setSettings(allSettings);
      setIsLoadingSettings(false);
    };

    fetchAllSettings();
  }, [plans, isLoadingPlans, firestore]);

  const handleSettingsChange = (planId: string, newSettings: PlanPaymentSettings) => {
    setSettings(prev => ({
      ...prev,
      [planId]: newSettings,
    }));
  };

  const handleSaveAll = async () => {
    if (!firestore || !plans) return;
    setIsSaving(true);
    try {
      const batch = writeBatch(firestore);
      
      // Guardar configuraciones por plan
      for (const plan of plans) {
        const planSettings = settings[plan.id];
        if (planSettings) {
          const settingsDocRef = doc(firestore, 'paymentSettings', plan.id);
          batch.set(settingsDocRef, { ...planSettings, updatedAt: serverTimestamp() }, { merge: true });
        }
      }

      // SINCRONIZACIÓN CRÍTICA: Guardar los métodos del primer plan como predeterminados del catálogo principal
      if (plans.length > 0) {
          const firstPlanSettings = settings[plans[0].id];
          if (firstPlanSettings) {
              const adminBusinessRef = doc(firestore, 'paymentSettings', SUPER_ADMIN_BUSINESS_ID);
              batch.set(adminBusinessRef, { ...firstPlanSettings, updatedAt: serverTimestamp() }, { merge: true });
          }
      }
      
      await batch.commit();
      toast({ title: "Configuración Guardada", description: "Los ajustes de pago han sido guardados y sincronizados con el catálogo."});
    } catch (error) {
      console.error("Error saving all payment settings:", error);
      toast({ variant: 'destructive', title: "Error", description: "No se pudieron guardar los ajustes."});
    } finally {
      setIsSaving(false);
    }
  }
  
  const isLoading = isUserLoading || isLoadingPlans || isLoadingSettings;

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin' />
        <p className="ml-2 text-muted-foreground">Cargando configuración de pagos...</p>
      </div>
    );
  }

  if (!user) {
     return (
        <Card className="bg-destructive/10 border-destructive">
            <CardHeader className="flex flex-row items-center gap-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div>
                    <CardTitle className="text-destructive">Acceso Denegado</CardTitle>
                    <CardDescription className="text-destructive/80">Debes iniciar sesión para ver esta sección.</CardDescription>
                </div>
            </CardHeader>
        </Card>
     );
  }
  
  if (!isLoadingPlans && (!plans || plans.length === 0)) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Sin Planes de Suscripción</CardTitle>
                  <CardDescription>
                      No se encontraron planes. Crea uno en{" "}
                      <Link href="/dashboard/admin/subscription-plans" className="text-primary underline">
                         Gestión de Planes
                      </Link>
                      {" "}para configurar los pagos.
                  </CardDescription>
              </CardHeader>
          </Card>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Configuración de Pagos por Plan
          </h1>
          <p className="text-muted-foreground">
            Define los métodos de pago para cada nivel de suscripción.
          </p>
        </div>
         <Button size="lg" onClick={handleSaveAll} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar y Sincronizar
        </Button>
      </div>

      <Alert variant="default" className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Nota de Sincronización</AlertTitle>
        <AlertDescription className="text-blue-700 text-sm">
          Al guardar, los métodos de pago configurados en el primer plan se usarán automáticamente para el <strong>Catálogo Principal</strong> de la plataforma.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue={plans?.[0]?.id} className="w-full">
            <TabsList className="grid w-full h-14 rounded-t-lg rounded-b-none grid-cols-3">
              {plans?.slice(0, 3).map(plan => (
                <TabsTrigger key={plan.id} value={plan.id} className="h-full">{plan.name}</TabsTrigger>
              ))}
            </TabsList>
            {plans?.map(plan => (
              <TabsContent key={plan.id} value={plan.id}>
                <PaymentPlanForm 
                    isLoading={isLoadingSettings} 
                    settings={settings[plan.id] || initialPlanSettings} 
                    setSettings={(newSettings) => handleSettingsChange(plan.id, newSettings)} 
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}