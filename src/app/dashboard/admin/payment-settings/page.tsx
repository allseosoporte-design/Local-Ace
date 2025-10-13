
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, Upload, Loader2 } from 'lucide-react';
import { uploadImage } from '@/ai/flows/upload-image';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';


const NequiIcon = () => (
  <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.9999 48C37.2547 48 47.9999 37.2548 47.9999 24C47.9999 10.7452 37.2547 0 23.9999 0C10.7451 0 0 10.7452 0 24C0 37.2548 10.7451 48 23.9999 48Z" fill="#C400D2"></path>
    <path d="M12.3213 22.8214V17.0357H16.4107V22.8214C16.4107 24.3321 15.1714 25.5714 13.6607 25.5714C12.9053 25.5714 12.3213 25.0749 12.3213 24.3196V22.8214Z" fill="white"></path>
    <path d="M30.4102 24.3196C30.4102 25.0749 29.8263 25.5714 29.0709 25.5714C27.5602 25.5714 26.3209 24.3321 26.3209 22.8214V17.0357H30.4102V24.3196Z" fill="white"></path>
    <path d="M20.5718 12.8572H24.2146V28.25H20.5718V12.8572Z" fill="white"></path>
    <path d="M25.75 12.8572H29.3928V15.75H25.75V12.8572Z" fill="white"></path>
    <path d="M31.25 18.2143H34.8928V26.6786H31.25V18.2143Z" fill="white"></path>
    <path d="M18.8928 29.1071H26.3214V31.8214H18.8928V29.1071Z" fill="white"></path>
  </svg>
);

const BancolombiaIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#FFD700"/>
        <rect x="4" y="4" width="16" height="16" rx="2" fill="black"/>
        <rect x="6" y="6" width="12" height="12" rx="1" fill="#FFD700"/>
        <rect x="8" y="8" width="8" height="8" fill="black"/>
    </svg>
);

const StripeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
        <path fill="#6772E5" d="M327.4 1024c-53.8 0-101.4-23-134.4-61.1L3.5 677.3c-4.7-5.4-4.2-13.7.9-18.4L337.8 322c3.6-3.3 8.5-4.2 12.9-2.5l372.4 142.1c5.2 2 8.7 7.1 8.7 12.6v110.1c0 6-3.4 11.5-8.8 14.1L365.1 768.1c-12.7 6.1-27 8.3-41.2 8.3h3.5zm-59.5-62.9c13.4 0 26.6-2.5 39.1-7.8l357.9-172.9c3.3-1.5 5.3-4.9 5.3-8.6V562.2c0-3.3-1.9-6.4-5-8.1L332 254.4c-1.3-.9-3-.8-4.2.3L111.4 540.3c-1.2 1.3-1.3 3.3-.2 4.7l158.4 281.3c8.1 14.4 22.8 23.4 38.9 23.4h-1.6zM896.3 331.2L559.8 211.7c-4.4-1.5-9.3-1.1-13.3 1.2L174 547.4c-4.7 2.7-6.2 8.6-3.5 13.3l203.9 362.4c2.7 4.7 8.6 6.2 13.3 3.5l372.4-215c4.7-2.7 6.2-8.6 3.5-13.3L560.1 335.8c-7-12.4-22-17.5-35-11.2l-4.1 2-25.2 14.5c-3.3 1.9-4.4 6.1-2.5 9.4l79.4 141.2c2.1 3.7 6.5 5.4 10.4 4.1l219.8-71.3c4.1-1.3 7.2-5 7.2-9.4v-46.7c0-3.2-1.9-6.1-4.8-7.5l-2.7-1.3zm-324 233.1c-1.3-2.3-4.2-3.2-6.5-1.9L346 681.3c-2.3 1.3-3.2 4.2-1.9 6.5l3.8 6.7c1.3 2.3 4.2 3.2 6.5 1.9l219.8-118.9c2.3-1.3 3.2-4.2 1.9-6.5l-3.8-6.7z"></path>
    </svg>
);


const MercadoPagoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.433 4.00018C15.659 4.00018 14.195 5.10518 13.682 6.64018H5.973C5.114 6.64018 4.5 7.25418 4.5 8.11318V13.8442C4.5 14.7042 5.114 15.3172 5.973 15.3172H9.011C9.171 16.5982 10.158 17.5682 11.393 17.5682C12.632 17.5682 13.621 16.5942 13.777 15.3172H18.75C19.107 15.3172 19.5 15.0102 19.5 14.5672V8.11318C19.5 5.86118 18.23 4.00018 17.433 4.00018ZM11.393 16.0312C10.999 16.0312 10.655 15.7222 10.551 15.3172H12.234C12.131 15.7222 11.787 16.0312 11.393 16.0312ZM18 13.8442H13.847C14.053 13.3442 14.172 12.7882 14.172 12.2032C14.172 10.2312 12.946 8.54418 11.393 8.18818C9.839 8.54418 8.613 10.2312 8.613 12.2032C8.613 12.7882 8.732 13.3442 8.938 13.8442H5.973C5.908 13.8442 5.871 13.8442 5.871 13.8442V8.11318C5.871 8.11318 5.908 8.11318 5.973 8.11318H13.149C13.268 7.39118 13.918 6.64018 14.541 6.64018C15.110 6.64018 15.772 7.33418 15.772 8.11318C15.772 8.89218 15.110 9.58618 14.541 9.58618C13.918 9.58618 13.268 8.83518 13.149 8.11318H12.923C13.435 9.64818 14.899 10.7542 16.673 10.7542C17.650 10.7542 18 10.2222 18 9.58618V8.11318C18 8.11318 18 13.8442 18 13.8442Z" fill="#009EE3"></path>
    </svg>
);

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

