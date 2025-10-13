
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { QRForm, type QRFormData } from '@/components/qr-form';
import { NequiIcon, BancolombiaIcon, StripeIcon, MercadoPagoIcon } from '@/components/icons/payment-methods';

const PaymentMethodForm = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <AccordionItem value={title}>
        <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-4 text-lg font-semibold">
                {icon}
                <span>{title}</span>
            </div>
        </AccordionTrigger>
        <AccordionContent>
            <Card className="border-none bg-stone-50">
                <CardContent className="p-6 space-y-6">
                    {children}
                </CardContent>
            </Card>
        </AccordionContent>
    </AccordionItem>
);

const initialQRData: QRFormData = {
  enabled: false,
  qrImageUrl: null,
  accountNumber: '',
  holderName: '',
  idDocument: '',
  phone: '',
  isMainQR: false,
  instructions: '',
};

interface StripeData {
    enabled: boolean;
    publicKey: string;
    secretKey: string;
}
const initialStripeData: StripeData = { enabled: false, publicKey: '', secretKey: '' };

interface MercadoPagoData {
    enabled: boolean;
    accessToken: string;
    publicKey: string;
    mode: 'production' | 'sandbox';
    instructions: string;
}
const initialMercadoPagoData: MercadoPagoData = { enabled: false, accessToken: '', publicKey: '', mode: 'production', instructions: '' };

interface PlanPaymentSettings {
    nequi: QRFormData;
    bancolombia: QRFormData;
    stripe: StripeData;
    mercadoPago: MercadoPagoData;
}

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
  
  const handleStripeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({ ...prev, stripe: { ...prev.stripe, [id]: value } }));
  };

  const handleMercadoPagoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({ ...prev, mercadoPago: { ...prev.mercadoPago, [id]: value } }));
  };

  const handleSetData = (method: 'nequi' | 'bancolombia') => (data: QRFormData) => {
    setSettings(prev => ({...prev, [method]: data}));
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
            { isLoadingData ? <Loader2 className="animate-spin my-12 mx-auto"/> : (
            <Accordion type="multiple" defaultValue={['Nequi con Código QR']} className="w-full space-y-4">
                <PaymentMethodForm icon={<NequiIcon />} title="Nequi con Código QR">
                    <QRForm methodName="Nequi" data={settings.nequi} setData={handleSetData('nequi')} />
                </PaymentMethodForm>

                <PaymentMethodForm icon={<BancolombiaIcon />} title="Bancolombia con Código QR">
                     <QRForm methodName="Bancolombia" data={settings.bancolombia} setData={handleSetData('bancolombia')} />
                </PaymentMethodForm>

                <PaymentMethodForm icon={<StripeIcon />} title="Stripe">
                     <div className="flex justify-end">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="switch-stripe">Stripe está activado</Label>
                            <Switch 
                                id="switch-stripe" 
                                checked={settings.stripe.enabled}
                                onCheckedChange={(checked) => setSettings(p => ({ ...p, stripe: {...p.stripe, enabled: checked}}))}
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="publicKey">Public Key</Label>
                            <Input id="publicKey" type="password" placeholder="pk_test_************************" value={settings.stripe.publicKey} onChange={handleStripeChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="secretKey">Secret Key</Label>
                            <Input id="secretKey" type="password" placeholder="sk_test_************************" value={settings.stripe.secretKey} onChange={handleStripeChange} />
                        </div>
                    </div>
                </PaymentMethodForm>

                <PaymentMethodForm icon={<MercadoPagoIcon />} title="Mercado Pago">
                     <div className="flex justify-end">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="switch-mp">Mercado Pago está activado</Label>
                            <Switch 
                                id="switch-mp"
                                checked={settings.mercadoPago.enabled}
                                onCheckedChange={(checked) => setSettings(p => ({ ...p, mercadoPago: {...p.mercadoPago, enabled: checked}}))}
                            />
                        </div>
                    </div>
                     <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="accessToken">Access Token</Label>
                            <Input id="accessToken" type="password" placeholder="APP_USR-********************************" value={settings.mercadoPago.accessToken} onChange={handleMercadoPagoChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="publicKey">Public Key</Label>
                            <Input id="publicKey" type="password" placeholder="APP_USR-********-****-****-****-************" value={settings.mercadoPago.publicKey} onChange={handleMercadoPagoChange} />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="mode">Modo de entorno</Label>
                            <Select 
                                value={settings.mercadoPago.mode} 
                                onValueChange={(value: 'production' | 'sandbox') => setSettings(p => ({ ...p, mercadoPago: {...p.mercadoPago, mode: value}}))}
                            >
                                <SelectTrigger id="mode">
                                    <SelectValue placeholder="Seleccionar modo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="production">Producción</SelectItem>
                                    <SelectItem value="sandbox">Sandbox</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="instructions">Instrucción para el cliente</Label>
                            <Textarea id="instructions" placeholder='Completa tu pago a través de Mercado Pago. Justo después de confirmar tu suscripción, serás redirigido a la página de pagos.' value={settings.mercadoPago.instructions} onChange={handleMercadoPagoChange} />
                        </div>
                    </div>
                </PaymentMethodForm>
            </Accordion>
            )}
        </TabsContent>
        <TabsContent value="professional">
             <p className="text-center text-muted-foreground py-12">Configuración para el Plan Professional.</p>
        </TabsContent>
        <TabsContent value="business">
             <p className="text-center text-muted-foreground py-12">Configuración para el Plan Business.</p>
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
