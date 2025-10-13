
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
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
import { Loader2 } from 'lucide-react';
import { QRForm, type QRFormData } from '@/components/qr-form';
import { NequiIcon, BancolombiaIcon, StripeIcon, MercadoPagoIcon } from '@/components/icons/payment-methods';
import type { PlanPaymentSettings } from '@/types/payment-settings';

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

interface PaymentPlanFormProps {
    isLoading: boolean;
    settings: PlanPaymentSettings;
    setSettings: React.Dispatch<React.SetStateAction<PlanPaymentSettings>>;
}

export function PaymentPlanForm({ isLoading, settings, setSettings }: PaymentPlanFormProps) {
    
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

    if (isLoading) {
        return <Loader2 className="animate-spin my-12 mx-auto"/>;
    }

    return (
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
    )
}