interface QRFormData {
  enabled: boolean;
  qrImageUrl: string | null;
  accountNumber: string;
  holderName: string;
  idDocument: string;
  phone: string;
  isMainQR: boolean;
  instructions: string;
}

interface QRFormProps {
    methodName: 'Nequi' | 'Bancolombia';
    data: QRFormData;
    setData: (data: QRFormData) => void;
}

const QRForm = ({methodName, data, setData}: QRFormProps) => {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const fileAsDataUrl = reader.result as string;
                const result = await uploadImage({
                  fileAsDataUrl,
                  folder: `payment-qrs/${methodName.toLowerCase()}`
                });

                if (result.imageUrl) {
                  setData({ ...data, qrImageUrl: result.imageUrl });
                  toast({
                    title: 'Imagen subida',
                    description: 'El código QR se ha actualizado correctamente.',
                  });
                }
            };
        } catch (error) {
            console.error('Error subiendo imagen:', error);
            toast({
                variant: 'destructive',
                title: 'Error de subida',
                description: 'No se pudo subir la imagen del código QR.',
            });
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setData({ ...data, [id]: value });
    };

    return (
        <>
            <div className="flex justify-end">
                <div className="flex items-center gap-2">
                    <Label htmlFor={`switch-${methodName.toLowerCase()}`}>{methodName} está activado</Label>
                    <Switch 
                        id="enabled"
                        checked={data.enabled}
                        onCheckedChange={(checked) => setData({ ...data, enabled: checked })}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="qrImageUrl">Imagen con Código QR (URL)</Label>
                        <Input 
                            id="qrImageUrl"
                            placeholder='https://...' 
                            value={data.qrImageUrl || ''}
                            onChange={(e) => setData({ ...data, qrImageUrl: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`qr-code-file-${methodName.toLowerCase()}`}>o sube el archivo</Label>
                        <Input 
                            id={`qr-code-file-${methodName.toLowerCase()}`} 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accountNumber">Número de cuenta asociado*</Label>
                        <Input id="accountNumber" value={data.accountNumber} onChange={handleInputChange} placeholder='3116028254' />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="holderName">Nombre del titular*</Label>
                        <Input id="holderName" value={data.holderName} onChange={handleInputChange} placeholder='Alexander Jerez Fernandez' />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="idDocument">Documento de identidad*</Label>
                        <Input id="idDocument" value={data.idDocument} onChange={handleInputChange} placeholder='1111846661' />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Vista Previa del QR</Label>
                        <div className="w-[240px] h-[240px] bg-gray-200 rounded-md flex items-center justify-center mx-auto border">
                             {isUploading ? (
                                <Loader2 className="h-8 w-8 animate-spin" />
                             ) : data.qrImageUrl ? (
                                <Image src={data.qrImageUrl} alt="QR Code Preview" width={240} height={240} className="rounded-md object-contain" />
                            ) : (
                                <p className="text-sm text-muted-foreground">Sube una imagen</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-2 justify-center">
                            <Checkbox 
                                id="isMainQR"
                                checked={data.isMainQR}
                                onCheckedChange={(checked) => setData({ ...data, isMainQR: !!checked })}
                            />
                            <Label htmlFor="isMainQR">Establecer como QR principal</Label>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" value={data.phone} onChange={handleInputChange} placeholder='(+57) 3116028254' />
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="instructions">Instrucción para el cliente</Label>
                <Textarea id="instructions" value={data.instructions} onChange={handleInputChange} placeholder='Para validar tu pago, envía el comprobante a nuestro WhatsApp. Luego, nuestro equipo confirmará y activará tu plan.' />
            </div>
        </>
    );
};

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
      // Merge initialData with the default structure to avoid missing fields
      setSettings(prev => ({
        nequi: { ...prev.nequi, ...initialData.nequi },
        bancolombia: { ...prev.bancolombia, ...initialData.bancolombia },
        stripe: { ...prev.stripe, ...initialData.stripe },
        mercadoPago: { ...prev.mercadoPago, ...initialData.mercadoPago },
      }));
    } else if (!isLoadingData) {
      setSettings(initialPlanSettings);
    }
  }, [initialData, isLoadingData]);
  
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
                         <div className="flex justify-end">
                            <Button>Guardar Configuración de Mercado Pago</Button>
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
